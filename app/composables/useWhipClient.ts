import { useWhipStore } from '~/stores/whip';

export function useWhipClient() {
    const store = useWhipStore();
    let pc: null | RTCPeerConnection = null;
    let statsInterval: null | ReturnType<typeof setInterval> = null;

    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    async function startStream(endpointUrl: string, bearerToken: string) {
        store.setEndpoint(endpointUrl);
        store.setBearerToken(bearerToken);
        store.setStatus('connecting');

        try {
            // 1. Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    facingMode: 'user',
                    height: { ideal: 1080 },
                    width: { ideal: 1920 },
                },
            });
            store.setLocalStream(stream);

            // 2. Create peer connection
            pc = new RTCPeerConnection(rtcConfig);

            pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                if (event.candidate) {
                    store.incrementIceCandidates();
                }
            };

            pc.onconnectionstatechange = () => {
                if (!pc) return;
                switch (pc.connectionState) {
                    case 'closed':
                    case 'disconnected':
                        store.setStatus('disconnected');
                        stopStatsPolling();
                        break;
                    case 'connected':
                        store.setStatus('connected');
                        startStatsPolling();
                        break;
                    case 'failed':
                        store.setError('Peer connection failed');
                        break;
                }
            };

            // Add tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc!.addTrack(track, stream);
            });

            // 3. Create offer SDP
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 4. POST offer to WHIP endpoint
            const response = await fetch(endpointUrl, {
                body: offer.sdp,
                headers: {
                    'Content-Type': 'application/sdp',
                    ...bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
                },
                method: 'POST',
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`WHIP endpoint returned ${response.status}: ${text}`);
            }

            // 5. Set remote description from answer
            const answerSdp = await response.text();
            const answer: RTCSessionDescriptionInit = {
                sdp: answerSdp,
                type: 'answer',
            };
            await pc.setRemoteDescription(answer);
            store.setRemoteDescription(answerSdp);
        } catch (err: any) {
            store.setError(err.message || 'Failed to start stream');
            cleanup();
        }
    }

    async function stopStream() {
        store.setStatus('disconnected');
        cleanup();
    }

    function cleanup() {
        stopStatsPolling();
        if (pc) {
            pc.close();
            pc = null;
        }
        if (store.localStream) {
            store.localStream.getTracks().forEach((t) => t.stop());
            store.setLocalStream(null);
        }
    }

    function startStatsPolling() {
        statsInterval = setInterval(async () => {
            if (!pc) return;
            try {
                const stats = await pc.getStats();
                let bitrate = 0;
                let packetsLost = 0;
                let rtt = 0;

                stats.forEach((report) => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        // bitrate in bps
                        if (report.bytesReceived !== undefined && report.timestamp !== undefined) {
                            const raw = report as any;
                            if (raw.lastBytesReceived !== undefined) {
                                const bytesDiff = report.bytesReceived - raw.lastBytesReceived;
                                const timeDiff = (report.timestamp as any) - raw.lastTimestamp;
                                if (timeDiff > 0) {
                                    bitrate = Math.round((bytesDiff * 8) / (timeDiff / 1000));
                                }
                                (raw as any).lastBytesReceived = report.bytesReceived;
                                (raw as any).lastTimestamp = report.timestamp;
                            } else {
                                (raw as any).lastBytesReceived = report.bytesReceived;
                                (raw as any).lastTimestamp = report.timestamp;
                            }
                        }
                        if (report.packetsLost !== undefined) {
                            packetsLost = report.packetsLost;
                        }
                    }
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        if (report.currentRoundTripTime !== undefined) {
                            rtt = Math.round(report.currentRoundTripTime * 1000);
                        }
                    }
                });

                store.updateStats({
                    bitrate,
                    packetsLost,
                    roundTripTime: rtt,
                });
            } catch {
                // Ignore stats errors
            }
        }, 2000);
    }

    function stopStatsPolling() {
        if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
        }
    }

    // Toggle mute
    function toggleAudio() {
        if (!store.localStream) return;
        const audioTrack = store.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return audioTrack.enabled;
        }
        return null;
    }

    function toggleVideo() {
        if (!store.localStream) return;
        const videoTrack = store.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return videoTrack.enabled;
        }
        return null;
    }

    return {
        cleanup,
        startStream,
        stopStream,
        toggleAudio,
        toggleVideo,
    };
}

import { defineStore } from 'pinia';

export type WhipStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'idle';

export interface WhipState {
    bearerToken: string;
    bitrate: number;
    endpointUrl: string;
    errorMessage: string;
    iceCandidateCount: number;
    localStream: MediaStream | null;
    packetsLost: number;
    remoteDescription: string;
    roundTripTime: number;
    status: WhipStatus;
}

export const useWhipStore = defineStore('whip', () => {
    const endpointUrl = ref('');
    const bearerToken = ref('');
    const status = ref<WhipStatus>('idle');
    const errorMessage = ref('');
    const localStream = ref<MediaStream | null>(null);
    const remoteDescription = ref('');
    const iceCandidateCount = ref(0);
    const bitrate = ref(0);
    const packetsLost = ref(0);
    const roundTripTime = ref(0);

    const isIdle = computed(() => status.value === 'idle');
    const isConnecting = computed(() => status.value === 'connecting');
    const isConnected = computed(() => status.value === 'connected');
    const isDisconnected = computed(() => status.value === 'disconnected');
    const isError = computed(() => status.value === 'error');

    function setEndpoint(url: string) {
        endpointUrl.value = url;
    }

    function setBearerToken(token: string) {
        bearerToken.value = token;
    }

    function setStatus(s: WhipStatus) {
        status.value = s;
    }

    function setError(msg: string) {
        errorMessage.value = msg;
        status.value = 'error';
    }

    function setLocalStream(stream: MediaStream | null) {
        localStream.value = stream;
    }

    function setRemoteDescription(sdp: string) {
        remoteDescription.value = sdp;
    }

    function incrementIceCandidates() {
        iceCandidateCount.value++;
    }

    function updateStats(stats: { bitrate?: number; packetsLost?: number; roundTripTime?: number }) {
        if (stats.bitrate !== undefined) bitrate.value = stats.bitrate;
        if (stats.packetsLost !== undefined) packetsLost.value = stats.packetsLost;
        if (stats.roundTripTime !== undefined) roundTripTime.value = stats.roundTripTime;
    }

    function reset() {
        endpointUrl.value = '';
        bearerToken.value = '';
        status.value = 'idle';
        errorMessage.value = '';
        if (localStream.value) {
            localStream.value.getTracks().forEach((t) => t.stop());
        }
        localStream.value = null;
        remoteDescription.value = '';
        iceCandidateCount.value = 0;
        bitrate.value = 0;
        packetsLost.value = 0;
        roundTripTime.value = 0;
    }

    return {
        bearerToken,
        bitrate,
        endpointUrl,
        errorMessage,
        iceCandidateCount,
        incrementIceCandidates,
        isConnected,
        isConnecting,
        isDisconnected,
        isError,
        isIdle,
        localStream,
        packetsLost,
        remoteDescription,
        reset,
        roundTripTime,
        setBearerToken,
        setEndpoint,
        setError,
        setLocalStream,
        setRemoteDescription,
        setStatus,
        updateStats,
    };
});

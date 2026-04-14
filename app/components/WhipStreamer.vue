<template>
    <div class="whip-streamer">
        <!-- Endpoint Settings -->
        <v-card class="mb-4" variant="outlined">
            <v-card-item>
                <v-card-title class="text-h6">
                    <v-icon class="mr-2" icon="mdi-broadcast" />
                    {{ $t('whip.settings') }}
                </v-card-title>
            </v-card-item>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="endpointUrl"
                            :disabled="store.isConnected || store.isConnecting"
                            :label="$t('whip.endpointUrl')"
                            :placeholder="$t('whip.endpointUrlPlaceholder')"
                            prepend-inner-icon="mdi-link-variant"
                            variant="outlined"
                            clearable
                            density="compact"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="bearerToken"
                            :disabled="store.isConnected || store.isConnecting"
                            :label="$t('whip.bearerToken')"
                            :placeholder="$t('whip.bearerTokenPlaceholder')"
                            prepend-inner-icon="mdi-key"
                            variant="outlined"
                            clearable
                            density="compact"
                            :type="showToken ? 'text' : 'password'"
                            :append-inner-icon="showToken ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showToken = !showToken"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Status & Preview -->
        <v-card class="mb-4" variant="outlined">
            <v-card-item>
                <v-card-title class="text-h6">
                    <v-icon class="mr-2" icon="mdi-monitor-dashboard" />
                    {{ $t('whip.preview') }}
                </v-card-title>
            </v-card-item>
            <v-card-text>
                <!-- Video preview -->
                <div class="video-wrapper rounded mb-3">
                    <video
                        ref="localVideoRef"
                        class="local-video"
                        autoplay
                        muted
                        playsinline
                    />
                    <div v-if="!store.localStream && !store.isConnecting" class="video-placeholder d-flex align-center justify-center">
                        <div class="text-center text-medium-emphasis">
                            <v-icon icon="mdi-video-off-outline" size="48" class="mb-2" />
                            <p>{{ $t('whip.noCamera') }}</p>
                        </div>
                    </div>
                    <div v-if="store.isConnecting" class="video-placeholder d-flex align-center justify-center">
                        <div class="text-center">
                            <v-progress-circular indeterminate color="primary" class="mb-2" />
                            <p>{{ $t('whip.connecting') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Status chips -->
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <v-chip
                        :color="statusColor"
                        variant="tonal"
                        size="small"
                    >
                        <v-icon start icon="mdi-circle" size="8" />
                        {{ $t(`whip.status.${store.status}`) }}
                    </v-chip>
                    <v-chip v-if="store.isConnected" color="success" variant="tonal" size="small">
                        <v-icon start icon="mdi-check-circle" size="16" />
                        {{ $t('whip.connected') }}
                    </v-chip>
                    <v-chip v-if="store.errorMessage" color="error" variant="tonal" size="small">
                        <v-icon start icon="mdi-alert-circle" size="16" />
                        {{ store.errorMessage }}
                    </v-chip>
                </div>

                <!-- Stream Stats -->
                <div v-if="store.isConnected" class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">{{ $t('whip.stats.bitrate') }}</span>
                        <span class="stat-value">{{ formatBitrate(store.bitrate) }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">{{ $t('whip.stats.packetsLost') }}</span>
                        <span class="stat-value">{{ store.packetsLost }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">{{ $t('whip.stats.rtt') }}</span>
                        <span class="stat-value">{{ store.roundTripTime }} ms</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">{{ $t('whip.stats.ice') }}</span>
                        <span class="stat-value">{{ store.iceCandidateCount }}</span>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <!-- Controls -->
        <v-card variant="outlined">
            <v-card-text>
                <div class="d-flex flex-wrap gap-2">
                    <template v-if="!store.isConnected && !store.isConnecting">
                        <v-btn
                            color="primary"
                            :disabled="!endpointUrl"
                            prepend-icon="mdi-broadcast"
                            @click="handleStart"
                        >
                            {{ $t('whip.startStream') }}
                        </v-btn>
                    </template>
                    <template v-else-if="store.isConnecting">
                        <v-btn color="warning" disabled prepend-icon="mdi-loading">
                            {{ $t('whip.connecting') }}
                        </v-btn>
                    </template>
                    <template v-else>
                        <v-btn
                            color="error"
                            prepend-icon="mdi-broadcast-off"
                            @click="handleStop"
                        >
                            {{ $t('whip.stopStream') }}
                        </v-btn>
                    </template>

                    <!-- Mute controls (only when streaming) -->
                    <template v-if="store.localStream">
                        <v-btn
                            :color="audioEnabled ? 'default' : 'error'"
                            :variant="audioEnabled ? 'outlined' : 'tonal'"
                            prepend-icon="mdi-microphone"
                            @click="handleToggleAudio"
                        >
                            {{ audioEnabled ? $t('whip.mute') : $t('whip.unmute') }}
                        </v-btn>
                        <v-btn
                            :color="videoEnabled ? 'default' : 'error'"
                            :variant="videoEnabled ? 'outlined' : 'tonal'"
                            prepend-icon="mdi-video"
                            @click="handleToggleVideo"
                        >
                            {{ videoEnabled ? $t('whip.turnOffVideo') : $t('whip.turnOnVideo') }}
                        </v-btn>
                    </template>

                    <v-spacer />

                    <!-- Copy SDP -->
                    <v-btn
                        v-if="store.remoteDescription"
                        variant="outlined"
                        prepend-icon="mdi-content-copy"
                        size="small"
                        @click="copySdp"
                    >
                        {{ $t('whip.copySdp') }}
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { useWhipStore } from '~/stores/whip';
import { useWhipClient } from '~/composables/useWhipClient';

const { t } = useI18n();
const store = useWhipStore();
const client = useWhipClient();

const endpointUrl = ref(store.endpointUrl || '');
const bearerToken = ref(store.bearerToken || '');
const showToken = ref(false);
const localVideoRef = ref<HTMLVideoElement | null>(null);
const audioEnabled = ref(true);
const videoEnabled = ref(true);

// Attach video stream to <video> element
watch(() => store.localStream, (stream) => {
    if (localVideoRef.value && stream) {
        localVideoRef.value.srcObject = stream;
    }
}, { immediate: true });

const statusColor = computed(() => {
    switch (store.status) {
        case 'connected': return 'success';
        case 'connecting': return 'warning';
        case 'error': return 'error';
        case 'disconnected': return 'grey';
        default: return 'default';
    }
});

async function handleStart() {
    audioEnabled.value = true;
    videoEnabled.value = true;
    await client.startStream(endpointUrl.value, bearerToken.value);
}

async function handleStop() {
    await client.stopStream();
}

function handleToggleAudio() {
    const enabled = client.toggleAudio();
    if (enabled !== null) audioEnabled.value = enabled;
}

function handleToggleVideo() {
    const enabled = client.toggleVideo();
    if (enabled !== null) videoEnabled.value = enabled;
}

function formatBitrate(bps: number): string {
    if (bps === 0) return '0 bps';
    if (bps < 1000) return `${bps} bps`;
    if (bps < 1_000_000) return `${(bps / 1000).toFixed(1)} Kbps`;
    return `${(bps / 1_000_000).toFixed(2)} Mbps`;
}

async function copySdp() {
    try {
        await navigator.clipboard.writeText(store.remoteDescription);
    }
    catch {
        // Fallback: select text
    }
}

// Cleanup on unmount
onUnmounted(() => {
    client.cleanup();
    store.reset();
});
</script>

<style scoped>
.video-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
}

.local-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
}

.video-placeholder {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
}

.stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 12px;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.stat-value {
    font-size: 14px;
    font-weight: 600;
}
</style>

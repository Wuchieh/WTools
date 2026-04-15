<template>
    <div class="whip-streamer">
        <!-- Endpoint Settings -->
        <v-card
            class="mb-4"
            variant="outlined"
        >
            <v-card-item>
                <v-card-title class="text-h6">
                    <v-icon
                        class="mr-2"
                        icon="mdi-broadcast"
                    />
                    {{ $t('whip.settings') }}
                </v-card-title>
            </v-card-item>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="endpointUrl"
                            density="compact"
                            prepend-inner-icon="mdi-link-variant"
                            variant="outlined"
                            :disabled="store.isConnected || store.isConnecting"
                            :label="$t('whip.endpointUrl')"
                            :placeholder="$t('whip.endpointUrlPlaceholder')"
                            clearable
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="bearerToken"
                            density="compact"
                            prepend-inner-icon="mdi-key"
                            variant="outlined"
                            :append-inner-icon="showToken ? 'mdi-eye-off' : 'mdi-eye'"
                            :disabled="store.isConnected || store.isConnecting"
                            :label="$t('whip.bearerToken')"
                            :placeholder="$t('whip.bearerTokenPlaceholder')"
                            :type="showToken ? 'text' : 'password'"
                            clearable
                            @click:append-inner="showToken = !showToken"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Status & Preview -->
        <v-card
            class="mb-4"
            variant="outlined"
        >
            <v-card-item>
                <v-card-title class="text-h6">
                    <v-icon
                        class="mr-2"
                        icon="mdi-monitor-dashboard"
                    />
                    {{ $t('whip.preview') }}
                </v-card-title>
            </v-card-item>
            <v-card-text>
                <!-- Video preview -->
                <div class="video-wrapper mb-3 rounded">
                    <video
                        ref="localVideoRef"
                        class="local-video"
                        autoplay
                        muted
                        playsinline
                    />
                    <div
                        v-if="!store.localStream && !store.isConnecting"
                        class="align-center d-flex video-placeholder justify-center"
                    >
                        <div class="text-medium-emphasis text-center">
                            <v-icon
                                class="mb-2"
                                icon="mdi-video-off-outline"
                                size="48"
                            />
                            <p>{{ $t('whip.noCamera') }}</p>
                        </div>
                    </div>
                    <div
                        v-if="store.isConnecting"
                        class="align-center d-flex video-placeholder justify-center"
                    >
                        <div class="text-center">
                            <v-progress-circular
                                class="mb-2"
                                color="primary"
                                indeterminate
                            />
                            <p>{{ $t('whip.connecting') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Status chips -->
                <div class="d-flex mb-3 flex-wrap gap-2">
                    <v-chip
                        size="small"
                        variant="tonal"
                        :color="statusColor"
                    >
                        <v-icon
                            icon="mdi-circle"
                            size="8"
                            start
                        />
                        {{ $t(`whip.status.${store.status}`) }}
                    </v-chip>
                    <v-chip
                        v-if="store.isConnected"
                        color="success"
                        size="small"
                        variant="tonal"
                    >
                        <v-icon
                            icon="mdi-check-circle"
                            size="16"
                            start
                        />
                        {{ $t('whip.connected') }}
                    </v-chip>
                    <v-chip
                        v-if="store.errorMessage"
                        color="error"
                        size="small"
                        variant="tonal"
                    >
                        <v-icon
                            icon="mdi-alert-circle"
                            size="16"
                            start
                        />
                        {{ store.errorMessage }}
                    </v-chip>
                </div>

                <!-- Stream Stats -->
                <div
                    v-if="store.isConnected"
                    class="stats-row"
                >
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
                            prepend-icon="mdi-broadcast"
                            :disabled="!endpointUrl"
                            @click="handleStart"
                        >
                            {{ $t('whip.startStream') }}
                        </v-btn>
                    </template>
                    <template v-else-if="store.isConnecting">
                        <v-btn
                            color="warning"
                            prepend-icon="mdi-loading"
                            disabled
                        >
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
                            prepend-icon="mdi-microphone"
                            :color="audioEnabled ? 'default' : 'error'"
                            :variant="audioEnabled ? 'outlined' : 'tonal'"
                            @click="handleToggleAudio"
                        >
                            {{ audioEnabled ? $t('whip.mute') : $t('whip.unmute') }}
                        </v-btn>
                        <v-btn
                            prepend-icon="mdi-video"
                            :color="videoEnabled ? 'default' : 'error'"
                            :variant="videoEnabled ? 'outlined' : 'tonal'"
                            @click="handleToggleVideo"
                        >
                            {{ videoEnabled ? $t('whip.turnOffVideo') : $t('whip.turnOnVideo') }}
                        </v-btn>
                    </template>

                    <v-spacer />

                    <!-- Copy SDP -->
                    <v-btn
                        v-if="store.remoteDescription"
                        prepend-icon="mdi-content-copy"
                        size="small"
                        variant="outlined"
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
import { useWhipClient } from '~/composables/useWhipClient';
import { useWhipStore } from '~/stores/whip';

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
        case 'disconnected': return 'grey';
        case 'error': return 'error';
        default: return 'default';
    }
});

async function copySdp() {
    try {
        await navigator.clipboard.writeText(store.remoteDescription);
    } catch {
        // Fallback: select text
    }
}

function formatBitrate(bps: number): string {
    if (bps === 0) return '0 bps';
    if (bps < 1000) return `${bps} bps`;
    if (bps < 1_000_000) return `${(bps / 1000).toFixed(1)} Kbps`;
    return `${(bps / 1_000_000).toFixed(2)} Mbps`;
}

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

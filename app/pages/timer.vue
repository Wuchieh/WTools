<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('timer.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('timer.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card
                    class="text-center"
                    border
                >
                    <v-card-text class="py-6">
                        <div class="font-weight-bold text-h1 mb-6">
                            {{ display }}
                        </div>
                        <v-btn-toggle class="mb-6">
                            <v-btn
                                v-if="!running"
                                color="success"
                                @click="start"
                            >
                                {{ $t('timer.start') }}
                            </v-btn>
                            <v-btn
                                v-else
                                color="warning"
                                @click="pause"
                            >
                                {{ $t('timer.pause') }}
                            </v-btn>
                            <v-btn
                                color="error"
                                @click="reset"
                            >
                                {{ $t('timer.reset') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-row justify="center">
                            <v-col cols="4">
                                <v-text-field
                                    v-model.number="setHours"
                                    density="compact"
                                    min="0"
                                    type="number"
                                    :label="$t('timer.hours')"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    v-model.number="setMinutes"
                                    density="compact"
                                    max="59"
                                    min="0"
                                    type="number"
                                    :label="$t('timer.minutes')"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    v-model.number="setSeconds"
                                    density="compact"
                                    max="59"
                                    min="0"
                                    type="number"
                                    :label="$t('timer.seconds')"
                                />
                            </v-col>
                        </v-row>
                        <v-alert
                            v-if="alarm"
                            class="mt-4"
                            type="success"
                        >
                            {{ $t('timer.done') }}
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
    description: t('timer.subtitle'),
    ogImage: '/og/timer.png',

    title: t('timer.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/timer.png',
});

const remaining = ref(0);
const running = ref(false);
const alarm = ref(false);
const setHours = ref(0);
const setMinutes = ref(5);
const setSeconds = ref(0);
let interval: null | ReturnType<typeof setInterval> = null;
let targetTime = 0; // Unix ms when timer should reach 0
let audioCtx: AudioContext | null = null;
let beepTimeout: null | ReturnType<typeof setTimeout> = null;

const display = computed(() => {
    const s = Math.max(0, Math.floor(remaining.value));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
});

function pause() {
    running.value = false;
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function playBeep(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
}

function reset() {
    pause();
    stopAlarmSound();
    targetTime = 0;
    remaining.value = 0;
    alarm.value = false;
}

function scheduleNextBeep(ctx: AudioContext) {
    beepTimeout = setTimeout(() => {
        if (!alarm.value) return; // stopped
        playBeep(ctx);
        scheduleNextBeep(ctx);
    }, 500);
}

function start() {
    if (running.value) return;

    if (remaining.value <= 0) {
        remaining.value = setHours.value * 3600 + setMinutes.value * 60 + setSeconds.value;
    }
    // Use wall-clock time for accuracy: target is now + remaining seconds
    targetTime = Date.now() + remaining.value * 1000;
    running.value = true;
    alarm.value = false;
    stopAlarmSound(); // clean up any previous alarm

    interval = setInterval(() => {
        // Recalculate from wall-clock to avoid setInterval drift
        remaining.value = Math.max(0, (targetTime - Date.now()) / 1000);
        if (remaining.value <= 0) {
            remaining.value = 0;
            pause();
            alarm.value = true;
            startAlarmSound();
        }
    }, 100); // Update frequently for smooth display
}

function startAlarmSound() {
    try {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        playBeep(audioCtx);
        scheduleNextBeep(audioCtx);
    } catch {
        // Audio not supported
    }
}

function stopAlarmSound() {
    if (beepTimeout) {
        clearTimeout(beepTimeout);
        beepTimeout = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

onUnmounted(() => {
    if (interval) clearInterval(interval);
    stopAlarmSound();
});
</script>

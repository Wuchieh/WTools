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
useHead({
    meta: [
        {
            content: t('timer.subtitle'),
            name: 'description',
        },
    ],
    title: t('timer.title'),

    ogImage: '/og/timer.png',
    twitterCard: 'summary_large_image',
    twitterImage: '/og/timer.png'});

const _totalSeconds = ref(0);
const remaining = ref(0);
const running = ref(false);
const alarm = ref(false);
const setHours = ref(0);
const setMinutes = ref(5);
const setSeconds = ref(0);
let interval: null | ReturnType<typeof setInterval> = null;

const display = computed(() => {
    const s = remaining.value;
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

function reset() {
    pause();
    remaining.value = 0;
    alarm.value = false;
}

function start() {
    if (remaining.value === 0) {
        remaining.value = setHours.value * 3600 + setMinutes.value * 60 + setSeconds.value;
    }
    running.value = true;
    alarm.value = false;
    interval = setInterval(() => {
        if (remaining.value > 0) remaining.value--;
        else {
            pause();
            alarm.value = true;
        }
    }, 1000);
}

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
});
</script>

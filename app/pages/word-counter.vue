<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('wordCounter.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('wordCounter.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="text"
                            class="mb-4"
                            rows="10"
                            :label="$t('wordCounter.input')"
                            border
                        />
                        <v-row>
                            <v-col
                                v-for="stat in stats"
                                :key="stat.label"
                                cols="4"
                                sm="3"
                            >
                                <v-card
                                    class="pa-3 text-center"
                                    variant="tonal"
                                >
                                    <div class="font-weight-bold text-h5">
                                        {{ stat.value }}
                                    </div>
                                    <div class="text-caption">
                                        {{ stat.label }}
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
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
            content: t('wordCounter.subtitle'),
            name: 'description',
        },
    ],
    ogImage: '/og/word-counter.png',

    title: t('wordCounter.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/word-counter.png',
});

const text = ref('');
const stats = computed(() => {
    const s = text.value.trim();
    const words = s ? s.split(/\s+/).length : 0;
    const chars = text.value.length;
    const charsNoSpace = text.value.replace(/\s/g, '').length;
    const lines = text.value ? text.value.split('\n').length : 0;
    return [
        {
            label: t('wordCounter.words'),
            value: words,
        },
        {
            label: t('wordCounter.chars'),
            value: chars,
        },
        {
            label: t('wordCounter.charsNoSpace'),
            value: charsNoSpace,
        },
        {
            label: t('wordCounter.lines'),
            value: lines,
        },
    ];
});
</script>

<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('sentenceCounter.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('sentenceCounter.subtitle') }}
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
                            rows="10"
                            :label="$t('sentenceCounter.input')"
                            border
                        />
                        <v-card
                            class="pa-4 mt-4 text-center"
                            variant="tonal"
                        >
                            <div class="font-weight-bold text-h4">
                                {{ count }}
                            </div>
                            <div class="text-caption">
                                {{ $t('sentenceCounter.sentences') }}
                            </div>
                        </v-card>
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
            content: t('sentenceCounter.subtitle'),
            name: 'description',
        }
    ],
    title: t('sentenceCounter.title'),

    ogImage: '/og/sentence-counter.png',
    twitterCard: 'summary_large_image',
    twitterImage: '/og/sentence-counter.png'});
const text = ref('');
const count = computed(() => (text.value.match(/[.!?]+/g) || []).length);
</script>

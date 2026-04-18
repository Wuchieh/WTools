<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('watermark.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('watermark.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
                md="10"
            >
                <WatermarkTool />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
    description: t('watermark.subtitle'),
    ogImage: '/og/image-watermark.png',

    title: t('watermark.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/image-watermark.png',
});
</script>

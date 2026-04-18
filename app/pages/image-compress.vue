<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('compressor.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('compressor.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
                md="10"
            >
                <ImageCompressor />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({
    meta: [
        {
            content: t('compressor.subtitle'),
            name: 'description',
        },
    ],
    ogImage: '/og/image-compress.png',

    title: t('compressor.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/image-compress.png',
});
</script>

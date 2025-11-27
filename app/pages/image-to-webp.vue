<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('hero.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('hero.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="6"
                md="8"
            >
                <ImageUploader />
                <ImagePreview
                    v-if="store.images.length > 0"
                />
                <ConversionResult
                    v-if="store.hasConverted"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useConverterStore } from '~/stores/converter';

const { t } = useI18n();
const store = useConverterStore();

useHead({
    meta: [
        {
            content: t('description'),
            name: 'description',
        },
    ],
    title: t('title'),
});
</script>

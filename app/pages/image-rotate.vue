<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('rotate.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('rotate.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="10" md="12">
                <RotateFlipTool />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('rotate.subtitle'), name: 'description' }], title: t('rotate.title') });
</script>

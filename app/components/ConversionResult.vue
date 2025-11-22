<template>
    <div
        class="bg-surface elevation-1 pa-6 result-container mt-8 rounded-lg border"
    >
        <div class="text-h5 mb-4">
            {{ $t('result.complete') }}
        </div>

        <div class="d-flex mb-6 gap-4">
            <v-chip
                color="success"
                size="large"
                variant="flat"
            >
                {{ $t('result.success') }}: {{ store.successCount }}
            </v-chip>
            <v-chip
                v-if="store.errorCount > 0"
                color="error"
                size="large"
                variant="flat"
            >
                {{ $t('result.failed') }}: {{ store.errorCount }}
            </v-chip>
        </div>

        <div
            v-if="store.errorCount > 0"
            class="mb-6"
        >
            <div class="text-error text-subtitle-1 mb-2">
                {{ $t('result.errors') }}:
            </div>
            <v-list
                class="bg-transparent"
                density="compact"
            >
                <v-list-item
                    v-for="img in store.images.filter(i => i.status === 'error')"
                    :key="img.id"
                    color="error"
                    prepend-icon="mdi-alert-circle"
                    :subtitle="img.error"
                    :title="img.file.name"
                />
            </v-list>
        </div>

        <div class="d-flex justify-end">
            <v-btn
                v-if="store.successCount > 0"
                color="success"
                prepend-icon="mdi-download"
                size="large"
                @click="store.downloadZip"
            >
                {{ $t('result.download') }}
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useConverterStore } from '~/stores/converter';

const store = useConverterStore();
</script>

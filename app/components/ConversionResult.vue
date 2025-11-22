<script setup lang="ts">
import { useConverterStore } from '~/stores/converter'

const store = useConverterStore()
</script>

<template>
  <div v-if="store.hasConverted" class="result-container mt-8 pa-6 bg-surface rounded-lg elevation-1 border">
    <div class="text-h5 mb-4">{{ $t('result.complete') }}</div>
    
    <div class="d-flex gap-4 mb-6">
      <v-chip color="success" variant="flat" size="large">
        {{ $t('result.success') }}: {{ store.successCount }}
      </v-chip>
      <v-chip v-if="store.errorCount > 0" color="error" variant="flat" size="large">
        {{ $t('result.failed') }}: {{ store.errorCount }}
      </v-chip>
    </div>

    <div v-if="store.errorCount > 0" class="mb-6">
      <div class="text-subtitle-1 text-error mb-2">{{ $t('result.errors') }}:</div>
      <v-list density="compact" class="bg-transparent">
        <v-list-item
          v-for="img in store.images.filter(i => i.status === 'error')"
          :key="img.id"
          :title="img.file.name"
          :subtitle="img.error"
          prepend-icon="mdi-alert-circle"
          color="error"
        ></v-list-item>
      </v-list>
    </div>

    <div class="d-flex justify-end">
      <v-btn
        v-if="store.successCount > 0"
        color="success"
        size="large"
        prepend-icon="mdi-download"
        @click="store.downloadZip"
      >
        {{ $t('result.download') }}
      </v-btn>
    </div>
  </div>
</template>

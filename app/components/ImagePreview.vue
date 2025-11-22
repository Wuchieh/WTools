<script setup lang="ts">
import { useConverterStore } from '~/stores/converter'

const store = useConverterStore()
</script>

<template>
  <div v-if="store.images.length > 0" class="preview-container mt-8">
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-h6">{{ $t('preview.selectedImages') }} ({{ store.images.length }})</div>
      <v-btn
        color="error"
        variant="text"
        size="small"
        @click="store.reset"
      >
        {{ $t('preview.clearAll') }}
      </v-btn>
    </div>

    <v-carousel
      hide-delimiters
      height="400"
      show-arrows="hover"
      class="rounded-lg elevation-2 bg-grey-lighten-4"
    >
      <v-carousel-item
        v-for="(img, index) in store.images"
        :key="img.id"
      >
        <div class="d-flex fill-height align-center justify-center position-relative">
          <v-img
            :src="img.preview"
            max-height="100%"
            max-width="100%"
            contain
          ></v-img>
          
          <div class="image-overlay d-flex flex-column justify-space-between pa-4">
            <div class="d-flex justify-end">
              <v-btn
                icon="mdi-close"
                color="error"
                variant="flat"
                size="small"
                @click.stop="store.removeFile(img.id)"
              ></v-btn>
            </div>
            <div class="image-info bg-black text-white pa-2 rounded opacity-70 text-truncate">
              {{ img.file.name }} ({{ (img.file.size / 1024).toFixed(1) }} KB)
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>

    <div class="d-flex justify-center mt-6">
      <v-btn
        color="primary"
        size="large"
        :loading="store.isConverting"
        :disabled="store.isConverting"
        @click="store.convertImages"
      >
        {{ $t('preview.convert') }}
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.image-overlay .v-btn {
  pointer-events: auto;
}
</style>

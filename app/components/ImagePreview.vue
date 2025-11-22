<template>
    <div
        class="preview-container mt-8"
    >
        <div class="align-center d-flex justify-space-between mb-4">
            <div class="text-h6">
                {{ $t('preview.selectedImages') }} ({{ store.images.length }})
            </div>
            <v-btn
                color="error"
                size="small"
                variant="text"
                @click="store.reset"
            >
                {{ $t('preview.clearAll') }}
            </v-btn>
        </div>

        <v-carousel
            class="bg-grey-lighten-4 elevation-2 rounded-lg"
            height="400"
            show-arrows="hover"
            hide-delimiters
        >
            <v-carousel-item
                v-for="(img) in store.images"
                :key="img.id"
            >
                <div class="align-center d-flex fill-height position-relative justify-center">
                    <v-img
                        max-height="100%"
                        max-width="100%"
                        :src="img.preview"
                        contain
                    />

                    <div class="d-flex flex-column image-overlay justify-space-between pa-4">
                        <div class="d-flex justify-end">
                            <v-btn
                                color="error"
                                icon="mdi-close"
                                size="small"
                                variant="flat"
                                @click.stop="store.removeFile(img.id)"
                            />
                        </div>
                        <div class="image-info pa-2 text-truncate rounded bg-black text-white opacity-70">
                            {{ img.file.name }} ({{ (img.file.size / 1024).toFixed(1) }} KB)
                        </div>
                    </div>
                </div>
            </v-carousel-item>
        </v-carousel>

        <div class="d-flex mt-6 justify-center">
            <v-btn
                color="primary"
                size="large"
                :disabled="store.isConverting"
                :loading="store.isConverting"
                @click="store.convertImages"
            >
                {{ $t('preview.convert') }}
                <v-icon end>
                    mdi-arrow-right
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useConverterStore } from '~/stores/converter';

const store = useConverterStore();
</script>

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

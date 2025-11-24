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

        <div class="mb-6">
            <div class="text-subtitle-2 mb-2">
                {{ $t('preview.quality') }}: {{ store.quality }}
            </div>
            <v-slider
                v-model="store.quality"
                color="primary"
                max="1"
                min="0.1"
                step="0.1"
                hide-details
                thumb-label
            />
        </div>

        <div class="position-relative">
            <div class="image-counter text-white bg-black rounded px-2 py-1 opacity-70 text-caption">
                {{ currentIndex + 1 }} / {{ store.images.length }}
            </div>

            <swiper
                :modules="[SwiperNavigation]"
                navigation
                loop
                class="bg-grey-lighten-4 elevation-2 rounded-lg"
                :slides-per-view="1"
                :space-between="20"
                style="height: 400px;"
                @slide-change="onSlideChange"
            >
                <swiper-slide
                    v-for="(img) in store.images"
                    :key="img.id"
                >
                    <div class="align-center d-flex fill-height position-relative justify-center">
                        <v-img
                            class="fill-height"
                            max-height="100%"
                            max-width="100%"
                            :src="img.preview"
                            contain
                        >
                            <div class="d-flex flex-column fill-height justify-space-between image-overlay">
                                <div class="d-flex justify-end pa-4">
                                    <v-btn
                                        color="error"
                                        class="mr-2"
                                        icon="mdi-close"
                                        size="small"
                                        variant="flat"
                                        @click.stop="store.removeFile(img.id)"
                                    />
                                </div>
                                <div class="image-info pa-2 text-truncate rounded bg-black text-white opacity-70 mx-4 mb-4">
                                    {{ img.file.name }} ({{ (img.file.size / 1024).toFixed(1) }} KB)
                                </div>
                            </div>
                        </v-img>
                    </div>
                </swiper-slide>
            </swiper>
        </div>

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
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useConverterStore } from '~/stores/converter';

const store = useConverterStore();
const currentIndex = ref(0);

const onSlideChange = (swiper: any) => {
    currentIndex.value = swiper.realIndex;
};
</script>

<style scoped>
.image-overlay {
  pointer-events: none;
}

.image-overlay .v-btn {
  pointer-events: auto;
}

:deep(.swiper-slide) {
  height: 100%;
}

.image-counter {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
}
</style>

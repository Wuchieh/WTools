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

            <div class="text-subtitle-2 mb-2 mt-4">
                {{ $t('preview.concurrency') }}: {{ store.concurrency }}
            </div>
            <v-slider
                v-model="store.concurrency"
                color="primary"
                max="10"
                min="1"
                step="1"
                hide-details
                thumb-label
            />
        </div>

        <div class="position-relative">
            <div class="image-counter text-caption rounded bg-black px-2 py-1 text-white opacity-70">
                {{ currentIndex + 1 }} / {{ store.images.length }}
            </div>

            <Swiper
                class="bg-grey-lighten-4 elevation-2 rounded-lg"
                style="height: 400px;"
                :modules="[SwiperNavigation]"
                :slides-per-view="1"
                :space-between="20"
                loop
                navigation
                @slide-change="onSlideChange"
            >
                <SwiperSlide
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
                            <div class="d-flex fill-height flex-column image-overlay justify-space-between">
                                <div class="d-flex pa-4 justify-end">
                                    <v-btn
                                        class="mr-2"
                                        color="error"
                                        icon="mdi-close"
                                        size="small"
                                        variant="flat"
                                        @click.stop="store.removeFile(img.id)"
                                    />
                                </div>
                                <div
                                    class="image-info pa-2 text-truncate mx-4 mb-4
                                 rounded bg-black text-white opacity-70"
                                >
                                    {{ img.file.name }} ({{ (img.file.size / 1024).toFixed(1) }} KB)
                                </div>
                            </div>
                        </v-img>
                    </div>
                </SwiperSlide>
            </Swiper>
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
import 'swiper/css';
import 'swiper/css/navigation';

import { Navigation as SwiperNavigation } from 'swiper/modules';
import {
    Swiper,
    SwiperSlide,
} from 'swiper/vue';

import { useConverterStore } from '~/stores/converter';

const store = useConverterStore();
const currentIndex = ref(0);

function onSlideChange(swiper: any) {
    currentIndex.value = swiper.realIndex;
}
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

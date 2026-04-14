<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon icon="mdi-crop" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('crop.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('crop.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                :label="$t('uploader.selectFiles')"
                prepend-icon="mdi-camera"
                multiple
                accept="image/*"
                show-size
                border
                class="mb-4"
                @update:model-value="handleFiles"
            />

            <!-- Settings -->
            <v-row class="mb-4">
                <v-col cols="4">
                    <v-select
                        v-model="store.outputFormat"
                        :items="formats"
                        :label="$t('crop.outputFormat')"
                        density="compact"
                    />
                </v-col>
                <v-col cols="4">
                    <v-select
                        v-model="store.aspectRatio"
                        :items="ratios"
                        :label="$t('crop.aspectRatio')"
                        density="compact"
                        clearable
                    />
                </v-col>
                <v-col cols="4">
                    <v-slider
                        v-model="store.quality"
                        :label="$t('crop.quality', { v: Math.round(store.quality * 100) })"
                        :min="0.1"
                        :max="1"
                        :step="0.05"
                        thumb-label
                        density="compact"
                    />
                </v-col>
            </v-row>

            <!-- File List with Crop Previews -->
            <v-row v-if="store.files.length > 0">
                <v-col
                    v-for="f in store.files"
                    :key="f.id"
                    cols="12"
                    md="6"
                >
                    <v-card border>
                        <v-img
                            :src="f.preview"
                            max-height="300"
                            cover
                            class="crop-container"
                            @mousedown="startCrop($event, f)"
                            @touchstart.prevent="startCrop($event, f)"
                        >
                            <div
                                class="crop-overlay"
                                :style="getCropStyle(f)"
                            />
                        </v-img>
                        <v-card-text>
                            <div class="text-caption">{{ f.file.name }}</div>
                            <div class="text-caption text-medium-emphasis">
                                {{ $t('crop.selected', { x: Math.round(f.crop.x), y: Math.round(f.crop.y), w: Math.round(f.crop.width), h: Math.round(f.crop.height) }) }}
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-chip
                                v-if="f.status === 'success'"
                                color="success"
                                size="small"
                                class="mr-2"
                            >
                                {{ $t('result.success') }}
                            </v-chip>
                            <v-chip
                                v-else-if="f.status === 'error'"
                                color="error"
                                size="small"
                                class="mr-2"
                            >
                                {{ f.error }}
                            </v-chip>
                            <v-spacer />
                            <v-btn
                                icon="mdi-close"
                                size="x-small"
                                variant="text"
                                @click="store.removeFile(f.id)"
                            />
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions v-if="store.files.length > 0">
            <v-btn color="warning" variant="text" @click="store.clearAll()">
                {{ $t('preview.clearAll') }}
            </v-btn>
            <v-spacer />
            <v-btn
                color="primary"
                :loading="store.isConverting"
                @click="store.convertFiles()"
            >
                {{ $t('crop.crop') }}
            </v-btn>
            <v-btn
                color="success"
                :disabled="!store.hasConverted || store.successCount === 0"
                @click="store.downloadZip()"
            >
                {{ $t('result.download') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useCropStore, type CropFile } from '~/stores/crop';

const store = useCropStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    { title: 'WebP', value: 'image/webp' },
    { title: 'JPEG', value: 'image/jpeg' },
    { title: 'PNG', value: 'image/png' },
];

const ratios = [
    { title: '1:1', value: 1 },
    { title: '4:3', value: 4 / 3 },
    { title: '16:9', value: 16 / 9 },
    { title: '3:2', value: 3 / 2 },
    { title: 'Free', value: null },
];

let dragging = false;
let dragFile: CropFile | null = null;
let dragStartX = 0;
let dragStartY = 0;
let cropStart = { x: 0, y: 0, w: 0, h: 0 };

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}

function startCrop(e: MouseEvent | TouchEvent, f: CropFile) {
    dragging = true;
    dragFile = f;
    cropStart = { ...f.crop };
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    if (e instanceof MouseEvent) {
        dragStartX = e.clientX - rect.left;
        dragStartY = e.clientY - rect.top;
    } else {
        dragStartX = e.touches[0].clientX - rect.left;
        dragStartY = e.touches[0].clientY - rect.top;
    }

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopCrop);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopCrop);
}

function onDrag(e: MouseEvent | TouchEvent) {
    if (!dragging || !dragFile) return;
    const rect = document.querySelector('.crop-container')?.getBoundingClientRect();
    if (!rect) return;

    let cx: number, cy: number;
    if (e instanceof MouseEvent) {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
    } else {
        cx = e.touches[0].clientX - rect.left;
        cy = e.touches[0].clientY - rect.top;
    }

    const dx = cx - dragStartX;
    const dy = cy - dragStartY;
    const pw = rect.width;
    const ph = rect.height;

    let nx = cropStart.x + (dx / pw) * 100;
    let ny = cropStart.y + (dy / ph) * 100;
    let nw = cropStart.w;
    let nh = cropStart.h;

    if (nx < 0) { nw += nx; nx = 0; }
    if (ny < 0) { nh += ny; ny = 0; }
    if (nx + nw > 100) { nw = 100 - nx; }
    if (ny + nh > 100) { nh = 100 - ny; }

    if (store.aspectRatio) {
        nh = nw / store.aspectRatio;
        if (ny + nh > 100) { ny = 100 - nh; }
    }

    store.updateCrop(dragFile.id, {
        x: Math.max(0, nx),
        y: Math.max(0, ny),
        width: Math.max(5, nw),
        height: Math.max(5, nh),
    });
}

function stopCrop() {
    dragging = false;
    dragFile = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopCrop);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopCrop);
}

function getCropStyle(f: CropFile) {
    return {
        position: 'absolute',
        left: `${f.crop.x}%`,
        top: `${f.crop.y}%`,
        width: `${f.crop.width}%`,
        height: `${f.crop.height}%`,
        border: '2px solid white',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        cursor: 'move',
    };
}
</script>

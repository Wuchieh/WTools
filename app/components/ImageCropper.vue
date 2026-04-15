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
                                @mousedown.stop="startCrop($event, f)"
                                @touchstart.prevent.stop="startCrop($event, f)"
                            >
                                <!-- Resize handles -->
                                <div class="resize-handle nw" @mousedown.stop="startResize($event, f, 'nw')" @touchstart.prevent.stop="startResize($event, f, 'nw')" />
                                <div class="resize-handle ne" @mousedown.stop="startResize($event, f, 'ne')" @touchstart.prevent.stop="startResize($event, f, 'ne')" />
                                <div class="resize-handle sw" @mousedown.stop="startResize($event, f, 'sw')" @touchstart.prevent.stop="startResize($event, f, 'sw')" />
                                <div class="resize-handle se" @mousedown.stop="startResize($event, f, 'se')" @touchstart.prevent.stop="startResize($event, f, 'se')" />
                                <div class="resize-handle n" @mousedown.stop="startResize($event, f, 'n')" @touchstart.prevent.stop="startResize($event, f, 'n')" />
                                <div class="resize-handle s" @mousedown.stop="startResize($event, f, 's')" @touchstart.prevent.stop="startResize($event, f, 's')" />
                                <div class="resize-handle e" @mousedown.stop="startResize($event, f, 'e')" @touchstart.prevent.stop="startResize($event, f, 'e')" />
                                <div class="resize-handle w" @mousedown.stop="startResize($event, f, 'w')" @touchstart.prevent.stop="startResize($event, f, 'w')" />
                            </div>
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
let activeRect: DOMRect | null = null;
let activeEl: HTMLElement | null = null;
let dragMode: 'move' | 'resize' | null = null;
let resizeHandle = '';

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}

function startCrop(e: MouseEvent | TouchEvent, f: CropFile) {
    dragging = true;
    dragFile = f;
    cropStart = { ...f.crop };
    // Use currentTarget to get the specific v-img element for this file
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    activeRect = rect;
    activeEl = target;
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
    if (!dragging || !dragFile || !activeRect) return;
    const rect = activeRect;

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

    let nx = cropStart.x;
    let ny = cropStart.y;
    let nw = cropStart.w;
    let nh = cropStart.h;

    if (dragMode === 'resize') {
        // Resize based on handle position
        if (resizeHandle.includes('e')) nw = cropStart.w + (dx / pw) * 100;
        if (resizeHandle.includes('w')) { nw = cropStart.w - (dx / pw) * 100; nx = cropStart.x + (dx / pw) * 100; }
        if (resizeHandle.includes('s')) nh = cropStart.h + (dy / ph) * 100;
        if (resizeHandle.includes('n')) { nh = cropStart.h - (dy / ph) * 100; ny = cropStart.y + (dy / ph) * 100; }
    } else {
        // Move
        nx = cropStart.x + (dx / pw) * 100;
        ny = cropStart.y + (dy / ph) * 100;
    }

    if (nx < 0) { if (dragMode === 'resize' && resizeHandle.includes('w')) nw += nx; nx = 0; }
    if (ny < 0) { if (dragMode === 'resize' && resizeHandle.includes('n')) nh += ny; ny = 0; }
    if (nx + nw > 100) { nw = 100 - nx; }
    if (ny + nh > 100) { nh = 100 - ny; }

    if (store.aspectRatio && dragMode === 'resize' && (resizeHandle === 'n' || resizeHandle === 's')) {
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
    dragMode = null;
    activeRect = null;
    activeEl = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopCrop);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopCrop);
}

function startResize(e: MouseEvent | TouchEvent, f: CropFile, handle: string) {
    dragging = true;
    dragFile = f;
    resizeHandle = handle;
    cropStart = { ...f.crop };
    dragMode = 'resize';
    const target = e.currentTarget as HTMLElement;
    const parentEl = target.closest('.v-img') as HTMLElement;
    const rect = parentEl.getBoundingClientRect();
    activeRect = rect;
    activeEl = parentEl;
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

<style scoped>
.resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border: 1px solid #888;
    border-radius: 2px;
    z-index: 10;
}
.resize-handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
.resize-handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-handle.se { bottom: -5px; right: -5px; cursor: se-resize; }
.resize-handle.n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.resize-handle.s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.resize-handle.e { right: -5px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.resize-handle.w { left: -5px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
</style>

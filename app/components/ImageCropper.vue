<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar
                    color="primary"
                    variant="tonal"
                    rounded
                >
                    <v-icon icon="mdi-crop" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('crop.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('crop.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                class="mb-4"
                accept="image/*"
                prepend-icon="mdi-camera"
                :label="$t('uploader.selectFiles')"
                border
                multiple
                show-size
                @update:model-value="handleFiles"
            />

            <!-- Settings -->
            <v-row class="mb-4">
                <v-col cols="4">
                    <v-select
                        v-model="store.outputFormat"
                        density="compact"
                        :items="formats"
                        :label="$t('crop.outputFormat')"
                    />
                </v-col>
                <v-col cols="4">
                    <v-select
                        v-model="store.aspectRatio"
                        density="compact"
                        :items="ratios"
                        :label="$t('crop.aspectRatio')"
                        clearable
                    />
                </v-col>
                <v-col cols="4">
                    <v-slider
                        v-model="store.quality"
                        density="compact"
                        :label="$t('crop.quality', { v: Math.round(store.quality * 100) })"
                        :max="1"
                        :min="0.1"
                        :step="0.05"
                        thumb-label
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
                            class="crop-container"
                            max-height="300"
                            :src="f.preview"
                            cover
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
                                <div
                                    class="nw resize-handle"
                                    @mousedown.stop="startResize($event, f, 'nw')"
                                    @touchstart.prevent.stop="startResize($event, f, 'nw')"
                                />
                                <div
                                    class="ne resize-handle"
                                    @mousedown.stop="startResize($event, f, 'ne')"
                                    @touchstart.prevent.stop="startResize($event, f, 'ne')"
                                />
                                <div
                                    class="resize-handle sw"
                                    @mousedown.stop="startResize($event, f, 'sw')"
                                    @touchstart.prevent.stop="startResize($event, f, 'sw')"
                                />
                                <div
                                    class="resize-handle se"
                                    @mousedown.stop="startResize($event, f, 'se')"
                                    @touchstart.prevent.stop="startResize($event, f, 'se')"
                                />
                                <div
                                    class="n resize-handle"
                                    @mousedown.stop="startResize($event, f, 'n')"
                                    @touchstart.prevent.stop="startResize($event, f, 'n')"
                                />
                                <div
                                    class="resize-handle s"
                                    @mousedown.stop="startResize($event, f, 's')"
                                    @touchstart.prevent.stop="startResize($event, f, 's')"
                                />
                                <div
                                    class="e resize-handle"
                                    @mousedown.stop="startResize($event, f, 'e')"
                                    @touchstart.prevent.stop="startResize($event, f, 'e')"
                                />
                                <div
                                    class="resize-handle w"
                                    @mousedown.stop="startResize($event, f, 'w')"
                                    @touchstart.prevent.stop="startResize($event, f, 'w')"
                                />
                            </div>
                        </v-img>
                        <v-card-text>
                            <div class="text-caption">
                                {{ f.file.name }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                                {{ $t('crop.selected', {
                                    x: Math.round(f.crop.x),
                                    y: Math.round(f.crop.y),
                                    w: Math.round(f.crop.width),
                                    h: Math.round(f.crop.height),
                                }) }}
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-chip
                                v-if="f.status === 'success'"
                                class="mr-2"
                                color="success"
                                size="small"
                            >
                                {{ $t('result.success') }}
                            </v-chip>
                            <v-chip
                                v-else-if="f.status === 'error'"
                                class="mr-2"
                                color="error"
                                size="small"
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
            <v-btn
                color="warning"
                variant="text"
                @click="store.clearAll()"
            >
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
import { useCropStore } from '~/stores/crop';
import type { CropFile } from '~/stores/crop';

const store = useCropStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    {
        title: 'WebP',
        value: 'image/webp',
    },
    {
        title: 'JPEG',
        value: 'image/jpeg',
    },
    {
        title: 'PNG',
        value: 'image/png',
    },
];

const ratios = [
    {
        title: '1:1',
        value: 1,
    },
    {
        title: '4:3',
        value: 4 / 3,
    },
    {
        title: '16:9',
        value: 16 / 9,
    },
    {
        title: '3:2',
        value: 3 / 2,
    },
    {
        title: 'Free',
        value: null,
    },
];

let dragging = false;
let dragFile: CropFile | null = null;
let dragStartX = 0;
let dragStartY = 0;
let cropStart = {
    h: 0,
    w: 0,
    x: 0,
    y: 0,
};
let activeRect: DOMRect | null = null;
let _activeEl: HTMLElement | null = null;
let dragMode: 'move' | 'resize' | null = null;
let resizeHandle = '';

function getCropStyle(f: CropFile): Record<string, string> {
    return {
        border: '2px solid white',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        cursor: 'move',
        height: `${f.crop.height}%`,
        left: `${f.crop.x}%`,
        position: 'absolute' as const,
        top: `${f.crop.y}%`,
        width: `${f.crop.width}%`,
    };
}

function handleFiles(files: File | File[]) {
    if (files) {
        const fileArray = Array.isArray(files) ? files : [files];
        store.addFiles(fileArray);
    }
}

function onDrag(e: MouseEvent | TouchEvent) {
    if (!dragging || !dragFile || !activeRect) return;
    const rect = activeRect;

    let cx: number, cy: number;
    if (e instanceof MouseEvent) {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
    } else {
        const touch = e.touches[0];
        if (!touch) return;
        cx = touch.clientX - rect.left;
        cy = touch.clientY - rect.top;
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
        if (resizeHandle.includes('w')) {
            nw = cropStart.w - (dx / pw) * 100;
            nx = cropStart.x + (dx / pw) * 100;
        }
        if (resizeHandle.includes('s')) nh = cropStart.h + (dy / ph) * 100;
        if (resizeHandle.includes('n')) {
            nh = cropStart.h - (dy / ph) * 100;
            ny = cropStart.y + (dy / ph) * 100;
        }
    } else {
        // Move
        nx = cropStart.x + (dx / pw) * 100;
        ny = cropStart.y + (dy / ph) * 100;
    }

    if (nx < 0) {
        if (dragMode === 'resize' && resizeHandle.includes('w')) nw += nx;
        nx = 0;
    }
    if (ny < 0) {
        if (dragMode === 'resize' && resizeHandle.includes('n')) nh += ny;
        ny = 0;
    }
    if (nx + nw > 100) {
        nw = 100 - nx;
    }
    if (ny + nh > 100) {
        nh = 100 - ny;
    }

    if (store.aspectRatio && dragMode === 'resize') {
        // Enforce aspect ratio for all resize handles (n, s, e, w, nw, ne, sw, se)
        if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
            // Horizontal handles: derive height from width
            nh = nw / store.aspectRatio;
        } else {
            // Vertical handles or corners: derive width from height
            nw = nh * store.aspectRatio;
        }
        // Clamp to bounds after aspect ratio adjustment
        if (ny + nh > 100) {
            ny = 100 - nh;
        }
        if (nx + nw > 100) {
            nx = 100 - nw;
        }
    }

    store.updateCrop(dragFile.id, {
        height: Math.max(5, nh),
        width: Math.max(5, nw),
        x: Math.max(0, nx),
        y: Math.max(0, ny),
    });
}

function startCrop(e: MouseEvent | TouchEvent, f: CropFile) {
    dragging = true;
    dragFile = f;
    dragMode = 'move';
    cropStart = {
        h: f.crop.height,
        w: f.crop.width,
        x: f.crop.x,
        y: f.crop.y,
    };
    // Use currentTarget to get the specific v-img element for this file
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    activeRect = rect;
    _activeEl = target;
    if (e instanceof MouseEvent) {
        dragStartX = e.clientX - rect.left;
        dragStartY = e.clientY - rect.top;
    } else {
        const touch = e.touches[0];
        if (touch) {
            dragStartX = touch.clientX - rect.left;
            dragStartY = touch.clientY - rect.top;
        }
    }

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopCrop);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopCrop);
}

function startResize(e: MouseEvent | TouchEvent, f: CropFile, handle: string) {
    dragging = true;
    dragFile = f;
    resizeHandle = handle;
    cropStart = {
        h: f.crop.height,
        w: f.crop.width,
        x: f.crop.x,
        y: f.crop.y,
    };
    dragMode = 'resize';
    const target = e.currentTarget as HTMLElement;
    const parentEl = target.closest('.v-img') as HTMLElement;
    const rect = parentEl.getBoundingClientRect();
    activeRect = rect;
    _activeEl = parentEl;
    if (e instanceof MouseEvent) {
        dragStartX = e.clientX - rect.left;
        dragStartY = e.clientY - rect.top;
    } else {
        const touch = e.touches[0];
        if (touch) {
            dragStartX = touch.clientX - rect.left;
            dragStartY = touch.clientY - rect.top;
        }
    }
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopCrop);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopCrop);
}

function stopCrop() {
    dragging = false;
    dragFile = null;
    dragMode = null;
    activeRect = null;
    _activeEl = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopCrop);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopCrop);
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
.resize-handle.nw {
    top: -5px;
    left: -5px;
    cursor: nw-resize;
}
.resize-handle.ne {
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}
.resize-handle.sw {
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}
.resize-handle.se {
    bottom: -5px;
    right: -5px;
    cursor: se-resize;
}
.resize-handle.n {
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    cursor: n-resize;
}
.resize-handle.s {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    cursor: s-resize;
}
.resize-handle.e {
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    cursor: e-resize;
}
.resize-handle.w {
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    cursor: w-resize;
}
</style>

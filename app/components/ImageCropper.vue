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
                        <div
                            :ref="el => setWrapperRef(el, f.id)"
                            class="crop-wrapper"
                            @mousedown="startCrop($event, f)"
                            @touchstart.prevent="startCrop($event, f)"
                        >
                            <img
                                :ref="el => setImgRef(el, f.id)"
                                class="crop-image"
                                draggable="false"
                                :src="f.preview"
                            >
                            <div
                                class="crop-overlay"
                                :style="getCropStyle(f)"
                                @mousedown.stop="startMove($event, f)"
                                @touchstart.prevent.stop="startMove($event, f)"
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
                        </div>
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

// --- Refs for DOM elements ---
const wrapperRefs = new Map<string, HTMLElement>();
const imgRefs = new Map<string, HTMLImageElement>();

function setImgRef(el: any, id: string) {
    if (el) imgRefs.set(id, el as HTMLImageElement);
    else imgRefs.delete(id);
}

function setWrapperRef(el: any, id: string) {
    if (el) wrapperRefs.set(id, el as HTMLElement);
    else wrapperRefs.delete(id);
}

// formats / ratios 同原本
const formats: any[] = [];
const ratios: any[] = [];

const MIN_SIZE = 5;

// --- 核心修正：取得圖片在 contain 模式下的實際渲染 Rect ---
// object-fit: contain 會在容器內置中圖片，產生 letterbox
// 必須計算圖片「真實顯示區域」，否則百分比座標會有偏移
function getImageRenderedRect(imgEl: HTMLImageElement): DOMRect {
    const containerRect = imgEl.getBoundingClientRect();
    const naturalW = imgEl.naturalWidth;
    const naturalH = imgEl.naturalHeight;

    if (!naturalW || !naturalH) return containerRect;

    const containerW = containerRect.width;
    const containerH = containerRect.height;
    const containerRatio = containerW / containerH;
    const imageRatio = naturalW / naturalH;

    let renderedH: number, renderedW: number;

    if (imageRatio > containerRatio) {
    // 寬度撐滿，上下有空白
        renderedW = containerW;
        renderedH = containerW / imageRatio;
    } else {
    // 高度撐滿，左右有空白
        renderedH = containerH;
        renderedW = containerH * imageRatio;
    }

    const offsetX = (containerW - renderedW) / 2;
    const offsetY = (containerH - renderedH) / 2;

    return new DOMRect(
        containerRect.left + offsetX,
        containerRect.top + offsetY,
        renderedW,
        renderedH,
    );
}

// --- Drag state ---
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
let activeRenderedRect: DOMRect | null = null; // 改用圖片實際渲染區域
let dragMode: 'move' | 'resize' | null = null;
let resizeHandle = '';

function _initDrag(e: MouseEvent | TouchEvent, f: CropFile, mode: 'move' | 'resize') {
    stopCrop();
    const rect = getRenderedRectForFile(f);
    if (!rect) return;

    dragging = true;
    dragFile = f;
    dragMode = mode;
    activeRenderedRect = rect;
    cropStart = {
        h: f.crop.height,
        w: f.crop.width,
        x: f.crop.x,
        y: f.crop.y,
    };

    const { x, y } = getEventPos(e);
    dragStartX = x - rect.left;
    dragStartY = y - rect.top;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopCrop);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopCrop);
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

function getCropStyle(f: CropFile): Record<string, string> {
    return {
        height: `${f.crop.height}%`,
        left: `${f.crop.x}%`,
        top: `${f.crop.y}%`,
        width: `${f.crop.width}%`,
    };
}

function getEventPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if (e instanceof MouseEvent) {
        return {
            x: e.clientX,
            y: e.clientY,
        };
    }
    const touch = e.touches[0];
    return touch
        ? {
            x: touch.clientX,
            y: touch.clientY,
        }
        : {
            x: 0,
            y: 0,
        };
}

// --- 修正：統一從 imgRef 取得正確的渲染 Rect ---
function getRenderedRectForFile(f: CropFile): DOMRect | null {
    const imgEl = imgRefs.get(f.id);
    if (!imgEl) return null;
    return getImageRenderedRect(imgEl);
}

function handleFiles(files: File | File[]) {
    const fileArray = Array.isArray(files) ? files : files ? [files] : [];
    if (fileArray.length === 0) {
        store.clearAll();
        return;
    }
    store.addFiles(fileArray);
}

function onDrag(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) e.preventDefault();
    if (!dragging || !dragFile || !activeRenderedRect) return;

    const { x: clientX, y: clientY } = getEventPos(e);
    const rect = activeRenderedRect;

    // 座標相對於圖片實際渲染區域
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const dx = cx - dragStartX;
    const dy = cy - dragStartY;
    const pw = rect.width;
    const ph = rect.height;

    let nx = cropStart.x;
    let ny = cropStart.y;
    let nw = cropStart.w;
    let nh = cropStart.h;

    if (dragMode === 'resize') {
        if (resizeHandle.includes('e')) nw = cropStart.w + (dx / pw) * 100;
        if (resizeHandle.includes('w')) {
            const dw = (dx / pw) * 100;
            nw = cropStart.w - dw;
            nx = cropStart.x + dw;
        }
        if (resizeHandle.includes('s')) nh = cropStart.h + (dy / ph) * 100;
        if (resizeHandle.includes('n')) {
            const dh = (dy / ph) * 100;
            nh = cropStart.h - dh;
            ny = cropStart.y + dh;
        }

        if (nw < MIN_SIZE) nw = MIN_SIZE;
        if (nh < MIN_SIZE) nh = MIN_SIZE;

        if (store.aspectRatio) {
            const ratio = store.aspectRatio;
            const isCorner = resizeHandle.length === 2;
            if (isCorner) {
                if (Math.abs(dx) >= Math.abs(dy)) nh = nw / ratio;
                else nw = nh * ratio;
            } else {
                if (resizeHandle === 'e' || resizeHandle === 'w') nh = nw / ratio;
                else nw = nh * ratio;
            }
        }

        if (resizeHandle.includes('w')) nx = cropStart.x + cropStart.w - nw;
        if (resizeHandle.includes('n')) ny = cropStart.y + cropStart.h - nh;

        // 邊界夾制
        nx = clamp(nx, 0, 100 - MIN_SIZE);
        ny = clamp(ny, 0, 100 - MIN_SIZE);
        if (nx + nw > 100) {
            nw = 100 - nx;
            if (store.aspectRatio) nh = nw / store.aspectRatio;
        }
        if (ny + nh > 100) {
            nh = 100 - ny;
            if (store.aspectRatio) nw = nh * store.aspectRatio;
        }
        nw = Math.max(nw, MIN_SIZE);
        nh = Math.max(nh, MIN_SIZE);
    } else {
    // Move
        nx = clamp(cropStart.x + (dx / pw) * 100, 0, 100 - cropStart.w);
        ny = clamp(cropStart.y + (dy / ph) * 100, 0, 100 - cropStart.h);
    }

    store.updateCrop(dragFile.id, {
        height: nh,
        width: nw,
        x: nx,
        y: ny,
    });
}

function startCrop(e: MouseEvent | TouchEvent, f: CropFile) {
    // 在空白區域點擊 → 新建 crop 區域（從點擊位置開始）
    _initDrag(e, f, 'move');
}

// 修正：overlay 上點擊改為 startMove，與 wrapper 上的 startCrop（新建區域）分開
function startMove(e: MouseEvent | TouchEvent, f: CropFile) {
    _initDrag(e, f, 'move');
}

function startResize(e: MouseEvent | TouchEvent, f: CropFile, handle: string) {
    stopCrop();
    const rect = getRenderedRectForFile(f);
    if (!rect) return;

    dragging = true;
    dragFile = f;
    resizeHandle = handle;
    dragMode = 'resize';
    activeRenderedRect = rect;
    cropStart = {
        h: f.crop.height,
        w: f.crop.width,
        x: f.crop.x,
        y: f.crop.y,
    };

    const { x, y } = getEventPos(e);
    dragStartX = x - rect.left;
    dragStartY = y - rect.top;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopCrop);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopCrop);
}

function stopCrop() {
    dragging = false;
    dragFile = null;
    dragMode = null;
    activeRenderedRect = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopCrop);
    document.removeEventListener('touchmove', onDrag, { passive: false } as any);
    document.removeEventListener('touchend', stopCrop);
}

onBeforeUnmount(() => {
    stopCrop();
});
</script>

<style scoped>
.crop-wrapper {
  position: relative;
  width: 100%;
  margin: 0 auto;
  user-select: none;
}

.crop-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  pointer-events: none;
}

.crop-overlay {
  position: absolute;
  border: 2px solid white;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
  cursor: move;
}

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

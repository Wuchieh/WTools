import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface WatermarkFile {
    blob?: Blob;
    error?: string;
    file: File;
    id: string;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useWatermarkStore = defineStore('watermark', () => {
    const files = ref<WatermarkFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
    const quality = ref(0.92);
    const watermarkText = ref('WTools');
    const fontSize = ref(32);
    const fontColor = ref('#ffffff');
    const opacity = ref(0.7);
    const position = ref<'bottom-left' | 'bottom-right' | 'center' | 'top-left' | 'top-right'>('bottom-right');
    const offsetX = ref(16);
    const offsetY = ref(16);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));
    const previewUrl = ref<null | string>(null);

    function addFiles(newFiles: File[]) {
        for (const file of newFiles) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                files.value.push({
                    file,
                    id: crypto.randomUUID(),
                    preview: e.target?.result as string,
                    status: 'pending',
                });
            };
            reader.readAsDataURL(file);
        }
    }

    function removeFile(id: string) {
        const index = files.value.findIndex((f) => f.id === id);
        if (index !== -1) files.value.splice(index, 1);
    }

    function clearAll() {
        files.value = [];
    }

    function applyWatermarkToCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.save();
        ctx.font = `${fontSize.value}px sans-serif`;
        // Use consistent opacity for both stroke and fill by incorporating
        // it directly into the color alpha channels
        ctx.strokeStyle = hexToRgba(fontColor.value, opacity.value * 0.5);
        ctx.lineWidth = 2;
        const text = watermarkText.value;
        const metrics = ctx.measureText(text);
        const tw = metrics.width;
        const th = fontSize.value;
        let tx = 0;
        let ty = 0;
        if (position.value === 'top-left') {
            tx = offsetX.value;
            ty = offsetY.value + th;
        } else if (position.value === 'top-right') {
            tx = w - tw - offsetX.value;
            ty = offsetY.value + th;
        } else if (position.value === 'bottom-left') {
            tx = offsetX.value;
            ty = h - offsetY.value;
        } else if (position.value === 'bottom-right') {
            tx = w - tw - offsetX.value;
            ty = h - offsetY.value;
        } else {
            tx = (w - tw) / 2;
            ty = (h + th) / 2;
        }
        ctx.fillStyle = hexToRgba(fontColor.value, opacity.value);
        ctx.strokeText(text, tx, ty);
        ctx.fillText(text, tx, ty);
        ctx.restore();
    }

    function hexToRgba(hex: string, alpha: number): string {
        const r = Number.parseInt(hex.slice(1, 3), 16);
        const g = Number.parseInt(hex.slice(3, 5), 16);
        const b = Number.parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    async function convertFiles() {
        if (isConverting.value) return;
        if (!watermarkText.value.trim()) {
            // Show error on first file
            const firstFile = files.value[0];
            if (firstFile) {
                firstFile.status = 'error';
                firstFile.error = 'Watermark text cannot be empty';
            }
            return;
        }
        isConverting.value = true;
        for (const f of files.value) {
            if (f.status === 'converting') continue;
            f.status = 'converting';
            try {
                f.blob = await applyWatermark(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'Watermark failed';
            }
        }
        isConverting.value = false;
    }

    function applyWatermark(f: WatermarkFile): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                applyWatermarkToCanvas(ctx, img.width, img.height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, outputFormat.value, quality.value);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = f.preview;
        });
    }

    async function downloadZip() {
        const zip = new JSZip();
        const successes = files.value.filter((f) => f.status === 'success' && f.blob);
        if (successes.length === 0) return;
        const ext = outputFormat.value.split('/')[1];
        for (const f of successes) {
            const fileName = `${f.file.name.replace(/\.[^/.]+$/, '')}_watermarked.${ext}`;
            zip.file(fileName, f.blob!);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${uuidv7()}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return {
        addFiles,
        applyWatermarkToCanvas,
        clearAll,
        convertFiles,
        downloadZip,
        files,
        fontColor,
        fontSize,
        hasConverted,
        isConverting,
        offsetX,
        offsetY,
        opacity,
        outputFormat,
        position,
        previewUrl,
        quality,
        removeFile,
        successCount,
        watermarkText,
    };
});

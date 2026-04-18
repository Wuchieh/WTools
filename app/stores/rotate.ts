import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface RotateFile {
    blob?: Blob;
    error?: string;
    file: File;
    flipH: boolean;
    flipV: boolean;
    id: string;
    preview: string;
    rotation: number;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useRotateStore = defineStore('rotate', () => {
    const files = ref<RotateFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
    const quality = ref(0.92);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));

    function addFiles(newFiles: File[]) {
        for (const file of newFiles) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                files.value.push({
                    file,
                    flipH: false,
                    flipV: false,
                    id: crypto.randomUUID(),
                    preview: e.target?.result as string,
                    rotation: 0,
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

    function rotate(id: string, angle: number) {
        const f = files.value.find((f) => f.id === id);
        if (f) {
            f.rotation = (f.rotation + angle + 360) % 360;
            f.status = 'pending';
        }
    }

    function flipH(id: string) {
        const f = files.value.find((f) => f.id === id);
        if (f) {
            f.flipH = !f.flipH;
            f.status = 'pending';
        }
    }

    function flipV(id: string) {
        const f = files.value.find((f) => f.id === id);
        if (f) {
            f.flipV = !f.flipV;
            f.status = 'pending';
        }
    }

    async function convertFiles() {
        if (isConverting.value) return;
        isConverting.value = true;
        for (const f of files.value) {
            if (f.status === 'converting') continue;
            f.status = 'converting';
            try {
                f.blob = await transformImage(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'Transform failed';
            }
        }
        isConverting.value = false;
    }

    function transformImage(f: RotateFile): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const rad = (f.rotation * Math.PI) / 180;
                const sin = Math.abs(Math.sin(rad));
                const cos = Math.abs(Math.cos(rad));
                const w = img.width * cos + img.height * sin;
                const h = img.width * sin + img.height * cos;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.translate(w / 2, h / 2);
                ctx.rotate(rad);
                if (f.flipH) ctx.scale(-1, 1);
                if (f.flipV) ctx.scale(1, -1);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
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
        const successes = files.value.filter((f) => f.status === 'success' && f.blob);
        if (successes.length === 0) return;
        // Single file: direct download, no zip
        if (successes.length === 1) {
            const f = successes[0];
            const ext = outputFormat.value.split('/')[1];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(f.blob!);
            link.download = `${f.file.name.replace(/\.[^/.]+$/, '')}_rotated.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
            return;
        }
        // Multiple files: zip
        const zip = new JSZip();
        const ext = outputFormat.value.split('/')[1];
        for (const f of successes) {
            const fileName = `${f.file.name.replace(/\.[^/.]+$/, '')}_rotated.${ext}`;
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
        clearAll,
        convertFiles,
        downloadZip,
        files,
        flipH,
        flipV,
        hasConverted,
        isConverting,
        outputFormat,
        quality,
        removeFile,
        rotate,
        successCount,
    };
});

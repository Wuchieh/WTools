import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface CompressedFile {
    convertedBlob?: Blob;
    convertedSize?: number;
    error?: string;
    file: File;
    id: string;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useCompressStore = defineStore('compress', () => {
    const files = ref<CompressedFile[]>([]);
    const isConverting = ref(false);
    const quality = ref(80);
    const maxWidth = ref<number | null>(null);
    const maxHeight = ref<number | null>(null);
    const outputFormat = ref<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const errorCount = computed(() => files.value.filter((f) => f.status === 'error').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));

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

    function resizeImage(img: HTMLImageElement): { width: number; height: number } {
        let { width, height } = { width: img.width, height: img.height };
        if (maxWidth.value && width > maxWidth.value) {
            height = Math.round((height * maxWidth.value) / width);
            width = maxWidth.value;
        }
        if (maxHeight.value && height > maxHeight.value) {
            width = Math.round((width * maxHeight.value) / height);
            height = maxHeight.value;
        }
        return { width, height };
    }

    async function convertFiles() {
        if (isConverting.value) return;
        isConverting.value = true;

        for (const f of files.value) {
            if (f.status === 'success' || f.status === 'converting') continue;
            f.status = 'converting';
            try {
                const blob = await compressImage(f.file);
                f.convertedBlob = blob;
                f.convertedSize = blob.size;
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'Compression failed';
            }
        }
        isConverting.value = false;
    }

    function compressImage(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const { width, height } = resizeImage(img);
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas context not available')); return; }
                if (outputFormat.value === 'image/jpeg' || outputFormat.value === 'image/png') {
                    ctx.fillStyle = outputFormat.value === 'image/jpeg' ? '#ffffff' : 'transparent';
                    if (outputFormat.value === 'image/jpeg') ctx.fillRect(0, 0, width, height);
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, outputFormat.value, quality.value / 100);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    async function downloadZip() {
        const zip = new JSZip();
        const successes = files.value.filter((f) => f.status === 'success' && f.convertedBlob);
        if (successes.length === 0) return;
        const ext = outputFormat.value.split('/')[1];
        for (const f of successes) {
            const fileName = `${f.file.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;
            zip.file(fileName, f.convertedBlob!);
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
        errorCount,
        files,
        hasConverted,
        isConverting,
        quality,
        maxWidth,
        maxHeight,
        outputFormat,
        removeFile,
        successCount,
    };
});

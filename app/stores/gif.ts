import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface GifFile {
    blob?: Blob;
    error?: string;
    file: File;
    id: string;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useGifStore = defineStore('gif', () => {
    const files = ref<GifFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/gif' | 'image/jpeg' | 'image/png'>('image/gif');
    const quality = ref(0.8);
    const maxWidth = ref<null | number>(null);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
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

    async function convertFiles() {
        if (isConverting.value) return;
        isConverting.value = true;
        for (const f of files.value) {
            if (f.status === 'converting') continue;
            f.status = 'converting';
            try {
                f.blob = await resizeGif(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'GIF processing failed';
            }
        }
        isConverting.value = false;
    }

    function resizeGif(f: GifFile): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const w = maxWidth.value ? Math.min(img.width, maxWidth.value) : img.width;
                const h = Math.round((img.height * w) / img.width);
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, w, h);
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
            if (!f) return;
            const ext = outputFormat.value.split('/')[1];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(f.blob!);
            link.download = `${f.file.name.replace(/\.[^/.]+$/, '')}.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
            return;
        }
        // Multiple files: zip
        const zip = new JSZip();
        for (const f of successes) {
            const ext = outputFormat.value.split('/')[1];
            const fileName = `${f.file.name.replace(/\.[^/.]+$/, '')}.${ext}`;
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
        hasConverted,
        isConverting,
        maxWidth,
        outputFormat,
        quality,
        removeFile,
        successCount,
    };
});

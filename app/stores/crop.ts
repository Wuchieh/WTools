import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface CropFile {
    blob?: Blob;
    crop: { height: number; width: number; x: number; y: number };
    error?: string;
    file: File;
    id: string;
    preview: string;
    scale: number;
    status: 'converting' | 'editing' | 'error' | 'pending' | 'success';
}

export const useCropStore = defineStore('crop', () => {
    const files = ref<CropFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
    const quality = ref(0.92);
    const aspectRatio = ref<null | number>(null);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));

    function addFiles(newFiles: File[]) {
        for (const file of newFiles) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                files.value.push({
                    crop: {
                        height: 100,
                        width: 100,
                        x: 0,
                        y: 0,
                    },
                    file,
                    id: crypto.randomUUID(),
                    preview: e.target?.result as string,
                    scale: 1,
                    status: 'editing',
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

    function updateCrop(id: string, crop: { height: number; width: number; x: number; y: number }) {
        const f = files.value.find((f) => f.id === id);
        if (f) f.crop = crop;
    }

    async function convertFiles() {
        if (isConverting.value) return;
        isConverting.value = true;

        for (const f of files.value) {
            if (f.status === 'converting') continue;
            f.status = 'converting';
            try {
                f.blob = await cropImage(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'Crop failed';
            }
        }
        isConverting.value = false;
    }

    function cropImage(f: CropFile): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const naturalW = img.naturalWidth;
                const naturalH = img.naturalHeight;

                // 百分比直接對應原始圖片尺寸（因為我們的座標已相對於圖片本身）
                const sx = (f.crop.x / 100) * naturalW;
                const sy = (f.crop.y / 100) * naturalH;
                const sw = (f.crop.width / 100) * naturalW;
                const sh = (f.crop.height / 100) * naturalH;

                const canvas = document.createElement('canvas');
                canvas.width = Math.round(sw);
                canvas.height = Math.round(sh);
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, outputFormat.value, quality.value);
            };
            img.onerror = reject;
            img.src = f.preview;
        });
    }

    async function downloadZip() {
        const successes = files.value.filter((f) => f.status === 'success' && f.blob);
        if (successes.length === 0) return;
        // Single file: direct download, no zip
        if (successes.length === 1) {
            const f = successes[0]!;
            const ext = outputFormat.value.split('/')[1];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(f.blob!);
            link.download = `${f.file.name.replace(/\.[^/.]+$/, '')}_cropped.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
            return;
        }
        // Multiple files: zip
        const zip = new JSZip();
        const ext = outputFormat.value.split('/')[1];
        for (const f of successes) {
            const fileName = `${f.file.name.replace(/\.[^/.]+$/, '')}_cropped.${ext}`;
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
        aspectRatio,
        clearAll,
        convertFiles,
        downloadZip,
        files,
        hasConverted,
        isConverting,
        outputFormat,
        quality,
        removeFile,
        successCount,
        updateCrop,
    };
});

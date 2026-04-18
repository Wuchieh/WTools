import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface SvgFile {
    blob?: Blob;
    error?: string;
    file: File;
    id: string;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useSvgStore = defineStore('svg', () => {
    const files = ref<SvgFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
    const quality = ref(0.92);
    const width = ref<null | number>(null);
    const height = ref<null | number>(null);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));

    function addFiles(newFiles: File[]) {
        for (const file of newFiles) {
            if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) continue;
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
                f.blob = await svgToImage(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'SVG conversion failed';
            }
        }
        isConverting.value = false;
    }

    function svgToImage(f: SvgFile): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Auto-calculate the other dimension if only one is set, to maintain aspect ratio
                if (width.value && !height.value) {
                    canvas.width = width.value;
                    canvas.height = Math.round((img.height * width.value) / img.width);
                } else if (height.value && !width.value) {
                    canvas.height = height.value;
                    canvas.width = Math.round((img.width * height.value) / img.height);
                } else {
                    canvas.width = width.value ?? img.width;
                    canvas.height = height.value ?? img.height;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                if (outputFormat.value === 'image/jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, outputFormat.value, quality.value);
            };
            img.onerror = () => reject(new Error('Failed to load SVG'));
            img.src = f.preview;
        });
    }

    async function downloadZip() {
        const zip = new JSZip();
        const successes = files.value.filter((f) => f.status === 'success' && f.blob);
        if (successes.length === 0) return;
        const ext = outputFormat.value.split('/')[1];
        for (const f of successes) {
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
        height,
        isConverting,
        outputFormat,
        quality,
        removeFile,
        successCount,
        width,
    };
});

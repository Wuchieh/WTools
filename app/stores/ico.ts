import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface IcoFile {
    blobs?: Blob[];
    error?: string;
    file: File;
    id: string;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useIcoStore = defineStore('ico', () => {
    const files = ref<IcoFile[]>([]);
    const isConverting = ref(false);
    const sizes = ref<number[]>([
        16,
        32,
        48,
        64,
        128,
        256,
    ]);
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
                f.blobs = await generateIco(f);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'ICO generation failed';
            }
        }
        isConverting.value = false;
    }

    function generateIco(f: IcoFile): Promise<Blob[]> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const blobs: Blob[] = sizes.value.map((size) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return new Blob();
                    ctx.drawImage(img, 0, 0, size, size);
                    const p = canvas.toDataURL('image/png');
                    const binary = atob(p.split(',')[1]);
                    const arr = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
                    return new Blob([arr], { type: 'image/png' });
                });
                // Simple ICO: just return PNG blobs for now (multi-size PNG zip)
                resolve(blobs.filter((b) => b.size > 0));
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = f.preview;
        });
    }

    async function downloadZip() {
        const zip = new JSZip();
        for (const f of files.value.filter((f) => f.status === 'success' && f.blobs)) {
            const base = f.file.name.replace(/\.[^/.]+$/, '');
            f.blobs!.forEach((blob, i) => {
                zip.file(`${base}_${sizes.value[i]}x${sizes.value[i]}.png`, blob);
            });
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
        removeFile,
        sizes,
        successCount,
    };
});

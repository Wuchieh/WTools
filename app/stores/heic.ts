import heic2any from 'heic2any';
import JSZip from 'jszip';
import { defineStore } from 'pinia';
import { v7 as uuidv7 } from 'uuid';

export interface HeicFile {
    blob?: Blob;
    error?: string;
    file: File;
    id: string;
    isHeic: boolean;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export const useHeicStore = defineStore('heic', () => {
    const files = ref<HeicFile[]>([]);
    const isConverting = ref(false);
    const outputFormat = ref<'image/jpeg' | 'image/png'>('image/jpeg');
    const quality = ref(0.92);
    const successCount = computed(() => files.value.filter((f) => f.status === 'success').length);
    const hasConverted = computed(() => files.value.some((f) => f.status === 'success' || f.status === 'error'));

    function addFiles(newFiles: File[]) {
        for (const file of newFiles) {
            const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
              || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
            if (!file.type.startsWith('image/') && !isHeic) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                files.value.push({
                    file,
                    id: crypto.randomUUID(),
                    isHeic,
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
                const blob = await heic2any({
                    blob: f.file,
                    quality: quality.value,
                    toType: outputFormat.value,
                }) as Blob;
                // heic2any returns single blob or array
                const actualBlob = Array.isArray(blob) ? blob[0] : blob;
                f.blob = actualBlob;
                // Generate preview from converted blob
                f.preview = URL.createObjectURL(actualBlob);
                f.status = 'success';
            } catch (e: any) {
                f.status = 'error';
                f.error = e.message || 'HEIC conversion failed';
            }
        }
        isConverting.value = false;
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
        outputFormat,
        quality,
        removeFile,
        successCount,
    };
});

// ============================================================================
// useFileUpload - Unified file upload handling
// ============================================================================

import type { FileItem } from '~/types';

export interface UseFileUploadOptions {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onError?: (error: string) => void;
    onFileAdded?: (file: File) => void;
}

export interface UseFileUploadReturn {
    addFiles: (newFiles: File[]) => void;
    clearAll: () => void;
    fileCount: ComputedRef<number>;
    fileInput: Ref<HTMLInputElement | null>;
    files: Ref<FileItem[]>;
    isDragging: Ref<boolean>;
    removeFile: (id: string) => void;
    totalSize: ComputedRef<number>;
    triggerFileInput: () => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
    const {
        accept = '*/*',
        maxSize,
        multiple: _multiple = true,
        onError,
        onFileAdded,
    } = options;

    const files = ref<FileItem[]>([]);
    const isDragging = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);

    function createPreview(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            } else {
                resolve('');
            }
        });
    }

    async function addFiles(newFiles: File[]): Promise<void> {
        for (const file of newFiles) {
            if (maxSize && file.size > maxSize) {
                onError?.(`File ${file.name} is too large (max ${formatBytes(maxSize)})`);
                continue;
            }

            if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
                onError?.(`File ${file.name} has unsupported format`);
                continue;
            }

            try {
                const preview = await createPreview(file);
                const fileItem: FileItem = {
                    file,
                    id: crypto.randomUUID(),
                    originalSize: file.size,
                    preview,
                    status: 'pending',
                };
                files.value.push(fileItem);
                onFileAdded?.(file);
            } catch {
                onError?.(`Failed to process file: ${file.name}`);
            }
        }
    }

    function removeFile(id: string): void {
        const index = files.value.findIndex((f) => f.id === id);
        if (index !== -1) files.value.splice(index, 1);
    }

    function clearAll(): void {
        files.value = [];
    }

    function triggerFileInput(): void {
        fileInput.value?.click();
    }

    function formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = [
            'B',
            'KB',
            'MB',
            'GB',
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
    }

    const totalSize = computed(() => files.value.reduce((sum, f) => sum + f.file.size, 0));
    const fileCount = computed(() => files.value.length);

    return {
        addFiles,
        clearAll,
        fileCount,
        fileInput,
        files,
        isDragging,
        removeFile,
        totalSize,
        triggerFileInput,
    };
}

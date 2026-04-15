// ============================================================================
// useImageProcessor - Unified image processing with step UX
// ============================================================================

import { compressImage } from '~/services/image';
import type {
    ConversionStats,
    FileItem,
    ProcessingStep,
} from '~/types';

export interface UseImageProcessorOptions {
    onComplete?: (stats: ConversionStats[]) => void;
    onError?: (error: string, fileId: string) => void;
    onProgress?: (progress: number) => void;
}

export interface UseImageProcessorReturn {
    // Actions
    addFiles: (newFiles: File[]) => void;
    // Step helpers
    canGoNext: ComputedRef<boolean>;
    canGoPrev: ComputedRef<boolean>;
    clearAll: () => void;
    currentStep: Ref<ProcessingStep>;
    files: Ref<FileItem[]>;

    goToStep: (step: ProcessingStep) => void;
    isConfigureStep: ComputedRef<boolean>;
    isDownloadStep: ComputedRef<boolean>;
    isPreviewStep: ComputedRef<boolean>;
    isProcessing: Ref<boolean>;
    isUploadStep: ComputedRef<boolean>;
    nextStep: () => void;

    prevStep: () => void;
    process: () => Promise<void>;
    progress: Ref<number>;
    removeFile: (id: string) => void;
    results: Ref<Map<string, ConversionStats>>;
    stats: Ref<ConversionStats | null>;
}

const STEPS: ProcessingStep[] = [
    'upload',
    'configure',
    'preview',
    'download',
];

export function useImageProcessor(options: UseImageProcessorOptions = {}): UseImageProcessorReturn {
    const files = ref<FileItem[]>([]);
    const currentStep = ref<ProcessingStep>('upload');
    const isProcessing = ref(false);
    const progress = ref(0);
    const results = ref<Map<string, ConversionStats>>(new Map());
    const stats = ref<ConversionStats | null>(null);

    async function addFiles(newFiles: File[]): Promise<void> {
        for (const file of newFiles) {
            if (!file.type.startsWith('image/')) continue;

            const preview = await createPreview(file);
            const fileItem: FileItem = {
                file,
                id: crypto.randomUUID(),
                originalSize: file.size,
                preview,
                status: 'pending',
            };
            files.value.push(fileItem);
        }

        if (files.value.length > 0 && currentStep.value === 'upload') {
            currentStep.value = 'configure';
        }
    }

    function removeFile(id: string): void {
        const index = files.value.findIndex((f) => f.id === id);
        if (index !== -1) {
            files.value.splice(index, 1);
            results.value.delete(id);
        }
    }

    function clearAll(): void {
        files.value = [];
        results.value.clear();
        stats.value = null;
        currentStep.value = 'upload';
    }

    async function process(): Promise<void> {
        if (isProcessing.value || files.value.length === 0) return;

        isProcessing.value = true;
        progress.value = 0;
        results.value.clear();

        const filesToProcess = files.value.filter((f) => f.status !== 'success');
        const total = filesToProcess.length;
        let completed = 0;

        try {
            for (const fileItem of filesToProcess) {
                fileItem.status = 'converting';

                try {
                    const { blob, stats: fileStats } = await compressImage(fileItem.file, {
                        outputFormat: 'image/webp',
                        quality: 80,
                    });

                    fileItem.convertedBlob = blob;
                    fileItem.convertedSize = blob.size;
                    fileItem.status = 'success';
                    results.value.set(fileItem.id, fileStats);
                } catch (e) {
                    fileItem.status = 'error';
                    fileItem.error = e instanceof Error ? e.message : 'Processing failed';
                    options.onError?.(e instanceof Error ? e.message : 'Processing failed', fileItem.id);
                }

                completed++;
                progress.value = Math.round((completed / total) * 100);
                options.onProgress?.(progress.value);
            }

            // Calculate aggregate stats
            const allStats = Array.from(results.value.values());
            if (allStats.length > 0) {
                const totalOriginal = allStats.reduce((sum, s) => sum + s.originalSize, 0);
                const totalConverted = allStats.reduce((sum, s) => sum + s.convertedSize, 0);
                stats.value = {
                    compressionRatio: totalOriginal > 0 ? (1 - totalConverted / totalOriginal) * 100 : 0,
                    convertedSize: totalConverted,
                    originalSize: totalOriginal,
                    savedBytes: totalOriginal - totalConverted,
                };
            }

            currentStep.value = 'preview';
            options.onComplete?.(allStats);
        } finally {
            isProcessing.value = false;
        }
    }

    function goToStep(step: ProcessingStep): void {
        currentStep.value = step;
    }

    function nextStep(): void {
        const idx = STEPS.indexOf(currentStep.value);
        if (idx < STEPS.length - 1) {
            currentStep.value = STEPS[idx + 1]!;
        }
    }

    function prevStep(): void {
        const idx = STEPS.indexOf(currentStep.value);
        if (idx > 0) {
            currentStep.value = STEPS[idx - 1]!;
        }
    }

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

    const canGoNext = computed(() => {
        const idx = STEPS.indexOf(currentStep.value);
        return idx < STEPS.length - 1;
    });

    const canGoPrev = computed(() => {
        const idx = STEPS.indexOf(currentStep.value);
        return idx > 0;
    });

    const isUploadStep = computed(() => currentStep.value === 'upload');
    const isConfigureStep = computed(() => currentStep.value === 'configure');
    const isPreviewStep = computed(() => currentStep.value === 'preview');
    const isDownloadStep = computed(() => currentStep.value === 'download');

    return {
        addFiles,
        canGoNext,
        canGoPrev,
        clearAll,
        currentStep,
        files,
        goToStep,
        isConfigureStep,
        isDownloadStep,
        isPreviewStep,
        isProcessing,
        isUploadStep,
        nextStep,
        prevStep,
        process,
        progress,
        removeFile,
        results,
        stats,
    };
}

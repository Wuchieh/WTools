// ============================================================================
// useDownload - Unified file download handling
// ============================================================================

import JSZip from 'jszip';
import { v7 as uuidv7 } from 'uuid';

export interface DownloadableFile {
    blob: Blob;
    name: string;
}

export interface UseDownloadOptions {
    onComplete?: () => void;
    onError?: (error: string) => void;
    onStart?: () => void;
}

export function useDownload(options: UseDownloadOptions = {}) {
    function downloadBlob(blob: Blob, filename: string): void {
        try {
            options.onStart?.();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
            options.onComplete?.();
        } catch (e) {
            options.onError?.(e instanceof Error ? e.message : 'Download failed');
        }
    }

    async function downloadFile(file: DownloadableFile): Promise<void> {
        await downloadBlob(file.blob, file.name);
    }

    async function downloadZip(files: DownloadableFile[], zipFilename?: string): Promise<void> {
        if (files.length === 0) return;

        try {
            options.onStart?.();
            const zip = new JSZip();

            for (const file of files) {
                zip.file(file.name, file.blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            await downloadBlob(content, zipFilename ?? `${uuidv7()}.zip`);
            options.onComplete?.();
        } catch (e) {
            options.onError?.(e instanceof Error ? e.message : 'Failed to create ZIP');
        }
    }

    function getFileExtension(mimeType: string): string {
        const map: Record<string, string> = {
            'image/gif': 'gif',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
        };
        return map[mimeType] ?? 'bin';
    }

    function createFilename(originalName: string, suffix: string, extension?: string): string {
        const baseName = originalName.replace(/\.[^/.]+$/, '');
        const ext = extension ?? originalName.split('.').pop() ?? 'bin';
        return `${baseName}_${suffix}.${ext}`;
    }

    return {
        createFilename,
        downloadBlob,
        downloadFile,
        downloadZip,
        getFileExtension,
    };
}

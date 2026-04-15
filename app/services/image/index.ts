// ============================================================================
// Image Processing Services
// Pure business logic for image operations - no UI dependencies
// ============================================================================

import type {
    ConversionStats,
    ImageProcessingOptions,
} from '~/types';
import {
    createError,
    getErrorMessage,
} from '~/types';

// ----------------------------------------------------------------------------
// Image Resize
// ----------------------------------------------------------------------------

export type RotateFlipAction = 'flipH' | 'flipV' | 'rotate90' | 'rotate180' | 'rotate270';

export interface CropArea {
    height: number;
    unit: 'percent' | 'pixel';
    width: number;
    x: number;
    y: number;
}

// ----------------------------------------------------------------------------
// Image Compression
// ----------------------------------------------------------------------------

export interface ResizeResult {
    height: number;
    width: number;
}

// ----------------------------------------------------------------------------
// Image Format Conversion (WebP, PNG, JPEG)
// ----------------------------------------------------------------------------

export interface WatermarkOptions {
    color?: string;
    fontSize?: number;
    image?: File;
    opacity: number;
    position: 'bottom-left' | 'bottom-right' | 'center' | 'top-left' | 'top-right';
    text?: string;
}

// ----------------------------------------------------------------------------
// Image Rotation / Flip
// ----------------------------------------------------------------------------

export function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export function calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: null | number | undefined,
    maxHeight: null | number | undefined,
): ResizeResult {
    let { height, width } = {
        height: originalHeight,
        width: originalWidth,
    };

    if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
    }
    if (maxHeight && height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
    }
    return {
        height,
        width,
    };
}

// ----------------------------------------------------------------------------
// Image Crop
// ----------------------------------------------------------------------------

function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            },
            type,
            quality,
        );
    });
}

export async function compressImage(
    file: File,
    options: ImageProcessingOptions,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);
        const { height, width } = calculateResizeDimensions(
            img.width,
            img.height,
            options.maxWidth,
            options.maxHeight,
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('COMPRESSION_FAILED', 'Canvas context not available');
        }

        const outputFormat = options.outputFormat ?? 'image/webp';
        if (outputFormat === 'image/jpeg' || outputFormat === 'image/png') {
            ctx.fillStyle = outputFormat === 'image/jpeg' ? '#ffffff' : 'transparent';
            if (outputFormat === 'image/jpeg') {
                ctx.fillRect(0, 0, width, height);
            }
        }

        ctx.drawImage(img, 0, 0, width, height);

        const quality = (options.quality ?? 80) / 100;
        const blob = await canvasToBlob(canvas, outputFormat, quality);

        const stats: ConversionStats = {
            compressionRatio: file.size > 0 ? (1 - blob.size / file.size) * 100 : 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: file.size - blob.size,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

// ----------------------------------------------------------------------------
// Image Watermark
// ----------------------------------------------------------------------------

export async function convertHeic(
    file: File,
    outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
    quality = 90,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    try {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({
            blob: file,
            quality: quality / 100,
            toType: outputFormat,
        }) as Blob;

        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } catch (e) {
        throw createError(
            'CONVERSION_FAILED',
            `HEIC conversion failed: ${getErrorMessage(e)}`,
        );
    }
}

export function convertImage(
    file: File,
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp',
    quality = 80,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    return compressImage(file, {
        outputFormat,
        quality,
    });
}

// ----------------------------------------------------------------------------
// HEIC to JPEG/PNG Conversion
// ----------------------------------------------------------------------------

export async function convertSvg(
    file: File,
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp',
    width?: number,
    height?: number,
    backgroundColor = 'transparent',
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);

        const w = width ?? img.width;
        const h = height ?? img.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        if (backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(img, 0, 0, w, h);

        const blob = await canvasToBlob(canvas, outputFormat, 1);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

// ----------------------------------------------------------------------------
// SVG Conversion
// ----------------------------------------------------------------------------

export async function cropImage(
    file: File,
    cropArea: CropArea,
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
    quality = 100,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);

        let sx: number;
        let sy: number;
        let sw: number;
        let sh: number;

        if (cropArea.unit === 'percent') {
            sx = (cropArea.x / 100) * img.width;
            sy = (cropArea.y / 100) * img.height;
            sw = (cropArea.width / 100) * img.width;
            sh = (cropArea.height / 100) * img.height;
        } else {
            sx = cropArea.x;
            sy = cropArea.y;
            sw = cropArea.width;
            sh = cropArea.height;
        }

        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        const blob = await canvasToBlob(canvas, outputFormat, quality / 100);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

// ----------------------------------------------------------------------------
// GIF Frame Extraction
// ----------------------------------------------------------------------------

export async function extractGifFrame(
    file: File,
    _frameIndex = 0,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        ctx.drawImage(img, 0, 0);

        const blob = await canvasToBlob(canvas, 'image/png', 1);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

// ----------------------------------------------------------------------------
// ICO Generation
// ----------------------------------------------------------------------------

export async function generateIco(
    file: File,
    sizes: number[] = [
        16,
        32,
        48,
        64,
        128,
        256,
    ],
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);

        // For simplicity, we generate PNG data for each size
        // A full ICO implementation would create proper ICO format
        // Here we return the largest size as PNG (ICO viewers handle this)
        const maxSize = Math.max(...sizes);

        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        ctx.drawImage(img, 0, 0, maxSize, maxSize);

        const blob = await canvasToBlob(canvas, 'image/png', 1);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

// ----------------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------------

export function getImageDimensions(file: File): Promise<{ height: number; width: number }> {
    const objectUrl = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({
                height: img.height,
                width: img.width,
            });
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

export async function rotateFlipImage(
    file: File,
    action: RotateFlipAction,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        const { height, width } = {
            height: img.height,
            width: img.width,
        };

        switch (action) {
            case 'flipH':
                canvas.width = width;
                canvas.height = height;
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                break;
            case 'flipV':
                canvas.width = width;
                canvas.height = height;
                ctx.translate(0, height);
                ctx.scale(1, -1);
                break;
            case 'rotate90':
            case 'rotate270':
                canvas.width = height;
                canvas.height = width;
                if (action === 'rotate90') {
                    ctx.translate(width, 0);
                } else {
                    ctx.translate(0, height);
                }
                ctx.rotate((action === 'rotate90' ? 90 : -90) * (Math.PI / 180));
                break;
            case 'rotate180':
                canvas.width = width;
                canvas.height = height;
                ctx.translate(width, height);
                ctx.rotate(Math.PI);
                break;
        }

        ctx.drawImage(img, 0, 0);

        const blob = await canvasToBlob(canvas, 'image/png', 1);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function watermarkImage(
    file: File,
    options: WatermarkOptions,
): Promise<{ blob: Blob; stats: ConversionStats }> {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await loadImage(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw createError('CONVERSION_FAILED', 'Canvas context not available');
        }

        ctx.drawImage(img, 0, 0);

        if (options.text) {
            ctx.globalAlpha = options.opacity;
            ctx.font = `${options.fontSize ?? 24}px sans-serif`;
            ctx.fillStyle = options.color ?? '#ffffff';
            ctx.strokeStyle = options.color ?? '#ffffff';
            ctx.lineWidth = 2;

            const text = options.text;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = options.fontSize ?? 24;

            let x: number;
            let y: number;

            switch (options.position) {
                case 'bottom-left':
                    x = 10;
                    y = img.height - 10;
                    break;
                case 'bottom-right':
                    x = img.width - textWidth - 10;
                    y = img.height - 10;
                    break;
                case 'top-left':
                    x = 10;
                    y = textHeight + 10;
                    break;
                case 'top-right':
                    x = img.width - textWidth - 10;
                    y = textHeight + 10;
                    break;
                case 'center':
                default:
                    x = (img.width - textWidth) / 2;
                    y = (img.height + textHeight) / 2;
                    break;
            }

            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }

        if (options.image) {
            const watermarkImg = await loadImage(URL.createObjectURL(options.image));
            ctx.globalAlpha = options.opacity;

            const wmWidth = Math.min(watermarkImg.width, img.width * 0.3);
            const wmHeight = (watermarkImg.height / watermarkImg.width) * wmWidth;

            let x: number;
            let y: number;

            switch (options.position) {
                case 'bottom-left':
                    x = 10;
                    y = img.height - wmHeight - 10;
                    break;
                case 'bottom-right':
                    x = img.width - wmWidth - 10;
                    y = img.height - wmHeight - 10;
                    break;
                case 'top-left':
                    x = 10;
                    y = 10;
                    break;
                case 'top-right':
                    x = img.width - wmWidth - 10;
                    y = 10;
                    break;
                case 'center':
                default:
                    x = (img.width - wmWidth) / 2;
                    y = (img.height - wmHeight) / 2;
                    break;
            }

            ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
        }

        const blob = await canvasToBlob(canvas, 'image/png', 1);
        const stats: ConversionStats = {
            compressionRatio: 0,
            convertedSize: blob.size,
            originalSize: file.size,
            savedBytes: 0,
        };

        return {
            blob,
            stats,
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

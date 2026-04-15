// ============================================================================
// WTools Type Definitions
// Unified type definitions across the application
// ============================================================================

// ----------------------------------------------------------------------------
// Error Handling
// ----------------------------------------------------------------------------

export type ErrorCode =
  | 'COMPRESSION_FAILED'
  | 'CONVERSION_FAILED'
  | 'DECODE_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'FILE_TOO_LARGE'
  | 'HASH_FAILED'
  | 'INVALID_FORMAT'
  | 'INVALID_JSON'
  | 'INVALID_REGEX'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT'
  | 'UNKNOWN'
  | 'UNSUPPORTED_TYPE'
  | 'UPLOAD_FAILED';

export type ProcessingStep = 'configure' | 'download' | 'preview' | 'upload';

export interface AppError {
    code: ErrorCode;
    details?: string | { stack?: string };
    message: string;
}

export interface AsyncTask<T> {
    execute: () => Promise<T>;
    onError?: (error: AppError) => void;
    onProgress?: (progress: number) => void;
    onSuccess?: (result: T) => void;
}

// ----------------------------------------------------------------------------
// File Handling
// ----------------------------------------------------------------------------

export interface ConversionStats {
    compressionRatio: number;
    convertedSize: number;
    originalSize: number;
    savedBytes: number;
}

export interface FileItem {
    convertedBlob?: Blob;
    convertedSize?: number;
    error?: string;
    file: File;
    id: string;
    originalSize: number;
    preview: string;
    status: 'converting' | 'error' | 'pending' | 'success';
}

export interface ImageProcessingOptions {
    maxHeight?: null | number;
    maxWidth?: null | number;
    outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
    quality?: number;
}

export interface ProcessingResult {
    blob: Blob;
    compressionRatio: number;
    originalSize: number;
    processedSize: number;
}

// ----------------------------------------------------------------------------
// Step UX
// ----------------------------------------------------------------------------

export interface StepConfig {
    icon: string;
    isActive: boolean;
    isCompleted: boolean;
    key: ProcessingStep;
    titleKey: string;
}

export interface ToolseoMeta {
    descriptionKey: string;
    keywords?: string[];
    titleKey: string;
}

// ----------------------------------------------------------------------------
// Tool Common
// ----------------------------------------------------------------------------

export interface ToolStats {
    processedCount: number;
    totalSaved: number;
}

export interface UseAsyncTaskOptions {
    onError?: (error: AppError) => void;
    onSuccess?: (result: unknown) => void;
}

// ----------------------------------------------------------------------------
// Async Task
// ----------------------------------------------------------------------------

export function createError(code: ErrorCode, message: string, details?: string): AppError {
    return {
        code,
        details,
        message,
    };
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
}

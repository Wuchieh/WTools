// ============================================================================
// useErrorHandler - Centralized error management
// ============================================================================

import { ref } from 'vue';

import type {
    AppError,
    ErrorCode,
} from '~/types';

export interface UseErrorHandlerOptions {
    /** Maximum errors to retain in history */
    maxHistory?: number;
    onError?: (error: AppError) => void;
    /** Auto-dismiss success messages after N ms (default: 3000, 0 = disabled) */
    successDuration?: number;
}

export interface UseErrorHandlerReturn {
    clearErrors: () => void;
    // State
    currentError: Ref<AppError | null>;
    dismissError: () => void;
    errors: Ref<AppError[]>;
    // Actions
    handleError: (error: unknown, defaultCode?: ErrorCode) => AppError;

    isErrorVisible: Ref<boolean>;
    isSuccessVisible: Ref<boolean>;
    showSuccess: (message: string) => void;
    successMessage: Ref<string>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
    const {
        maxHistory = 10,
        onError,
        successDuration = 3000,
    } = options;

    const currentError = ref<AppError | null>(null);
    const errors = ref<AppError[]>([]);
    const isErrorVisible = ref(false);
    const successMessage = ref('');
    const isSuccessVisible = ref(false);

    let successTimer: null | ReturnType<typeof setTimeout> = null;

    function handleError(error: unknown, defaultCode: ErrorCode = 'UNKNOWN'): AppError {
        const appError = normalizeError(error, defaultCode);

        // Add to history
        errors.value.unshift(appError);
        if (errors.value.length > maxHistory) {
            errors.value = errors.value.slice(0, maxHistory);
        }

        // Set as current
        currentError.value = appError;
        isErrorVisible.value = true;

        // Notify
        onError?.(appError);

        return appError;
    }

    function normalizeError(error: unknown, defaultCode: ErrorCode): AppError {
        if (isAppError(error)) {
            return error;
        }

        const message = error instanceof Error ? error.message : String(error);

        // Map common error types to codes
        let code: ErrorCode = defaultCode;

        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
            code = 'NETWORK_ERROR';
        } else if (message.includes('timeout')) {
            code = 'TIMEOUT';
        } else if (message.includes('permission') || message.includes('access')) {
            code = 'PERMISSION_DENIED';
        } else if (message.includes('file') || message.includes('upload') || message.includes('size')) {
            code = 'FILE_TOO_LARGE';
        }

        return {
            code,
            details: error instanceof Error && error.stack ? { stack: error.stack } : undefined,
            message,
        };
    }

    function isAppError(error: unknown): error is AppError {
        return (
            typeof error === 'object'
            && error !== null
            && 'code' in error
            && 'message' in error
        );
    }

    function showSuccess(message: string): void {
        if (successTimer) {
            clearTimeout(successTimer);
        }

        successMessage.value = message;
        isSuccessVisible.value = true;

        if (successDuration > 0) {
            successTimer = setTimeout(() => {
                isSuccessVisible.value = false;
            }, successDuration);
        }
    }

    function dismissError(): void {
        isErrorVisible.value = false;
        currentError.value = null;
    }

    function clearErrors(): void {
        errors.value = [];
        currentError.value = null;
        isErrorVisible.value = false;
    }

    return {
        clearErrors,
        currentError,
        dismissError,
        errors,
        handleError,
        isErrorVisible,
        isSuccessVisible,
        showSuccess,
        successMessage,
    };
}

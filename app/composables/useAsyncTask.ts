// ============================================================================
// useAsyncTask - Unified async task management with progress tracking
// ============================================================================

import type { AppError } from '~/types';
import { createError } from '~/types';

export interface UseAsyncTaskReturn<T> {
    error: Ref<AppError | null>;
    execute: () => Promise<T>;
    isRunning: Ref<boolean>;
    progress: Ref<number>;
    reset: () => void;
    result: Ref<null | T>;
}

export function useAsyncTask<T>(
    task: () => Promise<T>,
    options?: {
        onError?: (error: AppError) => void;
        onSuccess?: (result: T) => void;
    },
): UseAsyncTaskReturn<T> {
    const isRunning = ref(false);
    const error = ref<AppError | null>(null);
    const progress = ref(0);
    const result = ref<null | T>(null);

    async function execute(): Promise<T> {
        if (isRunning.value) {
            throw createError('UNKNOWN', 'Task is already running');
        }

        isRunning.value = true;
        error.value = null;
        progress.value = 0;

        try {
            const res = await task();
            result.value = res;
            progress.value = 100;
            options?.onSuccess?.(res);
            return res;
        } catch (e) {
            const appError = createError(
                'UNKNOWN',
                e instanceof Error ? e.message : 'Task failed',
            );
            error.value = appError;
            options?.onError?.(appError);
            throw appError;
        } finally {
            isRunning.value = false;
        }
    }

    function reset() {
        isRunning.value = false;
        error.value = null;
        progress.value = 0;
        result.value = null;
    }

    return {
        error,
        execute,
        isRunning,
        progress,
        reset,
        result: result as Ref<null | T>,
    };
}

export function useCopy() {
    async function copy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
            if (showCopySnackbar) {
                showCopySnackbar('已複製到剪貼簿！');
            }
        } catch {
            const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
            if (showCopySnackbar) {
                showCopySnackbar('複製失敗', 'error');
            }
        }
    }

    return { copy };
}

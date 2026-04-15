<template>
    <div class="tool-result">
        <!-- Download Button(s) -->
        <div class="result-actions mb-4">
            <slot name="actions">
                <v-btn
                    v-if="!isMultiple && blob"
                    color="primary"
                    size="large"
                    :loading="isDownloading"
                    block
                    @click="downloadSingle"
                >
                    <v-icon start>
                        mdi-download
                    </v-icon>
                    {{ downloadText }}
                </v-btn>

                <v-btn
                    v-if="isMultiple && blobs.length > 1"
                    color="primary"
                    size="large"
                    :loading="isDownloading"
                    block
                    @click="downloadAll"
                >
                    <v-icon start>
                        mdi-download-multiple
                    </v-icon>
                    {{ $t('tools.downloadAll') }} ({{ blobs.length }})
                </v-btn>
            </slot>
        </div>

        <!-- Stats Summary -->
        <v-card
            v-if="showStats && stats"
            class="mb-4"
            border
        >
            <v-card-text>
                <v-row justify="center">
                    <v-col
                        v-for="(stat, index) in displayStats"
                        :key="index"
                        class="px-6 text-center"
                        cols="auto"
                    >
                        <div
                            class="font-weight-bold text-h4"
                            :style="{ color: stat.color || 'rgb(var(--v-theme-primary))' }"
                        >
                            {{ stat.value }}
                        </div>
                        <div class="text-caption text-medium-emphasis text-uppercase">
                            {{ stat.label }}
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Result Items Grid -->
        <v-row v-if="isMultiple">
            <v-col
                v-for="item in resultItems"
                :key="item.id"
                cols="12"
                md="4"
                sm="6"
            >
                <v-card
                    class="result-item"
                    border
                >
                    <v-img
                        v-if="item.preview"
                        aspect-ratio="1"
                        :src="item.preview"
                        cover
                    >
                        <template #placeholder>
                            <v-row
                                class="fill-height ma-0"
                                align="center"
                                justify="center"
                            >
                                <v-progress-circular indeterminate />
                            </v-row>
                        </template>
                    </v-img>

                    <v-card-text class="pb-2">
                        <p
                            class="font-weight-medium text-body-2 text-truncate"
                            :title="item.name"
                        >
                            {{ item.name }}
                        </p>
                        <div
                            v-if="showItemStats"
                            class="text-caption text-medium-emphasis"
                        >
                            <span>{{ formatBytes(item.originalSize) }}</span>
                            <v-icon
                                v-if="item.convertedSize"
                                class="mx-1"
                                size="12"
                            >
                                mdi-arrow-right
                            </v-icon>
                            <span
                                v-if="item.convertedSize"
                                :class="{ 'text-success': item.savedBytes && item.savedBytes > 0 }"
                            >
                                {{ formatBytes(item.convertedSize) }}
                            </span>
                            <v-chip
                                v-if="item.savedBytes && item.savedBytes > 0"
                                class="ml-2"
                                color="success"
                                size="x-small"
                            >
                                -{{ formatPercent(item.savedBytes / item.originalSize) }}%
                            </v-chip>
                        </div>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn
                            v-if="item.blob"
                            color="primary"
                            size="small"
                            variant="tonal"
                            :loading="isDownloading"
                            block
                            @click="downloadItem(item)"
                        >
                            <v-icon start>
                                mdi-download
                            </v-icon>
                            {{ $t('tools.download') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Single Result Preview -->
        <v-card
            v-if="!isMultiple && blob && preview"
            v-intersect="onPreviewIntersect"
            border
        >
            <v-img
                max-height="500"
                :src="preview"
                contain
            >
                <template #placeholder>
                    <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                    >
                        <v-progress-circular indeterminate />
                    </v-row>
                </template>
            </v-img>

            <v-card-text>
                <p
                    v-if="filename"
                    class="text-body-2 text-medium-emphasis"
                >
                    {{ filename }}
                </p>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip';
import { v7 as uuidv7 } from 'uuid';

interface Props {
    blob?: Blob;
    blobs?: {
        blob: Blob;
        convertedSize?: number;
        id: string;
        name: string;
        originalSize: number;
        preview?: string;
        savedBytes?: number;
    }[];
    downloadText?: string;
    filename?: string;
    isMultiple?: boolean;
    preview?: string;
    showItemStats?: boolean;
    showStats?: boolean;
    stats?: StatItem[];
}

export interface ResultItem {
    blob?: Blob;
    convertedSize?: number;
    id: string;
    name: string;
    originalSize: number;
    preview?: string;
    savedBytes?: number;
}

export interface StatItem {
    color?: string;
    label: string;
    value: string;
}

const props = withDefaults(defineProps<Props>(), {
    blob: undefined,
    blobs: () => [],
    downloadText: '下載',
    filename: '',
    isMultiple: false,
    preview: '',
    showItemStats: false,
    showStats: false,
    stats: () => [],
});

const isDownloading = ref(false);

const displayStats = computed(() => props.stats);

const resultItems = computed<ResultItem[]>(() => {
    if (props.isMultiple && props.blobs.length > 0) {
        return props.blobs.map((b) => ({
            blob: b.blob,
            convertedSize: b.convertedSize,
            id: b.id,
            name: b.name,
            originalSize: b.originalSize,
            preview: b.preview,
            savedBytes: b.savedBytes,
        }));
    }
    return [];
});

function createDownloadName(suffix: string, ext?: string): string {
    const extension = ext ?? getFileExtension(props.blob);
    const baseName = props.filename?.replace(/\.[^/.]+$/, '') ?? 'result';
    return `${baseName}_${suffix}.${extension}`;
}

async function downloadAll(): Promise<void> {
    if (props.blobs.length === 0) return;

    isDownloading.value = true;
    try {
        const zip = new JSZip();

        for (const item of props.blobs) {
            if (item.blob) {
                zip.file(item.name, item.blob);
            }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        await downloadBlob(content, `${uuidv7()}.zip`);
    } finally {
        isDownloading.value = false;
    }
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

async function downloadItem(item: ResultItem): Promise<void> {
    if (!item.blob) return;

    isDownloading.value = true;
    try {
        await downloadBlob(item.blob, item.name);
    } finally {
        isDownloading.value = false;
    }
}

async function downloadSingle(): Promise<void> {
    if (!props.blob) return;

    isDownloading.value = true;
    try {
        await downloadBlob(props.blob, props.filename ?? createDownloadName('converted'));
    } finally {
        isDownloading.value = false;
    }
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
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function formatPercent(ratio: number): string {
    return `${Math.round(ratio * 100)}`;
}

function getFileExtension(blob?: Blob): string {
    if (!blob) return 'bin';
    const map: Record<string, string> = {
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/webp': 'webp',
    };
    return map[blob.type] ?? 'bin';
}

function onPreviewIntersect(_entries: IntersectionObserverEntry[], _observer: IntersectionObserver): void {
    // Could implement lazy loading or animations here
}
</script>

<style scoped lang="scss">
.tool-result {
    .result-item {
        transition: transform 0.2s ease;

        &:hover {
            transform: translateY(-2px);
        }
    }
}
</style>

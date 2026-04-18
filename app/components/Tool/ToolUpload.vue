<template>
    <div
        class="upload-zone"
        :class="{ 'drag-over': isDragOver }"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
    >
        <input
            ref="fileInput"
            class="d-none"
            type="file"
            :accept="accept"
            :multiple="multiple"
            @change="onFileSelect"
        >

        <div
            v-if="!modelValue || modelValue.length === 0"
            class="upload-placeholder"
            @click="openFilePicker"
        >
            <v-icon
                class="mb-4"
                color="primary"
                size="64"
            >
                {{ icon }}
            </v-icon>
            <h3 class="text-h6 mb-2">
                {{ title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
                {{ hint }}
            </p>
            <v-btn
                color="primary"
                variant="outlined"
            >
                {{ buttonText }}
            </v-btn>
            <p
                v-if="maxSize"
                class="text-caption text-medium-emphasis mt-4"
            >
                {{ $t('tools.maxFileSize', { size: formatBytes(maxSize) }) }}
            </p>
        </div>

        <!-- File Preview Grid -->
        <div
            v-else
            class="file-grid"
        >
            <div class="file-grid-header mb-4">
                <span class="text-body-2 text-medium-emphasis">
                    {{ modelValue.length }} {{ $t('tools.filesSelected') }}
                </span>
                <div>
                    <v-btn
                        size="small"
                        variant="text"
                        @click="openFilePicker"
                    >
                        {{ $t('tools.addMore') }}
                    </v-btn>
                    <v-btn
                        color="error"
                        size="small"
                        variant="text"
                        @click="clearFiles"
                    >
                        {{ $t('tools.clearAll') }}
                    </v-btn>
                </div>
            </div>

            <v-row>
                <v-col
                    v-for="file in modelValue"
                    :key="file.id"
                    cols="6"
                    lg="3"
                    md="4"
                >
                    <v-card
                        class="file-card"
                        border
                    >
                        <v-img
                            v-if="file.preview && isImage(file.file)"
                            aspect-ratio="1"
                            :src="file.preview"
                            cover
                        >
                            <template #placeholder>
                                <v-row
                                    class="fill-height ma-0"
                                    align="center"
                                    justify="center"
                                >
                                    <v-progress-circular
                                        color="primary"
                                        indeterminate
                                    />
                                </v-row>
                            </template>
                        </v-img>
                        <div
                            v-else
                            class="align-center d-flex file-icon-placeholder justify-center"
                            style="height: 120px;"
                        >
                            <v-icon
                                color="primary"
                                size="48"
                            >
                                {{ getFileIcon(file.file) }}
                            </v-icon>
                        </div>

                        <v-card-text class="pa-2">
                            <p
                                class="text-caption text-truncate"
                                :title="file.file.name"
                            >
                                {{ file.file.name }}
                            </p>
                            <p class="text-caption text-medium-emphasis">
                                {{ formatBytes(file.file.size) }}
                            </p>
                        </v-card-text>

                        <v-card-actions class="pa-1">
                            <v-btn
                                v-if="removable"
                                icon="mdi-close"
                                size="x-small"
                                variant="text"
                                @click="removeFile(file.id)"
                            />
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~/types';

interface Props {
    accept?: string;
    buttonText?: string;
    hint?: string;
    icon?: string;
    maxFiles?: number;
    maxSize?: number;
    modelValue: FileItem[];
    multiple?: boolean;
    removable?: boolean;
    title?: string;
}

const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
    buttonText: '選擇文件',
    hint: '或點擊選擇文件',
    icon: 'mdi-cloud-upload',
    maxFiles: 20,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    removable: true,
    title: '拖放文件到這裡',
});

const emit = defineEmits<{
    'update:modelValue': [files: FileItem[]];
}>();

const { t } = useI18n();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

function clearFiles(): void {
    emit('update:modelValue', []);
}

function createPreview(file: File): Promise<string> {
    if (!isImage(file)) return Promise.resolve('');
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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

function getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return 'mdi-image';
    if (file.type.startsWith('video/')) return 'mdi-video';
    if (file.type.startsWith('audio/')) return 'mdi-music';
    if (file.type.includes('pdf')) return 'mdi-file-pdf';
    if (file.type.includes('word') || file.name.endsWith('.docx')) return 'mdi-file-word';
    if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) return 'mdi-file-excel';
    return 'mdi-file';
}

function isImage(file: File): boolean {
    return file.type.startsWith('image/');
}

function onDragEnter(): void {
    isDragOver.value = true;
}

function onDragLeave(): void {
    isDragOver.value = false;
}

function onDragOver(): void {
    isDragOver.value = true;
}

function onDrop(event: DragEvent): void {
    isDragOver.value = false;
    if (event.dataTransfer?.files) {
        processFiles(event.dataTransfer.files);
    }
}

function onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
        processFiles(input.files);
        input.value = ''; // Reset for re-selection
    }
}

function openFilePicker(): void {
    fileInput.value?.click();
}

async function processFiles(fileList: File[] | FileList): Promise<void> {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
        if (props.maxFiles && props.modelValue.length + validFiles.length >= props.maxFiles) {
            errors.push(props.maxFiles === 1
                ? t('tools.fileExceededMaxFilesSingle', { name: file.name })
                : t('tools.fileExceededMaxFiles', {
                    max: props.maxFiles,
                    name: file.name,
                }));
            continue;
        }

        if (props.maxSize && file.size > props.maxSize) {
            errors.push(t('tools.fileTooLarge', {
                max: formatBytes(props.maxSize),
                name: file.name,
                size: formatBytes(file.size),
            }));
            continue;
        }

        validFiles.push(file);
    }

    if (errors.length > 0 && errors.length <= 3) {
        // Could show error snackbar here
        console.warn(errors.join('\n'));
    }

    const newFileItems: FileItem[] = await Promise.all(
        validFiles.map(async (file) => ({
            file,
            id: crypto.randomUUID(),
            originalSize: file.size,
            preview: await createPreview(file),
            status: 'pending' as const,
        })),
    );

    emit('update:modelValue', [
        ...props.modelValue,
        ...newFileItems,
    ]);
}

function removeFile(id: string): void {
    emit(
        'update:modelValue',
        props.modelValue.filter((f) => f.id !== id),
    );
}
</script>

<style scoped lang="scss">
.upload-zone {
    border: 2px dashed rgba(var(--v-theme-primary), 0.4);
    border-radius: 12px;
    padding: 48px 24px;
    transition: all 0.2s ease;
    background: rgba(var(--v-theme-surface));

    &.drag-over {
        border-color: rgb(var(--v-theme-primary));
        background: rgba(var(--v-theme-primary), 0.05);
    }
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
}

.file-grid {
    .file-grid-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

.file-card {
    position: relative;
    overflow: hidden;

    .v-img,
    .file-icon-placeholder {
        background: rgba(var(--v-theme-surface-variant));
    }

    .v-card-actions {
        position: absolute;
        top: 0;
        right: 0;
    }
}
</style>

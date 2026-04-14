<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon icon="mdi-image-filter-hdr" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('compressor.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('compressor.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <!-- Drop Zone -->
            <v-file-input
                v-model="selectedFiles"
                :label="$t('uploader.selectFiles')"
                prepend-icon="mdi-camera"
                multiple
                accept="image/*"
                show-size
                border
                class="mb-4"
                @update:model-value="handleFiles"
            />

            <!-- Settings -->
            <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-icon icon="mdi-tune" start />
                        {{ $t('compressor.settings') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col cols="6">
                                <v-select
                                    v-model="store.outputFormat"
                                    :items="formats"
                                    :label="$t('compressor.outputFormat')"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-slider
                                    v-model="store.quality"
                                    :label="$t('compressor.quality', { v: store.quality })"
                                    :min="10"
                                    :max="100"
                                    :step="5"
                                    thumb-label
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.maxWidth"
                                    :label="$t('compressor.maxWidth')"
                                    type="number"
                                    density="compact"
                                    clearable
                                    :min="1"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.maxHeight"
                                    :label="$t('compressor.maxHeight')"
                                    type="number"
                                    density="compact"
                                    clearable
                                    :min="1"
                                />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <!-- File List -->
            <v-list v-if="store.files.length > 0" class="mb-4" border>
                <v-list-item
                    v-for="f in store.files"
                    :key="f.id"
                    :subtitle="formatBytes(f.convertedSize ?? f.file.size) + (f.convertedSize ? ' ← ' + formatBytes(f.file.size) : '')"
                >
                    <template #prepend>
                        <v-avatar rounded="0" size="40">
                            <v-img :src="f.preview" />
                        </v-avatar>
                    </template>
                    <v-list-item-title>{{ f.file.name }}</v-list-item-title>
                    <template #append>
                        <v-chip
                            v-if="f.status === 'success'"
                            color="success"
                            size="small"
                            class="mr-2"
                        >
                            {{ formatBytes(f.convertedSize ?? 0) }}
                        </v-chip>
                        <v-chip
                            v-else-if="f.status === 'error'"
                            color="error"
                            size="small"
                            class="mr-2"
                        >
                            {{ f.error }}
                        </v-chip>
                        <v-chip
                            v-else-if="f.status === 'converting'"
                            color="warning"
                            size="small"
                            class="mr-2"
                        >
                            ...
                        </v-chip>
                        <v-btn
                            icon="mdi-close"
                            size="x-small"
                            variant="text"
                            @click="store.removeFile(f.id)"
                        />
                    </template>
                </v-list-item>
            </v-list>
        </v-card-text>

        <v-card-actions v-if="store.files.length > 0">
            <v-btn
                color="warning"
                variant="text"
                @click="store.clearAll()"
            >
                {{ $t('preview.clearAll') }}
            </v-btn>
            <v-spacer />
            <v-btn
                color="primary"
                :loading="store.isConverting"
                @click="store.convertFiles()"
            >
                {{ $t('compressor.compress') }}
            </v-btn>
            <v-btn
                color="success"
                :disabled="!store.hasConverted || store.successCount === 0"
                @click="store.downloadZip()"
            >
                {{ $t('result.download') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useCompressStore } from '~/stores/compress';

const store = useCompressStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    { title: 'WebP', value: 'image/webp' },
    { title: 'JPEG', value: 'image/jpeg' },
    { title: 'PNG', value: 'image/png' },
];

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
</script>

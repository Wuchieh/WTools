<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon icon="mdi-water" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('watermark.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('watermark.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
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

            <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-icon icon="mdi-tune" start />
                        {{ $t('watermark.settings') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.watermarkText"
                                    :label="$t('watermark.text')"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.fontSize"
                                    :label="$t('watermark.fontSize')"
                                    type="number"
                                    density="compact"
                                    :min="8"
                                    :max="200"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    v-model="store.fontColor"
                                    :label="$t('watermark.fontColor')"
                                    type="color"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-slider
                                    v-model="store.opacity"
                                    :label="$t('watermark.opacity', { v: Math.round(store.opacity * 100) })"
                                    :min="0.1" :max="1" :step="0.05"
                                    thumb-label
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-select
                                    v-model="store.position"
                                    :items="positions"
                                    :label="$t('watermark.position')"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-select
                                    v-model="store.outputFormat"
                                    :items="formats"
                                    :label="$t('watermark.outputFormat')"
                                    density="compact"
                                />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-list v-if="store.files.length > 0" border>
                <v-list-item
                    v-for="f in store.files"
                    :key="f.id"
                >
                    <template #prepend>
                        <v-avatar rounded="0" size="40">
                            <v-img :src="f.preview" />
                        </v-avatar>
                    </template>
                    <v-list-item-title>{{ f.file.name }}</v-list-item-title>
                    <template #append>
                        <v-chip v-if="f.status === 'success'" color="success" size="small" class="mr-2">{{ $t('result.success') }}</v-chip>
                        <v-chip v-else-if="f.status === 'error'" color="error" size="small" class="mr-2">{{ f.error }}</v-chip>
                        <v-btn icon="mdi-close" size="x-small" variant="text" @click="store.removeFile(f.id)" />
                    </template>
                </v-list-item>
            </v-list>
        </v-card-text>

        <v-card-actions v-if="store.files.length > 0">
            <v-btn color="warning" variant="text" @click="store.clearAll()">{{ $t('preview.clearAll') }}</v-btn>
            <v-spacer />
            <v-btn color="primary" :loading="store.isConverting" @click="store.convertFiles()">{{ $t('watermark.apply') }}</v-btn>
            <v-btn color="success" :disabled="!store.hasConverted || store.successCount === 0" @click="store.downloadZip()">{{ $t('result.download') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useWatermarkStore } from '~/stores/watermark';

const store = useWatermarkStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    { title: 'WebP', value: 'image/webp' },
    { title: 'JPEG', value: 'image/jpeg' },
    { title: 'PNG', value: 'image/png' },
];

const positions = [
    { title: 'Top Left', value: 'top-left' },
    { title: 'Top Right', value: 'top-right' },
    { title: 'Bottom Left', value: 'bottom-left' },
    { title: 'Bottom Right', value: 'bottom-right' },
    { title: 'Center', value: 'center' },
];

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}
</script>

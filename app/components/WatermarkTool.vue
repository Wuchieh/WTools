<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar
                    color="primary"
                    variant="tonal"
                    rounded
                >
                    <v-icon icon="mdi-water" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('watermark.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('watermark.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                class="mb-4"
                accept="image/*"
                prepend-icon="mdi-camera"
                :label="$t('uploader.selectFiles')"
                border
                multiple
                show-size
                @update:model-value="handleFiles"
            />

            <v-expansion-panels
                class="mb-4"
                variant="accordion"
            >
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-icon
                            icon="mdi-tune"
                            start
                        />
                        {{ $t('watermark.settings') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.watermarkText"
                                    density="compact"
                                    :label="$t('watermark.text')"
                                    @update:model-value="updatePreview"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                    v-model="store.fontSize"
                                    density="compact"
                                    type="number"
                                    :label="$t('watermark.fontSize')"
                                    :max="200"
                                    :min="8"
                                    @update:model-value="updatePreview"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    v-model="store.fontColor"
                                    density="compact"
                                    type="color"
                                    :label="$t('watermark.fontColor')"
                                    @update:model-value="updatePreview"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-slider
                                    v-model="store.opacity"
                                    density="compact"
                                    :label="$t('watermark.opacity', { v: Math.round(store.opacity * 100) })"
                                    :max="1"
                                    :min="0.1"
                                    :step="0.05"
                                    thumb-label
                                    @update:model-value="updatePreview"
                                />
                            </v-col>
                            <v-col cols="4">
                                <v-select
                                    v-model="store.position"
                                    density="compact"
                                    :items="positions"
                                    :label="$t('watermark.position')"
                                    @update:model-value="updatePreview"
                                />
                            </v-col>
                            <v-col
                                v-if="store.previewUrl"
                                cols="12"
                            >
                                <p class="text-caption text-medium-emphasis mb-2">
                                    {{ $t('watermark.preview') || '即時預覽' }}
                                </p>
                                <img
                                    style="max-width:100%; max-height:200px; border:1px solid #ccc; border-radius:4px;"
                                    :src="store.previewUrl"
                                >
                            </v-col>
                            <v-col cols="6">
                                <v-select
                                    v-model="store.outputFormat"
                                    density="compact"
                                    :items="formats"
                                    :label="$t('watermark.outputFormat')"
                                />
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-list
                v-if="store.files.length > 0"
                border
            >
                <v-list-item
                    v-for="f in store.files"
                    :key="f.id"
                >
                    <template #prepend>
                        <v-avatar
                            rounded="0"
                            size="40"
                        >
                            <v-img :src="f.preview" />
                        </v-avatar>
                    </template>
                    <v-list-item-title>{{ f.file.name }}</v-list-item-title>
                    <template #append>
                        <v-chip
                            v-if="f.status === 'success'"
                            class="mr-2"
                            color="success"
                            size="small"
                        >
                            {{ $t('result.success') }}
                        </v-chip>
                        <v-chip
                            v-else-if="f.status === 'error'"
                            class="mr-2"
                            color="error"
                            size="small"
                        >
                            {{ f.error }}
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
                {{ $t('watermark.apply') }}
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
import { useWatermarkStore } from '~/stores/watermark';

const store = useWatermarkStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    {
        title: 'WebP',
        value: 'image/webp',
    },
    {
        title: 'JPEG',
        value: 'image/jpeg',
    },
    {
        title: 'PNG',
        value: 'image/png',
    },
];

const positions = [
    {
        title: 'Top Left',
        value: 'top-left',
    },
    {
        title: 'Top Right',
        value: 'top-right',
    },
    {
        title: 'Bottom Left',
        value: 'bottom-left',
    },
    {
        title: 'Bottom Right',
        value: 'bottom-right',
    },
    {
        title: 'Center',
        value: 'center',
    },
];

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
    updatePreview();
}

function updatePreview() {
    const firstFile = store.files[0];
    if (!firstFile) {
        store.previewUrl = null;
        return;
    }
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        store.applyWatermarkToCanvas(ctx, img.width, img.height);
        store.previewUrl = canvas.toDataURL();
    };
    img.src = firstFile.preview;
}
</script>

<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon icon="mdi-rotate-3d-variant" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('rotate.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('rotate.subtitle') }}</v-card-subtitle>
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

            <v-row class="mb-4">
                <v-col cols="4">
                    <v-select
                        v-model="store.outputFormat"
                        :items="formats"
                        :label="$t('rotate.outputFormat')"
                        density="compact"
                    />
                </v-col>
                <v-col cols="4">
                    <v-slider
                        v-model="store.quality"
                        :label="$t('rotate.quality', { v: Math.round(store.quality * 100) })"
                        :min="0.1" :max="1" :step="0.05"
                        thumb-label
                        density="compact"
                    />
                </v-col>
            </v-row>

            <v-row v-if="store.files.length > 0">
                <v-col
                    v-for="f in store.files"
                    :key="f.id"
                    cols="12"
                    md="6"
                >
                    <v-card border>
                        <v-img :src="f.preview" max-height="250" cover class="bg-grey-lighten-3" />
                        <v-card-text>
                            <div class="text-caption">{{ f.file.name }}</div>
                            <div class="text-caption text-medium-emphasis">
                                {{ $t('rotate.rotation') }}: {{ f.rotation }}°
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn icon="mdi-rotate-left" size="small" variant="text" @click="store.rotate(f.id, -90)" />
                            <v-btn icon="mdi-rotate-right" size="small" variant="text" @click="store.rotate(f.id, 90)" />
                            <v-btn icon="mdi-flip-horizontal" size="small" variant="text" @click="store.flipH(f.id)" />
                            <v-btn icon="mdi-flip-vertical" size="small" variant="text" @click="store.flipV(f.id)" />
                            <v-spacer />
                            <v-chip v-if="f.status === 'success'" color="success" size="small">{{ $t('result.success') }}</v-chip>
                            <v-chip v-else-if="f.status === 'error'" color="error" size="small">{{ f.error }}</v-chip>
                            <v-btn icon="mdi-close" size="x-small" variant="text" @click="store.removeFile(f.id)" />
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions v-if="store.files.length > 0">
            <v-btn color="warning" variant="text" @click="store.clearAll()">{{ $t('preview.clearAll') }}</v-btn>
            <v-spacer />
            <v-btn color="primary" :loading="store.isConverting" @click="store.convertFiles()">{{ $t('rotate.transform') }}</v-btn>
            <v-btn color="success" :disabled="!store.hasConverted || store.successCount === 0" @click="store.downloadZip()">{{ $t('result.download') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useRotateStore } from '~/stores/rotate';

const store = useRotateStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    { title: 'WebP', value: 'image/webp' },
    { title: 'JPEG', value: 'image/jpeg' },
    { title: 'PNG', value: 'image/png' },
];

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}
</script>

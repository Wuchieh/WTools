<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar
                    color="primary"
                    variant="tonal"
                    rounded
                >
                    <v-icon icon="mdi-image-filter-hdr" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('heic.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('heic.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                class="mb-4"
                accept="image/heic,image/heif,.heic,.heif"
                prepend-icon="mdi-camera"
                :label="$t('uploader.selectFiles')"
                border
                multiple
                show-size
                @update:model-value="handleFiles"
            />

            <v-row class="mb-4">
                <v-col cols="6">
                    <v-select
                        v-model="store.outputFormat"
                        density="compact"
                        :items="formats"
                        :label="$t('heic.outputFormat')"
                    />
                </v-col>
                <v-col cols="6">
                    <v-slider
                        v-model="store.quality"
                        density="compact"
                        :label="$t('heic.quality', { v: Math.round(store.quality * 100) })"
                        :max="1"
                        :min="0.1"
                        :step="0.05"
                        thumb-label
                    />
                </v-col>
            </v-row>

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
                        <v-chip
                            v-else-if="f.status === 'converting'"
                            class="mr-2"
                            color="warning"
                            size="small"
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
                {{ $t('heic.convert') }}
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
import { useHeicStore } from '~/stores/heic';

const store = useHeicStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    {
        title: 'JPEG',
        value: 'image/jpeg',
    },
    {
        title: 'PNG',
        value: 'image/png',
    },
];

function handleFiles(files: File | File[]) {
    if (files) {
        const fileArray = Array.isArray(files) ? files : [files];
        store.addFiles(fileArray);
    }
}
</script>

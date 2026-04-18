<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar
                    color="primary"
                    variant="tonal"
                    rounded
                >
                    <v-icon icon="mdi-gif" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('gif.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('gif.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                class="mb-4"
                accept="image/gif,image/*"
                prepend-icon="mdi-camera"
                :label="$t('uploader.selectFiles')"
                border
                multiple
                show-size
                @update:model-value="handleFiles"
            />

            <v-row class="mb-4">
                <v-col cols="4">
                    <v-select
                        v-model="store.outputFormat"
                        density="compact"
                        :items="formats"
                        :label="$t('gif.outputFormat')"
                    />
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="store.maxWidth"
                        density="compact"
                        type="number"
                        :label="$t('gif.maxWidth')"
                        :min="1"
                        clearable
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
                {{ $t('gif.process') }}
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
import { useGifStore } from '~/stores/gif';

const store = useGifStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    {
        title: 'GIF',
        value: 'image/gif',
    },
    {
        title: 'PNG',
        value: 'image/png',
    },
    {
        title: 'JPEG',
        value: 'image/jpeg',
    },
];

function handleFiles(files: File | File[]) {
    const fileArray = Array.isArray(files) ? files : (files ? [files] : []);
    if (fileArray.length === 0) {
        store.clearAll();
        return;
    }
    store.addFiles(fileArray);
}
</script>

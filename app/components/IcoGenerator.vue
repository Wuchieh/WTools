<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                    <v-icon icon="mdi-favicon" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('ico.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('ico.subtitle') }}</v-card-subtitle>
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

            <v-chip class="mb-4">{{ $t('ico.sizes') }}: {{ store.sizes.join(', ') }} px</v-chip>

            <v-list v-if="store.files.length > 0" border>
                <v-list-item v-for="f in store.files" :key="f.id">
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
            <v-btn color="primary" :loading="store.isConverting" @click="store.convertFiles()">{{ $t('ico.generate') }}</v-btn>
            <v-btn color="success" :disabled="!store.hasConverted || store.successCount === 0" @click="store.downloadZip()">{{ $t('result.download') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useIcoStore } from '~/stores/ico';

const store = useIcoStore();
const selectedFiles = ref<File[]>([]);

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}
</script>

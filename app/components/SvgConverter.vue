<template>
    <v-card border>
        <v-card-item>
            <template #prepend>
                <v-avatar
                    color="primary"
                    variant="tonal"
                    rounded
                >
                    <v-icon icon="mdi-svg" />
                </v-avatar>
            </template>
            <v-card-title>{{ $t('svg.title') }}</v-card-title>
            <v-card-subtitle>{{ $t('svg.subtitle') }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-4">
            <v-file-input
                v-model="selectedFiles"
                class="mb-4"
                accept=".svg,image/svg+xml"
                prepend-icon="mdi-file"
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
                        :label="$t('svg.outputFormat')"
                    />
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="store.width"
                        density="compact"
                        type="number"
                        :label="$t('svg.width')"
                        :min="1"
                        clearable
                    />
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="store.height"
                        density="compact"
                        type="number"
                        :label="$t('svg.height')"
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
                            color="grey-lighten-2"
                            rounded="0"
                            size="40"
                        >
                            <v-icon icon="mdi-svg" />
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
                {{ $t('svg.convert') }}
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
import { useSvgStore } from '~/stores/svg';

const store = useSvgStore();
const selectedFiles = ref<File[]>([]);

const formats = [
    {
        title: 'PNG',
        value: 'image/png',
    },
    {
        title: 'JPEG',
        value: 'image/jpeg',
    },
    {
        title: 'WebP',
        value: 'image/webp',
    },
];

function handleFiles(files: File[]) {
    if (files) store.addFiles(files);
}
</script>

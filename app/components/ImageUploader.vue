<template>
    <div
        class="align-center d-flex flex-column pa-10 uploader-container justify-center rounded-lg border-dashed"
        :class="{ dragging: isDragging }"
        @click="triggerFileInput"
        @dragleave="onDragLeave"
        @dragover="onDragOver"
        @drop="onDrop"
    >
        <v-icon
            class="mb-4"
            color="primary"
            size="64"
        >
            mdi-cloud-upload
        </v-icon>
        <div class="text-h6 mb-2">
            {{ $t('uploader.dragDrop') }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('uploader.orClick') }}
        </div>
        <v-btn
            color="primary"
            variant="tonal"
        >
            {{ $t('uploader.selectFiles') }}
        </v-btn>
        <input
            ref="fileInput"
            class="d-none"
            accept="image/*"
            type="file"
            multiple
            @change="onFileChange"
        >
    </div>
</template>

<script setup lang="ts">
import { useConverterStore } from '~/stores/converter';

const store = useConverterStore();
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function onDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging.value = false;
}

function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging.value = true;
}

function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging.value = false;
    if (e.dataTransfer?.files) {
        store.addFiles(Array.from(e.dataTransfer.files));
    }
}

function onFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        store.addFiles(Array.from(target.files));
    }
    // Reset input so same files can be selected again if needed
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

function triggerFileInput() {
    fileInput.value?.click();
}
</script>

<style scoped>
.uploader-container {
    border: 2px dashed rgba(var(--v-theme-primary), 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: rgba(var(--v-theme-surface), 0.5);
}

.uploader-container:hover,
.uploader-container.dragging {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>

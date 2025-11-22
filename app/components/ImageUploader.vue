<script setup lang="ts">
import { useConverterStore } from '~/stores/converter'

const store = useConverterStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    store.addFiles(Array.from(e.dataTransfer.files))
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    store.addFiles(Array.from(target.files))
  }
  // Reset input so same files can be selected again if needed
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="uploader-container d-flex flex-column align-center justify-center pa-10 rounded-lg border-dashed"
    :class="{ 'dragging': isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="triggerFileInput"
  >
    <v-icon size="64" color="primary" class="mb-4">mdi-cloud-upload</v-icon>
    <div class="text-h6 mb-2">{{ $t('uploader.dragDrop') }}</div>
    <div class="text-body-2 text-medium-emphasis mb-4">{{ $t('uploader.orClick') }}</div>
    <v-btn color="primary" variant="tonal">{{ $t('uploader.selectFiles') }}</v-btn>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="d-none"
      @change="onFileChange"
    >
  </div>
</template>

<style scoped>
.uploader-container {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: rgba(var(--v-theme-surface), 0.5);
}

.uploader-container:hover, .uploader-container.dragging {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>

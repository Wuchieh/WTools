import { defineStore } from 'pinia'
import JSZip from 'jszip'

export interface ImageFile {
    id: string
    file: File
    preview: string
    status: 'pending' | 'converting' | 'success' | 'error'
    error?: string
    convertedBlob?: Blob
}

export const useConverterStore = defineStore('converter', () => {
    const images = ref<ImageFile[]>([])
    const isConverting = ref(false)
    const successCount = computed(() => images.value.filter(img => img.status === 'success').length)
    const errorCount = computed(() => images.value.filter(img => img.status === 'error').length)
    const hasConverted = computed(() => images.value.some(img => img.status === 'success' || img.status === 'error'))

    function addFiles(files: File[]) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue

            const reader = new FileReader()
            reader.onload = (e) => {
                images.value.push({
                    id: crypto.randomUUID(),
                    file,
                    preview: e.target?.result as string,
                    status: 'pending',
                })
            }
            reader.readAsDataURL(file)
        }
    }

    function removeFile(id: string) {
        const index = images.value.findIndex(img => img.id === id)
        if (index !== -1) {
            images.value.splice(index, 1)
        }
    }

    async function convertImages() {
        isConverting.value = true

        // Reset status for pending images if re-running? 
        // Or just convert pending ones. Let's convert all pending.

        const pendingImages = images.value.filter(img => img.status === 'pending' || img.status === 'error')

        for (const img of pendingImages) {
            img.status = 'converting'
            try {
                const blob = await convertToWebP(img.file)
                img.convertedBlob = blob
                img.status = 'success'
            } catch (e: any) {
                img.status = 'error'
                img.error = e.message || 'Conversion failed'
            }
        }
        isConverting.value = false
    }

    function convertToWebP(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas context not available'))
                    return
                }
                ctx.drawImage(img, 0, 0)
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Canvas toBlob failed'))
                    }
                }, 'image/webp', 0.8)
            }
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = URL.createObjectURL(file)
        })
    }

    async function downloadZip() {
        const zip = new JSZip()
        const successImages = images.value.filter(img => img.status === 'success' && img.convertedBlob)

        if (successImages.length === 0) return

        for (const img of successImages) {
            const fileName = img.file.name.replace(/\.[^/.]+$/, "") + ".webp"
            zip.file(fileName, img.convertedBlob!)
        }

        const content = await zip.generateAsync({ type: "blob" })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = "converted_images.zip"
        link.click()
        URL.revokeObjectURL(link.href)
    }

    function reset() {
        images.value = []
        isConverting.value = false
    }

    return {
        images,
        isConverting,
        successCount,
        errorCount,
        hasConverted,
        addFiles,
        removeFile,
        convertImages,
        downloadZip,
        reset
    }
})

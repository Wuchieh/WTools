<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('qrreader.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('qrreader.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input
                            v-model="file"
                            :label="$t('qrreader.selectImage')"
                            accept="image/*"
                            prepend-icon="mdi-camera"
                            show-size
                            border
                            class="mb-4"
                            @update:model-value="readQr"
                        />

                        <v-btn color="primary" variant="outlined" block class="mb-4" @click="startCamera">
                            {{ $t('qrreader.useCamera') }}
                        </v-btn>

                        <video v-if="showCamera" ref="videoEl" autoplay playsinline class="w-full" style="max-height:300px; background:#000" />

                        <v-alert v-if="result" type="success" class="mt-4">
                            <div class="text-break">{{ result }}</div>
                            <v-btn size="small" class="mt-2" @click="copy(result)">{{ $t('qrreader.copy') }}</v-btn>
                        </v-alert>

                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import jsQR from 'jsqr';

const { t } = useI18n();
useHead({ meta: [{ content: t('qrreader.subtitle'), name: 'description' }], title: t('qrreader.title') });

const file = ref<File[] | null>(null);
const result = ref('');
const error = ref('');
const showCamera = ref(false);
const videoEl = ref<HTMLVideoElement | null>(null);
let stream: MediaStream | null = null;

async function readQr(files: File[] | null) {
    result.value = '';
    error.value = '';
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { error.value = 'Canvas error'; return; }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, img.width, img.height);
            if (code) result.value = code.data;
            else error.value = t('qrreader.notFound');
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(files[0]);
}

async function startCamera() {
    showCamera.value = true;
    await nextTick();
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (videoEl.value) {
        videoEl.value.srcObject = stream;
        scanCamera();
    }
}

function scanCamera() {
    if (!videoEl.value || !stream) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.value.videoWidth;
    canvas.height = videoEl.value.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoEl.value, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
        result.value = code.data;
        stopCamera();
    } else {
        requestAnimationFrame(scanCamera);
    }
}

function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
}

function copy(text: string) {
    navigator.clipboard.writeText(text);
}

onUnmounted(() => stopCamera());
</script>

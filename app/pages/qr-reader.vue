<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('qrreader.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('qrreader.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input
                            v-model="file"
                            class="mb-4"
                            accept="image/*"
                            prepend-icon="mdi-camera"
                            :label="$t('qrreader.selectImage')"
                            border
                            show-size
                            @update:model-value="readQr"
                        />

                        <v-btn
                            class="mb-4"
                            color="primary"
                            variant="outlined"
                            block
                            @click="startCamera"
                        >
                            {{ $t('qrreader.useCamera') }}
                        </v-btn>

                        <video
                            v-if="showCamera"
                            ref="videoEl"
                            class="w-full"
                            style="max-height:300px; background:#000"
                            autoplay
                            playsinline
                        />

                        <v-alert
                            v-if="result"
                            class="mt-4"
                            type="success"
                        >
                            <div class="text-break">
                                {{ result }}
                            </div>
                            <v-btn
                                class="mt-2"
                                size="small"
                                @click="copy(result)"
                            >
                                {{ $t('qrreader.copy') }}
                            </v-btn>
                        </v-alert>

                        <v-alert
                            v-if="error"
                            class="mt-4"
                            type="error"
                        >
                            {{ error }}
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import jsQR from 'jsqr';

const { t } = useI18n();
useSeoMeta({
    description: t('qrreader.subtitle'),
    ogImage: '/og/qr-reader.png',

    title: t('qrreader.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/qr-reader.png',
});

const file = ref<File[] | null>(null);
const result = ref('');
const error = ref('');
const showCamera = ref(false);
const videoEl = ref<HTMLVideoElement | null>(null);
let stream: MediaStream | null = null;

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('qrreader.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('qrreader.copyFailed'), 'error');
    });
}

function readQr(files: File | File[] | null) {
    result.value = '';
    error.value = '';
    if (!files) return;
    const fileArray = Array.isArray(files) ? files : [files];
    if (!fileArray.length) return;
    const firstFile = fileArray[0];
    if (!firstFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target?.result;
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                error.value = 'Canvas error';
                return;
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, img.width, img.height);
            if (code) result.value = code.data;
            else error.value = t('qrreader.notFound');
        };
        img.src = file as string;
    };
    reader.readAsDataURL(firstFile);
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

async function startCamera() {
    showCamera.value = true;
    await nextTick();
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoEl.value) {
            videoEl.value.srcObject = stream;
            scanCamera();
        }
    } catch (err) {
        showCamera.value = false;
        error.value = t('qrreader.cameraPermissionDenied');
    }
}

function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
}

onUnmounted(() => stopCamera());
</script>

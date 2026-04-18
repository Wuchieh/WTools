<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('base64File.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('base64File.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle
                            v-model="mode"
                            class="mb-4"
                            color="primary"
                        >
                            <v-btn value="encode">
                                {{ $t('base64File.encode') }}
                            </v-btn>
                            <v-btn value="decode">
                                {{ $t('base64File.decode') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-file-input
                            v-if="mode === 'encode'"
                            v-model="file"
                            class="mb-4"
                            :label="$t('base64File.selectFile')"
                            border
                            show-size
                            @update:model-value="encodeFile"
                        />
                        <v-textarea
                            v-else
                            v-model="base64"
                            class="mb-4"
                            rows="4"
                            :label="$t('base64File.inputBase64')"
                            border
                        />
                        <v-btn
                            v-if="mode === 'decode'"
                            color="primary"
                            :disabled="!base64"
                            block
                            @click="decodeFile"
                        >
                            {{ $t('base64File.decode') }}
                        </v-btn>
                        <v-card
                            v-if="decodedUrl"
                            class="mt-4 text-center"
                            color="success"
                            variant="tonal"
                        >
                            <v-card-text>
                                <v-img
                                    v-if="isImage"
                                    class="d-inline-block"
                                    max-height="300"
                                    :src="decodedUrl"
                                />
                                <div
                                    v-else
                                    class="text-break"
                                >
                                    {{ decodedUrl }}
                                </div>
                                <v-btn
                                    class="mt-2"
                                    color="success"
                                    size="small"
                                    @click="downloadDecoded"
                                >
                                    {{ $t('base64File.download') }}
                                </v-btn>
                            </v-card-text>
                        </v-card>
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
const { t } = useI18n();

useSeoMeta({
    description: t('base64File.subtitle'),
    ogImage: '/og/base64-file.png',
    title: t('base64File.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/base64-file.png',
});

const mode = ref<'decode' | 'encode'>('encode');
const file = ref<File[] | null>(null);
const base64 = ref('');
const decodedUrl = ref('');
const isImage = ref(false);
const error = ref('');
let decodedBlob: Blob | null = null;

function decodeFile() {
    error.value = '';
    decodedUrl.value = '';
    try {
        const mime = base64.value.match(/^data:([^;]+);base64,/)?.[1] || 'text/plain';
        const raw = base64.value.replace(/^data:[^;]+;base64,/, '');
        const binary = atob(raw);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        decodedBlob = new Blob([arr], { type: mime });
        decodedUrl.value = URL.createObjectURL(decodedBlob);
        isImage.value = mime.startsWith('image/');
    } catch (e: any) {
        error.value = e.message;
    }
}

function downloadDecoded() {
    if (!decodedBlob) return;
    const link = document.createElement('a');
    link.href = decodedUrl.value;
    link.download = 'decoded_file';
    link.click();
}

async function encodeFile(files: File | File[] | null) {
    error.value = '';
    decodedUrl.value = '';
    if (!files) return;
    const fileArray = Array.isArray(files) ? files : [files];
    if (!fileArray.length) return;
    const f = fileArray[0];
    if (!f) return;
    const data = await f.arrayBuffer();
    const b64 = btoa(new Uint8Array(data).reduce((s, b) => s + String.fromCharCode(b), ''));
    decodedUrl.value = `data:${f.type};base64,${b64}`;
    decodedBlob = new Blob([data], { type: f.type });
    isImage.value = f.type.startsWith('image/');
}
</script>

<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('base64file.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('base64file.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle v-model="mode" class="mb-4" color="primary">
                            <v-btn value="encode">{{ $t('base64file.encode') }}</v-btn>
                            <v-btn value="decode">{{ $t('base64file.decode') }}</v-btn>
                        </v-btn-toggle>
                        <v-file-input v-if="mode === 'encode'" v-model="file" :label="$t('base64file.selectFile')" show-size border class="mb-4" @update:model-value="encodeFile" />
                        <v-textarea v-else v-model="base64" :label="$t('base64file.inputBase64')" rows="4" border class="mb-4" />
                        <v-btn v-if="mode === 'decode'" color="primary" block :disabled="!base64" @click="decodeFile">{{ $t('base64file.decode') }}</v-btn>
                        <v-card v-if="decodedUrl" variant="tonal" color="success" class="mt-4 text-center">
                            <v-card-text>
                                <v-img v-if="isImage" :src="decodedUrl" max-height="300" class="d-inline-block" />
                                <div v-else class="text-break">{{ decodedUrl }}</div>
                                <v-btn color="success" size="small" class="mt-2" @click="downloadDecoded">{{ $t('base64file.download') }}</v-btn>
                            </v-card-text>
                        </v-card>
                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('base64file.subtitle'), name: 'description' }], title: t('base64file.title') });

const mode = ref<'encode' | 'decode'>('encode');
const file = ref<File[] | null>(null);
const base64 = ref('');
const decodedUrl = ref('');
const isImage = ref(false);
const error = ref('');
let decodedBlob: Blob | null = null;

async function encodeFile(files: File[] | null) {
    error.value = '';
    decodedUrl.value = '';
    if (!files?.length) return;
    const f = files[0];
    const data = await f.arrayBuffer();
    const b64 = btoa(new Uint8Array(data).reduce((s, b) => s + String.fromCharCode(b), ''));
    decodedUrl.value = `data:${f.type};base64,${b64}`;
    decodedBlob = new Blob([data], { type: f.type });
    isImage.value = f.type.startsWith('image/');
}

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
    } catch (e: any) { error.value = e.message; }
}

function downloadDecoded() {
    if (!decodedBlob) return;
    const link = document.createElement('a');
    link.href = decodedUrl.value;
    link.download = 'decoded_file';
    link.click();
}
</script>

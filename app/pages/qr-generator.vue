<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('qr.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('qr.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            :label="$t('qr.input')"
                            :placeholder="$t('qr.placeholder')"
                            rows="3"
                            border
                            class="mb-4"
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-select
                                    v-model="format"
                                    :items="formats"
                                    :label="$t('qr.format')"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-slider
                                    v-model="size"
                                    :label="$t('qr.size', { v: size })"
                                    :min="128"
                                    :max="512"
                                    :step="32"
                                    thumb-label
                                    density="compact"
                                />
                            </v-col>
                        </v-row>

                        <v-btn color="primary" block :disabled="!input" @click="generate">
                            {{ $t('qr.generate') }}
                        </v-btn>

                        <div v-if="dataUrl" class="text-center mt-4">
                            <v-img :src="dataUrl" :width="size" class="d-inline-block" />
                            <div class="mt-3">
                                <v-btn color="success" size="small" @click="download">
                                    {{ $t('qr.download') }}
                                </v-btn>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';

const { t } = useI18n();

useHead({ meta: [{ content: t('qr.subtitle'), name: 'description' }], title: t('qr.title') });

const input = ref('');
const format = ref<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
const size = ref(256);
const dataUrl = ref('');

const formats = [
    { title: 'PNG', value: 'image/png' },
    { title: 'JPEG', value: 'image/jpeg' },
    { title: 'WebP', value: 'image/webp' },
];

async function generate() {
    dataUrl.value = await QRCode.toDataURL(input.value, {
        width: size.value,
        type: format.value.split('/')[1] as 'png' | 'jpeg' | 'webp',
    });
}

function download() {
    const link = document.createElement('a');
    link.href = dataUrl.value;
    link.download = `qr_${Date.now()}.${format.value.split('/')[1]}`;
    link.click();
}
</script>

<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('urlenc.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('urlenc.subtitle') }}
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
                                {{ $t('urlenc.encode') }}
                            </v-btn>
                            <v-btn value="decode">
                                {{ $t('urlenc.decode') }}
                            </v-btn>
                        </v-btn-toggle>

                        <v-textarea
                            v-model="input"
                            class="mb-4"
                            rows="4"
                            :label="$t('urlenc.input')"
                            border
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn
                                    color="primary"
                                    :disabled="!input.trim()"
                                    block
                                    @click="process"
                                >
                                    {{ mode === 'encode' ? $t('urlenc.encode') : $t('urlenc.decode') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    color="success"
                                    :disabled="!output"
                                    block
                                    @click="copy"
                                >
                                    {{ $t('urlenc.copy') }}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-textarea
                            v-model="output"
                            rows="4"
                            :label="$t('urlenc.output')"
                            border
                            readonly
                        />

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
    description: t('urlenc.subtitle'),
    ogImage: '/og/url-encoder.png',

    title: t('urlenc.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/url-encoder.png',
});

const mode = ref<'decode' | 'encode'>('encode');
const input = ref('');
const output = ref('');
const error = ref('');

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('urlenc.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('urlenc.copyFailed'), 'error');
    });
}

function process() {
    error.value = '';
    output.value = '';
    try {
        if (mode.value === 'encode') {
            output.value = encodeURIComponent(input.value);
        } else {
            output.value = decodeURIComponent(input.value);
        }
    } catch (e: any) {
        error.value = e.message || 'Processing failed';
    }
}
</script>

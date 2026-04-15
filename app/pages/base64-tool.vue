<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('base64.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('base64.subtitle') }}
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
                                {{ $t('base64.encode') }}
                            </v-btn>
                            <v-btn value="decode">
                                {{ $t('base64.decode') }}
                            </v-btn>
                        </v-btn-toggle>

                        <v-textarea
                            v-model="input"
                            class="mb-4"
                            rows="4"
                            :label="mode === 'encode' ? $t('base64.inputText') : $t('base64.inputBase64')"
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
                                    {{ mode === 'encode' ? $t('base64.encode') : $t('base64.decode') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    color="success"
                                    :disabled="!output"
                                    block
                                    @click="copy"
                                >
                                    {{ $t('base64.copy') }}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-textarea
                            v-model="output"
                            rows="4"
                            :label="$t('base64.output')"
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

useHead({
    meta: [
        {
            content: t('base64.subtitle'),
            name: 'description',
        },
    ],
    title: t('base64.title'),
});

const mode = ref<'decode' | 'encode'>('encode');
const input = ref('');
const output = ref('');
const error = ref('');

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
    });
}

function process() {
    error.value = '';
    output.value = '';
    try {
        if (mode.value === 'encode') {
            output.value = btoa(unescape(encodeURIComponent(input.value)));
        } else {
            output.value = decodeURIComponent(escape(atob(input.value.trim())));
        }
    } catch (e: any) {
        error.value = e.message || 'Processing failed';
    }
}
</script>

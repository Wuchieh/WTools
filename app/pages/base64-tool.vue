<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('base64.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('base64.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle v-model="mode" class="mb-4" color="primary">
                            <v-btn value="encode">{{ $t('base64.encode') }}</v-btn>
                            <v-btn value="decode">{{ $t('base64.decode') }}</v-btn>
                        </v-btn-toggle>

                        <v-textarea
                            v-model="input"
                            :label="mode === 'encode' ? $t('base64.inputText') : $t('base64.inputBase64')"
                            rows="4"
                            border
                            class="mb-4"
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn color="primary" block :disabled="!input.trim()" @click="process">
                                    {{ mode === 'encode' ? $t('base64.encode') : $t('base64.decode') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn color="success" block :disabled="!output" @click="copy">
                                    {{ $t('base64.copy') }}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-textarea
                            v-model="output"
                            :label="$t('base64.output')"
                            rows="4"
                            border
                            readonly
                        />

                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({ meta: [{ content: t('base64.subtitle'), name: 'description' }], title: t('base64.title') });

const mode = ref<'encode' | 'decode'>('encode');
const input = ref('');
const output = ref('');
const error = ref('');

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

function copy() {
    navigator.clipboard.writeText(output.value);
}
</script>

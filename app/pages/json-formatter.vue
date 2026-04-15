<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('json.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('json.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle v-model="mode" class="mb-4" color="primary">
                            <v-btn value="format">{{ $t('json.format') }}</v-btn>
                            <v-btn value="minify">{{ $t('json.minify') }}</v-btn>
                            <v-btn value="validate">{{ $t('json.validate') }}</v-btn>
                        </v-btn-toggle>
                        <v-textarea v-model="input" :label="$t('json.input')" rows="8" border class="mb-4 font-monospace" />
                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn color="primary" block :disabled="!input" @click="process">{{ $t('json.process') }}</v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn color="success" block :disabled="!output" @click="copy">{{ $t('json.copy') }}</v-btn>
                            </v-col>
                        </v-row>
                        <v-textarea v-if="output" v-model="output" :label="$t('json.output')" rows="8" border readonly class="font-monospace" />
                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('json.subtitle'), name: 'description' }], title: t('json.title') });

const mode = ref('format');
const input = ref('');
const output = ref('');
const error = ref('');

function process() {
    error.value = '';
    output.value = '';
    try {
        const parsed = JSON.parse(input.value);
        if (mode.value === 'format') output.value = JSON.stringify(parsed, null, 2);
        else if (mode.value === 'minify') output.value = JSON.stringify(parsed);
        else output.value = 'Valid JSON ✓';
    } catch (e: any) {
        error.value = e.message;
    }
}

function copy() { navigator.clipboard.writeText(output.value).then(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
}).catch(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
}); }
</script>

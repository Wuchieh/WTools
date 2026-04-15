<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('cssfmt.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('cssfmt.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea v-model="input" :label="$t('cssfmt.input')" rows="10" border class="font-monospace mb-4" />
                        <v-btn color="primary" block :disabled="!input" @click="format">{{ $t('cssfmt.format') }}</v-btn>
                        <v-textarea v-if="output" v-model="output" :label="$t('cssfmt.output')" rows="10" border readonly class="font-monospace mt-4" />
                        <v-btn v-if="output" color="success" block class="mt-2" @click="copy">{{ $t('cssfmt.copy') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('cssfmt.subtitle'), name: 'description' }], title: t('cssfmt.title') });

const input = ref('');
const output = ref('');

function format() {
    let indent = 0;
    output.value = input.value
        .replace(/\s*{\s*/g, ' {\n' + '  '.repeat(++indent))
        .replace(/\s*}\s*/g, '\n' + '  '.repeat(--indent) + '}')
        .replace(/;\s*/g, ';\n' + '  '.repeat(indent))
        .replace(/{\s*\n\s*\n/g, '{\n' + '  '.repeat(indent));
    // Collapse extra newlines
    output.value = output.value.replace(/\n{3,}/g, '\n\n').trim();
}

function copy() { navigator.clipboard.writeText(output.value).then(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
}).catch(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
}); }
</script>

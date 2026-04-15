<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('cssFormatter.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('cssFormatter.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            class="font-monospace mb-4"
                            rows="10"
                            :label="$t('cssFormatter.input')"
                            border
                        />
                        <v-btn
                            color="primary"
                            :disabled="!input"
                            block
                            @click="format"
                        >
                            {{ $t('cssFormatter.format') }}
                        </v-btn>
                        <v-textarea
                            v-if="output"
                            v-model="output"
                            class="font-monospace mt-4"
                            rows="10"
                            :label="$t('cssFormatter.output')"
                            border
                            readonly
                        />
                        <v-btn
                            v-if="output"
                            class="mt-2"
                            color="success"
                            block
                            @click="copy"
                        >
                            {{ $t('cssFormatter.copy') }}
                        </v-btn>
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
            content: t('cssFormatter.subtitle'),
            name: 'description',
        }
    ],
    title: t('cssFormatter.title'),
});

const input = ref('');
const output = ref('');

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('cssFormatter.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('cssFormatter.copyFailed'), 'error');
    });
}

function format() {
    let indent = 0;
    output.value = input.value
        .replace(/\s*\{\s*/g, ` {\n${'  '.repeat(++indent)}`)
        .replace(/\s*\}\s*/g, `\n${'  '.repeat(--indent)}}`)
        .replace(/;\s*/g, `;\n${'  '.repeat(indent)}`)
        .replace(/\{\s*\n\s*\n/g, `{\n${'  '.repeat(indent)}`);
    // Collapse extra newlines
    output.value = output.value.replace(/\n{3,}/g, '\n\n').trim();
}
</script>

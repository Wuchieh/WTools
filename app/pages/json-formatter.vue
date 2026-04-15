<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('jsonFormatter.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('jsonFormatter.subtitle') }}
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
                            <v-btn value="format">
                                {{ $t('jsonFormatter.format') }}
                            </v-btn>
                            <v-btn value="minify">
                                {{ $t('jsonFormatter.minify') }}
                            </v-btn>
                            <v-btn value="validate">
                                {{ $t('jsonFormatter.validate') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-textarea
                            v-model="input"
                            class="font-monospace mb-4"
                            rows="8"
                            :label="$t('jsonFormatter.input')"
                            border
                        />
                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn
                                    color="primary"
                                    :disabled="!input"
                                    block
                                    @click="process"
                                >
                                    {{ $t('jsonFormatter.process') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    color="success"
                                    :disabled="!output"
                                    block
                                    @click="copy"
                                >
                                    {{ $t('jsonFormatter.copy') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-textarea
                            v-if="output"
                            v-model="output"
                            class="font-monospace"
                            rows="8"
                            :label="$t('jsonFormatter.output')"
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
            content: t('jsonFormatter.subtitle'),
            name: 'description',
        }
    ],
    title: t('jsonFormatter.title'),
});

const mode = ref('format');
const input = ref('');
const output = ref('');
const error = ref('');

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('jsonFormatter.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('jsonFormatter.copyFailed'), 'error');
    });
}

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
</script>

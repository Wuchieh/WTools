<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('html.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('html.subtitle') }}
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
                            <v-btn value="escape">
                                {{ $t('html.escape') }}
                            </v-btn>
                            <v-btn value="unescape">
                                {{ $t('html.unescape') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-textarea
                            v-model="input"
                            class="mb-4"
                            rows="4"
                            :label="$t('html.input')"
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
                                    {{ mode === 'escape' ? $t('html.escape') : $t('html.unescape') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    color="success"
                                    :disabled="!output"
                                    block
                                    @click="copy"
                                >
                                    {{ $t('html.copy') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-textarea
                            v-model="output"
                            rows="4"
                            :label="$t('html.output')"
                            border
                            readonly
                        />
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
            content: t('html.subtitle'),
            name: 'description',
        },
    ],
    title: t('html.title'),

    ogImage: '/og/html-escape.png',
    twitterCard: 'summary_large_image',
    twitterImage: '/og/html-escape.png'});

const mode = ref<'escape' | 'unescape'>('escape');
const input = ref('');
const output = ref('');

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('html.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('html.copyFailed'), 'error');
    });
}

function process() {
    if (mode.value === 'escape') {
        const d = document.createElement('div');
        d.textContent = input.value;
        output.value = d.innerHTML;
    } else {
        const d = document.createElement('div');
        d.innerHTML = input.value;
        output.value = d.textContent || '';
    }
}
</script>

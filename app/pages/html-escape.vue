<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('html.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('html.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle v-model="mode" class="mb-4" color="primary">
                            <v-btn value="escape">{{ $t('html.escape') }}</v-btn>
                            <v-btn value="unescape">{{ $t('html.unescape') }}</v-btn>
                        </v-btn-toggle>
                        <v-textarea v-model="input" :label="$t('html.input')" rows="4" border class="mb-4" />
                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn color="primary" block :disabled="!input" @click="process">{{ mode === 'escape' ? $t('html.escape') : $t('html.unescape') }}</v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn color="success" block :disabled="!output" @click="copy">{{ $t('html.copy') }}</v-btn>
                            </v-col>
                        </v-row>
                        <v-textarea v-model="output" :label="$t('html.output')" rows="4" border readonly />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('html.subtitle'), name: 'description' }], title: t('html.title') });

const mode = ref<'escape' | 'unescape'>('escape');
const input = ref('');
const output = ref('');

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

function copy() { navigator.clipboard.writeText(output.value); }
</script>

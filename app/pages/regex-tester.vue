<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('regex.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('regex.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field v-model="pattern" :label="$t('regex.pattern')" placeholder="e.g. ^\w+@\w+\.\w+$" border class="mb-2" />
                        <v-row class="mb-2">
                            <v-col cols="6">
                                <v-switch v-model="flags.g" :label="$t('regex.global')" color="primary" density="compact" />
                            </v-col>
                            <v-col cols="6">
                                <v-switch v-model="flags.i" :label="$t('regex.caseInsensitive')" color="primary" density="compact" />
                            </v-col>
                        </v-row>

                        <v-textarea v-model="text" :label="$t('regex.testString')" rows="4" border class="mb-4" />

                        <v-btn color="primary" block :disabled="!pattern" @click="test">
                            {{ $t('regex.test') }}
                        </v-btn>

                        <v-alert v-if="regexError" type="error" class="mt-4">{{ regexError }}</v-alert>

                        <div v-if="matches.length" class="mt-4">
                            <div class="text-caption text-medium-emphasis mb-2">{{ $t('regex.matches', { v: matches.length }) }}</div>
                            <v-chip v-for="(m, i) in matches" :key="i" color="success" class="mr-2 mb-2">{{ m }}</v-chip>
                        </div>

                        <div v-if="highlightedText" class="mt-4 pa-3 bg-grey-lighten-4 rounded text-break" v-html="highlightedText" />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('regex.subtitle'), name: 'description' }], title: t('regex.title') });

const pattern = ref('');
const text = ref('');
const regexError = ref('');
const matches = ref<string[]>([]);
const highlightedText = ref('');
const flags = reactive({ g: true, i: false });

function test() {
    regexError.value = '';
    matches.value = [];
    highlightedText.value = '';
    try {
        const re = new RegExp(pattern.value, `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}`);
        const found = [...text.value.matchAll(re)].map((m) => m[0]);
        matches.value = [...new Set(found)];
        highlightedText.value = text.value.replace(re, (m) => `<mark style="background:yellow">${m}</mark>`);
    } catch (e: any) {
        regexError.value = e.message;
    }
}
</script>

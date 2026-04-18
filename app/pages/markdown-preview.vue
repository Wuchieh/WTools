<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('markdownPreview.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('markdownPreview.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="10"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            class="font-monospace mb-4"
                            rows="12"
                            :label="$t('markdownPreview.input')"
                            border
                        />
                        <!-- eslint-disable vue/no-v-html -->
                        <div
                            v-if="html"
                            class="prose"
                            v-html="html"
                        />
                        <!-- eslint-enable vue/no-v-html -->
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
    description: t('markdownPreview.subtitle'),
    ogImage: '/og/markdown-preview.png',

    title: t('markdownPreview.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/markdown-preview.png',
});

const input = ref('');

const html = computed(() => {
    if (!input.value) return '';
    return input.value
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>');
});
</script>

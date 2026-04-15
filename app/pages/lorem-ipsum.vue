<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('lorem.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('lorem.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="unit"
                            class="mb-4"
                            :items="unitOptions"
                            :label="$t('lorem.unit')"
                        />
                        <v-slider
                            v-model="count"
                            class="mb-4"
                            :label="$t('lorem.count', { v: count })"
                            :max="50"
                            :min="1"
                            thumb-label
                        />
                        <v-btn
                            color="primary"
                            block
                            @click="generate"
                        >
                            {{ $t('lorem.generate') }}
                        </v-btn>
                        <v-textarea
                            v-if="text"
                            class="font-monospace mt-4"
                            rows="10"
                            :model-value="text"
                            border
                            readonly
                        />
                        <v-btn
                            v-if="text"
                            class="mt-2"
                            color="success"
                            block
                            @click="copy"
                        >
                            {{ $t('lorem.copy') }}
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
            content: t('lorem.subtitle'),
            name: 'description',
        },
    ],
    title: t('lorem.title'),
});

const unit = ref('paragraphs');
const count = ref(3);
const text = ref('');
const unitOptions = [
    {
        title: 'Words',
        value: 'words',
    },
    {
        title: 'Sentences',
        value: 'sentences',
    },
    {
        title: 'Paragraphs',
        value: 'paragraphs',
    },
];

const WORDS = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
];

function copy() {
    navigator.clipboard.writeText(text.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
    });
}

function generate() {
    let result: string[] = [];
    if (unit.value === 'words') {
        result = Array.from({ length: count.value }, () => WORDS[Math.floor(Math.random() * WORDS.length)] ?? '');
    } else if (unit.value === 'sentences') {
        result = Array.from({ length: count.value }, () => {
            const len = Math.floor(Math.random() * 10) + 8;
            const words = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)] ?? '');
            return `${words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')}.`;
        });
    } else {
        result = Array.from({ length: count.value }, () => {
            const sentences = Array.from({ length: Math.floor(Math.random() * 4) + 4 }, () => {
                const len = Math.floor(Math.random() * 10) + 6;
                const words = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)] ?? '');
                return `${words.map((w, j) => j === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')}.`;
            });
            return sentences.join(' ');
        });
    }
    text.value = unit.value === 'words' ? result.join(' ') : result.join(unit.value === 'paragraphs' ? '\n\n' : ' ');
}
</script>

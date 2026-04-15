<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('encdec.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('encdec.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select v-model="cipher" :items="ciphers" :label="$t('encdec.cipher')" class="mb-4" />
                        <v-text-field v-if="cipher !== 'rot13'" v-model="key" :label="$t('encdec.key')" type="number" border class="mb-4" />
                        <v-btn-toggle v-if="cipher !== 'rot13'" v-model="mode" class="mb-4" color="primary">
                            <v-btn value="encrypt">{{ $t('encdec.encrypt') }}</v-btn>
                            <v-btn value="decrypt">{{ $t('encdec.decrypt') }}</v-btn>
                        </v-btn-toggle>
                        <p v-if="cipher === 'rot13'" class="text-caption text-medium-emphasis mb-4">ROT13 是對稱加密，加密與解密結果相同</p>
                        <v-textarea v-model="input" :label="$t('encdec.input')" rows="4" border class="mb-4" />
                        <v-btn color="primary" block :disabled="!input" @click="process">{{ mode === 'encrypt' ? $t('encdec.encrypt') : $t('encdec.decrypt') }}</v-btn>
                        <v-textarea v-if="output" v-model="output" :label="$t('encdec.output')" rows="4" border readonly class="mt-4" />
                        <v-btn v-if="output" color="success" block class="mt-2" @click="copy">{{ $t('encdec.copy') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('encdec.subtitle'), name: 'description' }], title: t('encdec.title') });

const cipher = ref('caesar');
const key = ref(3);
const mode = ref('encrypt');
const input = ref('');
const output = ref('');
const ciphers = [
    { title: 'Caesar', value: 'caesar' },
    { title: 'ROT13', value: 'rot13' },
];

function process() {
    const k = key.value % 26;
    const step = mode.value === 'encrypt' ? k : 26 - k;
    let result = '';
    for (const ch of input.value) {
        if (ch.match(/[a-z]/)) {
            const code = ((ch.charCodeAt(0) - 97 + step) % 26) + 97;
            result += String.fromCharCode(code);
        } else if (ch.match(/[A-Z]/)) {
            const code = ((ch.charCodeAt(0) - 65 + step) % 26) + 65;
            result += String.fromCharCode(code);
        } else { result += ch; }
    }
    output.value = result;
}

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
    });
}
</script>

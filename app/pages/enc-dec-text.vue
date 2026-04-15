<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('encDecText.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('encDecText.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="cipher"
                            class="mb-4"
                            :items="ciphers"
                            :label="$t('encDecText.cipher')"
                        />
                        <v-text-field
                            v-if="cipher !== 'rot13'"
                            v-model="key"
                            class="mb-4"
                            type="number"
                            :label="$t('encDecText.key')"
                            border
                        />
                        <v-btn-toggle
                            v-if="cipher !== 'rot13'"
                            v-model="mode"
                            class="mb-4"
                            color="primary"
                        >
                            <v-btn value="encrypt">
                                {{ $t('encDecText.encrypt') }}
                            </v-btn>
                            <v-btn value="decrypt">
                                {{ $t('encDecText.decrypt') }}
                            </v-btn>
                        </v-btn-toggle>
                        <p
                            v-if="cipher === 'rot13'"
                            class="text-caption text-medium-emphasis mb-4"
                        >
                            {{ $t('encDecText.rot13Note') }}
                        </p>
                        <v-textarea
                            v-model="input"
                            class="mb-4"
                            rows="4"
                            :label="$t('encDecText.input')"
                            border
                        />
                        <v-btn
                            color="primary"
                            :disabled="!input"
                            block
                            @click="process"
                        >
                            {{ mode === 'encrypt' ? $t('encDecText.encrypt') : $t('encDecText.decrypt') }}
                        </v-btn>
                        <v-textarea
                            v-if="output"
                            v-model="output"
                            class="mt-4"
                            rows="4"
                            :label="$t('encDecText.output')"
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
                            {{ $t('encDecText.copy') }}
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
            content: t('encDecText.subtitle'),
            name: 'description',
        }
    ],
    title: t('encDecText.title'),
});

const cipher = ref('caesar');
const key = ref(3);
const mode = ref('encrypt');
const input = ref('');
const output = ref('');
const ciphers = [
    {
        title: 'Caesar',
        value: 'caesar',
    },
    {
        title: 'ROT13',
        value: 'rot13',
    },
];

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('encDecText.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('encDecText.copyFailed'), 'error');
    });
}

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
        } else {
            result += ch;
        }
    }
    output.value = result;
}
</script>

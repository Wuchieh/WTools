<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('pwd.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('pwd.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-slider
                            v-model="length"
                            class="mb-4"
                            :label="$t('pwd.length', { v: length })"
                            :max="128"
                            :min="8"
                            :step="1"
                            thumb-label
                        />
                        <v-switch
                            v-model="upper"
                            color="primary"
                            density="compact"
                            :label="$t('pwd.uppercase')"
                        />
                        <v-switch
                            v-model="lower"
                            color="primary"
                            density="compact"
                            :label="$t('pwd.lowercase')"
                        />
                        <v-switch
                            v-model="numbers"
                            color="primary"
                            density="compact"
                            :label="$t('pwd.numbers')"
                        />
                        <v-switch
                            v-model="symbols"
                            color="primary"
                            density="compact"
                            :label="$t('pwd.symbols')"
                        />

                        <v-btn
                            class="mt-4"
                            color="primary"
                            block
                            @click="generate"
                        >
                            {{ $t('pwd.generate') }}
                        </v-btn>

                        <v-card
                            v-if="password"
                            class="pa-3 mt-4"
                            color="primary"
                            variant="tonal"
                        >
                            <div class="align-center d-flex gap-2">
                                <code class="flex-grow-1 text-break text-h6">{{ password }}</code>
                                <v-btn
                                    icon="mdi-content-copy"
                                    size="small"
                                    variant="text"
                                    @click="copy(password)"
                                />
                            </div>
                        </v-card>

                        <v-progress-linear
                            v-if="strength !== null"
                            class="mt-3"
                            :color="strengthColor"
                            :model-value="strength * 25"
                            rounded
                        />
                        <div
                            v-if="strength !== null"
                            class="text-caption text-medium-emphasis mt-1"
                        >
                            {{ $t('pwd.strength') }}:
                            {{ [$t('pwd.weak'), $t('pwd.fair'), $t('pwd.good'), $t('pwd.strong')][strength] }}
                        </div>
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
            content: t('pwd.subtitle'),
            name: 'description',
        },
    ],
    title: t('pwd.title'),

    ogImage: '/og/password-generator.png',
    twitterCard: 'summary_large_image',
    twitterImage: '/og/password-generator.png'});

const length = ref(16);
const upper = ref(true);
const lower = ref(true);
const numbers = ref(true);
const symbols = ref(true);
const password = ref('');
const strength = ref<null | number>(null);

const strengthColor = computed(() => [
    '',
    'error',
    'warning',
    'success',
][strength.value ?? 0]);

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('pwd.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('pwd.copyFailed'), 'error');
    });
}

function generate() {
    let chars = '';
    if (upper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers.value) chars += '0123456789';
    if (symbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) {
        password.value = '';
        strength.value = null;
        return;
    }
    const arr = new Uint32Array(length.value);
    crypto.getRandomValues(arr);
    password.value = Array.from(arr).map((v) => chars[v % chars.length]).join('');
    // Estimate strength
    const poolSize = [
        upper.value,
        lower.value,
        numbers.value,
        symbols.value,
    ].filter(Boolean).length;
    strength.value = Math.min(3, Math.floor((poolSize * length.value) / 48));
}
</script>

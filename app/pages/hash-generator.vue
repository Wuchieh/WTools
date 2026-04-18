<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('hash.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('hash.subtitle') }}
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
                            class="mb-4"
                            rows="4"
                            :label="$t('hash.input')"
                            border
                        />

                        <div class="d-flex mb-4 flex-wrap gap-2">
                            <v-chip
                                v-for="a in algorithmsList"
                                :key="a"
                                :color="algorithms.includes(a) ? 'primary' : undefined"
                                :variant="algorithms.includes(a) ? 'flat' : 'outlined'"
                                @click="toggleAlg(a)"
                            >
                                {{ a.toUpperCase() }}
                            </v-chip>
                        </div>

                        <v-btn
                            color="primary"
                            :disabled="!input"
                            block
                            @click="generate"
                        >
                            {{ $t('hash.generate') }}
                        </v-btn>

                        <div
                            v-if="results.length"
                            class="mt-4"
                        >
                            <v-card
                                v-for="r in results"
                                :key="r.alg"
                                class="mb-2"
                                variant="outlined"
                            >
                                <v-card-text class="pb-2">
                                    <div class="text-caption text-medium-emphasis mb-1">
                                        {{ r.alg.toUpperCase() }}
                                    </div>
                                    <div class="align-center d-flex gap-2">
                                        <code class="flex-grow-1 text-break">{{ r.hash }}</code>
                                        <v-btn
                                            icon="mdi-content-copy"
                                            size="x-small"
                                            variant="text"
                                            @click="copyText(r.hash)"
                                        />
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
    description: t('hash.subtitle'),
    ogImage: '/og/hash-generator.png',

    title: t('hash.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/hash-generator.png',
});

const input = ref('');
const algorithms = ref(['SHA-256']);
const results = ref<{ alg: string; hash: string }[]>([]);
const algorithmsList = [
    'MD5',
    'SHA-1',
    'SHA-256',
    'SHA-384',
    'SHA-512',
];

function copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('hash.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('hash.copyFailed'), 'error');
    });
}

async function generate() {
    results.value = [];
    const data = new TextEncoder().encode(input.value);
    for (const alg of algorithms.value) {
        let hashHex: string;
        if (alg === 'MD5') {
            hashHex = md5(input.value);
        } else {
            const hashBuffer = await crypto.subtle.digest(alg, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        }
        results.value.push({
            alg,
            hash: hashHex,
        });
    }
}

// Pure JS MD5 — Web Crypto API does not support MD5
function md5(str: string): string {
    function rotl(x: number, n: number) {
        return ((x << n) | (x >>> (32 - n))) >>> 0;
    }

    function addUI32(a: number, b: number) {
        return (a + b) >>> 0;
    }

    function F(u: number, v: number, w: number) {
        return ((u & v) | (~u & w)) >>> 0;
    }

    function G(u: number, v: number, w: number) {
        return ((u & w) | (v & ~w)) >>> 0;
    }

    function H(u: number, v: number, w: number) {
        return (u ^ v ^ w) >>> 0;
    }

    function I(u: number, v: number, w: number) {
        return (v ^ (u | ~w)) >>> 0;
    }

    const msg = new TextEncoder().encode(str);
    const ml = (msg.length * 8) & 0xFFFFFFFF;

    // Pad to 64 bytes (512 bits)
    const padded = new Uint8Array(((ml + 64) & ~63) + 64);
    padded.set(msg);
    padded[msg.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 4, ml, true);

    // Initial state
    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;

    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) {
        K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0xFFFFFFFF) >>> 0;
    }

    const s = new Uint8Array([
        7,
        12,
        17,
        22,
        7,
        12,
        17,
        22,
        7,
        12,
        17,
        22,
        7,
        12,
        17,
        22,
        5,
        9,
        14,
        20,
        5,
        9,
        14,
        20,
        5,
        9,
        14,
        20,
        5,
        9,
        14,
        20,
        4,
        11,
        16,
        23,
        4,
        11,
        16,
        23,
        4,
        11,
        16,
        23,
        4,
        11,
        16,
        23,
        6,
        10,
        15,
        21,
        6,
        10,
        15,
        21,
        6,
        10,
        15,
        21,
        6,
        10,
        15,
        21,
    ]);

    for (let chunk = 0; chunk < padded.length; chunk += 64) {
        const M = new Uint32Array(16);
        for (let j = 0; j < 16; j++) M[j] = view.getUint32(chunk + j * 4, true);

        let A = a;
        let B = b;
        let C = c;
        let D = d;

        for (let i = 0; i < 64; i++) {
            let fi: number, g: number;
            if (i < 16) {
                fi = F(B, C, D);
                g = i;
            } else if (i < 32) {
                fi = G(B, C, D);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                fi = H(B, C, D);
                g = (3 * i + 5) % 16;
            } else {
                fi = I(B, C, D);
                g = (7 * i) % 16;
            }

            const temp = addUI32(addUI32(addUI32(A, fi), K[i]!), M[g]!);
            const rot = s[i]!;
            A = D;
            D = C;
            C = B;
            B = addUI32(B, rotl(temp, rot));
        }

        a = addUI32(a, A);
        b = addUI32(b, B);
        c = addUI32(c, C);
        d = addUI32(d, D);
    }

    const toHex8 = (n: number) => {
        const h = n.toString(16);
        return '00000000'.slice(h.length) + h;
    };

    return toHex8(a) + toHex8(b) + toHex8(c) + toHex8(d);
}

function toggleAlg(a: string) {
    const idx = algorithms.value.indexOf(a);
    if (idx >= 0) algorithms.value.splice(idx, 1);
    else algorithms.value.push(a);
    if (algorithms.value.length === 0) algorithms.value.push('SHA-256');
}
</script>

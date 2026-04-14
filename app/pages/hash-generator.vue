<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('hash.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('hash.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            :label="$t('hash.input')"
                            rows="4"
                            border
                            class="mb-4"
                        />

                        <v-row class="mb-4">
                            <v-col cols="12">
                                <v-chip-group v-model="algorithms" multiple selected-class="text-primary">
                                    <v-chip v-for="a in algorithmsList" :key="a" :value="a" filter>
                                        {{ a.toUpperCase() }}
                                    </v-chip>
                                </v-chip-group>
                            </v-col>
                        </v-row>

                        <v-btn color="primary" block :disabled="!input" @click="generate">
                            {{ $t('hash.generate') }}
                        </v-btn>

                        <div v-if="results.length" class="mt-4">
                            <v-card
                                v-for="r in results"
                                :key="r.alg"
                                variant="outlined"
                                class="mb-2"
                            >
                                <v-card-text class="pb-2">
                                    <div class="text-caption text-medium-emphasis mb-1">{{ r.alg.toUpperCase() }}</div>
                                    <div class="d-flex align-center gap-2">
                                        <code class="flex-grow-1 text-break">{{ r.hash }}</code>
                                        <v-btn
                                            icon="mdi-content-copy"
                                            size="x-small"
                                            variant="text"
                                            @click="copy(r.hash)"
                                        />
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({ meta: [{ content: t('hash.subtitle'), name: 'description' }], title: t('hash.title') });

const input = ref('');
const algorithms = ref(['sha256']);
const results = ref<{ alg: string; hash: string }[]>([]);
const algorithmsList = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];

async function generate() {
    results.value = [];
    const data = new TextEncoder().encode(input.value);
    for (const alg of algorithms.value) {
        const hashBuffer = await crypto.subtle.digest(alg.toUpperCase(), data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        results.value.push({ alg, hash: hashHex });
    }
}

function copy(text: string) {
    navigator.clipboard.writeText(text);
}
</script>

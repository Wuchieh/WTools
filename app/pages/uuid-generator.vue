<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('uuid.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('uuid.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="version"
                            :items="versions"
                            :label="$t('uuid.version')"
                            class="mb-4"
                        />

                        <v-btn color="primary" block @click="generate">
                            {{ $t('uuid.generate') }}
                        </v-btn>

                        <v-card
                            v-if="generated"
                            variant="outlined"
                            class="mt-4 pa-3"
                        >
                            <div class="d-flex align-center gap-2">
                                <code class="text-h6 flex-grow-1 text-break">{{ generated }}</code>
                                <v-btn icon="mdi-content-copy" size="small" variant="text" @click="copy(generated)" />
                            </div>
                        </v-card>

                        <v-btn
                            v-if="history.length"
                            color="warning"
                            variant="text"
                            class="mt-4"
                            @click="history = []"
                        >
                            {{ $t('uuid.clearHistory') }}
                        </v-btn>

                        <v-list v-if="history.length" class="mt-2" border>
                            <v-list-item
                                v-for="(u, i) in history"
                                :key="i"
                                density="compact"
                            >
                                <template #prepend>
                                    <v-icon icon="mdi-identifier" size="small" />
                                </template>
                                <v-list-item-title class="text-break font-monospace">{{ u }}</v-list-item-title>
                                <template #append>
                                    <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copy(u)" />
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({ meta: [{ content: t('uuid.subtitle'), name: 'description' }], title: t('uuid.title') });

const version = ref('v4');
const generated = ref('');
const history = ref<string[]>([]);
const versions = [
    { title: 'UUID v4 (Random)', value: 'v4' },
    { title: 'UUID v7 (Timestamp)', value: 'v7' },
];

function generate() {
    let uuid = '';
    if (version.value === 'v4') {
        uuid = crypto.randomUUID();
    } else {
        // UUID v7: timestamp-based
        const ts = Date.now();
        const tsl = ts.toString(16).padStart(12, '0');
        const rand = crypto.randomUUID().replace(/-/g, '').slice(-13);
        uuid = `${tsl.slice(0,8)}-${tsl.slice(8,12)}-7${rand.slice(0,3)}-${rand.slice(3,6)}-000000000000`.replace(/-/g, '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    }
    generated.value = uuid;
    if (!history.value.includes(uuid)) {
        history.value.unshift(uuid);
        if (history.value.length > 20) history.value.pop();
    }
}

function copy(text: string) {
    navigator.clipboard.writeText(text);
}
</script>

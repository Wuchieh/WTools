<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('uuid.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('uuid.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="version"
                            class="mb-4"
                            :items="versions"
                            :label="$t('uuid.version')"
                        />

                        <v-btn
                            color="primary"
                            block
                            @click="generate"
                        >
                            {{ $t('uuid.generate') }}
                        </v-btn>

                        <v-card
                            v-if="generated"
                            class="pa-3 mt-4"
                            variant="outlined"
                        >
                            <div class="align-center d-flex gap-2">
                                <code class="flex-grow-1 text-break text-h6">{{ generated }}</code>
                                <v-btn
                                    icon="mdi-content-copy"
                                    size="small"
                                    variant="text"
                                    @click="copy(generated)"
                                />
                            </div>
                        </v-card>

                        <v-btn
                            v-if="history.length"
                            class="mt-4"
                            color="warning"
                            variant="text"
                            @click="history = []"
                        >
                            {{ $t('uuid.clearHistory') }}
                        </v-btn>

                        <v-list
                            v-if="history.length"
                            class="mt-2"
                            border
                        >
                            <v-list-item
                                v-for="(u, i) in history"
                                :key="i"
                                density="compact"
                            >
                                <template #prepend>
                                    <v-icon
                                        icon="mdi-identifier"
                                        size="small"
                                    />
                                </template>
                                <v-list-item-title class="font-monospace text-break">
                                    {{ u }}
                                </v-list-item-title>
                                <template #append>
                                    <v-btn
                                        icon="mdi-content-copy"
                                        size="x-small"
                                        variant="text"
                                        @click="copy(u)"
                                    />
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
import { v7 as uuidv7 } from 'uuid';

const { t } = useI18n();

useHead({
    meta: [
        {
            content: t('uuid.subtitle'),
            name: 'description',
        },
    ],
    ogImage: '/og/uuid-generator.png',

    title: t('uuid.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/uuid-generator.png',
});

const version = ref('v4');
const generated = ref('');
const history = ref<string[]>([]);
const versions = [
    {
        title: 'UUID v4 (Random)',
        value: 'v4',
    },
    {
        title: 'UUID v7 (Timestamp)',
        value: 'v7',
    },
];

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('uuid.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('uuid.copyFailed'), 'error');
    });
}

function generate() {
    let uuid = '';
    if (version.value === 'v4') {
        uuid = crypto.randomUUID();
    } else {
        uuid = uuidv7();
    }
    generated.value = uuid;
    if (!history.value.includes(uuid)) {
        history.value.unshift(uuid);
        if (history.value.length > 20) history.value.pop();
    }
}
</script>

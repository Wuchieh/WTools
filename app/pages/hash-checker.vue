<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('hashcheck.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('hashcheck.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input
                            v-model="files"
                            class="mb-4"
                            accept=".*"
                            :label="$t('hashcheck.selectFiles')"
                            border
                            multiple
                            show-size
                        />
                        <v-btn-toggle
                            v-model="algorithm"
                            class="mb-4"
                        >
                            <v-chip
                                v-for="a in algs"
                                :key="a"
                                :value="a"
                                filter
                            >
                                {{ a.toUpperCase() }}
                            </v-chip>
                        </v-btn-toggle>
                        <v-btn
                            color="primary"
                            :disabled="!files?.length"
                            :loading="loading"
                            block
                            @click="compute"
                        >
                            {{ $t('hashcheck.compute') }}
                        </v-btn>
                        <v-list
                            v-if="results.length"
                            class="mt-4"
                            border
                        >
                            <v-list-item
                                v-for="r in results"
                                :key="r.name"
                            >
                                <v-list-item-title class="font-weight-bold">
                                    {{ r.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-monospace text-break">
                                    {{ r.hash }}
                                </v-list-item-subtitle>
                                <template #append>
                                    <v-btn
                                        icon="mdi-content-copy"
                                        size="x-small"
                                        variant="text"
                                        @click="copy(r.hash)"
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
const { t } = useI18n();
useHead({
    meta: [
        {
            content: t('hashcheck.subtitle'),
            name: 'description',
        },
    ],
    title: t('hashcheck.title'),
});

const files = ref<File[] | null>(null);
const algorithm = ref('sha256');
const algs = [
    'md5',
    'sha1',
    'sha256',
    'sha384',
    'sha512',
];
const loading = ref(false);
const results = ref<{ hash: string; name: string }[]>([]);

async function compute() {
    if (!files.value) return;
    loading.value = true;
    results.value = [];
    for (const f of files.value) {
        const data = await f.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest(algorithm.value.toUpperCase(), data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        results.value.push({
            hash: hashHex,
            name: f.name,
        });
    }
    loading.value = false;
}

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
    });
}
</script>

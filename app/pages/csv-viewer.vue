<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('csvViewer.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('csvViewer.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="10"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input
                            v-model="file"
                            class="mb-4"
                            accept=".csv,.tsv,.txt"
                            prepend-icon="mdi-file"
                            :label="$t('csvViewer.selectFile')"
                            border
                            show-size
                            @update:model-value="loadFile"
                        />
                        <v-textarea
                            v-if="!file"
                            v-model="text"
                            class="font-monospace mb-4"
                            rows="10"
                            :label="$t('csvViewer.pasteData')"
                            border
                        />
                        <v-btn-toggle
                            v-if="parsed.length"
                            class="mb-4"
                        >
                            <v-btn
                                size="small"
                                @click="toJson"
                            >
                                {{ $t('csvViewer.toJson') }}
                            </v-btn>
                            <v-btn
                                size="small"
                                @click="toTsv"
                            >
                                {{ $t('csvViewer.toTsv') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-data-table
                            v-if="parsed.length"
                            class="font-monospace"
                            density="compact"
                            :headers="headers"
                            :items="parsed"
                        />
                        <v-alert
                            v-if="error"
                            class="mt-4"
                            type="error"
                        >
                            {{ error }}
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
    description: t('csvViewer.subtitle'),
    ogImage: '/og/csv-viewer.png',

    title: t('csvViewer.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/csv-viewer.png',
});

const file = ref<File[] | null>(null);
const text = ref('');
const error = ref('');
const parsed = ref<Record<string, string>[]>([]);
const headers = computed(() => parsed.value.length
    ? Object.keys(parsed.value[parsed.value.length - 1] ?? {}).map((k) => ({
        key: k,
        title: k,
    }))
    : []);

function downloadBlob(blob: Blob, name: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

function loadFile(files: File | File[] | null) {
    error.value = '';
    parsed.value = [];
    if (!files) return;
    const fileArray = Array.isArray(files) ? files : [files];
    if (!fileArray.length) return;
    const firstFile = fileArray[0];
    if (!firstFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target?.result;
        if (!file) return;
        parseCsv(file as string);
    };
    reader.readAsText(firstFile);
}

function parseCsv(content: string) {
    try {
        const lines = content.trim().split('\n');
        const firstLine = lines[0];
        if (!firstLine) return;
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        const heads = firstLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
        parsed.value = lines.slice(1).filter(Boolean).map((line) => {
            const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
            return heads.reduce((acc, h, i) => {
                acc[h] = values[i] ?? '';
                return acc;
            }, {} as Record<string, string>);
        });
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Parse error';
    }
}

function toJson() {
    const blob = new Blob([JSON.stringify(parsed.value, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'data.json');
}

function toTsv() {
    if (!parsed.value.length) return;
    const firstRow = parsed.value[0];
    if (!firstRow) return;
    const heads = Object.keys(firstRow).join('\t');
    const rows = parsed.value.map((r) => Object.values(r).join('\t')).join('\n');
    const blob = new Blob([`${heads}\n${rows}`], { type: 'text/tab-separated-values' });
    downloadBlob(blob, 'data.tsv');
}
</script>

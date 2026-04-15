<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('csv.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('csv.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="10">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input v-model="file" :label="$t('csv.selectFile')" accept=".csv,.tsv,.txt" prepend-icon="mdi-file" show-size border class="mb-4" @update:model-value="loadFile" />
                        <v-textarea v-if="!file" v-model="text" :label="$t('csv.pasteData')" rows="10" border class="font-monospace mb-4" />
                        <v-btn-toggle v-if="parsed.length" class="mb-4">
                            <v-btn size="small" @click="toJson">{{ $t('csv.toJson') }}</v-btn>
                            <v-btn size="small" @click="toTsv">{{ $t('csv.toTsv') }}</v-btn>
                        </v-btn-toggle>
                        <v-data-table v-if="parsed.length" :headers="headers" :items="parsed" density="compact" class="font-monospace" />
                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('csv.subtitle'), name: 'description' }], title: t('csv.title') });

const file = ref<File[] | null>(null);
const text = ref('');
const error = ref('');
const parsed = ref<Record<string, string>[]>([]);
const headers = computed(() => parsed.value.length ? Object.keys(parsed.value[0]).map((k) => ({ title: k, key: k })) : []);

function loadFile(files: File[] | null) {
    error.value = '';
    parsed.value = [];
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => parseCsv(e.target?.result as string);
    reader.readAsText(files[0]);
}

function parseCsv(content: string) {
    try {
        const lines = content.trim().split('\n');
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const heads = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
        parsed.value = lines.slice(1).filter(Boolean).map((line) => {
            const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
            return heads.reduce((acc, h, i) => { acc[h] = values[i] ?? ''; return acc; }, {} as Record<string, string>);
        });
    } catch (e: any) { error.value = e.message; }
}

function toJson() {
    const blob = new Blob([JSON.stringify(parsed.value, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'data.json');
}

function toTsv() {
    if (!parsed.value.length) return;
    const heads = Object.keys(parsed.value[0]).join('\t');
    const rows = parsed.value.map((r) => Object.values(r).join('\t')).join('\n');
    const blob = new Blob([heads + '\n' + rows], { type: 'text/tab-separated-values' });
    downloadBlob(blob, 'data.tsv');
}

function downloadBlob(blob: Blob, name: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
}
</script>

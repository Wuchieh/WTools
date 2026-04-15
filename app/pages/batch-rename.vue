<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('batchrename.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('batchrename.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="10">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input v-model="files" :label="$t('batchrename.selectFiles')" multiple prepend-icon="mdi-file" show-size border class="mb-4" />
                        <v-text-field v-model="pattern" :label="$t('batchrename.pattern')" placeholder="{n}_{date}" border class="mb-2" />
                        <v-select v-model="caseStyle" :items="caseOptions" :label="$t('batchrename.caseStyle')" density="compact" class="mb-4" />
                        <v-btn color="primary" block :disabled="!files?.length" @click="rename">{{ $t('batchrename.rename') }}</v-btn>
                        <v-btn v-if="results.length" color="success" block class="mt-2" @click="downloadZip">{{ $t('batchrename.downloadZip') }}</v-btn>
                        <v-list v-if="results.length" class="mt-4" border>
                            <v-list-item v-for="(r, i) in results" :key="i">
                                <template #prepend><v-icon icon="mdi-file" /></template>
                                <v-list-item-title class="font-monospace">{{ r.old }}</v-list-item-title>
                                <template #append>
                                    <v-icon icon="mdi-arrow-right" class="mx-2" />
                                    <v-list-item-title class="font-monospace text-primary">{{ r.new }}</v-list-item-title>
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
import JSZip from 'jszip';
import { v7 as uuidv7 } from 'uuid';

const { t } = useI18n();
useHead({ meta: [{ content: t('batchrename.subtitle'), name: 'description' }], title: t('batchrename.title') });

const files = ref<File[] | null>(null);
const pattern = ref('{name}');
const caseStyle = ref('keep');
const results = ref<{ old: string; new: string }[]>([]);
const caseOptions = [
    { title: 'Keep Original', value: 'keep' },
    { title: 'lowercase', value: 'lower' },
    { title: 'UPPERCASE', value: 'upper' },
    { title: 'Title Case', value: 'title' },
];

function rename() {
    if (!files.value) return;
    results.value = [];
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    files.value.forEach((f, i) => {
        let newName = pattern.value
            .replace('{name}', f.name.replace(/\.[^/.]+$/, ''))
            .replace('{n}', String(i + 1).padStart(3, '0'))
            .replace('{date}', date);
        let ext = f.name.match(/\.[^/.]+$/)?.[0] ?? '';
        if (caseStyle.value === 'lower') newName = newName.toLowerCase() + ext.toLowerCase();
        else if (caseStyle.value === 'upper') newName = newName.toUpperCase() + ext.toUpperCase();
        else if (caseStyle.value === 'title') newName = newName.replace(/\b\w/g, (c) => c.toUpperCase()) + ext;
        else newName += ext;
        results.value.push({ old: f.name, new: newName });
    });
}

async function downloadZip() {
    if (!files.value || !results.value.length) return;
    const zip = new JSZip();
    const fileMap = new Map(files.value.map(f => [f.name, f]));
    for (const r of results.value) {
        const originalFile = fileMap.get(r.old);
        if (originalFile) {
            const blob = await originalFile.arrayBuffer();
            zip.file(r.new, blob);
        }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${uuidv7()}_renamed.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
}
</script>

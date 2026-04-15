<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('batchrename.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('batchrename.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="10"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-file-input
                            v-model="files"
                            class="mb-4"
                            prepend-icon="mdi-file"
                            :label="$t('batchrename.selectFiles')"
                            border
                            multiple
                            show-size
                        />
                        <v-text-field
                            v-model="pattern"
                            class="mb-2"
                            placeholder="{n}_{date}"
                            :label="$t('batchrename.pattern')"
                            border
                        />
                        <v-select
                            v-model="caseStyle"
                            class="mb-4"
                            density="compact"
                            :items="caseOptions"
                            :label="$t('batchrename.caseStyle')"
                        />
                        <v-btn
                            color="primary"
                            :disabled="!files?.length"
                            block
                            @click="rename"
                        >
                            {{ $t('batchrename.rename') }}
                        </v-btn>
                        <v-btn
                            v-if="results.length"
                            class="mt-2"
                            color="success"
                            block
                            @click="downloadZip"
                        >
                            {{ $t('batchrename.downloadZip') }}
                        </v-btn>
                        <v-list
                            v-if="results.length"
                            class="mt-4"
                            border
                        >
                            <v-list-item
                                v-for="(r, i) in results"
                                :key="i"
                            >
                                <template #prepend>
                                    <v-icon icon="mdi-file" />
                                </template>
                                <v-list-item-title class="font-monospace">
                                    {{ r.old }}
                                </v-list-item-title>
                                <template #append>
                                    <v-icon
                                        class="mx-2"
                                        icon="mdi-arrow-right"
                                    />
                                    <v-list-item-title class="font-monospace text-primary">
                                        {{ r.new }}
                                    </v-list-item-title>
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
useHead({
    meta: [
        {
            content: t('batchrename.subtitle'),
            name: 'description',
        },
    ],
    title: t('batchrename.title'),
});

const files = ref<File[] | null>(null);
const pattern = ref('{name}');
const caseStyle = ref('keep');
const results = ref<{ new: string; old: string }[]>([]);
const caseOptions = [
    {
        title: 'Keep Original',
        value: 'keep',
    },
    {
        title: 'lowercase',
        value: 'lower',
    },
    {
        title: 'UPPERCASE',
        value: 'upper',
    },
    {
        title: 'Title Case',
        value: 'title',
    },
];

async function downloadZip() {
    if (!files.value || !results.value.length) return;
    const zip = new JSZip();
    const fileMap = new Map(files.value.map((f) => [
        f.name,
        f,
    ]));
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

function rename() {
    if (!files.value) return;
    results.value = [];
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    files.value.forEach((f, i) => {
        let newName = pattern.value
            .replace('{name}', f.name.replace(/\.[^/.]+$/, ''))
            .replace('{n}', String(i + 1).padStart(3, '0'))
            .replace('{date}', date);
        const ext = f.name.match(/\.[^/.]+$/)?.[0] ?? '';
        if (caseStyle.value === 'lower') newName = newName.toLowerCase() + ext.toLowerCase();
        else if (caseStyle.value === 'upper') newName = newName.toUpperCase() + ext.toUpperCase();
        else if (caseStyle.value === 'title') newName = newName.replace(/\b\w/g, (c) => c.toUpperCase()) + ext;
        else newName += ext;
        results.value.push({
            new: newName,
            old: f.name,
        });
    });
}
</script>

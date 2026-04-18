<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('jsonYaml.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('jsonYaml.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle
                            v-model="mode"
                            class="mb-4"
                            color="primary"
                        >
                            <v-btn value="json2yaml">
                                {{ $t('jsonYaml.json2yaml') }}
                            </v-btn>
                            <v-btn value="yaml2json">
                                {{ $t('jsonYaml.yaml2json') }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-textarea
                            v-model="input"
                            class="font-monospace mb-4"
                            rows="10"
                            :label="mode === 'json2yaml' ? 'JSON' : 'YAML'"
                            border
                        />
                        <v-btn
                            color="primary"
                            :disabled="!input"
                            block
                            @click="convert"
                        >
                            {{ $t('jsonYaml.convert') }}
                        </v-btn>
                        <v-textarea
                            v-if="output"
                            v-model="output"
                            class="font-monospace mt-4"
                            rows="10"
                            :label="mode === 'json2yaml' ? 'YAML' : 'JSON'"
                            border
                            readonly
                        />
                        <v-btn
                            v-if="output"
                            class="mt-2"
                            color="success"
                            block
                            @click="copy"
                        >
                            {{ $t('jsonYaml.copy') }}
                        </v-btn>
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
useHead({
    meta: [
        {
            content: t('jsonYaml.subtitle'),
            name: 'description',
        },
    ],
    ogImage: '/og/json-yaml.png',

    title: t('jsonYaml.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/json-yaml.png',
});

const mode = ref('json2yaml');
const input = ref('');
const output = ref('');
const error = ref('');

function convert() {
    error.value = '';
    output.value = '';
    try {
        if (mode.value === 'json2yaml') {
            const obj = JSON.parse(input.value);
            output.value = jsonToYaml(obj);
        } else {
            output.value = yamlToJson(input.value);
        }
    } catch (e: any) {
        error.value = e.message;
    }
}

function copy() {
    navigator.clipboard.writeText(output.value).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('jsonYaml.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('jsonYaml.copyFailed'), 'error');
    });
}

function jsonToYaml(obj: unknown, indent = 0): string {
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            return obj.map((v) => jsonToYaml(v, indent)).map((v) => `- ${v}`).join('\n');
        }
        return Object.entries(obj).map(([k, v]) => {
            const prefix = `${'  '.repeat(indent) + k}:`;
            if (typeof v === 'object' && v !== null) return `${prefix}\n${jsonToYaml(v, indent + 1)}`;
            return `${prefix} ${jsonToYaml(v, indent)}`;
        }).join('\n');
    }
    return String(obj);
}

function yamlToJson(yaml: string): string {
    const lines = yaml.split('\n');
    const _result: Record<string, unknown> = {};

    function parse(lines: string[], start = 0): Record<string, unknown> | unknown[] {
        const obj: Record<string, unknown> = {};
        let i = start;
        while (i < lines.length) {
            const line = lines[i];
            if (!line || !line.trim() || line.match(/^\s*#/)) {
                i++;
                continue;
            }
            if (line.match(/^\s*-\s*(.+)/)) {
                const items: unknown[] = [];
                while (i < lines.length && lines[i]?.match(/^\s*-\s*(.+)/)) {
                    const match = lines[i]?.match(/^\s*-\s*(.+)/);
                    if (match) {
                        const val = (match[1] ?? '').trim();
                        if (!val) {
                            i++;
                            continue;
                        }
                        if (val.includes(':')) {
                            const subObj: Record<string, unknown> = {};
                            const parts = val.split(':');
                            const k = parts[0]?.trim() ?? '';
                            subObj[k] = parts.slice(1).join(':').trim();
                            items.push(subObj);
                        } else {
                            items.push(val);
                        }
                    }
                    i++;
                }
                return items;
            }
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                const key = line.slice(0, colonIdx).trim();
                const rest = line.slice(colonIdx + 1).trim();
                if (!rest) {
                    i++;
                    const sub = parse(lines, i);
                    obj[key] = sub;
                } else {
                    obj[key] = rest;
                    i++;
                }
            } else {
                i++;
            }
        }
        return obj;
    }

    return JSON.stringify(parse(lines), null, 2);
}
</script>

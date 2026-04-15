<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('jsonyaml.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('jsonyaml.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-btn-toggle v-model="mode" class="mb-4" color="primary">
                            <v-btn value="json2yaml">{{ $t('jsonyaml.json2yaml') }}</v-btn>
                            <v-btn value="yaml2json">{{ $t('jsonyaml.yaml2json') }}</v-btn>
                        </v-btn-toggle>
                        <v-textarea v-model="input" :label="mode === 'json2yaml' ? 'JSON' : 'YAML'" rows="10" border class="font-monospace mb-4" />
                        <v-btn color="primary" block :disabled="!input" @click="convert">{{ $t('jsonyaml.convert') }}</v-btn>
                        <v-textarea v-if="output" v-model="output" :label="mode === 'json2yaml' ? 'YAML' : 'JSON'" rows="10" border readonly class="font-monospace mt-4" />
                        <v-btn v-if="output" color="success" block class="mt-2" @click="copy">{{ $t('jsonyaml.copy') }}</v-btn>
                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('jsonyaml.subtitle'), name: 'description' }], title: t('jsonyaml.title') });

const mode = ref('json2yaml');
const input = ref('');
const output = ref('');
const error = ref('');

function jsonToYaml(obj: unknown, indent = 0): string {
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            return obj.map((v) => jsonToYaml(v, indent)).map((v) => `- ${v}`).join('\n');
        }
        return Object.entries(obj).map(([k, v]) => {
            const prefix = '  '.repeat(indent) + k + ':';
            if (typeof v === 'object' && v !== null) return `${prefix}\n${jsonToYaml(v, indent + 1)}`;
            return `${prefix} ${jsonToYaml(v, indent)}`;
        }).join('\n');
    }
    return String(obj);
}

function yamlToJson(yaml: string): string {
    const lines = yaml.split('\n');
    const result: Record<string, unknown> = {};
    function parse(lines: string[], start = 0): Record<string, unknown> {
        const obj: Record<string, unknown> = {};
        let i = start;
        while (i < lines.length) {
            const line = lines[i];
            if (!line.trim() || line.match(/^\s*#/)) { i++; continue; }
            if (line.match(/^\s*-\s*(.+)/)) {
                const items: unknown[] = [];
                while (i < lines.length && lines[i].match(/^\s*-\s*(.+)/)) {
                    const match = lines[i].match(/^\s*-\s*(.+)/);
                    if (match) {
                        const val = match[1].trim();
                        if (val.includes(':')) {
                            const subObj: Record<string, unknown> = {};
                            const [k, ...vParts] = val.split(':');
                            subObj[k.trim()] = vParts.join(':').trim();
                            items.push(subObj);
                        } else { items.push(val); }
                    }
                    i++;
                }
                return items;
            }
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                const key = line.slice(0, colonIdx).trim();
                const rest = line.slice(colonIdx + 1).trim();
                if (!rest) { i++; const sub = parse(lines, i); obj[key] = sub; }
                else { obj[key] = rest; i++; }
            } else { i++; }
        }
        return obj;
    }
    return JSON.stringify(parse(lines), null, 2);
}

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
    } catch (e: any) { error.value = e.message; }
}

function copy() { navigator.clipboard.writeText(output.value); }
</script>

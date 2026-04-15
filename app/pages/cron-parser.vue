<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('cron.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('cron.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field v-model="expression" :label="$t('cron.expression')" placeholder="* * * * *" border class="mb-4 font-monospace" />
                        <v-btn color="primary" block :disabled="!expression" @click="parse">
                            {{ $t('cron.parse') }}
                        </v-btn>
                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                        <v-table v-if="result" class="mt-4" density="compact">
                            <tbody>
                                <tr v-for="(v, k) in result" :key="k">
                                    <td class="font-weight-bold" style="width:100px">{{ k }}</td>
                                    <td class="font-monospace">{{ v }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                        <div v-if="nextRuns.length" class="mt-4">
                            <div class="text-caption text-medium-emphasis mb-2">{{ $t('cron.nextRuns') }}</div>
                            <v-chip v-for="(r, i) in nextRuns" :key="i" class="mr-2 mb-2" size="small">{{ r }}</v-chip>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('cron.subtitle'), name: 'description' }], title: t('cron.title') });

const expression = ref('');
const error = ref('');
const result = ref<Record<string, string> | null>(null);
const nextRuns = ref<string[]>([]);

function parseField(field: string, min: number, max: number): number[] {
    const values: number[] = [];
    if (field === '*') {
        for (let i = min; i <= max; i++) values.push(i);
        return values;
    }
    const parts = field.split(',');
    for (const part of parts) {
        if (part.includes('/')) {
            const [range, step] = part.split('/');
            const stepNum = parseInt(step, 10);
            let start = min, end = max;
            if (range !== '*') {
                if (range.includes('-')) {
                    [start, end] = range.split('-').map(Number);
                } else {
                    start = parseInt(range, 10);
                }
            }
            for (let i = start; i <= end; i += stepNum) values.push(i);
        } else if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) values.push(i);
        } else {
            values.push(parseInt(part, 10));
        }
    }
    return [...new Set(values)].sort((a, b) => a - b);
}

function getNextRuns(expr: string, count = 5): string[] {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return [];

    const [minField, hourField, domField, monthField, dowField] = parts;
    const runs: string[] = [];
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);

    const monthVals = parseField(monthField, 1, 12);
    const domVals = parseField(domField, 1, 31);
    const dowVals = parseField(dowField, 0, 6);
    const hourVals = parseField(hourField, 0, 23);
    const minVals = parseField(minField, 0, 59);

    let attempts = 0;
    while (runs.length < count && attempts < 100000) {
        attempts++;
        const m = d.getMonth() + 1;
        const dom = d.getDate();
        const dow = d.getDay();
        const h = d.getHours();
        const mi = d.getMinutes();

        if (monthVals.includes(m)
            && domVals.includes(dom)
            && dowVals.includes(dow)
            && hourVals.includes(h)
            && minVals.includes(mi)) {
            runs.push(d.toLocaleString());
            d.setMinutes(d.getMinutes() + 1);
        } else {
            // Advance to next minute
            d.setMinutes(d.getMinutes() + 1);
        }
    }
    return runs;
}

function parse() {
    error.value = '';
    result.value = null;
    nextRuns.value = [];
    const parts = expression.value.trim().split(/\s+/);
    if (parts.length < 5) { error.value = 'Invalid cron expression (need 5 fields)'; return; }
    const [min, hour, dom, month, dow] = parts;
    result.value = { minute: min, hour, 'day-of-month': dom, month, 'day-of-week': dow };
    nextRuns.value = getNextRuns(expression.value, 5);
}
</script>

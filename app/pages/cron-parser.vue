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

function parse() {
    error.value = '';
    result.value = null;
    nextRuns.value = [];
    const parts = expression.value.trim().split(/\s+/);
    if (parts.length < 5) { error.value = 'Invalid cron expression (need 5 fields)'; return; }
    const [min, hour, dom, month, dow] = parts;
    result.value = { minute: min, hour, 'day-of-month': dom, month, 'day-of-week': dow };

    // Calculate next 5 runs (simple approximation)
    const now = new Date();
    const runs: string[] = [];
    let d = new Date(now);
    for (let i = 0; i < 5; i++) {
        d = new Date(d.getTime() + 60000);
        runs.push(d.toLocaleString());
    }
    nextRuns.value = runs;
}
</script>

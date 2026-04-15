<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('textDiff.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('textDiff.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="10"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-row>
                            <v-col cols="6">
                                <v-textarea
                                    v-model="text1"
                                    class="font-monospace"
                                    rows="12"
                                    :label="$t('textDiff.original')"
                                    border
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-textarea
                                    v-model="text2"
                                    class="font-monospace"
                                    rows="12"
                                    :label="$t('textDiff.modified')"
                                    border
                                />
                            </v-col>
                        </v-row>
                        <v-btn
                            color="primary"
                            :disabled="!text1 || !text2"
                            block
                            @click="compare"
                        >
                            {{ $t('textDiff.compare') }}
                        </v-btn>
                        <div
                            v-if="diffLines.length"
                            class="mt-4"
                        >
                            <div
                                v-for="(line, i) in diffLines"
                                :key="i"
                                class="font-monospace pa-1 text-body-2"
                                :class="line.type === 'add' ? 'bg-green-lighten-5'
                                    : line.type === 'remove' ? 'bg-red-lighten-5' : ''"
                            >
                                <span class="text-caption mr-2">
                                    {{ line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ' }}
                                </span>
                                {{ line.text }}
                            </div>
                        </div>
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
            content: t('textDiff.subtitle'),
            name: 'description',
        }
    ],
    title: t('textDiff.title'),
});

const text1 = ref('');
const text2 = ref('');
const diffLines = ref<{ text: string; type: 'add' | 'remove' | 'same' }[]>([]);

function compare() {
    const lines1 = text1.value.split('\n');
    const lines2 = text2.value.split('\n');
    const dp = lcs(lines1, lines2);
    diffLines.value = [];
    let i = lines1.length;
    let j = lines2.length;
    const ops: { text: string; type: 'add' | 'remove' | 'same' }[] = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
            const line1 = lines1[i - 1];
            const line2 = lines2[j - 1];
            if (line1 !== undefined && line2 !== undefined && line1 === line2) {
                ops.unshift({
                    text: line1,
                    type: 'same',
                });
                i -= 1;
                j -= 1;
                continue;
            }
        }
        if (j > 0 && (i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))) {
            const text = lines2[j - 1] ?? '';
            ops.unshift({
                text,
                type: 'add',
            });
            j--;
        } else if (i > 0) {
            const text = lines1[i - 1] ?? '';
            ops.unshift({
                text,
                type: 'remove',
            });
            i--;
        } else {
            break;
        }
    }
    diffLines.value = ops;
}

function lcs(a: string[], b: string[]): number[][] {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from<number>({ length: n + 1 }).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const prevDiag = dp[i - 1]?.[j - 1] ?? 0;
            const prevLeft = dp[i - 1]?.[j] ?? 0;
            const prevTop = dp[i]?.[j - 1] ?? 0;
            const aVal = a[i - 1];
            const bVal = b[j - 1];
            if (aVal !== undefined && bVal !== undefined && aVal === bVal) {
                dp[i]![j] = prevDiag + 1;
            } else {
                dp[i]![j] = Math.max(prevLeft, prevTop);
            }
        }
    }
    return dp;
}
</script>

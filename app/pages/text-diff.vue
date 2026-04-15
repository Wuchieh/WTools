<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('diff.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('diff.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="10">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-row>
                            <v-col cols="6">
                                <v-textarea v-model="text1" :label="$t('diff.original')" rows="12" border class="font-monospace" />
                            </v-col>
                            <v-col cols="6">
                                <v-textarea v-model="text2" :label="$t('diff.modified')" rows="12" border class="font-monospace" />
                            </v-col>
                        </v-row>
                        <v-btn color="primary" block :disabled="!text1 || !text2" @click="compare">{{ $t('diff.compare') }}</v-btn>
                        <div v-if="diffLines.length" class="mt-4">
                            <div v-for="(line, i) in diffLines" :key="i" class="font-monospace pa-1 text-body-2" :class="line.type === 'add' ? 'bg-green-lighten-5' : line.type === 'remove' ? 'bg-red-lighten-5' : ''">
                                <span class="mr-2 text-caption">{{ line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ' }}</span>{{ line.text }}
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
useHead({ meta: [{ content: t('diff.subtitle'), name: 'description' }], title: t('diff.title') });

const text1 = ref('');
const text2 = ref('');
const diffLines = ref<{ type: 'add' | 'remove' | 'same'; text: string }[]>([]);

function compare() {
    const lines1 = text1.value.split('\n');
    const lines2 = text2.value.split('\n');
    const result: typeof diffLines.value = [];
    const maxLen = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLen; i++) {
        if (lines1[i] === undefined) { result.push({ type: 'add', text: lines2[i] }); }
        else if (lines2[i] === undefined) { result.push({ type: 'remove', text: lines1[i] }); }
        else if (lines1[i] !== lines2[i]) {
            result.push({ type: 'remove', text: lines1[i] });
            result.push({ type: 'add', text: lines2[i] });
        } else { result.push({ type: 'same', text: lines1[i] }); }
    }
    diffLines.value = result;
}
</script>

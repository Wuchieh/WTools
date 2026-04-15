<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('percent.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('percent.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="6">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select v-model="mode" :items="modes" :label="$t('percent.mode')" class="mb-4" />
                        <v-text-field v-model.number="a" :label="labelA" type="number" border class="mb-4" />
                        <v-text-field v-if="mode !== 'whatIsXOfY'" v-model.number="b" :label="labelB" type="number" border class="mb-4" />
                        <v-card v-if="result !== null" variant="tonal" color="primary" class="pa-4 text-center">
                            <div class="text-h5 font-weight-bold">{{ result }}{{ mode === 'whatPercentOfXY' ? '%' : '' }}</div>
                            <div class="text-caption mt-1">{{ description }}</div>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('percent.subtitle'), name: 'description' }], title: t('percent.title') });

const mode = ref('whatIsXOfY');
const a = ref(0);
const b = ref(0);
const modes = [
    { title: 'X is what % of Y?', value: 'whatPercentOfXY' },
    { title: 'What is X% of Y?', value: 'whatIsXOfY' },
    { title: 'X is Y% of what?', value: 'xIsYOfZ' },
];
const labelA = computed(() => mode.value === 'whatIsXOfY' ? '%' : 'X');
const labelB = computed(() => mode.value === 'whatPercentOfXY' ? 'Y' : 'Y');

const result = computed<number | null>(() => {
    if (mode.value === 'whatPercentOfXY') {
        if (!b.value) return null;
        return Math.round((a.value / b.value) * 100 * 100) / 100;
    } else if (mode.value === 'whatIsXOfY') {
        return Math.round(a.value * b.value / 100 * 100) / 100;
    } else {
        if (!a.value) return null;
        return Math.round(b.value * 100 / a.value * 100) / 100;
    }
});

const description = computed(() => {
    if (mode.value === 'whatPercentOfXY') return `${a.value} / ${b.value} × 100`;
    if (mode.value === 'whatIsXOfY') return `${a.value}% × ${b.value}`;
    return `${b.value} / ${a.value} × 100`;
});
</script>

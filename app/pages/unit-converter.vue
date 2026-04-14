<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('unit.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('unit.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-select v-model="category" :items="categories" :label="$t('unit.category')" class="mb-4" />
                        <v-row>
                            <v-col cols="5">
                                <v-text-field v-model.number="fromValue" type="number" :label="$t('unit.from')" density="compact" />
                                <v-select v-model="fromUnit" :items="currentUnits" :label="$t('unit.fromUnit')" density="compact" />
                            </v-col>
                            <v-col cols="2" class="d-flex align-center justify-center">
                                <v-btn icon="mdi-swap-horizontal" @click="swap" />
                            </v-col>
                            <v-col cols="5">
                                <v-text-field :model-value="toValue.toFixed(6).replace(/\.?0+$/, '')" :label="$t('unit.to')" readonly density="compact" />
                                <v-select v-model="toUnit" :items="currentUnits" :label="$t('unit.toUnit')" density="compact" />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('unit.subtitle'), name: 'description' }], title: t('unit.title') });

const category = ref('length');
const fromValue = ref(1);
const fromUnit = ref('m');
const toUnit = ref('cm');

const categories = [
    { title: 'Length', value: 'length' },
    { title: 'Weight', value: 'weight' },
    { title: 'Temperature', value: 'temperature' },
    { title: 'Data', value: 'data' },
];

const conversionFactors: Record<string, Record<string, number>> = {
    length: { m: 1, cm: 100, mm: 1000, km: 0.001, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
    weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
    data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
};

const currentUnits = computed(() => {
    return Object.keys(conversionFactors[category.value] || {}).map((k) => ({ title: k, value: k }));
});

const toValue = computed(() => {
    if (!conversionFactors[category.value]) return fromValue.value;
    const factor = conversionFactors[category.value];
    return (fromValue.value / (factor[fromUnit.value] ?? 1)) * (factor[toUnit.value] ?? 1);
});

function swap() {
    const tmp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmp;
}
</script>

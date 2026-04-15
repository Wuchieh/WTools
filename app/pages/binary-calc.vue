<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('binary.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('binary.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="6"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field
                            v-model="input"
                            class="font-monospace mb-4"
                            :label="$t('binary.input')"
                            border
                        />
                        <v-btn-toggle
                            v-model="fromBase"
                            class="mb-4"
                        >
                            <v-chip
                                v-for="b in bases"
                                :key="b.value"
                                :value="b.value"
                                filter
                            >
                                {{ b.label }}
                            </v-chip>
                        </v-btn-toggle>
                        <v-card
                            class="pa-4"
                            variant="tonal"
                        >
                            <div class="text-caption text-medium-emphasis mb-2">
                                Decimal
                            </div>
                            <div class="font-monospace text-h6 mb-3">
                                {{ decimal }}
                            </div>
                            <div class="text-caption text-medium-emphasis mb-2">
                                Binary
                            </div>
                            <div class="font-monospace text-h6 mb-3">
                                {{ binary }}
                            </div>
                            <div class="text-caption text-medium-emphasis mb-2">
                                Hexadecimal
                            </div>
                            <div class="font-monospace text-h6">
                                {{ hex }}
                            </div>
                        </v-card>
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
            content: t('binary.subtitle'),
            name: 'description',
        },
    ],
    title: t('binary.title'),
});

const input = ref('255');
const fromBase = ref(10);
const bases = [
    {
        label: 'Dec',
        value: 10,
    },
    {
        label: 'Bin',
        value: 2,
    },
    {
        label: 'Hex',
        value: 16,
    },
];

const decimal = computed(() => {
    try {
        return Number.parseInt(String(input.value), fromBase.value).toString(10);
    } catch {
        return '—';
    }
});

const binary = computed(() => {
    try {
        return Number.parseInt(String(input.value), fromBase.value).toString(2);
    } catch {
        return '—';
    }
});

const hex = computed(() => {
    try {
        return Number.parseInt(String(input.value), fromBase.value).toString(16).toUpperCase();
    } catch {
        return '—';
    }
});
</script>

<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('random.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('random.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea v-model="itemsText" :label="$t('random.items')" rows="6" border class="mb-4" :placeholder="$t('random.placeholder')" />
                        <v-slider v-model="pickCount" :label="$t('random.pickCount', { v: pickCount })" :min="1" :max="Math.max(1, items.length)" thumb-label class="mb-4" />
                        <v-btn color="primary" block :disabled="items.length < pickCount" @click="pick">
                            {{ $t('random.pick') }}
                        </v-btn>
                        <v-card v-if="picked.length" variant="tonal" color="success" class="mt-4 pa-3">
                            <div class="text-h6 text-center">{{ picked.join(', ') }}</div>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('random.subtitle'), name: 'description' }], title: t('random.title') });

const itemsText = ref('');
const pickCount = ref(1);
const picked = ref<string[]>([]);

const items = computed(() => itemsText.value.split('\n').map((s) => s.trim()).filter(Boolean));

function pick() {
    const pool = [...items.value];
    const result: string[] = [];
    for (let i = 0; i < Math.min(pickCount.value, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(idx, 1)[0]);
    }
    picked.value = result;
}
</script>

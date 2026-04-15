<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('random.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('random.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="itemsText"
                            class="mb-4"
                            rows="6"
                            :label="$t('random.items')"
                            :placeholder="$t('random.placeholder')"
                            border
                        />
                        <v-slider
                            v-model="pickCount"
                            class="mb-4"
                            :label="$t('random.pickCount', { v: pickCount })"
                            :max="Math.max(1, items.length)"
                            :min="1"
                            thumb-label
                        />
                        <v-btn
                            color="primary"
                            :disabled="items.length < pickCount"
                            block
                            @click="pick"
                        >
                            {{ $t('random.pick') }}
                        </v-btn>
                        <v-card
                            v-if="picked.length"
                            class="pa-3 mt-4"
                            color="success"
                            variant="tonal"
                        >
                            <div class="text-h6 text-center">
                                {{ picked.join(', ') }}
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
            content: t('random.subtitle'),
            name: 'description',
        },
    ],
    title: t('random.title'),

    ogImage: '/og/random-picker.png',
    twitterCard: 'summary_large_image',
    twitterImage: '/og/random-picker.png'});

const itemsText = ref('');
const pickCount = ref(1);
const picked = ref<string[]>([]);

const items = computed(() => itemsText.value.split('\n').map((s) => s.trim()).filter(Boolean));

function pick() {
    const pool = [...items.value];
    const result: string[] = [];
    for (let i = 0; i < Math.min(pickCount.value, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const picked_item = pool.splice(idx, 1)[0];
        if (picked_item !== undefined) {
            result.push(picked_item);
        }
    }
    picked.value = result;
}
</script>

<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('wordcount.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('wordcount.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea v-model="text" :label="$t('wordcount.input')" rows="10" border class="mb-4" />
                        <v-row>
                            <v-col cols="4" sm="3" v-for="stat in stats" :key="stat.label">
                                <v-card variant="tonal" class="text-center pa-3">
                                    <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                                    <div class="text-caption">{{ stat.label }}</div>
                                </v-card>
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
useHead({ meta: [{ content: t('wordcount.subtitle'), name: 'description' }], title: t('wordcount.title') });

const text = ref('');
const stats = computed(() => {
    const s = text.value.trim();
    const words = s ? s.split(/\s+/).length : 0;
    const chars = text.value.length;
    const charsNoSpace = text.value.replace(/\s/g, '').length;
    const lines = text.value ? text.value.split('\n').length : 0;
    return [
        { label: t('wordcount.words'), value: words },
        { label: t('wordcount.chars'), value: chars },
        { label: t('wordcount.charsNoSpace'), value: charsNoSpace },
        { label: t('wordcount.lines'), value: lines },
    ];
});
</script>

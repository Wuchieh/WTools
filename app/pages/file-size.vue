<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('filesize.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('filesize.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="6">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field v-model.number="bytes" :label="$t('filesize.bytes')" type="number" min="0" border class="mb-4" />
                        <div class="d-flex flex-wrap gap-2">
                            <v-chip v-for="u in units" :key="u.key" variant="outlined" class="mr-2 mb-2">
                                {{ u.key }}: <strong class="ml-1">{{ formatSize(bytes, u.div) }}</strong>
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('filesize.subtitle'), name: 'description' }], title: t('filesize.title') });

const bytes = ref(1024);
const units = [
    { key: 'B', div: 1 },
    { key: 'KB', div: 1024 },
    { key: 'MB', div: 1048576 },
    { key: 'GB', div: 1073741824 },
    { key: 'TB', div: 1099511627776 },
];

function formatSize(b: number, div: number) {
    return (b / div).toFixed(4).replace(/\.?0+$/, '');
}
</script>

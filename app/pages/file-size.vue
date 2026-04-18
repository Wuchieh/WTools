<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('fileSize.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('fileSize.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="6"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field
                            v-model.number="bytes"
                            class="mb-4"
                            min="0"
                            type="number"
                            :label="$t('fileSize.bytes')"
                            border
                        />
                        <div class="d-flex flex-wrap gap-2">
                            <v-chip
                                v-for="u in units"
                                :key="u.key"
                                class="mb-2 mr-2"
                                variant="outlined"
                            >
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
useSeoMeta({
    description: t('fileSize.subtitle'),
    ogImage: '/og/file-size.png',

    title: t('fileSize.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/file-size.png',
});

const bytes = ref(1024);
const units = [
    {
        div: 1,
        key: 'B',
    },
    {
        div: 1024,
        key: 'KB',
    },
    {
        div: 1048576,
        key: 'MB',
    },
    {
        div: 1073741824,
        key: 'GB',
    },
    {
        div: 1099511627776,
        key: 'TB',
    },
];

function formatSize(b: number, div: number) {
    return (b / div).toFixed(4).replace(/\.?0+$/, '');
}
</script>

<template>
    <v-container class="py-10">
        <div class="mb-10 text-center">
            <h1 class="font-weight-bold text-h3 mb-2">
                {{ $t('dashboard.title') }}
            </h1>
            <p class="text-body-1 text-medium-emphasis">
                {{ $t('dashboard.subtitle') }}
            </p>
        </div>

        <v-row>
            <v-col
                v-for="tool in tools"
                :key="tool.id"
                cols="12"
                lg="3"
                md="4"
                sm="6"
            >
                <v-card
                    class="d-flex flex-column h-100"
                    :to="localePath(tool.route)"
                    border
                    hover
                >
                    <v-card-item>
                        <template #prepend>
                            <v-avatar
                                color="primary"
                                variant="tonal"
                                rounded
                            >
                                <v-icon :icon="tool.icon" />
                            </v-avatar>
                        </template>
                        <v-card-title>{{ $t(tool.titleKey) }}</v-card-title>
                    </v-card-item>

                    <v-card-text class="text-medium-emphasis pt-2">
                        {{ $t(tool.descKey) }}
                    </v-card-text>

                    <v-spacer />

                    <v-card-actions>
                        <v-btn
                            append-icon="mdi-arrow-right"
                            color="primary"
                            variant="text"
                            block
                        >
                            Open Tool
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <AdUnit slot-id="9876543210" />
    </v-container>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
const { t } = useI18n();

useHead({ title: t('home') });

definePageMeta({ name: 'index' });

const tools = [
    {
        descKey: 'tools.imageToWebP.description',
        icon: 'mdi-image-multiple',
        id: 'image-to-webp',
        route: 'image-to-webp',
        titleKey: 'tools.imageToWebP.title',
    },
];
</script>

<style scoped>
</style>

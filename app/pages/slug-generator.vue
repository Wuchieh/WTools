<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('slug.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('slug.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            :label="$t('slug.input')"
                            rows="3"
                            border
                            class="mb-4"
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-switch v-model="options.lower" :label="$t('slug.lowercase')" color="primary" density="compact" />
                            </v-col>
                            <v-col cols="6">
                                <v-switch v-model="options.strict" :label="$t('slug.strict')" color="primary" density="compact" />
                            </v-col>
                        </v-row>

                        <v-btn color="primary" block :disabled="!input" @click="generate">
                            {{ $t('slug.generate') }}
                        </v-btn>

                        <v-card v-if="slug" variant="outlined" class="mt-4 pa-3">
                            <div class="d-flex align-center gap-2">
                                <code class="text-h6 flex-grow-1 text-break">{{ slug }}</code>
                                <v-btn icon="mdi-content-copy" size="small" variant="text" @click="copy(slug)" />
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
useHead({ meta: [{ content: t('slug.subtitle'), name: 'description' }], title: t('slug.title') });

const input = ref('');
const slug = ref('');
const options = reactive({ lower: true, strict: true });

function generate() {
    let s = input.value.trim();
    // Remove accents
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Replace spaces with hyphens
    s = s.replace(/\s+/g, '-');
    // Remove non-alphanumeric (except hyphens)
    s = s.replace(options.strict ? /[^a-zA-Z0-9-]/g : /[^a-zA-Z0-9-_\s]/g, '');
    // Remove multiple hyphens
    s = s.replace(/-+/g, '-');
    // Trim hyphens from ends
    s = s.replace(/^-+|-+$/g, '');
    slug.value = options.lower ? s.toLowerCase() : s;
}

function copy(text: string) { navigator.clipboard.writeText(text); }
</script>

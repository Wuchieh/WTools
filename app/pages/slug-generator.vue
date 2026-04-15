<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('slug.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('slug.subtitle') }}
        </p>

        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            class="mb-4"
                            rows="3"
                            :label="$t('slug.input')"
                            border
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-switch
                                    v-model="options.lower"
                                    color="primary"
                                    density="compact"
                                    :label="$t('slug.lowercase')"
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-switch
                                    v-model="options.strict"
                                    color="primary"
                                    density="compact"
                                    :label="$t('slug.strict')"
                                />
                            </v-col>
                        </v-row>

                        <v-btn
                            color="primary"
                            :disabled="!input"
                            block
                            @click="generate"
                        >
                            {{ $t('slug.generate') }}
                        </v-btn>

                        <v-card
                            v-if="slug"
                            class="pa-3 mt-4"
                            variant="outlined"
                        >
                            <div class="align-center d-flex gap-2">
                                <code class="flex-grow-1 text-break text-h6">{{ slug }}</code>
                                <v-btn
                                    icon="mdi-content-copy"
                                    size="small"
                                    variant="text"
                                    @click="copy(slug)"
                                />
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
            content: t('slug.subtitle'),
            name: 'description',
        },
    ],
    title: t('slug.title'),
});

const input = ref('');
const slug = ref('');
const options = reactive({
    lower: true,
    strict: true,
});

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('slug.copied'));
    }).catch(() => {
        const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
        if (showCopySnackbar) showCopySnackbar(t('slug.copyFailed'), 'error');
    });
}

function generate() {
    let s = input.value.trim();
    // Remove accents
    s = s.normalize('NFD').replace(/[\u0300-\u036F]/g, '');
    // Replace spaces with hyphens
    s = s.replace(/\s+/g, '-');
    // Remove non-alphanumeric (except hyphens)
    s = s.replace(options.strict ? /[^a-z0-9\-]/gi : /[^\w\-\s]/g, '');
    // Remove multiple hyphens
    s = s.replace(/-+/g, '-');
    // Trim hyphens from ends
    s = s.replace(/^-+|-+$/g, '');
    slug.value = options.lower ? s.toLowerCase() : s;
}
</script>

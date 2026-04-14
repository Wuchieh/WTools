<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('jwt.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('jwt.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-textarea
                            v-model="input"
                            :label="$t('jwt.input')"
                            :placeholder="$t('jwt.inputPlaceholder')"
                            rows="4"
                            border
                            class="mb-4"
                        />

                        <v-row class="mb-4">
                            <v-col cols="6">
                                <v-btn
                                    color="primary"
                                    block
                                    :disabled="!input.trim()"
                                    @click="decode"
                                >
                                    {{ $t('jwt.decode') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    color="warning"
                                    block
                                    variant="outlined"
                                    @click="clear"
                                >
                                    {{ $t('preview.clearAll') }}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-tabs v-if="decoded" v-model="tab" class="mb-4">
                            <v-tab value="header">{{ $t('jwt.header') }}</v-tab>
                            <v-tab value="payload">{{ $t('jwt.payload') }}</v-tab>
                            <v-tab value="signature">{{ $t('jwt.signature') }}</v-tab>
                        </v-tabs>

                        <v-window v-if="decoded" v-model="tab">
                            <v-window-item value="header">
                                <pre class="bg-grey-lighten-4 pa-3 rounded">{{ JSON.stringify(decoded.header, null, 2) }}</pre>
                            </v-window-item>
                            <v-window-item value="payload">
                                <pre class="bg-grey-lighten-4 pa-3 rounded">{{ JSON.stringify(decoded.payload, null, 2) }}</pre>
                                <div v-if="decoded.exp" class="mt-2 text-caption text-medium-emphasis">
                                    {{ $t('jwt.expires') }}: {{ new Date(decoded.exp * 1000).toLocaleString() }}
                                </div>
                                <div v-if="decoded.iat" class="mt-1 text-caption text-medium-emphasis">
                                    {{ $t('jwt.issued') }}: {{ new Date(decoded.iat * 1000).toLocaleString() }}
                                </div>
                            </v-window-item>
                            <v-window-item value="signature">
                                <pre class="bg-grey-lighten-4 pa-3 rounded">{{ decoded.signature }}</pre>
                            </v-window-item>
                        </v-window>

                        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({ meta: [{ content: t('jwt.subtitle'), name: 'description' }], title: t('jwt.title') });

const input = ref('');
const tab = ref('header');
const error = ref('');
const decoded = ref<{ header: Record<string, unknown>; payload: Record<string, unknown>; signature: string; exp?: number; iat?: number } | null>(null);

function decode() {
    error.value = '';
    decoded.value = null;
    try {
        const parts = input.value.trim().split('.');
        if (parts.length !== 3) throw new Error('Invalid JWT format');
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        decoded.value = {
            header,
            payload,
            signature: parts[2],
            exp: payload.exp as number | undefined,
            iat: payload.iat as number | undefined,
        };
    } catch (e: any) {
        error.value = e.message || 'Invalid JWT';
    }
}

function clear() {
    input.value = '';
    decoded.value = null;
    error.value = '';
}
</script>

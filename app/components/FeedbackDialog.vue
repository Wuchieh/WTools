<template>
    <v-dialog
        v-model="dialog"
        max-width="500"
    >
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                icon="mdi-message-alert-outline"
                variant="text"
                :title="$t('feedback.title')"
            />
        </template>

        <v-card>
            <v-card-title>{{ $t('feedback.title') }}</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="submit">
                    <v-text-field
                        v-model="form.nickname"
                        counter="30"
                        :label="$t('feedback.nickname')"
                        :rules="[rules.max30]"
                    />

                    <v-text-field
                        v-model="form.contact"
                        :hint="$t('feedback.contactHint')"
                        :label="$t('feedback.contact')"
                    />

                    <v-textarea
                        v-model="form.description"
                        counter="1500"
                        rows="5"
                        :label="$t('feedback.description')"
                        :rules="[rules.required, rules.max1500]"
                        required
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    color="error"
                    variant="text"
                    @click="dialog = false"
                >
                    {{ $t('feedback.cancel') }}
                </v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="!form.description"
                    :loading="loading"
                    @click="submit"
                >
                    {{ $t('feedback.submit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
    >
        {{ snackbarText }}
        <template #actions>
            <v-btn
                variant="text"
                @click="snackbar = false"
            >
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
const dialog = ref(false);
const loading = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const form = ref({
    contact: '',
    description: '',
    nickname: '',
});

const { locale } = useI18n();

const rules = {
    max30: (v: string) => v.length <= 30 || 'Max 30 characters.',
    max1500: (v: string) => v.length <= 1500 || 'Max 1500 characters.',
    required: (v: string) => !!v || 'Required.',
};

async function submit() {
    if (!form.value.description) return;

    loading.value = true;
    try {
        await $fetch('/api/feedback', {
            body: {
                ...form.value,
                locale: locale.value,
            },
            method: 'POST',
        });

        snackbarText.value = 'Feedback sent successfully!';
        snackbarColor.value = 'success';
        snackbar.value = true;
        dialog.value = false;
        form.value = {
            contact: '',
            description: '',
            nickname: '',
        };
    } catch {
        snackbarText.value = 'Failed to send feedback. Please try again.';
        snackbarColor.value = 'error';
        snackbar.value = true;
    } finally {
        loading.value = false;
    }
}
</script>

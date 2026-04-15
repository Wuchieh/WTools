<template>
    <ToolLayout
        :current-step-index="currentStep"
        :is-processing="isProcessing"
        :steps="steps"
        :subtitle="$t('lorem.subtitle')"
        :success-message="successMessage"
        :title="$t('lorem.title')"
        @step-click="goToStep"
    >
        <!-- Step 0: Configure -->
        <v-select
            v-model="unit"
            class="mb-4"
            :items="unitOptions"
            :label="$t('lorem.unit')"
        />
        <v-slider
            v-model="count"
            class="mb-4"
            :label="$t('lorem.count', { v: count })"
            :max="50"
            :min="1"
            thumb-label
        />

        <v-btn
            color="primary"
            :loading="isProcessing"
            block
            @click="generate"
        >
            {{ $t('lorem.generate') }}
        </v-btn>

        <!-- Step 1: Result -->
        <v-textarea
            v-if="text"
            class="font-monospace mt-4"
            rows="10"
            :model-value="text"
            border
            readonly
        />

        <template #actions>
            <v-btn
                v-if="text"
                class="mt-2"
                color="success"
                block
                @click="copy"
            >
                {{ $t('lorem.copy') }}
            </v-btn>
        </template>
    </ToolLayout>
</template>

<script setup lang="ts">
import type { ToolStep } from '~/components/Tool/ToolLayout.vue';
import { generateLoremIpsum } from '~/services/text';
import type { LoremOptions } from '~/services/text';

const { t } = useI18n();

useSeoMeta({
    description: t('lorem.subtitle'),
    ogDescription: t('lorem.subtitle'),
    ogTitle: t('lorem.title'),
    title: t('lorem.title'),
});

const unit = ref<'paragraphs' | 'sentences' | 'words'>('paragraphs');
const count = ref(3);
const text = ref('');
const isProcessing = ref(false);
const successMessage = ref('');
const currentStep = ref(0);

const steps = computed<ToolStep[]>(() => [
    {
        key: 'configure',
        label: t('lorem.stepConfigure'),
    },
    {
        key: 'result',
        label: t('lorem.stepResult'),
    },
]);

const unitOptions = [
    {
        title: 'Paragraphs',
        value: 'paragraphs',
    },
    {
        title: 'Sentences',
        value: 'sentences',
    },
    {
        title: 'Words',
        value: 'words',
    },
];

function copy(): void {
    navigator.clipboard.writeText(text.value).then(() => {
        successMessage.value = t('lorem.copied');
    }).catch(() => {
        successMessage.value = '';
    });
}

function generate(): void {
    isProcessing.value = true;
    successMessage.value = '';

    try {
        const options: LoremOptions = {
            count: count.value,
            format: 'plain',
            units: unit.value,
        };

        text.value = generateLoremIpsum(options);
        currentStep.value = 1;
    } catch (e) {
        console.error('Lorem ipsum generation failed:', e);
    } finally {
        isProcessing.value = false;
    }
}

function goToStep(index: number): void {
    currentStep.value = index;
}
</script>

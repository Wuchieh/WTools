<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ title }}
        </h1>
        <p
            v-if="subtitle"
            class="text-body-1 text-medium-emphasis mb-10 text-center"
        >
            {{ subtitle }}
        </p>

        <!-- Step Indicator -->
        <v-stepper
            v-if="steps.length > 1"
            class="mb-8"
            :model-value="currentStepIndex + 1"
            flat
        >
            <v-stepper-header>
                <v-stepper-item
                    v-for="(step, index) in steps"
                    :key="step.key"
                    class="text-none"
                    :active="index === currentStepIndex"
                    :complete="index < currentStepIndex"
                    :title="step.label"
                    :value="index + 1"
                />
            </v-stepper-header>
        </v-stepper>

        <v-row justify="center">
            <v-col
                lg="8"
                :cols="maxWidthCols"
            >
                <!-- Loading Overlay -->
                <v-overlay
                    class="align-center justify-center"
                    :model-value="isProcessing"
                    contained
                >
                    <v-card
                        class="pa-6"
                        border
                    >
                        <v-progress-circular
                            color="primary"
                            :size="64"
                            indeterminate
                        />
                        <p
                            v-if="progressMessage"
                            class="text-body-1 mt-4 text-center"
                        >
                            {{ progressMessage }}
                        </p>
                        <p
                            v-if="progress > 0"
                            class="text-body-2 mt-2 text-center"
                        >
                            {{ progress }}%
                        </p>
                    </v-card>
                </v-overlay>

                <!-- Error Alert -->
                <v-alert
                    v-if="errorMessage"
                    class="mb-6"
                    type="error"
                    variant="tonal"
                    closable
                    @click:close="$emit('update:errorMessage', '')"
                >
                    {{ errorMessage }}
                </v-alert>

                <!-- Success Alert -->
                <v-alert
                    v-if="successMessage"
                    class="mb-6"
                    type="success"
                    variant="tonal"
                    closable
                    @click:close="$emit('update:successMessage', '')"
                >
                    {{ successMessage }}
                </v-alert>

                <!-- Content Slots -->
                <v-card border>
                    <v-card-text class="pt-4">
                        <slot />
                    </v-card-text>
                </v-card>

                <!-- Action Buttons -->
                <div
                    v-if="$slots.actions"
                    class="mt-4"
                >
                    <slot name="actions" />
                </div>

                <!-- Stats Display -->
                <v-card
                    v-if="showStats && stats.length > 0"
                    class="mt-4"
                    border
                >
                    <v-card-text>
                        <slot name="stats">
                            <v-row justify="center">
                                <v-col
                                    v-for="stat in displayStats"
                                    :key="stat.label"
                                    class="text-center"
                                    cols="auto"
                                >
                                    <div class="font-weight-bold text-h5 text-primary">
                                        {{ stat.value }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        {{ stat.label }}
                                    </div>
                                </v-col>
                            </v-row>
                        </slot>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
interface Props {
    currentStepIndex?: number;
    errorMessage?: string;
    isProcessing?: boolean;
    maxWidthCols?: number;
    progress?: number;
    progressMessage?: string;
    showStats?: boolean;
    stats?: StatItem[];
    steps?: ToolStep[];
    subtitle?: string;
    successMessage?: string;
    title: string;
}

export interface StatItem {
    color?: string;
    label: string;
    value: string;
}

export interface ToolStep {
    key: string;
    label: string;
}

const props = withDefaults(defineProps<Props>(), {
    currentStepIndex: 0,
    errorMessage: '',
    isProcessing: false,
    maxWidthCols: 12,
    progress: 0,
    progressMessage: '',
    showStats: false,
    stats: () => [],
    steps: () => [],
    successMessage: '',
});

defineEmits<{
    'update:errorMessage': [value: string];
    'update:successMessage': [value: string];
}>();

const displayStats = computed(() => props.stats);
</script>

<style scoped lang="scss">
:deep(.v-stepper-item) {
    min-width: 100px;
}
</style>

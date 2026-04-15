<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('color.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('color.subtitle') }}</p>

        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-color-picker v-model="color" mode="hex" hide-inputs class="mb-4" />

                        <v-row>
                            <v-col cols="6">
                                <v-text-field :model-value="color" label="HEX" border readonly />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field :model-value="rgbString" label="RGB" border readonly />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field :model-value="hslString" label="HSL" border readonly />
                            </v-col>
                        </v-row>

                        <v-card class="pa-4 text-center" :style="{ backgroundColor: color }">
                            <div :style="{ color: textColor }">{{ $t('color.preview') }}</div>
                        </v-card>

                        <v-btn color="success" block class="mt-4" @click="copy(color)">
                            {{ $t('color.copy') }}
                        </v-btn>

                        <v-list border class="mt-4">
                            <v-list-subheader>{{ $t('color.palette') }}</v-list-subheader>
                            <v-list-item
                                v-for="c in palette"
                                :key="c"
                                :style="{ background: c }"
                                @click="color = c"
                            >
                                <template #prepend>
                                    <v-icon icon="mdi-palette" />
                                </template>
                                <v-list-item-title :style="{ color: textColorFor(c) }">{{ c }}</v-list-item-title>
                                <template #append>
                                    <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click.stop="copy(c)" />
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('color.subtitle'), name: 'description' }], title: t('color.title') });

const color = ref('#1976D2');
const palette = ['#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800', '#607D8B'];

const rgbString = computed(() => {
    const r = parseInt(color.value.slice(1, 3), 16);
    const g = parseInt(color.value.slice(3, 5), 16);
    const b = parseInt(color.value.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
});

const hslString = computed(() => {
    const r = parseInt(color.value.slice(1, 3), 16) / 255;
    const g = parseInt(color.value.slice(3, 5), 16) / 255;
    const b = parseInt(color.value.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
});

const textColor = computed(() => {
    const r = parseInt(color.value.slice(1, 3), 16);
    const g = parseInt(color.value.slice(3, 5), 16);
    const b = parseInt(color.value.slice(5, 7), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? '#000' : '#fff';
});

function textColorFor(c: string) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? '#000' : '#fff';
}

function copy(text: string) { navigator.clipboard.writeText(text).then(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
}).catch(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
}); }
</script>

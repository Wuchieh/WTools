<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('timestamp.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('timestamp.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field v-model.number="ts" :label="$t('timestamp.timestamp')" type="number" border class="mb-4" />
                        <div class="mb-4 d-flex flex-wrap gap-2">
                            <v-chip v-for="fmt in formats" :key="fmt" variant="outlined" class="mr-2 mb-2" @click="applyFormat(fmt)">{{ fmt }}</v-chip>
                        </div>
                        <div v-if="result" class="mt-4">
                            <v-card variant="tonal" class="pa-3">
                                <div class="text-h6 mb-2">{{ result }}</div>
                                <div class="text-caption text-medium-emphasis">{{ relativeTime }}</div>
                            </v-card>
                            <v-btn color="success" class="mt-3" @click="copy(result)">{{ $t('timestamp.copy') }}</v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useHead({ meta: [{ content: t('timestamp.subtitle'), name: 'description' }], title: t('timestamp.title') });

const ts = ref(Math.floor(Date.now() / 1000));
const formats = ['YYYY-MM-DD', 'YYYY/MM/DD', 'HH:mm:ss', 'Full DateTime'];
const result = ref('');
const relativeTime = computed(() => {
    const diff = Date.now() - new Date(ts.value * 1000).getTime();
    const abs = Math.abs(diff);
    const unit = abs < 60000 ? 's' : abs < 3600000 ? 'm' : abs < 86400000 ? 'h' : 'd';
    return `${diff < 0 ? 'in ' : ''}${Math.floor(abs / (unit === 's' ? 1000 : unit === 'm' ? 60000 : unit === 'h' ? 3600000 : 86400000))} ${unit}${diff < 0 ? '' : ' ago'}`;
});

watch(ts, () => {
    const d = new Date(ts.value * 1000);
    result.value = d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
});

function applyFormat(fmt: string) {
    const d = new Date(ts.value * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    if (fmt === 'YYYY-MM-DD') result.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    else if (fmt === 'YYYY/MM/DD') result.value = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    else if (fmt === 'HH:mm:ss') result.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    else result.value = d.toLocaleString();
}

function copy(text: string) { navigator.clipboard.writeText(text).then(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('已複製到剪貼簿！');
}).catch(() => {
    const showCopySnackbar = inject<(text: string, color?: string) => void>('showCopySnackbar');
    if (showCopySnackbar) showCopySnackbar('複製失敗', 'error');
}); }
</script>

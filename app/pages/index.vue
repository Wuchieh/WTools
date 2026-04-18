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

        <div class="mb-6">
            <v-text-field
                v-model="search"
                class="mb-4"
                prepend-inner-icon="mdi-magnify"
                :label="$t('dashboard.search')"
                border
                clearable
            />
            <v-chip-group
                v-model="selectedCategory"
                column
                filter
            >
                <v-chip
                    size="small"
                    value="all"
                >
                    {{ $t('dashboard.all') }}
                </v-chip>
                <v-chip
                    size="small"
                    value="image"
                >
                    {{ $t('dashboard.image') }}
                </v-chip>
                <v-chip
                    size="small"
                    value="text"
                >
                    {{ $t('dashboard.text') }}
                </v-chip>
                <v-chip
                    size="small"
                    value="developer"
                >
                    {{ $t('dashboard.developer') }}
                </v-chip>
                <v-chip
                    size="small"
                    value="utility"
                >
                    {{ $t('dashboard.utility') }}
                </v-chip>
            </v-chip-group>
        </div>

        <v-row>
            <v-col
                v-for="tool in filteredTools"
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
                            {{ $t('dashboard.openTool') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <div
            v-if="filteredTools.length === 0"
            class="text-medium-emphasis mt-10 text-center"
        >
            {{ $t('dashboard.noResults') }}
        </div>
    </v-container>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
const { t } = useI18n();

useHead({
    ogImage: '/og/index.png',
    title: t('home'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/index.png',

});

definePageMeta({ name: 'index' });

const search = ref('');
const selectedCategory = ref('all');

interface Tool {
    category: 'developer' | 'image' | 'text' | 'utility';
    descKey: string;
    icon: string;
    id: string;
    route: string;
    titleKey: string;
}

const allTools: Tool[] = [
    {
        category: 'image',
        descKey: 'tools.imageToWebP.description',
        icon: 'mdi-image-multiple',
        id: 'image-to-webp',
        route: 'image-to-webp',
        titleKey: 'tools.imageToWebP.title',
    },
    {
        category: 'image',
        descKey: 'tools.whipStream.description',
        icon: 'mdi-broadcast',
        id: 'whip-stream',
        route: 'whip-stream',
        titleKey: 'tools.whipStream.title',
    },
    {
        category: 'image',
        descKey: 'tools.imageCompress.description',
        icon: 'mdi-image-filter-hdr',
        id: 'image-compress',
        route: 'image-compress',
        titleKey: 'tools.imageCompress.title',
    },
    {
        category: 'image',
        descKey: 'tools.imageCrop.description',
        icon: 'mdi-crop',
        id: 'image-crop',
        route: 'image-crop',
        titleKey: 'tools.imageCrop.title',
    },
    {
        category: 'image',
        descKey: 'tools.imageRotate.description',
        icon: 'mdi-rotate-3d-variant',
        id: 'image-rotate',
        route: 'image-rotate',
        titleKey: 'tools.imageRotate.title',
    },
    {
        category: 'image',
        descKey: 'tools.imageWatermark.description',
        icon: 'mdi-water',
        id: 'image-watermark',
        route: 'image-watermark',
        titleKey: 'tools.imageWatermark.title',
    },
    {
        category: 'image',
        descKey: 'tools.imageHeic.description',
        icon: 'mdi-image-filter-hdr',
        id: 'image-heic',
        route: 'image-heic',
        titleKey: 'tools.imageHeic.title',
    },
    {
        category: 'image',
        descKey: 'tools.svgConvert.description',
        icon: 'mdi-svg',
        id: 'svg-convert',
        route: 'svg-convert',
        titleKey: 'tools.svgConvert.title',
    },
    {
        category: 'image',
        descKey: 'tools.icoGenerator.description',
        icon: 'mdi-favicon',
        id: 'ico-generator',
        route: 'ico-generator',
        titleKey: 'tools.icoGenerator.title',
    },
    {
        category: 'image',
        descKey: 'tools.gifEditor.description',
        icon: 'mdi-gif',
        id: 'gif-editor',
        route: 'gif-editor',
        titleKey: 'tools.gifEditor.title',
    },
    {
        category: 'developer',
        descKey: 'tools.jwtDecoder.description',
        icon: 'mdi-key',
        id: 'jwt-decoder',
        route: 'jwt-decoder',
        titleKey: 'tools.jwtDecoder.title',
    },
    {
        category: 'developer',
        descKey: 'tools.base64Tool.description',
        icon: 'mdi-lock',
        id: 'base64-tool',
        route: 'base64-tool',
        titleKey: 'tools.base64Tool.title',
    },
    {
        category: 'developer',
        descKey: 'tools.urlEncoder.description',
        icon: 'mdi-link',
        id: 'url-encoder',
        route: 'url-encoder',
        titleKey: 'tools.urlEncoder.title',
    },
    {
        category: 'developer',
        descKey: 'tools.hashGenerator.description',
        icon: 'mdi-key-variant',
        id: 'hash-generator',
        route: 'hash-generator',
        titleKey: 'tools.hashGenerator.title',
    },
    {
        category: 'developer',
        descKey: 'tools.uuidGenerator.description',
        icon: 'mdi-identifier',
        id: 'uuid-generator',
        route: 'uuid-generator',
        titleKey: 'tools.uuidGenerator.title',
    },
    {
        category: 'developer',
        descKey: 'tools.regexTester.description',
        icon: 'mdi-regex',
        id: 'regex-tester',
        route: 'regex-tester',
        titleKey: 'tools.regexTester.title',
    },
    {
        category: 'developer',
        descKey: 'tools.colorPicker.description',
        icon: 'mdi-palette',
        id: 'color-picker',
        route: 'color-picker',
        titleKey: 'tools.colorPicker.title',
    },
    {
        category: 'text',
        descKey: 'tools.slugGenerator.description',
        icon: 'mdi-format-text',
        id: 'slug-generator',
        route: 'slug-generator',
        titleKey: 'tools.slugGenerator.title',
    },
    {
        category: 'utility',
        descKey: 'tools.unitConverter.description',
        icon: 'mdi-calculator',
        id: 'unit-converter',
        route: 'unit-converter',
        titleKey: 'tools.unitConverter.title',
    },
    {
        category: 'utility',
        descKey: 'tools.todoList.description',
        icon: 'mdi-checkbox-marked-outline',
        id: 'todo-list',
        route: 'todo-list',
        titleKey: 'tools.todoList.title',
    },
    {
        category: 'utility',
        descKey: 'tools.randomPicker.description',
        icon: 'mdi-shuffle-variant',
        id: 'random-picker',
        route: 'random-picker',
        titleKey: 'tools.randomPicker.title',
    },
    {
        category: 'utility',
        descKey: 'tools.timer.description',
        icon: 'mdi-timer-outline',
        id: 'timer',
        route: 'timer',
        titleKey: 'tools.timer.title',
    },
    {
        category: 'utility',
        descKey: 'tools.cronParser.description',
        icon: 'mdi-clock-outline',
        id: 'cron-parser',
        route: 'cron-parser',
        titleKey: 'tools.cronParser.title',
    },
    {
        category: 'text',
        descKey: 'tools.htmlEscape.description',
        icon: 'mdi-code-tags',
        id: 'html-escape',
        route: 'html-escape',
        titleKey: 'tools.htmlEscape.title',
    },
    {
        category: 'text',
        descKey: 'tools.jsonFormatter.desc',
        icon: 'mdi-code-json',
        id: 'json-formatter',
        route: 'json-formatter',
        titleKey: 'tools.jsonFormatter.title',
    },
    {
        category: 'text',
        descKey: 'tools.csvViewer.desc',
        icon: 'mdi-table',
        id: 'csv-viewer',
        route: 'csv-viewer',
        titleKey: 'tools.csvViewer.title',
    },
    {
        category: 'text',
        descKey: 'tools.textDiff.desc',
        icon: 'mdi-compare',
        id: 'text-diff',
        route: 'text-diff',
        titleKey: 'tools.textDiff.title',
    },
    {
        category: 'text',
        descKey: 'tools.batchRename.desc',
        icon: 'mdi-rename-box',
        id: 'batch-rename',
        route: 'batch-rename',
        titleKey: 'tools.batchRename.title',
    },
    {
        category: 'text',
        descKey: 'tools.markdownPreview.desc',
        icon: 'mdi-language-markdown',
        id: 'markdown-preview',
        route: 'markdown-preview',
        titleKey: 'tools.markdownPreview.title',
    },
    {
        category: 'utility',
        descKey: 'tools.fileSize.desc',
        icon: 'mdi-harddisk',
        id: 'file-size',
        route: 'file-size',
        titleKey: 'tools.fileSize.title',
    },
    {
        category: 'utility',
        descKey: 'tools.timestamp.desc',
        icon: 'mdi-clock',
        id: 'timestamp',
        route: 'timestamp',
        titleKey: 'tools.timestamp.title',
    },
    {
        category: 'text',
        descKey: 'tools.wordCounter.desc',
        icon: 'mdi-counter',
        id: 'word-counter',
        route: 'word-counter',
        titleKey: 'tools.wordCounter.title',
    },
    {
        category: 'developer',
        descKey: 'tools.hashChecker.desc',
        icon: 'mdi-file-check',
        id: 'hash-checker',
        route: 'hash-checker',
        titleKey: 'tools.hashChecker.title',
    },
    {
        category: 'developer',
        descKey: 'tools.base64File.desc',
        icon: 'mdi-file-lock',
        id: 'base64-file',
        route: 'base64-file',
        titleKey: 'tools.base64File.title',
    },
    {
        category: 'text',
        descKey: 'lorem.subtitle',
        icon: 'mdi-text',
        id: 'lorem-ipsum',
        route: 'lorem-ipsum',
        titleKey: 'lorem.title',
    },
    {
        category: 'developer',
        descKey: 'tools.cssFormatter.desc',
        icon: 'mdi-language-css3',
        id: 'css-formatter',
        route: 'css-formatter',
        titleKey: 'tools.cssFormatter.title',
    },
    {
        category: 'text',
        descKey: 'tools.sentenceCounter.desc',
        icon: 'mdi-text-short',
        id: 'sentence-counter',
        route: 'sentence-counter',
        titleKey: 'tools.sentenceCounter.title',
    },
    {
        category: 'utility',
        descKey: 'percent.subtitle',
        icon: 'mdi-percent',
        id: 'percentage-calc',
        route: 'percentage-calc',
        titleKey: 'percent.title',
    },
    {
        category: 'text',
        descKey: 'tools.jsonYaml.desc',
        icon: 'mdi-code-braces',
        id: 'json-yaml',
        route: 'json-yaml',
        titleKey: 'tools.jsonYaml.title',
    },
    {
        category: 'utility',
        descKey: 'tools.binaryCalc.desc',
        icon: 'mdi-numeric',
        id: 'binary-calc',
        route: 'binary-calc',
        titleKey: 'tools.binaryCalc.title',
    },
    {
        category: 'text',
        descKey: 'tools.encDecText.desc',
        icon: 'mdi-lock-open',
        id: 'enc-dec-text',
        route: 'enc-dec-text',
        titleKey: 'tools.encDecText.title',
    },
    {
        category: 'developer',
        descKey: 'tools.qrGenerator.description',
        icon: 'mdi-qrcode',
        id: 'qr-generator',
        route: 'qr-generator',
        titleKey: 'tools.qrGenerator.title',
    },
    {
        category: 'developer',
        descKey: 'tools.qrReader.description',
        icon: 'mdi-qrcode-scan',
        id: 'qr-reader',
        route: 'qr-reader',
        titleKey: 'tools.qrReader.title',
    },
    {
        category: 'developer',
        descKey: 'tools.passwordGenerator.description',
        icon: 'mdi-lock',
        id: 'password-generator',
        route: 'password-generator',
        titleKey: 'tools.passwordGenerator.title',
    },
];

const filteredTools = computed(() => {
    let result = allTools;
    if (selectedCategory.value !== 'all') {
        result = result.filter((t) => t.category === selectedCategory.value);
    }
    if (search.value.trim()) {
        const q = search.value.toLowerCase();
        result = result.filter((t) =>
            t.id.toLowerCase().includes(q)
            || t.titleKey.toLowerCase().includes(q)
            || t.descKey.toLowerCase().includes(q),
        );
    }
    return result;
});
</script>

<style scoped>
</style>

export default defineEventHandler(() => {
    const base = 'https://wtools-e7g.pages.dev';

    const staticPages = [
        {
            changefreq: 'daily',
            loc: '/',
            priority: 1.0,
        },
    ];

    const toolPages = [
        {
            loc: '/image-to-webp',
            priority: 0.9,
        },
        {
            loc: '/whip-stream',
            priority: 0.7,
        },
        {
            loc: '/image-compress',
            priority: 0.9,
        },
        {
            loc: '/image-crop',
            priority: 0.9,
        },
        {
            loc: '/image-rotate',
            priority: 0.9,
        },
        {
            loc: '/image-watermark',
            priority: 0.9,
        },
        {
            loc: '/image-heic',
            priority: 0.8,
        },
        {
            loc: '/svg-convert',
            priority: 0.8,
        },
        {
            loc: '/ico-generator',
            priority: 0.8,
        },
        {
            loc: '/gif-editor',
            priority: 0.8,
        },
        {
            loc: '/jwt-decoder',
            priority: 0.9,
        },
        {
            loc: '/base64-tool',
            priority: 0.9,
        },
        {
            loc: '/url-encoder',
            priority: 0.9,
        },
        {
            loc: '/hash-generator',
            priority: 0.9,
        },
        {
            loc: '/uuid-generator',
            priority: 0.9,
        },
        {
            loc: '/regex-tester',
            priority: 0.9,
        },
        {
            loc: '/color-picker',
            priority: 0.9,
        },
        {
            loc: '/slug-generator',
            priority: 0.8,
        },
        {
            loc: '/unit-converter',
            priority: 0.8,
        },
        {
            loc: '/todo-list',
            priority: 0.8,
        },
        {
            loc: '/random-picker',
            priority: 0.8,
        },
        {
            loc: '/timer',
            priority: 0.8,
        },
        {
            loc: '/cron-parser',
            priority: 0.8,
        },
        {
            loc: '/html-escape',
            priority: 0.8,
        },
        {
            loc: '/json-formatter',
            priority: 0.9,
        },
        {
            loc: '/csv-viewer',
            priority: 0.8,
        },
        {
            loc: '/text-diff',
            priority: 0.9,
        },
        {
            loc: '/batch-rename',
            priority: 0.8,
        },
        {
            loc: '/markdown-preview',
            priority: 0.8,
        },
        {
            loc: '/file-size',
            priority: 0.7,
        },
        {
            loc: '/timestamp',
            priority: 0.8,
        },
        {
            loc: '/word-counter',
            priority: 0.8,
        },
        {
            loc: '/hash-checker',
            priority: 0.8,
        },
        {
            loc: '/base64-file',
            priority: 0.8,
        },
        {
            loc: '/lorem-ipsum',
            priority: 0.7,
        },
        {
            loc: '/css-formatter',
            priority: 0.8,
        },
        {
            loc: '/sentence-counter',
            priority: 0.7,
        },
        {
            loc: '/percentage-calc',
            priority: 0.7,
        },
        {
            loc: '/json-yaml',
            priority: 0.8,
        },
        {
            loc: '/binary-calc',
            priority: 0.7,
        },
        {
            loc: '/enc-dec-text',
            priority: 0.8,
        },
        {
            loc: '/qr-generator',
            priority: 0.8,
        },
        {
            loc: '/qr-reader',
            priority: 0.8,
        },
        {
            loc: '/password-generator',
            priority: 0.8,
        },
    ];

    const allPages = [
        ...staticPages,
        ...toolPages,
    ];

    // i18n: also include /en/ prefixed routes
    const enPages = toolPages.map((p) => ({
        ...p,
        loc: `/en${p.loc}`,
    }));

    return [
        ...allPages,
        ...enPages,
    ].map((page) => ({
        changefreq: page.changefreq || 'weekly',
        lastmod: new Date().toISOString().split('T')[0],
        loc: `${base}${page.loc}`,
        priority: page.priority,
    }));
});

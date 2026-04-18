export default defineEventHandler(() => {
    const base = 'https://wtools.wuchieh.com';

    const staticPages = [
        {
            changefreq: 'daily',
            loc: '/',
            priority: 1.0,
        },
    ];

    const toolPages = [
        {
            changefreq: 'daily',
            loc: '/whip-stream',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/image-to-webp',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/image-compress',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/image-crop',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/image-rotate',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/image-watermark',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/image-heic',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/svg-convert',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/ico-generator',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/gif-editor',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/jwt-decoder',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/base64-tool',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/url-encoder',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/hash-generator',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/uuid-generator',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/regex-tester',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/color-picker',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/slug-generator',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/unit-converter',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/todo-list',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/random-picker',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/timer',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/cron-parser',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/html-escape',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/json-formatter',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/csv-viewer',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/text-diff',
            priority: 0.9,
        },
        {
            changefreq: 'weekly',
            loc: '/batch-rename',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/markdown-preview',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/file-size',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/timestamp',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/word-counter',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/hash-checker',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/base64-file',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/lorem-ipsum',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/css-formatter',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/sentence-counter',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/percentage-calc',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/json-yaml',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/binary-calc',
            priority: 0.7,
        },
        {
            changefreq: 'weekly',
            loc: '/enc-dec-text',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/qr-generator',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
            loc: '/qr-reader',
            priority: 0.8,
        },
        {
            changefreq: 'weekly',
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

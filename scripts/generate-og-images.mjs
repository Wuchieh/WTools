#!/usr/bin/env node
/**
 * Generate OG images for WTools homepage and each tool page.
 * Uses sharp to create 1200x630 PNG images from SVG templates.
 */

import { Buffer } from 'node:buffer';
import { mkdirSync } from 'node:fs';
import {
    dirname,
    join,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'public', 'og');
mkdirSync(outputDir, { recursive: true });

const tools = [
    {
        icon: 'B64',
        id: 'base64-tool',
        subtitle: 'Encode & decode text in Base64',
        title: 'Base64 Encoder',
    },
    {
        icon: 'B64',
        id: 'base64-file',
        subtitle: 'Encode files to Base64 or decode back',
        title: 'Base64 File',
    },
    {
        icon: 'RN',
        id: 'batch-rename',
        subtitle: 'Rename multiple files at once',
        title: 'Batch Rename',
    },
    {
        icon: '02',
        id: 'binary-calc',
        subtitle: 'Binary, Decimal, Hexadecimal converter',
        title: 'Base Converter',
    },
    {
        icon: 'CLR',
        id: 'color-picker',
        subtitle: 'Pick colors and convert HEX, RGB, HSL',
        title: 'Color Picker',
    },
    {
        icon: 'CRN',
        id: 'cron-parser',
        subtitle: 'Parse cron expressions',
        title: 'Cron Parser',
    },
    {
        icon: 'CSS',
        id: 'css-formatter',
        subtitle: 'Format and beautify CSS code',
        title: 'CSS Formatter',
    },
    {
        icon: 'CSV',
        id: 'csv-viewer',
        subtitle: 'View and convert CSV/TSV data',
        title: 'CSV Viewer',
    },
    {
        icon: 'CAESAR',
        id: 'enc-dec-text',
        subtitle: 'Caesar cipher and ROT13 encryption',
        title: 'Text Encrypt/Decrypt',
    },
    {
        icon: 'B',
        id: 'file-size',
        subtitle: 'Convert bytes to various size units',
        title: 'File Size',
    },
    {
        icon: 'GIF',
        id: 'gif-editor',
        subtitle: 'Resize and convert GIF images',
        title: 'GIF Editor',
    },
    {
        icon: '#',
        id: 'hash-checker',
        subtitle: 'Compute MD5, SHA1, SHA256 hashes',
        title: 'Hash Checker',
    },
    {
        icon: '#',
        id: 'hash-generator',
        subtitle: 'Generate MD5, SHA1, SHA256 hashes',
        title: 'Hash Generator',
    },
    {
        icon: '<>',
        id: 'html-escape',
        subtitle: 'HTML entity escape and unescape',
        title: 'HTML Escape',
    },
    {
        icon: 'ICO',
        id: 'ico-generator',
        subtitle: 'Convert images to ICO/favicon',
        title: 'ICO Generator',
    },
    {
        icon: 'IMG',
        id: 'image-compress',
        subtitle: 'Compress images locally',
        title: 'Image Compressor',
    },
    {
        icon: 'CROP',
        id: 'image-crop',
        subtitle: 'Crop images with aspect ratio options',
        title: 'Image Cropper',
    },
    {
        icon: 'HEIC',
        id: 'image-heic',
        subtitle: 'Convert HEIC/HEIF to JPG or PNG',
        title: 'HEIC Converter',
    },
    {
        icon: 'RT',
        id: 'image-rotate',
        subtitle: 'Rotate and flip images',
        title: 'Image Rotate',
    },
    {
        icon: 'WEBP',
        id: 'image-to-webp',
        subtitle: 'Convert images to WebP locally',
        title: 'Image to WebP',
    },
    {
        icon: 'WM',
        id: 'image-watermark',
        subtitle: 'Add text watermarks to photos',
        title: 'Image Watermark',
    },
    {
        icon: 'WT',
        id: 'index',
        subtitle: 'A collection of useful browser tools',
        title: 'WTools',
    },
    {
        icon: '{}',
        id: 'json-formatter',
        subtitle: 'Format, minify and validate JSON',
        title: 'JSON Formatter',
    },
    {
        icon: 'YAML',
        id: 'json-yaml',
        subtitle: 'Convert between JSON and YAML',
        title: 'JSON/YAML Converter',
    },
    {
        icon: 'JWT',
        id: 'jwt-decoder',
        subtitle: 'Decode JWT tokens',
        title: 'JWT Decoder',
    },
    {
        icon: 'LOREM',
        id: 'lorem-ipsum',
        subtitle: 'Generate placeholder text',
        title: 'Lorem Ipsum',
    },
    {
        icon: 'MD',
        id: 'markdown-preview',
        subtitle: 'Live preview Markdown documents',
        title: 'Markdown Preview',
    },
    {
        icon: '***',
        id: 'password-generator',
        subtitle: 'Generate secure random passwords',
        title: 'Password Generator',
    },
    {
        icon: '%',
        id: 'percentage-calc',
        subtitle: 'Percentage calculation tool',
        title: 'Percentage Calculator',
    },
    {
        icon: 'QR',
        id: 'qr-generator',
        subtitle: 'Generate QR Code images',
        title: 'QR Generator',
    },
    {
        icon: 'QR',
        id: 'qr-reader',
        subtitle: 'Read QR Code from image or camera',
        title: 'QR Reader',
    },
    {
        icon: 'RND',
        id: 'random-picker',
        subtitle: 'Randomly pick items from a list',
        title: 'Random Picker',
    },
    {
        icon: '.*',
        id: 'regex-tester',
        subtitle: 'Test regular expressions',
        title: 'Regex Tester',
    },
    {
        icon: 'ABC',
        id: 'sentence-counter',
        subtitle: 'Count sentences in text',
        title: 'Sentence Counter',
    },
    {
        icon: 'SLUG',
        id: 'slug-generator',
        subtitle: 'Convert text to URL-friendly slugs',
        title: 'Slug Generator',
    },
    {
        icon: 'SVG',
        id: 'svg-convert',
        subtitle: 'Convert SVG to PNG, JPG, WebP',
        title: 'SVG Converter',
    },
    {
        icon: 'DIFF',
        id: 'text-diff',
        subtitle: 'Compare differences between texts',
        title: 'Text Diff',
    },
    {
        icon: 'T',
        id: 'timer',
        subtitle: 'Countdown timer',
        title: 'Timer',
    },
    {
        icon: 'TS',
        id: 'timestamp',
        subtitle: 'Unix timestamp conversion',
        title: 'Timestamp',
    },
    {
        icon: 'TODO',
        id: 'todo-list',
        subtitle: 'Simple todo list',
        title: 'Todo List',
    },
    {
        icon: 'U',
        id: 'unit-converter',
        subtitle: 'Convert length, weight, temperature',
        title: 'Unit Converter',
    },
    {
        icon: 'URL',
        id: 'url-encoder',
        subtitle: 'URL encode and decode',
        title: 'URL Encoder',
    },
    {
        icon: 'UUID',
        id: 'uuid-generator',
        subtitle: 'Generate UUID v4 and v7',
        title: 'UUID Generator',
    },
    {
        icon: 'LIVE',
        id: 'whip-stream',
        subtitle: 'Push WebRTC streams via WHIP',
        title: 'WHIP Stream',
    },
    {
        icon: 'W',
        id: 'word-counter',
        subtitle: 'Count words, characters, lines',
        title: 'Word Counter',
    },
];

const categoryColors = {
    developer: {
        accent: '#FF9800',
        bg: '#1f1f0f',
        label: 'Developer',
    },
    home: {
        accent: '#6C63FF',
        bg: '#0f0f23',
        label: 'All Tools',
    },
    image: {
        accent: '#4CAF50',
        bg: '#0f1f0f',
        label: 'Image',
    },
    text: {
        accent: '#2196F3',
        bg: '#0f1f2f',
        label: 'Text',
    },
    utility: {
        accent: '#9C27B0',
        bg: '#1f0f1f',
        label: 'Utility',
    },
};

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function generateOGImages() {
    const sharp = (await import('../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js')).default;

    for (const tool of tools) {
        const svg = generateSVG(tool);
        const svgBuffer = Buffer.from(svg);
        const outputPath = join(outputDir, `${tool.id}.png`);

        await sharp(svgBuffer)
            .png()
            .toFile(outputPath);

        console.log(`Generated: public/og/${tool.id}.png`);
    }

    console.log(`\nAll ${tools.length} OG images generated in ${outputDir}`);
}

function generateSVG(tool) {
    const colors = categoryColors[tool.category] || categoryColors.home;
    const title = escapeXml(tool.title);
    const subtitle = escapeXml(tool.subtitle);
    const icon = escapeXml(tool.icon);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.accent}"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>

  <!-- Category badge -->
  <rect x="80" y="60" width="140" height="36" rx="18" fill="${colors.accent}" opacity="0.2"/>
  <text
    x="150" y="84"
    font-size="16"
    font-weight="600"
    fill="${colors.accent}"
    text-anchor="middle"
    font-family="system-ui, sans-serif"
  >${escapeXml(colors.label)}</text>

  <!-- Icon badge -->
  <rect x="80" y="220" width="200" height="200" rx="24" fill="${colors.accent}" opacity="0.1"/>
  <rect x="100" y="240" width="160" height="160" rx="16" fill="${colors.accent}" opacity="0.15"/>
  <text
    x="180" y="340"
    font-size="48"
    font-weight="bold"
    fill="${colors.accent}"
    text-anchor="middle"
    font-family="ui-monospace, monospace"
  >${icon}</text>

  <!-- Title -->
  <text
    x="320" y="280"
    font-size="72"
    font-weight="bold"
    fill="white"
    font-family="system-ui, sans-serif"
  >${title}</text>

  <!-- Subtitle -->
  <text x="320" y="360" font-size="28" fill="#94a3b8" font-family="system-ui, sans-serif">${subtitle}</text>

  <!-- Divider -->
  <rect x="320" y="400" width="500" height="3" rx="1.5" fill="${colors.accent}" opacity="0.5"/>

  <!-- WTools branding -->
  <text x="320" y="460" font-size="22" fill="#64748b" font-family="system-ui, sans-serif">wtools.pages.dev</text>

  <!-- Decorative elements -->
  <circle cx="1050" cy="100" r="200" fill="${colors.accent}" opacity="0.03"/>
  <circle cx="1150" cy="580" r="250" fill="${colors.accent}" opacity="0.03"/>
  <text
    x="950" y="550"
    font-size="280"
    font-weight="bold"
    fill="${colors.accent}"
    opacity="0.04"
    font-family="ui-monospace, monospace"
  >W</text>
</svg>`;
}

generateOGImages().catch(console.error);

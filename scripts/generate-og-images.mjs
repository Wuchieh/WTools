#!/usr/bin/env node
/**
 * Generate OG images for WTools homepage and each tool page.
 * Uses sharp to create 1200x630 PNG images from SVG templates.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'public', 'og');
mkdirSync(outputDir, { recursive: true });

const tools = [
    { id: 'base64-tool', title: 'Base64 Encoder', subtitle: 'Encode & decode text in Base64', icon: 'B64' },
    { id: 'base64-file', title: 'Base64 File', subtitle: 'Encode files to Base64 or decode back', icon: 'B64' },
    { id: 'batch-rename', title: 'Batch Rename', subtitle: 'Rename multiple files at once', icon: 'RN' },
    { id: 'binary-calc', title: 'Base Converter', subtitle: 'Binary, Decimal, Hexadecimal converter', icon: '02' },
    { id: 'color-picker', title: 'Color Picker', subtitle: 'Pick colors and convert HEX, RGB, HSL', icon: 'CLR' },
    { id: 'cron-parser', title: 'Cron Parser', subtitle: 'Parse cron expressions', icon: 'CRN' },
    { id: 'css-formatter', title: 'CSS Formatter', subtitle: 'Format and beautify CSS code', icon: 'CSS' },
    { id: 'csv-viewer', title: 'CSV Viewer', subtitle: 'View and convert CSV/TSV data', icon: 'CSV' },
    { id: 'enc-dec-text', title: 'Text Encrypt/Decrypt', subtitle: 'Caesar cipher and ROT13 encryption', icon: 'CAESAR' },
    { id: 'file-size', title: 'File Size', subtitle: 'Convert bytes to various size units', icon: 'B' },
    { id: 'gif-editor', title: 'GIF Editor', subtitle: 'Resize and convert GIF images', icon: 'GIF' },
    { id: 'hash-checker', title: 'Hash Checker', subtitle: 'Compute MD5, SHA1, SHA256 hashes', icon: '#' },
    { id: 'hash-generator', title: 'Hash Generator', subtitle: 'Generate MD5, SHA1, SHA256 hashes', icon: '#' },
    { id: 'html-escape', title: 'HTML Escape', subtitle: 'HTML entity escape and unescape', icon: '<>' },
    { id: 'ico-generator', title: 'ICO Generator', subtitle: 'Convert images to ICO/favicon', icon: 'ICO' },
    { id: 'image-compress', title: 'Image Compressor', subtitle: 'Compress images locally', icon: 'IMG' },
    { id: 'image-crop', title: 'Image Cropper', subtitle: 'Crop images with aspect ratio options', icon: 'CROP' },
    { id: 'image-heic', title: 'HEIC Converter', subtitle: 'Convert HEIC/HEIF to JPG or PNG', icon: 'HEIC' },
    { id: 'image-rotate', title: 'Image Rotate', subtitle: 'Rotate and flip images', icon: 'RT' },
    { id: 'image-to-webp', title: 'Image to WebP', subtitle: 'Convert images to WebP locally', icon: 'WEBP' },
    { id: 'image-watermark', title: 'Image Watermark', subtitle: 'Add text watermarks to photos', icon: 'WM' },
    { id: 'index', title: 'WTools', subtitle: 'A collection of useful browser tools', icon: 'WT' },
    { id: 'json-formatter', title: 'JSON Formatter', subtitle: 'Format, minify and validate JSON', icon: '{}' },
    { id: 'json-yaml', title: 'JSON/YAML Converter', subtitle: 'Convert between JSON and YAML', icon: 'YAML' },
    { id: 'jwt-decoder', title: 'JWT Decoder', subtitle: 'Decode JWT tokens', icon: 'JWT' },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', subtitle: 'Generate placeholder text', icon: 'LOREM' },
    { id: 'markdown-preview', title: 'Markdown Preview', subtitle: 'Live preview Markdown documents', icon: 'MD' },
    { id: 'password-generator', title: 'Password Generator', subtitle: 'Generate secure random passwords', icon: '***' },
    { id: 'percentage-calc', title: 'Percentage Calculator', subtitle: 'Percentage calculation tool', icon: '%' },
    { id: 'qr-generator', title: 'QR Generator', subtitle: 'Generate QR Code images', icon: 'QR' },
    { id: 'qr-reader', title: 'QR Reader', subtitle: 'Read QR Code from image or camera', icon: 'QR' },
    { id: 'random-picker', title: 'Random Picker', subtitle: 'Randomly pick items from a list', icon: 'RND' },
    { id: 'regex-tester', title: 'Regex Tester', subtitle: 'Test regular expressions', icon: '.*' },
    { id: 'sentence-counter', title: 'Sentence Counter', subtitle: 'Count sentences in text', icon: 'ABC' },
    { id: 'slug-generator', title: 'Slug Generator', subtitle: 'Convert text to URL-friendly slugs', icon: 'SLUG' },
    { id: 'svg-convert', title: 'SVG Converter', subtitle: 'Convert SVG to PNG, JPG, WebP', icon: 'SVG' },
    { id: 'text-diff', title: 'Text Diff', subtitle: 'Compare differences between texts', icon: 'DIFF' },
    { id: 'timer', title: 'Timer', subtitle: 'Countdown timer', icon: 'T' },
    { id: 'timestamp', title: 'Timestamp', subtitle: 'Unix timestamp conversion', icon: 'TS' },
    { id: 'todo-list', title: 'Todo List', subtitle: 'Simple todo list', icon: 'TODO' },
    { id: 'unit-converter', title: 'Unit Converter', subtitle: 'Convert length, weight, temperature', icon: 'U' },
    { id: 'url-encoder', title: 'URL Encoder', subtitle: 'URL encode and decode', icon: 'URL' },
    { id: 'uuid-generator', title: 'UUID Generator', subtitle: 'Generate UUID v4 and v7', icon: 'UUID' },
    { id: 'whip-stream', title: 'WHIP Stream', subtitle: 'Push WebRTC streams via WHIP', icon: 'LIVE' },
    { id: 'word-counter', title: 'Word Counter', subtitle: 'Count words, characters, lines', icon: 'W' },
];

const categoryColors = {
    home:   { bg: '#0f0f23', accent: '#6C63FF', label: 'All Tools' },
    image:  { bg: '#0f1f0f', accent: '#4CAF50', label: 'Image' },
    text:   { bg: '#0f1f2f', accent: '#2196F3', label: 'Text' },
    developer: { bg: '#1f1f0f', accent: '#FF9800', label: 'Developer' },
    utility: { bg: '#1f0f1f', accent: '#9C27B0', label: 'Utility' },
};

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
  <text x="150" y="84" font-size="16" font-weight="600" fill="${colors.accent}" text-anchor="middle" font-family="system-ui, sans-serif">${escapeXml(colors.label)}</text>

  <!-- Icon badge -->
  <rect x="80" y="220" width="200" height="200" rx="24" fill="${colors.accent}" opacity="0.1"/>
  <rect x="100" y="240" width="160" height="160" rx="16" fill="${colors.accent}" opacity="0.15"/>
  <text x="180" y="340" font-size="48" font-weight="bold" fill="${colors.accent}" text-anchor="middle" font-family="ui-monospace, monospace">${icon}</text>

  <!-- Title -->
  <text x="320" y="280" font-size="72" font-weight="bold" fill="white" font-family="system-ui, sans-serif">${title}</text>

  <!-- Subtitle -->
  <text x="320" y="360" font-size="28" fill="#94a3b8" font-family="system-ui, sans-serif">${subtitle}</text>

  <!-- Divider -->
  <rect x="320" y="400" width="500" height="3" rx="1.5" fill="${colors.accent}" opacity="0.5"/>

  <!-- WTools branding -->
  <text x="320" y="460" font-size="22" fill="#64748b" font-family="system-ui, sans-serif">wtools.pages.dev</text>

  <!-- Decorative elements -->
  <circle cx="1050" cy="100" r="200" fill="${colors.accent}" opacity="0.03"/>
  <circle cx="1150" cy="580" r="250" fill="${colors.accent}" opacity="0.03"/>
  <text x="950" y="550" font-size="280" font-weight="bold" fill="${colors.accent}" opacity="0.04" font-family="ui-monospace, monospace">W</text>
</svg>`;
}

async function generateOGImages() {
    const sharp = (await import('./node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js')).default;

    for (const tool of tools) {
        const svg = generateSVG(tool);
        const svgBuffer = Buffer.from(svg, 'utf-8');
        const outputPath = join(outputDir, `${tool.id}.png`);

        await sharp(svgBuffer)
            .png()
            .toFile(outputPath);

        console.log(`Generated: public/og/${tool.id}.png`);
    }

    console.log(`\nAll ${tools.length} OG images generated in ${outputDir}`);
}

generateOGImages().catch(console.error);

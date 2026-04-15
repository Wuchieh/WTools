// ============================================================================
// Text Processing Services
// Pure business logic for text operations - no UI dependencies
// ============================================================================

import {
    createError,
    getErrorMessage,
} from '~/types';

// ----------------------------------------------------------------------------
// Lorem Ipsum Generator
// ----------------------------------------------------------------------------

export type LoremFormat = 'html' | 'plain' | 'text';

export interface LoremOptions {
    count: number;
    format: LoremFormat;
    units: 'paragraphs' | 'sentences' | 'words';
}

const LOREM_WORDS = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
    'pellentesque',
    'habitant',
    'morbi',
    'tristique',
    'senectus',
    'netus',
    'malesuada',
    'famesac',
    'turpis',
    'egestas',
    'proin',
    'sagittis',
    'nisl',
    'rhoncus',
    'mattis',
    'massa',
    'vitae',
    'tortor',
    'condimentum',
    'lacinia',
    'quis',
    'vel',
    'eros',
    'donec',
    'odio',
];

export interface RegexMatch {
    groups: null | Record<string, string>;
    index: number;
    match: string;
}

export interface TextStats {
    characters: number;
    charactersNoSpaces: number;
    paragraphs: number;
    readingTime: number; // minutes
    sentences: number;
    words: number;
}

export function analyzeText(text: string): TextStats {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Count words (sequences of non-whitespace)
    const wordMatches = text.match(/\S+/g);
    const words = wordMatches ? wordMatches.length : 0;

    // Count sentences (ending with . ! or ?)
    const sentenceMatches = text.match(/[.!?]+(?:\s|$)/g);
    const sentences = sentenceMatches ? sentenceMatches.length : 0;

    // Count paragraphs (separated by blank lines or newlines)
    const paragraphMatches = text.match(/(?:^|\n\n)(.+?)(?:\n\n|$)/gs);
    const paragraphs = paragraphMatches ? paragraphMatches.length : text.trim().length > 0 ? 1 : 0;

    // Reading time: average 200 words per minute
    const readingTime = words / 200;

    return {
        characters,
        charactersNoSpaces,
        paragraphs,
        readingTime: Math.round(readingTime * 10) / 10,
        sentences,
        words,
    };
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function decodeBase64(encoded: string): string {
    try {
        const binary = atob(encoded.trim());
        const bytes = Array.from(binary).map((c) => c.charCodeAt(0));
        return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (e) {
        throw createError('DECODE_FAILED', `Base64 decode failed: ${getErrorMessage(e)}`);
    }
}

export function decodeUrlComponent(text: string): string {
    try {
        return decodeURIComponent(text);
    } catch (e) {
        throw createError('DECODE_FAILED', `URL decode failed: ${getErrorMessage(e)}`);
    }
}

// ----------------------------------------------------------------------------
// URL Encoder/Decoder
// ----------------------------------------------------------------------------

export function decodeUrlFull(text: string): string {
    try {
        return decodeURI(text);
    } catch (e) {
        throw createError('DECODE_FAILED', `URL decode failed: ${getErrorMessage(e)}`);
    }
}

export function encodeBase64(text: string): string {
    // Handle unicode characters
    const bytes = new TextEncoder().encode(text);
    const binary = Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join('');
    return btoa(binary);
}

export function encodeUrlComponent(text: string): string {
    return encodeURIComponent(text);
}

export function encodeUrlFull(text: string): string {
    return encodeURI(text);
}

// ----------------------------------------------------------------------------
// Base64 Encoder/Decoder
// ----------------------------------------------------------------------------

export function formatJson(json: string, indent = 2): string {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed, null, indent);
    } catch (e) {
        throw createError('INVALID_JSON', `JSON parse failed: ${getErrorMessage(e)}`);
    }
}

export async function generateHash(
    text: string,
    algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256',
): Promise<string> {
    try {
        const bytes = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        throw createError('HASH_FAILED', `Hash generation failed: ${getErrorMessage(e)}`);
    }
}

// ----------------------------------------------------------------------------
// Hash Generator (SHA-256)
// ----------------------------------------------------------------------------

export function generateLoremIpsum(options: LoremOptions): string {
    const {
        count,
        format,
        units,
    } = options;

    let wordCount: number;
    switch (units) {
        case 'sentences':
            wordCount = count * 15; // ~15 words per sentence average
            break;
        case 'words':
            wordCount = count;
            break;
        case 'paragraphs':
        default:
            wordCount = count * 100; // ~100 words per paragraph average
            break;
    }

    const words = generateWords(wordCount);
    const isHtml = format === 'html';

    switch (units) {
        case 'sentences': {
            const sentences = wordsToSentences(words, count);
            const content = sentences.map((s) => isHtml ? `<span>${s}</span> ` : `${s} `).join('');
            return isHtml ? `<p>${content.trim()}</p>` : content.trim();
        }

        case 'words': {
            const text = wordsToText(words, format);
            return isHtml ? `<p>${text}</p>` : text;
        }

        case 'paragraphs':
        default: {
            const paragraphs: string[] = [];
            const wordsPerParagraph = Math.ceil(wordCount / count);

            for (let p = 0; p < count; p++) {
                const start = p * wordsPerParagraph;
                const end = Math.min(start + wordsPerParagraph, words.length);
                const paraWords = words.slice(start, end);
                const paraText = wordsToSentences(paraWords, 5).join(' ');
                paragraphs.push(isHtml ? `<p>${paraText}</p>` : paraText);
            }

            return paragraphs.join(isHtml ? '\n' : '\n\n');
        }
    }
}

// ----------------------------------------------------------------------------
// Slug Generator
// ----------------------------------------------------------------------------

export function generateSlug(text: string, delimiter = '-'): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/gi, delimiter)
        .replace(new RegExp(`^${delimiter}+|${delimiter}+$`, 'g'), ''); // Trim delimiters
}

// ----------------------------------------------------------------------------
// Word/Character Counter
// ----------------------------------------------------------------------------

function generateWords(count: number): string[] {
    return Array.from({ length: count }, () => getRandomWord());
}

function getRandomWord(): string {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)] ?? 'lorem';
}

// ----------------------------------------------------------------------------
// Regex Tester
// ----------------------------------------------------------------------------

export function minifyJson(json: string): string {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed);
    } catch (e) {
        throw createError('INVALID_JSON', `JSON parse failed: ${getErrorMessage(e)}`);
    }
}

export function testRegex(pattern: string, flags: string, text: string): RegexMatch[] {
    try {
        const regex = new RegExp(pattern, flags);
        const matches: RegexMatch[] = [];

        if (flags.includes('g')) {
            let match: null | RegExpExecArray = regex.exec(text);
            for (; match !== null; match = regex.exec(text)) {
                matches.push({
                    groups: match.groups ?? null,
                    index: match.index,
                    match: match[0],
                });
                // Prevent infinite loop for zero-length matches
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
            }
        } else {
            const match = regex.exec(text);
            if (match) {
                matches.push({
                    groups: match.groups ?? null,
                    index: match.index,
                    match: match[0],
                });
            }
        }

        return matches;
    } catch (e) {
        throw createError('INVALID_REGEX', `Regex error: ${getErrorMessage(e)}`);
    }
}

// ----------------------------------------------------------------------------
// JSON Formatter/Minifier
// ----------------------------------------------------------------------------

function wordsToSentences(words: string[], sentences: number): string[] {
    const result: string[] = [];
    let currentSentence: string[] = [];
    let wordCount = 0;
    const avgWordsPerSentence = Math.ceil(words.length / sentences);

    for (const word of words) {
        currentSentence.push(word);
        wordCount++;

        // End sentence if we've reached average words and have enough for current sentence
        const shouldEnd = wordCount >= avgWordsPerSentence && currentSentence.length > 3;
        const isLastWord = word === words[words.length - 1];

        if (shouldEnd || isLastWord) {
            result.push(wordsToText(currentSentence, 'plain'));
            currentSentence = [];
            wordCount = 0;
        }
    }

    // Add remaining words as final sentence
    if (currentSentence.length > 0) {
        result.push(wordsToText(currentSentence, 'plain'));
    }

    return result;
}

function wordsToText(words: string[], _format: 'html' | 'plain' | 'text'): string {
    if (words.length === 0) return '';
    const text = words.map((w, i) => i === 0 ? capitalize(w) : w).join(' ');
    return `${text}.`;
}

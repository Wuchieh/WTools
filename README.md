# WTools - Online Tools

A collection of useful online tools built with Nuxt 3, Vuetify 3, and Pinia.

## Features

- **Image Tools** - Compress, resize, crop, convert, watermark, HEIC support
- **Text Tools** - Lorem Ipsum, URL encode/decode, Base64, Hash, Slug, Regex tester, JSON formatter
- **Development Tools** - Color converter, QR code generator, and more

## Tech Stack

- Nuxt 3 (Vue 3 + Nitro)
- Vuetify 3 (Material Design)
- Pinia (State Management)
- UnoCSS (Atomic CSS)
- Cloudflare Pages (Hosting)
- TypeScript

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Start the development server at `http://localhost:3000`

## Build

```bash
pnpm build
```

## Preview

```bash
pnpm preview
```

## Deploy

Built files are deployed to Cloudflare Pages automatically via CI/CD.

## Project Structure

```
app/
├── components/     # Vue components
│   └── Tool/       # Reusable tool UI components
├── composables/     # Vue composables
├── pages/          # Route pages
├── services/       # Business logic layer
│   ├── image/      # Image processing
│   └── text/       # Text processing
├── stores/         # Pinia stores
└── types/          # TypeScript type definitions
```

## License

MIT

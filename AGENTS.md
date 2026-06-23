# AGENTS.md

## Project

Nuxt 4 project with Nuxt UI v4 and Tailwind CSS 4. Single `app/` directory, no monorepo.

## Commands

```bash
pnpm dev          # dev server at http://localhost:3000
pnpm build        # production build
pnpm preview      # preview production build locally
pnpm lint         # ESLint
pnpm typecheck    # nuxt typecheck (vue-tsc)
```

Verify changes with `pnpm lint` then `pnpm typecheck` (lint first — generated config must exist).

## Generated config

- ESLint imports from `./.nuxt/eslint.config.mjs` — requires `nuxt prepare` (runs on `postinstall`).
- TypeScript references `./.nuxt/tsconfig.*.json` — same prerequisite.
- If lint or typecheck fails after a fresh clone, run `pnpm install` (which triggers `nuxt prepare`).

## Code conventions

- 2-space indent, LF line endings (see `.editorconfig`)
- ESLint stylistic: `commaDangle: 'never'`, `braceStyle: '1tbs'`
- Vue SFCs prefer `<template>`-only; add `<script setup>` only when logic is needed
- Nuxt auto-imports components and composables — no manual imports

## Architecture

- `app/app.vue` — root layout, wraps pages in `<UApp>`
- `app/pages/` — file-based routing; home page (`/`) is prerendered
- `app/components/` — auto-imported components
- `app/assets/css/main.css` — Tailwind imports + theme tokens
- `app/app.config.ts` — Nuxt UI config: primary `green`, neutral `slate`
- Google Fonts provider is disabled (`nuxt.config.ts`); only system fonts are used (`--font-sans` in `main.css`)

## Language

All user-facing text (UI labels, placeholders, hints, error messages, server responses) must be written in Chinese. Only code identifiers, technical config keys, and terminal commands remain in English.

## Responsive (Web + H5)

All styles and layouts must be compatible with both desktop web and mobile H5 viewports. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for breakpoint-specific styles. Avoid fixed pixel widths that break on narrow screens. Nuxt UI v4 components are responsive by default — avoid overriding their responsive behavior unless necessary.

## Dependencies

- Package manager: pnpm 11 (enforced in `package.json`)
- `pnpm-workspace.yaml` disables native builds for several packages — do not remove
- Renovate configured via `renovate.json`, extends nuxt config

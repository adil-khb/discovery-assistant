# Discovery Assistant + Adil's portfolio

Two independent static React sites, built from the supplied `codex-prompts.md` brief.

## Local development

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev:discovery
npm run dev:portfolio
npm test
npm run build
```

The development URLs are http://127.0.0.1:5173 and http://127.0.0.1:5174. Build outputs are `dist/discovery` and `dist/portfolio`; relative asset paths support GitHub Pages project URLs.

## Discovery Assistant

All 39 seed questions are preserved verbatim. A fictional 420-person company provides 36 sample answers and three outstanding items. Users can create a session, edit responses, mark items not applicable, add custom questions, and export Markdown, plain text, or Word documents. Checklist notes without a decision remain outstanding and their notes are retained in the document.

`discovery/src/model.js` handles progress and storage validation. `discovery/src/brd.js` contains the isolated, deterministic document generator and export adapters. No backend, login, AI service, analytics, or external answer transmission is used. Fonts are requested from Google Fonts; all application dependencies are bundled locally. Browser storage is scoped to the site origin and browser profile. Starting a new session replaces the current session after an explicit warning; export first if it must be retained.

For a future LLM integration, replace the isolated generator contract with a provider behind a secure server-side proxy. Never put an API secret in a static website. GitHub Pages cannot itself host that proxy.

## Portfolio

Existing project content was recovered from the public portfolio's `assets/js/project-data.js`. All 28 titles, descriptions, and destination links are preserved. Automation case studies avoid unverified metrics. The featured image is a screenshot of the actual Discovery Assistant.

## GitHub Pages

Each site is deployed independently: `adil-khb/discovery-assistant` and `adil-khb/-portfolio`. Each repository serves its built site from `main` → `/docs`. The source and lockfile are included for maintainability. Build the relevant target and copy its output into that repository's `docs` directory, then commit. GitHub Pages publishes the resulting update.

The portfolio's Discovery Assistant URL is set in `portfolio/src/main.jsx`. Set `VITE_DISCOVERY_URL` at build time to override it for another deployment.

## Validation

`npm test` covers sample completeness, outstanding items, negative checklist answers, not-applicable handling, custom questions, pending notes, storage corruption, and real DOCX generation. Browser verification covers interactive capture and reload persistence, document preview, downloads, and responsive layouts.

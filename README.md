# Discovery Assistant

A fully client-side HCM discovery questionnaire and Business Requirements Document generator.

Live app: https://adil-khb.github.io/discovery-assistant/

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev:discovery
npm test
npm run build
```

The preview runs at http://127.0.0.1:5173. The production build is written to `dist/discovery`. Copy that directory’s contents into `docs` and commit to publish through GitHub Pages (`main` → `/docs`).

## Architecture

- `discovery/src/questions.js`: all 39 original seed questions and stable identifiers.
- `discovery/src/model.js`: fictional sample session, answer status, local storage validation, and custom questions.
- `discovery/src/brd.js`: isolated template generator, Markdown/plain-text formatting, and real Word export through the bundled `docx` library.
- `discovery/src/main.jsx`: live capture, category navigation, progress, accessible dialogs, and exports.
- `shared/base.css`: common typography and near-black/teal design tokens.

A sample session contains 36 answers and three outstanding items. Negative checklist responses count as answered; notes without a decision remain outstanding. Not-applicable items are recorded separately. User answers never leave the browser. Browser storage is shared by users of the same profile; starting another session replaces it after a warning. Fonts load from Google Fonts; application dependencies are bundled locally.

The generator is intentionally rule-based and isolated for a future provider integration. An LLM would need a secure server-side proxy outside GitHub Pages. Never embed secret API keys in this static app.

The questionnaire draws inspiration from a published HCM selection framework, adapted to an interactive discovery workflow. The company and all sample answers are fictional.

## Validation

Five automated tests cover progress and outstanding items, Yes/No/Partial semantics, not-applicable answers, custom questions, notes retention, saved-session recovery, and DOCX generation. Browser checks cover editing, refresh persistence, custom questions, clipboard copy, document preview, Word download, and mobile overflow.

# Database-backed Console Translations

Console strings were JSON files in `apps/console/i18n/locales/`, so fixing a word took a PR and a deploy, and Greek speakers on staff could not help. Spec: #344 (CORE-386).

## Decision

- **Code owns keys.** Developers add a key and its English text in `packages/shared/src/translations/en/*.json`. Staff edit values in the adminboard but cannot create keys, because a key no code uses does nothing.
- **`en` and `el` are both editable.** The English in the repo is the default; an English edit saved in the adminboard overrides it, so copy fixes need no deploy.
- **Languages are fixed in code** (`TRANSLATION_LOCALES`). The `Translation` table accepts any locale string, so adding a language later is a one-line change plus translations.
- **Edits go live on save.** There is no publish step. Clinicians see them on the next page load, through the public `translation.bundle` procedure (public so `(auth)` pages can load it before sign-in).
- **Agents draft the Greek, people approve it.** The agent that adds a key also writes its Greek draft in `translations/el/*.json`. The draft is served until a Greek speaker approves or edits the key, which writes a `Translation` row. No seed.
- **Staleness is a hash.** A row stores `sourceHash`, the hash of the English it was translated from. If the English changes, the row is `outdated`.

## Consequences

- If `translation.bundle` fails, the console falls back to the catalog's English.
- Deleting a row (`translation.reset`) makes the repo default apply again.
- A test fails if a Greek draft has a key the English lacks or drops a `{{placeholder}}`.

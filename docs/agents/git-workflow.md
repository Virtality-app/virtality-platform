# Git workflow: branches and PRs

## Branches

| Branch | Role                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| `dev`  | Integration branch. Feature PRs merge here. Deploys to **staging** / preview.     |
| `main` | Production. Updated only by merging already-tested `dev` (or equivalent promote). |

There is no separate long-lived `staging` git branch: staging tracks `dev`.

## Pull requests

- **Open feature/fix/docs PRs against `dev` only.** Do not target `main`.
- After merge to `dev`, verify on staging.
- Promote to production with a simple merge (or PR) of `dev` → `main` once staging looks good.

Agents creating PRs with `gh pr create` must pass `--base dev` (or ensure the default base is `dev`). Never open a routine work PR into `main`.

The PR description names its issue on both sides (`Closes #<n>` and `CORE-<n>`, see `docs/agents/issue-tracker.md`) and ends with a `## Demo` section (see `docs/agents/demo-recordings.md`).

## PR previews

Vercel builds a preview of console, adminboard and website for every PR, served from `*.vercel.app`. You can't sign in there: the session cookie and the auth server's trusted origins only cover `*.virtality.app`. The `Alias PR Previews` workflow waits for the console and adminboard previews, points `pr-<n>-console.virtality.app` and `pr-<n>-admin.virtality.app` at them, and posts both URLs as a PR comment. It removes the aliases when the PR closes.

These previews run against the staging server, socket and database, which deploy from `dev`. A PR's own server changes and migrations aren't in its preview until it merges. Google sign-in returns to `preview-console.virtality.app`, not the PR alias; use email sign-in on PR previews.

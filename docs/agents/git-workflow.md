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

## Merging a PR

Merge locally and push `dev`. Never merge on GitHub: no Merge button, no `gh pr merge`.

GitHub marks the PR merged and closes it once the PR's head commit is on `dev`, so land the PR's own commits rather than rewritten copies:

```sh
git fetch origin
git switch <branch>
git rebase origin/dev
git push --force-with-lease origin <branch>   # the PR head now sits on top of dev
gh pr checks <branch> --watch --required      # wait for CI on that head
git push origin <branch>:dev                  # fast-forwards dev; rejected if dev moved
```

Wait for CI before the last push. Once the `dev` and `main` ruleset is on (see CI below), GitHub refuses a push whose head commit has not passed the required checks. That includes a merge commit made locally, which CI has never seen: push it to a branch first and let CI run on it.

`git push origin <branch>:dev` works when another worktree has `dev` checked out. Otherwise `git switch dev && git merge --ff-only <branch> && git push origin dev` does the same. Don't squash or rebase as part of the merge itself: the commits on `dev` would then differ from the PR's, and the PR stays open.

## CI

`.github/workflows/ci.yml` runs on every PR into `dev` or `main` and on every push to them:

| Job               | What it runs                                                                     | Required |
| ----------------- | -------------------------------------------------------------------------------- | -------- |
| `Checks`          | `pnpm format:check`, then `turbo run type-check test build`                      | Yes      |
| `Server image`    | Builds `services/server/Dockerfile` without pushing it                           | Yes      |
| `Lint (advisory)` | `turbo run lint`. ESLint errors already on `dev` keep it from being required yet | No       |

`.github/rulesets/protect-dev-and-main.json` holds the ruleset that requires the first two and blocks force-pushes and deletion on `dev` and `main`. Apply it with `gh api --method POST repos/Virtality-app/virtality-platform/rulesets --input .github/rulesets/protect-dev-and-main.json`.

## Deploys

| What                         | How it deploys                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| console, adminboard, website | Vercel's git integration: production from `main`, staging from `dev`                  |
| server                       | `.github/workflows/deploy.yml` to the VPS: staging from `dev`, production from `main` |
| team bot                     | `.github/workflows/deploy-team-bot.yml` to the VPS, from `main`                       |
| Prisma migrations            | `.github/workflows/deploy.yml`, before the server                                     |

`deploy.yml` applies pending migrations and builds the server image at the same time. It deploys the image by commit SHA only once both succeed, then waits for the container's health check (`GET /healthz`). Pushes to the same branch queue rather than run side by side. Vercel does not wait for migrations, so a migration a PR's app code needs must be backward compatible with the code already deployed.

To roll the server back, run **Deploy** from the Actions tab on `dev` or `main` with `server-image-tag` set to an earlier commit SHA. It redeploys that image without building or migrating.

## PR previews

Vercel builds a preview of console, adminboard and website for every PR, served from `*.vercel.app`. You can't sign in there: the session cookie and the auth server's trusted origins only cover `*.virtality.app`. The `Alias PR Previews` workflow waits for the console and adminboard previews, points `pr-<n>-console.virtality.app` and `pr-<n>-admin.virtality.app` at them, and posts both URLs as a PR comment. It removes the aliases when the PR closes.

These previews run against the staging server, socket and database, which deploy from `dev`. A PR's own server changes and migrations aren't in its preview until it merges. Google sign-in returns to `preview-console.virtality.app`, not the PR alias; use email sign-in on PR previews.

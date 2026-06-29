import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../../../../', import.meta.url))

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('PRD 114 email-approved pending password changes', () => {
  it('defines Pending Password Change in the console glossary', () => {
    const context = readRepoFile('apps/console/CONTEXT.md')

    expect(context).toMatch(/\*\*Pending Password Change\*\*/)
    expect(context).toMatch(/password reset/i)
    expect(context).toMatch(/_Avoid_/)
  })

  it('exposes pendingPasswordChange procedures in the oRPC router', () => {
    const router = readRepoFile('packages/orpc/src/router.ts')

    expect(router).toMatch(/pendingPasswordChange,/)
  })

  it('persists pending password changes with hashed material and lifecycle fields', () => {
    const schema = readRepoFile(
      'packages/db/console/prisma/models/pending-password-change.prisma',
    )
    const enums = readRepoFile('packages/db/console/prisma/models/enums.prisma')

    expect(schema).toMatch(/pendingPasswordHash/)
    expect(schema).toMatch(/approvalTokenHash/)
    expect(schema).toMatch(/initiatingSessionId/)
    expect(schema).toMatch(/expiresAt/)
    expect(schema).toMatch(/supersededAt/)
    expect(enums).toMatch(/SUPERSEDED/)
    expect(enums).toMatch(/CANCELLED/)
    expect(enums).toMatch(/APPROVED/)
  })

  it('sends only the approval email without a post-approval completion message', () => {
    const lifecycle = readRepoFile(
      'packages/orpc/src/procedures/pending-password-change/pending-password-change.ts',
    )
    const approveBlock =
      lifecycle.match(
        /export async function approvePendingPasswordChange[\s\S]*$/,
      )?.[0] ?? ''

    expect(readRepoFile('packages/nodemailer/src/index.ts')).toMatch(
      /sendPendingPasswordChange/,
    )
    expect(approveBlock).not.toMatch(/sendPendingPasswordChange|sendMail/)
  })

  it('uses a dedicated confirmation route separate from password reset', () => {
    const procedures = readRepoFile(
      'packages/orpc/src/procedures/pending-password-change/index.ts',
    )

    expect(procedures).toMatch(/password-setup\/confirm/)
    expect(procedures).not.toMatch(/reset-password/)
  })

  it('expires pending requests after 30 minutes', () => {
    const lifecycle = readRepoFile(
      'packages/orpc/src/procedures/pending-password-change/pending-password-change.ts',
    )

    expect(lifecycle).toMatch(
      /PENDING_PASSWORD_CHANGE_EXPIRY_MS = 30 \* 60 \* 1000/,
    )
  })

  it('documents the security design in ADR 0002', () => {
    const adr = readRepoFile(
      'docs/adr/0002-pending-password-change-security.md',
    )

    expect(adr).toMatch(/Pending Password Change/)
    expect(adr).toMatch(/token-only/i)
    expect(adr).toMatch(/latest-request-wins/i)
  })
})

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../../../../', import.meta.url))

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('PRD 133 issue 137 waitlist internal notification', () => {
  it('sends team notification from the server-side waitlist create path', () => {
    const waitlistProcedure = readRepoFile(
      'packages/orpc/src/procedures/waitlist.ts',
    )
    const createModule = readRepoFile(
      'packages/orpc/src/procedures/waitlist/waitlist-create.ts',
    )

    expect(waitlistProcedure).toMatch(/createWaitlistEntry/)
    expect(waitlistProcedure).toMatch(/sendWaitlistNotification/)
    expect(createModule).toMatch(/WAITLIST_NOTIFY_EMAIL/)
    expect(createModule).toMatch(/waitlist\.notify\.sent/)
    expect(createModule).toMatch(/waitlist\.notify\.skipped/)
  })

  it('does not send duplicate notifications for existing waitlist emails', () => {
    const createModule = readRepoFile(
      'packages/orpc/src/procedures/waitlist/waitlist-create.ts',
    )

    const createBlock =
      createModule.match(
        /export async function createWaitlistEntry[\s\S]*?^}/m,
      )?.[0] ?? ''

    expect(createBlock).toMatch(/if \(exists\)/)
    expect(createBlock.indexOf('notifyWaitlistTeam')).toBeGreaterThan(
      createBlock.indexOf('if (exists)'),
    )
  })

  it('uses a dedicated internal notification email template and sender', () => {
    expect(readRepoFile('packages/nodemailer/src/index.ts')).toMatch(
      /sendWaitlistNotification/,
    )
    expect(
      readRepoFile('packages/nodemailer/src/lib/send-waitlist-notification.ts'),
    ).toMatch(/WaitlistInternalNotificationEmail/)
    expect(
      readRepoFile(
        'packages/ui/src/components/email/waitlist-internal-notification.tsx',
      ),
    ).toMatch(/New waitlist signup/)
  })
})

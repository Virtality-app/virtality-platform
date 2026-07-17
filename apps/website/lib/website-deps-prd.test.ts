import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

type WebsitePackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

function readWebsitePackageJson(): WebsitePackageJson {
  return JSON.parse(readWebsiteFile('package.json')) as WebsitePackageJson
}

function readWebsiteDependencies(): Record<string, string> {
  return readWebsitePackageJson().dependencies ?? {}
}

function readWebsiteDevDependencies(): Record<string, string> {
  return readWebsitePackageJson().devDependencies ?? {}
}

const CONSOLE_LEFTOVER_DEPENDENCIES = ['react-resizable-panels'] as const

const UNUSED_RADIX_DEPENDENCIES = [
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-switch',
] as const

const UNUSED_PRISMA_DEPENDENCIES = [
  '@prisma/adapter-pg',
  '@prisma/client',
  'pg',
] as const

const UNUSED_PRISMA_DEV_DEPENDENCIES = ['prisma'] as const

const UNUSED_WORKSPACE_DEPENDENCIES = ['@virtality/db'] as const

const OTHER_UNUSED_DEPENDENCIES = [
  'class-variance-authority',
  'date-fns',
  'lodash.capitalize',
  'nodemailer',
  'posthog-js',
  'posthog-node',
  'react-day-picker',
  'stripe',
  'uuid',
] as const

const OTHER_UNUSED_DEV_DEPENDENCIES = ['@types/nodemailer'] as const

describe('issue #144 prune Website package.json deps unused by Website', () => {
  it.each(CONSOLE_LEFTOVER_DEPENDENCIES)(
    'drops console-leftover dependency %s after Console cleanup',
    (packageName) => {
      expect(readWebsiteDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(UNUSED_RADIX_DEPENDENCIES)(
    'drops unused radix package %s while keeping label and slot for form',
    (packageName) => {
      expect(readWebsiteDependencies()).not.toHaveProperty(packageName)
    },
  )

  it('keeps radix label and slot used by the local form component', () => {
    const dependencies = readWebsiteDependencies()
    const formSource = readWebsiteFile('components/ui/form.tsx')

    expect(dependencies).toHaveProperty('@radix-ui/react-label')
    expect(dependencies).toHaveProperty('@radix-ui/react-slot')
    expect(formSource).toMatch(/@radix-ui\/react-label/)
    expect(formSource).toMatch(/@radix-ui\/react-slot/)
  })

  it.each(UNUSED_PRISMA_DEPENDENCIES)(
    'drops unused prisma runtime dependency %s',
    (packageName) => {
      expect(readWebsiteDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(UNUSED_PRISMA_DEV_DEPENDENCIES)(
    'drops unused prisma dev dependency %s',
    (packageName) => {
      expect(readWebsiteDevDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(UNUSED_WORKSPACE_DEPENDENCIES)(
    'drops unused workspace dependency %s',
    (packageName) => {
      expect(readWebsiteDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(OTHER_UNUSED_DEPENDENCIES)(
    'drops other confirmed-unused website dependency %s',
    (packageName) => {
      expect(readWebsiteDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(OTHER_UNUSED_DEV_DEPENDENCIES)(
    'drops other confirmed-unused website dev dependency %s',
    (packageName) => {
      expect(readWebsiteDevDependencies()).not.toHaveProperty(packageName)
    },
  )

  it('keeps react-email for the waitlist email template', () => {
    const dependencies = readWebsiteDependencies()
    const emailTemplateSource = readWebsiteFile(
      'components/email/waitinglist-email.tsx',
    )

    expect(dependencies).toHaveProperty('@react-email/components')
    expect(emailTemplateSource).toMatch(/@react-email\/components/)
  })

  it('keeps website testimonials in the codebase', () => {
    expect(
      existsSync(join(websiteRoot, 'components/home/testimonials.tsx')),
    ).toBe(true)
  })
})

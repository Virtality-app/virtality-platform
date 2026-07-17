// @vitest-environment node

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const adminboardRoot = fileURLToPath(new URL('..', import.meta.url))

const REMOVED_MODULE_PATHS = [
  'components/ActionsDropDown.tsx',
  'components/FormErrors.tsx',
  'components/GenerateColumns.tsx',
  'components/HeaderTemplate.tsx',
  'components/Sidebar.tsx',
  'components/TabBar.tsx',
  'components/ToggleTheme.tsx',
  'components/UploadResource.tsx',
  'components/email/VerificationEmail.tsx',
  'components/tables/data-table-template.tsx',
  'components/ui/chart.tsx',
  'components/ui/data-table.tsx',
  'components/ui/field.tsx',
  'components/ui/form.tsx',
  'components/ui/table.tsx',
  'context/query-context.tsx',
  'lib/actions/generalActions.ts',
  'permissions.ts',
  'prisma.ts',
] as const

function adminboardFileExists(relativePath: string): boolean {
  return existsSync(join(adminboardRoot, relativePath))
}

describe('adminboard dead code island removal', () => {
  it.each(REMOVED_MODULE_PATHS)(
    'removes unreachable module %s',
    (relativePath) => {
      expect(adminboardFileExists(relativePath)).toBe(false)
    },
  )
})

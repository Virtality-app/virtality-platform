import { PROMOTED_COMPONENTS } from '@virtality/ui/contract'

const restrictedPaths = PROMOTED_COMPONENTS.flatMap((name) => [
  {
    name: `@/components/ui/${name}`,
    message: `Import promoted UI from '@virtality/ui/components/${name}' (Canonical Shared UI Import).`,
  },
])

const restrictedPatterns = PROMOTED_COMPONENTS.map((name) => ({
  group: [`**/components/ui/${name}`, `**/ui/${name}`],
  message: `Import promoted UI from '@virtality/ui/components/${name}' (Canonical Shared UI Import).`,
}))

/**
 * ESLint rules enforcing Canonical Shared UI Import for promoted components.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedPaths,
          patterns: restrictedPatterns,
        },
      ],
    },
  },
]

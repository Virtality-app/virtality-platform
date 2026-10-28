import i18next from 'eslint-plugin-i18next'
import nextConfig from '@virtality/eslint-config/next'

const USER_FACING_ATTRIBUTES = [
  'title',
  'placeholder',
  'aria-label',
  'alt',
  'label',
  'description',
]

export default [
  ...nextConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    plugins: { i18next },
    rules: {
      // Flags new hard-coded strings in JSX text, user-facing attributes and
      // toast calls. className and other non-UI strings are not checked.
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-only',
          'jsx-attributes': { include: USER_FACING_ATTRIBUTES },
          callees: {
            include: [
              'notify.success',
              'notify.error',
              'notify.info',
              'notify.attention',
            ],
          },
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    rules: {
      // Toast calls: a literal message should be a translation key.
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "CallExpression[callee.object.name='notify'][arguments.0.type=/^(Literal|TemplateLiteral)$/]",
          message:
            'Hard-coded toast message: pass a translation key, e.g. notify.success({ key: "toast.saved" }).',
        },
      ],
    },
  },
]

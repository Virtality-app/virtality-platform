import type { TOptions } from 'i18next'
import type { $ZodRawIssue } from 'zod/v4/core'

const isEmptyInput = (input: unknown) =>
  input === undefined || input === null || input === ''

const countOf = (value: unknown) => String(value)

/** Turns a Zod issue into a `validation` namespace key plus its placeholders. */
export function describeIssue(issue: $ZodRawIssue): {
  key: string
  values?: Record<string, string>
} {
  switch (issue.code) {
    case 'invalid_type':
      return { key: isEmptyInput(issue.input) ? 'required' : 'invalid_type' }
    case 'too_small': {
      if (issue.origin === 'string' && Number(issue.minimum) === 1) {
        return { key: 'required' }
      }
      const key = issue.origin === 'string' ? 'too_small_string' : 'too_small'
      return { key, values: { min: countOf(issue.minimum) } }
    }
    case 'too_big': {
      const key = issue.origin === 'string' ? 'too_big_string' : 'too_big'
      return { key, values: { max: countOf(issue.maximum) } }
    }
    case 'invalid_format':
      return {
        key: issue.format === 'email' ? 'invalid_email' : 'invalid_format',
      }
    case 'invalid_value':
      return { key: 'invalid_value' }
    default:
      return { key: 'custom' }
  }
}

/**
 * Builds the console's Zod error map. Messages are translated when the issue
 * is raised, so they follow the language selected at that moment.
 */
export function createZodErrorMap(
  t: (key: string, options?: TOptions) => string,
) {
  return (issue: $ZodRawIssue) => {
    const { key, values } = describeIssue(issue)
    return t(key, { ns: 'validation', ...values })
  }
}

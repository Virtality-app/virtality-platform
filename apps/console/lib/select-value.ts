/**
 * Wraps a Radix Select `onValueChange` so it drops `''`. Radix's hidden
 * native select fires a change with `''` while a form resets to loaded
 * values, which would wipe the saved value. None of the console's selects
 * has an empty option.
 */
export function ignoreEmptySelectValue(
  onChange: (value: string) => void,
): (value: string) => void {
  return (value) => {
    if (value) onChange(value)
  }
}

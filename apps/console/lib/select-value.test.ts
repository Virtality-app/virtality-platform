import { describe, expect, it, vi } from 'vitest'
import { ignoreEmptySelectValue } from './select-value'

describe('ignoreEmptySelectValue', () => {
  it('drops the empty value Radix fires while the form resets', () => {
    const onChange = vi.fn()
    ignoreEmptySelectValue(onChange)('')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('passes a chosen value through', () => {
    const onChange = vi.fn()
    ignoreEmptySelectValue(onChange)('female')
    expect(onChange).toHaveBeenCalledWith('female')
  })
})

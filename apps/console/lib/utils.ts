import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Exercise } from '@virtality/db'
import { v4 as uuid } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayName = (
  e?: Exercise | Pick<Exercise, 'displayName' | 'direction'>,
) => (!e ? undefined : e.displayName + ' ' + e.direction)

export const getUUID = () => {
  return uuid()
}

export const isValidNumber = (value: string | null | undefined) => {
  const isUndefined = value === undefined
  const isValueNaN = isNaN(Number(value))
  const isEmptyString = value === ''
  const isPositive = Number(value) >= 0

  return isEmptyString || (!isUndefined && !isValueNaN && isPositive)
}

export { isValidPassword } from '@virtality/shared/utils'

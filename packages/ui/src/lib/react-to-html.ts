import type { ReactNode } from 'react'
import { pretty, render, toPlainText } from 'react-email'

export const reactToHTML = async (email: ReactNode) => {
  return await pretty(await render(email))
}

export { toPlainText }

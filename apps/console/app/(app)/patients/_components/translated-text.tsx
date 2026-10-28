'use client'

import { useClientT } from '@/i18n/use-client-t'

interface TranslatedTextProps {
  /** Key in the `patients` namespace. */
  labelKey: string
  values?: Record<string, unknown>
}

/** Lets non-component code (table columns) render a reactive translation. */
const TranslatedText = ({ labelKey, values }: TranslatedTextProps) => {
  const { t } = useClientT('patients')
  return <>{t(labelKey, values)}</>
}

export default TranslatedText

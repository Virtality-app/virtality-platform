'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { useClientT } from '@/i18n/use-client-t'

interface SelectCheckboxProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  'aria-label'
> {
  /** Key in the `patients` namespace for the accessible label. */
  labelKey: string
}

/** A table selection checkbox whose label follows the current language. */
const SelectCheckbox = ({ labelKey, ...props }: SelectCheckboxProps) => {
  const { t } = useClientT('patients')
  return <Checkbox aria-label={t(labelKey)} {...props} />
}

export default SelectCheckbox

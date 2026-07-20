'use client'

import * as React from 'react'

const PHONE_MAX_WIDTH_PX = 767

export function useMosaicPhoneGate() {
  const [isPhone, setIsPhone] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH_PX}px)`)
    const onChange = () => {
      setIsPhone(mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', onChange)
    setIsPhone(mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return !!isPhone
}

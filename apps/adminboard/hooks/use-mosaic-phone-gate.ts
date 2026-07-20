'use client'

import * as React from 'react'

const PHONE_MAX_WIDTH_PX = 767

export function useMosaicPhoneGate() {
  const [isPhone, setIsPhone] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH_PX}px)`)
    const updateIsPhone = () => {
      setIsPhone(mediaQuery.matches)
    }

    updateIsPhone()
    mediaQuery.addEventListener('change', updateIsPhone)

    return () => mediaQuery.removeEventListener('change', updateIsPhone)
  }, [])

  return isPhone
}

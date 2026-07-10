'use client'

import { Button } from '@virtality/ui/components/button'
import { scrollToFinalCta } from '@/lib/scroll-to-cta'
import type { ComponentProps } from 'react'

type ScrollToCtaButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'>

const ScrollToCtaButton = ({ children, ...props }: ScrollToCtaButtonProps) => {
  return (
    <Button {...props} onClick={scrollToFinalCta}>
      {children}
    </Button>
  )
}

export default ScrollToCtaButton

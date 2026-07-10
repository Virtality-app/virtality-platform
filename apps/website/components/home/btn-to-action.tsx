'use client'
import { Button } from '@virtality/ui/components/button'
import { scrollToFinalCta } from '@/lib/scroll-to-cta'

const ButtonToAction = () => {
  return (
    <Button
      variant='link'
      onClick={scrollToFinalCta}
      className='text-white cursor-pointer text-sm p-0 h-auto underline underline-offset-2 hover:text-vital-blue-100 transition-colors font-semibold'
    >
      waitlist
    </Button>
  )
}

export default ButtonToAction

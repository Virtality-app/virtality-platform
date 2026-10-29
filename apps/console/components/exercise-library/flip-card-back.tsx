import { useClientT } from '@/i18n/use-client-t'
import { MouseEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@virtality/ui/components/card'
import { Separator } from '@virtality/ui/components/separator'
import { cn, getDisplayName } from '@/lib/utils'
import { P } from '@/components/typography'
import { Exercise } from '@virtality/db'

interface FlipCardBackProps {
  exercise: Exercise
  isSelected: boolean
  footerTitle?: string
  handleFlip: (e: MouseEvent) => void
}

const FlipCardBack = ({
  exercise,
  isSelected,
  footerTitle,
  handleFlip,
}: FlipCardBackProps) => {
  const { t } = useClientT('shared')
  const primaryLabel = footerTitle ?? getDisplayName(exercise)
  return (
    <Card
      className={cn(
        'absolute inset-0 rotate-y-180 gap-0 overflow-hidden rounded-lg p-0 transition-all backface-hidden',
        isSelected &&
          'border-vital-blue-700 dark:border-vital-blue-800 border-2 ring-2 ring-cyan-300/35 dark:ring-cyan-500/35',
      )}
    >
      <CardHeader className='p-2 text-center'>
        <P>{primaryLabel}</P>
      </CardHeader>
      <Separator />
      <CardContent className='flex-1 overflow-auto p-2'>
        <P className='text-muted-foreground text-sm'>{exercise.description}</P>
      </CardContent>
      <CardFooter className='justify-end p-2'>
        <Button variant='outline' onClick={handleFlip} type='button'>
          <RotateCcw className='mr-2 size-4 transition-transform group-hover:rotate-90' />
          {t('exerciseLibrary.flipBack')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FlipCardBack

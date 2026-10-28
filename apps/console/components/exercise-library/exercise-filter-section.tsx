import Image from 'next/image'
import { Button } from '@virtality/ui/components/button'
import { cn } from '@/lib/utils'

interface ExerciseFilterSectionProps {
  title: string
  options: string[] | undefined
  selected: string[]
  onToggle: (option: string) => void
  iconSrcFor: (option: string) => string | null | undefined
  /** Intrinsic size passed to next/image for the option icons. */
  iconSize: number
  labelFor?: (option: string) => string
  dataTour?: string
}

const ExerciseFilterSection = ({
  title,
  options,
  selected,
  onToggle,
  iconSrcFor,
  iconSize,
  labelFor = (option) => option,
  dataTour,
}: ExerciseFilterSectionProps) => {
  return (
    <div data-tour={dataTour} className='flex flex-col gap-2'>
      <h2 className='text-lg font-bold'>{title}</h2>
      <div className='mb-3 flex flex-wrap gap-2'>
        {options?.map((option) => {
          const isSelected = selected.includes(option)
          const iconSrc = iconSrcFor(option)
          return (
            <Button
              key={option}
              type='button'
              size='sm'
              variant='outline'
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              className={cn(
                'flex h-auto flex-col items-center gap-2 py-1.5',
                isSelected && 'ring-cyan-highlight ring-2',
              )}
            >
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt={option}
                  width={iconSize}
                  height={iconSize}
                  preload
                  loading='eager'
                  className='size-18 shrink-0'
                />
              ) : null}
              <span>{labelFor(option)}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default ExerciseFilterSection

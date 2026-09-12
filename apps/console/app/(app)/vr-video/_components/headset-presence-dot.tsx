import { cn } from '@/lib/utils'

export function HeadsetPresenceDot({ online }: { online: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-2 shrink-0 rounded-full',
        online ? 'bg-green-500' : 'bg-red-500',
      )}
    />
  )
}

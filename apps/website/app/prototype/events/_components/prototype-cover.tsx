import Image from 'next/image'
import { shouldBypassVercelImageOptimization } from '@virtality/shared/utils'
import { cn } from '@/lib/utils'
import type { PrototypeItem } from './prototype-items'

type PrototypeCoverProps = {
  item: PrototypeItem
  sizes: string
  className?: string
  imageClassName?: string
}

const PrototypeCover = ({
  item,
  sizes,
  className,
  imageClassName,
}: PrototypeCoverProps) => (
  <div
    className={cn(
      'relative overflow-hidden bg-slate-200 dark:bg-zinc-800',
      className,
    )}
  >
    <Image
      src={item.cover}
      alt=''
      fill
      unoptimized={shouldBypassVercelImageOptimization(item.cover)}
      sizes={sizes}
      className={cn(
        'object-cover transition-transform duration-500 group-hover:scale-[1.03]',
        imageClassName,
      )}
      style={{ objectPosition: `center ${item.coverFocusY}%` }}
    />
  </div>
)

export default PrototypeCover

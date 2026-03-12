import { Skeleton } from '@/components/ui/skeleton'

const AvatarSkeleton = () => {
  return (
    <div className='flex h-12 items-center gap-2'>
      <Skeleton className='bg-accent-foreground h-7 w-48' />
      <Skeleton className='bg-accent-foreground size-12 rounded-full' />
    </div>
  )
}

export default AvatarSkeleton

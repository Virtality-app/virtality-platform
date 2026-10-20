'use client'

import { BooleanCell } from '@/components/tables/boolean-cell'

type ExerciseMediaCellProps = {
  image: string | null
  video: string | null
}

/** Image thumbnail plus a video present/missing mark for one exercise row. */
export function ExerciseMediaCell({ image, video }: ExerciseMediaCellProps) {
  return (
    <div className='flex items-center gap-2'>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=''
          className='h-8 w-12 rounded bg-zinc-100 object-cover'
        />
      ) : (
        <span className='text-muted-foreground w-12 text-xs'>No image</span>
      )}
      <BooleanCell
        value={Boolean(video)}
        trueLabel='Has video'
        falseLabel='No video'
      />
    </div>
  )
}

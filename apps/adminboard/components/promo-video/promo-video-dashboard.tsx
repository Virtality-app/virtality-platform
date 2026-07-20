'use client'

import { Button } from '@/components/ui/button'
import { AssignPromoVideoDialog } from '@/components/promo-video/assign-promo-video-dialog'
import { ClearPromoVideoDialog } from '@/components/promo-video/clear-promo-video-dialog'
import { usePromoVideo } from '@virtality/react-query'
import { Film, Trash2 } from 'lucide-react'
import { useState } from 'react'

const PromoVideoDashboard = () => {
  const [assignOpen, setAssignOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const { data: promoVideo = null, isPending } = usePromoVideo()

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <p className='text-muted-foreground max-w-2xl text-sm'>
          Assign a Bucket MP4 to the website landing promo section. Changes go
          live immediately. Clearing hides the section without deleting the
          file.
        </p>
        <div className='ml-auto flex flex-wrap gap-2'>
          {promoVideo ? (
            <Button
              variant='outline'
              className='flex items-center'
              onClick={() => setClearOpen(true)}
            >
              <Trash2 />
              Clear
            </Button>
          ) : null}
          <Button
            variant='primary'
            className='flex items-center'
            onClick={() => setAssignOpen(true)}
          >
            <Film />
            {promoVideo ? 'Replace video' : 'Assign video'}
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className='text-muted-foreground text-sm'>Loading promo video...</p>
      ) : promoVideo ? (
        <div className='space-y-3'>
          <p
            className='text-muted-foreground truncate font-mono text-xs'
            title={promoVideo.objectKey}
          >
            {promoVideo.objectKey}
          </p>
          <div className='overflow-hidden rounded-xl border bg-black'>
            <video
              key={promoVideo.cdnUrl}
              controls
              controlsList='nodownload'
              src={promoVideo.cdnUrl}
              className='aspect-video w-full'
            />
          </div>
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>
          No promo video assigned. The landing promo section is hidden.
        </p>
      )}

      <AssignPromoVideoDialog open={assignOpen} onOpenChange={setAssignOpen} />
      <ClearPromoVideoDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        promoVideo={promoVideo}
      />
    </div>
  )
}

export default PromoVideoDashboard

import { Info } from 'lucide-react'

/** Shown until Immersive Video playback is recorded on patient sessions. */
export function VrTrackingNotice() {
  return (
    <div className='bg-muted/60 text-muted-foreground flex items-start gap-2 rounded-lg border px-4 py-3 text-sm'>
      <Info aria-hidden className='mt-0.5 size-4 shrink-0' />
      <p>
        VR video sessions aren’t recorded yet, so every session counts as
        Exercise for now. VR video fills in once video playback is saved.
      </p>
    </div>
  )
}

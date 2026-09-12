'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'
import { useUnpublishImmersiveVideo } from '@virtality/react-query'
import { toast } from 'sonner'

export function ImmersiveVideoUnpublishDialog({
  open,
  onOpenChange,
  videoId,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoId: string
  title: string
}) {
  const unpublish = useUnpublishImmersiveVideo()
  const displayTitle = title.trim() || 'Untitled'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unpublish video</DialogTitle>
          <DialogDescription>
            Unpublish '{displayTitle}'? Physios won't see it in the catalog and
            can't play it on headsets that already have it until it's published
            again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={() =>
              unpublish.mutate(
                { id: videoId },
                {
                  onSuccess: () => onOpenChange(false),
                  onError: (error) =>
                    toast.error(getErrorMessage(error, 'Failed to unpublish')),
                },
              )
            }
          >
            Unpublish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

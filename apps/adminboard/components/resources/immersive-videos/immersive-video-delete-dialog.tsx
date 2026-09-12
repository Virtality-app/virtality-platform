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
import { useDeleteImmersiveVideo } from '@virtality/react-query'
import { toast } from 'sonner'

export function ImmersiveVideoDeleteDialog({
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
  const remove = useDeleteImmersiveVideo()
  const displayTitle = title.trim() || 'Untitled'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete video</DialogTitle>
          <DialogDescription>
            Delete '{displayTitle}'? This removes it from the catalog. Physios
            can remove the file from each headset on their VR video page. This
            can't be undone.
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
            variant='destructive'
            onClick={() =>
              remove.mutate(
                { id: videoId },
                {
                  onSuccess: () => onOpenChange(false),
                  onError: (error) =>
                    toast.error(
                      getErrorMessage(error, 'Failed to delete video'),
                    ),
                },
              )
            }
          >
            Delete video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

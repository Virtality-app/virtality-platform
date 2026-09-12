'use client'

import { ExerciseWizardThumbnailControls } from '@/components/exercise-wizard/exercise-wizard-thumbnail-controls'
import { ExerciseWizardThumbnailPreview } from '@/components/exercise-wizard/exercise-wizard-thumbnail-preview'
import { useExerciseThumbnailGenerator } from '@/components/exercise-wizard/use-exercise-thumbnail-generator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getErrorMessage } from '@/lib/get-error-message'
import { exerciseThumbnailFile } from '@/lib/exercise-wizard-thumbnail'
import type { ExerciseThumbnailVideoSource } from '@/lib/exercise-wizard-thumbnail'
import { cn } from '@/lib/utils'
import { Input } from '@virtality/ui/components/input'
import { useSetImmersiveVideoThumbnail } from '@virtality/react-query'
import { Spinner } from '@virtality/ui/components/spinner'
import { Camera, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ImmersiveVideoThumbnailSection({
  videoId,
  thumbnailUrl,
  videoSource,
}: {
  videoId: string
  thumbnailUrl: string | null
  videoSource: ExerciseThumbnailVideoSource | null
}) {
  const generator = useExerciseThumbnailGenerator(videoSource)
  const setThumbnail = useSetImmersiveVideoThumbnail()
  const isBusy = generator.isBusy || setThumbnail.isPending

  const saveBlob = async (blob: Blob) => {
    const file = exerciseThumbnailFile(blob, generator.form.format)
    await setThumbnail.mutateAsync({ id: videoId, file })
    generator.clear()
    toast.success('Thumbnail saved.')
  }

  return (
    <div className='space-y-3'>
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt='Video thumbnail'
          className={cn('h-24 w-24 rounded object-cover')}
        />
      ) : null}
      <Tabs defaultValue='video'>
        <TabsList className={cn('grid w-full grid-cols-2')}>
          <TabsTrigger value='video' disabled={!videoSource}>
            From video
          </TabsTrigger>
          <TabsTrigger value='upload'>Upload image</TabsTrigger>
        </TabsList>
        <TabsContent value='video' className='space-y-3 pt-2'>
          {videoSource ? (
            <>
              <ExerciseWizardThumbnailControls
                form={generator.form}
                disabled={isBusy}
                onChange={generator.updateField}
                onOrientation={generator.applyOrientation}
              />
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isBusy}
                  onClick={() => void generator.generate()}
                >
                  {generator.isBusy ? (
                    <Spinner className='mr-2 size-4' />
                  ) : (
                    <Camera className='mr-2 size-4' />
                  )}
                  Generate thumbnail
                </Button>
                <Button
                  type='button'
                  disabled={isBusy || !generator.generated}
                  onClick={() => {
                    if (!generator.generated) return
                    void saveBlob(generator.generated.blob).catch((error) =>
                      toast.error(getErrorMessage(error, 'Thumbnail failed.')),
                    )
                  }}
                >
                  {setThumbnail.isPending ? (
                    <Spinner className='mr-2 size-4' />
                  ) : (
                    <Check className='mr-2 size-4' />
                  )}
                  Use as thumbnail
                </Button>
                <span className='text-muted-foreground text-xs'>
                  {generator.status}
                </span>
              </div>
              <ExerciseWizardThumbnailPreview
                previewUrl={generator.generated?.previewUrl ?? null}
              />
            </>
          ) : (
            <p className='text-muted-foreground text-sm'>
              Pick a video file to generate a thumbnail from it.
            </p>
          )}
        </TabsContent>
        <TabsContent value='upload' className='pt-2'>
          <Input
            type='file'
            accept='image/*'
            disabled={isBusy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setThumbnail.mutate(
                { id: videoId, file },
                {
                  onSuccess: () => toast.success('Thumbnail saved.'),
                  onError: (error) =>
                    toast.error(getErrorMessage(error, 'Thumbnail failed.')),
                },
              )
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

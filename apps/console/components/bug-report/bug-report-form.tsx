'use client'
import React, { ChangeEvent, useState } from 'react'
import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@virtality/ui/components/input'
import { SelectItem } from '@virtality/ui/components/select'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui/form'
import Image from 'next/image'
import { CheckCircle, Loader2, Trash2 } from 'lucide-react'
import { useCreateBugReport } from '@virtality/react-query'
import { type BugReportForm as BugReportFormType } from '@/lib/definitions'
import { BugReportFormSchema } from '@/lib/definitions'
import { useClientT } from '@/i18n/use-client-t'
import capitalize from 'lodash.capitalize'
import { P } from '@/components/typography'

interface BugReportFormProps {
  children: React.ReactNode
}

export const BugReportForm = ({ children }: BugReportFormProps) => {
  const { t } = useClientT(['shared', 'common'])
  const [imageFiles, setImageFiles] = useState<
    { previewUrl: string; file: File }[]
  >([])
  const [isDialogOpen, setDialogOpen] = useState(false)

  const {
    mutate: createReport,
    isPending,
    isSuccess,
    reset,
  } = useCreateBugReport({
    onSuccess: () => handleClearForm(),
  })

  const form = useForm<BugReportFormType>({
    resolver: zodResolver(BugReportFormSchema),
    defaultValues: {
      title: '',
      platform: undefined,
      description: '',
      image: undefined,
    },
  })

  const handlePhotoUpload = (
    event: ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<BugReportFormType, 'image'>,
  ) => {
    const files = Array.from(event.target.files || [])

    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader()

        reader.onload = () => {
          const previewUrl = reader.result as string
          setImageFiles((prev) => [...prev, { file, previewUrl }])
        }
        reader.readAsDataURL(file)
      })

      event.target.value = ''
    } else {
      setImageFiles([])

      field.onChange(undefined)
    }
  }

  const handlePhotoRemoval = (url: string) => {
    const newPreviewUrls = imageFiles.filter((file) => file.previewUrl !== url)
    setImageFiles(newPreviewUrls)
  }

  const handleClearForm = () => {
    form.reset()
    setImageFiles([])
  }

  const handleDialogToggle = (open: boolean) => {
    if (isSuccess) {
      reset()
    }
    setDialogOpen(open)
  }

  function onSubmit(values: BugReportFormType) {
    createReport({
      title: values.title,
      platform: values.platform,
      description: values.description,
      images: imageFiles.map((_file) => _file.file),
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-h-175 overflow-auto sm:max-w-131.25 dark:bg-zinc-900'>
        {isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                {t('bugReport.submitted', { ns: 'shared' })}{' '}
                <CheckCircle className='text-green-500' />
              </DialogTitle>
              <P>{t('bugReport.thanks', { ns: 'shared' })}</P>
              <P>{t('bugReport.hangTight', { ns: 'shared' })}</P>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>{t('btn.close')}</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('bugReport.title', { ns: 'shared' })}
              </DialogTitle>
              <DialogDescription>
                {t('bugReport.description', { ns: 'shared' })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormInput
                control={form.control}
                name='title'
                label={capitalize(t('form.title'))}
                placeholder={t('bugReport.titlePlaceholder', { ns: 'shared' })}
              />

              <FormSelect
                control={form.control}
                name='platform'
                label={capitalize(t('platform', { ns: 'glossary' }))}
                placeholder={t('bugReport.platformPlaceholder', {
                  ns: 'shared',
                })}
                triggerClassName='w-full'
              >
                <SelectItem value='web'>
                  {t('bugReport.webPlatform', { ns: 'shared' })}
                </SelectItem>
                <SelectItem value='vr'>
                  {t('bugReport.vrApplication', { ns: 'shared' })}
                </SelectItem>
              </FormSelect>

              <FormTextarea
                control={form.control}
                name='description'
                label={capitalize(t('form.description'))}
                placeholder={t('bugReport.descriptionPlaceholder', {
                  ns: 'shared',
                })}
              />

              <FormField
                control={form.control}
                name='image'
                label={t('bugReport.image', { ns: 'shared' })}
              >
                {(field) => (
                  <>
                    <label
                      htmlFor={field.id}
                      className='w-full cursor-pointer rounded-md border p-2 text-left text-sm font-medium'
                    >
                      {t('bugReport.chooseFiles', { ns: 'shared' })}
                      <span className='font-normal'>
                        {imageFiles.length === 0
                          ? ` ${t('bugReport.noFiles', { ns: 'shared' })}`
                          : ` ${t('bugReport.filesChosen', { ns: 'shared', count: imageFiles.length })}`}
                      </span>
                    </label>
                    <Input
                      id={field.id}
                      name={field.name}
                      type='file'
                      accept='image/*'
                      onChange={(event) => handlePhotoUpload(event, field)}
                      multiple
                      className='hidden'
                    />
                  </>
                )}
              </FormField>

              {imageFiles.length > 0 && (
                <div className='flex flex-wrap gap-2 pt-2'>
                  {imageFiles.map((file, index) => (
                    <div key={index} className='relative'>
                      <Image
                        src={file.previewUrl}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className='size-20 rounded-md object-cover'
                      />
                      <div
                        onClick={() => handlePhotoRemoval(file.previewUrl)}
                        className='absolute top-0 flex size-20 cursor-pointer items-center rounded-md hover:bg-zinc-200/20 [&_svg]:hidden hover:[&_svg]:block'
                      >
                        <Trash2 className='mx-auto text-red-500' />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClearForm}
                >
                  {t('btn.clear')}
                </Button>
                <Button variant='primary'>
                  {isPending ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    t('btn.submit')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

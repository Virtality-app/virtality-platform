'use client'
import { Button } from '@virtality/ui/components/button'
import { Input } from '@virtality/ui/components/input'
import { FormField } from '@/components/ui/form'
import { PatientFormInput } from '@/lib/definitions'
import { Patient } from '@virtality/db'
import { Trash2, Upload, User } from 'lucide-react'
import Image from 'next/image'
import { ChangeEvent, useState } from 'react'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import placeholder from '@/public/placeholder.svg'
import { shouldBypassVercelImageOptimization } from '@virtality/shared/utils'

interface PatientPhotoFieldProps {
  form: ReturnType<typeof useForm<PatientFormInput>>
  patient?: Patient
}

const PatientPhotoField = ({ form, patient }: PatientPhotoFieldProps) => {
  const [previewUrl, setPreviewUrl] = useState<Patient['image']>(null)
  const [hasImage, setImage] = useState(patient?.image ? true : false)
  const [isImageHovered, setIsImageHovered] = useState(false)

  const handlePhotoUpload = (
    event: ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<PatientFormInput, 'image'>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      field.onChange(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        setImage(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    setImage(false)
    form.setValue('image', null, { shouldDirty: true })
  }

  const handleMouseEnter = () => {
    if (!hasImage) return
    setIsImageHovered(true)
  }

  const handleMouseLeave = () => {
    if (!hasImage) return
    setIsImageHovered(false)
  }

  return (
    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border bg-white/80 p-2 backdrop-blur-sm dark:bg-zinc-950'>
      <div className='relative p-16'>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className='border-vital-blue-700 relative size-50 overflow-hidden rounded-full border-2 bg-slate-100 shadow-lg'
        >
          {isImageHovered && hasImage && (
            <Button
              type='button'
              size='icon'
              variant='ghost'
              onClick={removeImage}
              className='absolute z-10 size-full rounded-full text-red-500 hover:bg-zinc-500/50 hover:text-red-500'
            >
              <Trash2 className='size-6' />
            </Button>
          )}
          {hasImage ? (
            <Image
              height={200}
              width={200}
              alt='Patient'
              src={
                previewUrl
                  ? previewUrl
                  : patient?.image
                    ? patient.image
                    : placeholder
              }
              unoptimized={shouldBypassVercelImageOptimization(
                previewUrl || patient?.image,
              )}
              className='size-full object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center bg-linear-to-br from-slate-200 to-slate-300'>
              <User className='size-12 text-zinc-400' />
            </div>
          )}
        </div>
        <FormField
          control={form.control}
          name='image'
          label={<span className='sr-only'>Patient photo</span>}
          className='absolute right-20.5 bottom-20.5 z-20 w-auto'
        >
          {(field) => (
            <>
              <label
                htmlFor={field.id}
                className='cursor-pointer rounded-full bg-blue-600 p-2 text-white shadow-lg transition-colors hover:bg-blue-700'
              >
                <Upload className='size-4' />
              </label>
              <Input
                id={field.id}
                name={field.name}
                type='file'
                accept='image/*'
                capture
                onChange={(event) => handlePhotoUpload(event, field)}
                className='hidden'
              />
            </>
          )}
        </FormField>
      </div>
      <p className='text-sm text-zinc-500'>Click to upload patient photo</p>
    </div>
  )
}

export default PatientPhotoField

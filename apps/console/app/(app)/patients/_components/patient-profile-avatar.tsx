'use client'
import { ChangeEvent, useState } from 'react'
import Image from 'next/image'
import { Camera, Trash2, User } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { shouldBypassVercelImageOptimization } from '@virtality/shared/utils'
import { FormField } from '@/components/ui/form'
import { PatientFormInput } from '@/lib/definitions'
import { patientInitials } from '@/app/(app)/_components/patient-initials-avatar'
import { useClientT } from '@/i18n/use-client-t'

type PatientProfileAvatarProps = {
  form: UseFormReturn<PatientFormInput>
  /** Initials come from this; a person icon shows while it's empty. */
  name: string
  /** The stored photo, for a patient that already exists. */
  savedImage?: string | null
}

/** The patient photo, or initials. Hover to change it; a corner button removes it. */
const PatientProfileAvatar = ({
  form,
  name,
  savedImage,
}: PatientProfileAvatarProps) => {
  const { t } = useClientT('patients')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRemoved, setRemoved] = useState(false)

  const src = isRemoved ? null : (previewUrl ?? savedImage ?? null)
  const initials = patientInitials(name)

  const removePhoto = () => {
    setPreviewUrl(null)
    setRemoved(true)
    form.setValue('image', null, { shouldDirty: true })
  }

  return (
    <FormField
      control={form.control}
      name='image'
      label={<span className='sr-only'>{t('form.photoLabel')}</span>}
      // Field stretches its children to its width, so it carries the avatar's.
      className='w-19 shrink-0 gap-0'
    >
      {(field) => {
        const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          if (!file) return
          field.onChange(file)
          const reader = new FileReader()
          reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string)
            setRemoved(false)
          }
          reader.readAsDataURL(file)
        }

        return (
          <div className='group ph-sensitive relative size-19'>
            <div className='from-vital-blue-600 to-vital-blue-800 relative grid size-full place-items-center overflow-hidden rounded-full bg-linear-to-br ring-3 ring-white outline outline-zinc-200 dark:ring-zinc-900 dark:outline-zinc-700'>
              {src ? (
                <Image
                  src={src}
                  alt={t('form.photoAlt')}
                  fill
                  sizes='76px'
                  className='object-cover'
                  unoptimized={shouldBypassVercelImageOptimization(src)}
                />
              ) : initials ? (
                <span className='text-2xl font-semibold tracking-wide text-white'>
                  {initials}
                </span>
              ) : (
                <User className='size-8 text-white/80' />
              )}
              <label
                htmlFor={field.id}
                title={t('profile.changePhoto')}
                className='absolute inset-0 grid cursor-pointer place-items-center rounded-full bg-zinc-950/55 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'
              >
                <Camera className='size-5' />
                <span className='sr-only'>{t('profile.changePhoto')}</span>
              </label>
            </div>
            <input
              id={field.id}
              name={field.name}
              type='file'
              accept='image/*'
              onChange={onFileChange}
              className='sr-only'
            />
            {src && (
              <button
                type='button'
                onClick={removePhoto}
                title={t('profile.removePhoto')}
                className='absolute -right-1 -bottom-1 grid size-6.5 place-items-center rounded-full border border-zinc-200 bg-white text-red-600 opacity-0 shadow-sm transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950'
              >
                <Trash2 className='size-3.5' />
                <span className='sr-only'>{t('profile.removePhoto')}</span>
              </button>
            )}
          </div>
        )
      }}
    </FormField>
  )
}

export default PatientProfileAvatar

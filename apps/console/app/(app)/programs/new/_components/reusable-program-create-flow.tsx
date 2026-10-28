'use client'

import { useState } from 'react'
import { Button } from '@virtality/ui/components/button'
import { H2, P } from '@/components/typography'
import { useClientT } from '@/i18n/use-client-t'
import { useRouter } from 'next/navigation'
import { ExerciseLibraryProvider } from '@/context/exercise-library-context'
import type { CompleteReusableProgram } from '@/types/models'
import ReusableProgramFormView from './reusable-program-form'
import StarterTemplatePicker from './starter-template-picker'

type CreateStep = 'choice' | 'template-picker' | 'editor'

type EditorSource =
  | { kind: 'scratch' }
  | { kind: 'template'; template: CompleteReusableProgram }

const ReusableProgramCreateFlow = () => {
  const router = useRouter()
  const { t } = useClientT(['programs', 'common'])
  const [step, setStep] = useState<CreateStep>('choice')
  const [editorSource, setEditorSource] = useState<EditorSource | null>(null)

  const handleCancel = () => router.push('/programs')

  if (step === 'choice') {
    return (
      <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
        <div>
          <H2>{t('create.title')}</H2>
          <P>{t('create.description')}</P>
        </div>

        <div data-tour='program-choice' className='grid gap-4 md:grid-cols-2'>
          <button
            type='button'
            className='hover:bg-accent flex flex-col gap-2 rounded-lg border p-6 text-left transition-colors'
            onClick={() => {
              setEditorSource({ kind: 'scratch' })
              setStep('editor')
            }}
          >
            <span className='text-lg font-medium'>
              {t('create.scratchTitle')}
            </span>
            <span className='text-muted-foreground text-sm'>
              {t('create.scratchDescription')}
            </span>
          </button>

          <button
            type='button'
            className='hover:bg-accent flex flex-col gap-2 rounded-lg border p-6 text-left transition-colors'
            onClick={() => setStep('template-picker')}
          >
            <span className='text-lg font-medium'>
              {t('create.templateTitle')}
            </span>
            <span className='text-muted-foreground text-sm'>
              {t('create.templateDescription')}
            </span>
          </button>
        </div>

        <div>
          <Button onClick={handleCancel}>{t('common:btn.cancel')}</Button>
        </div>
      </div>
    )
  }

  if (step === 'template-picker') {
    return (
      <StarterTemplatePicker
        onCancel={handleCancel}
        onBack={() => setStep('choice')}
        onContinue={(template) => {
          setEditorSource({ kind: 'template', template })
          setStep('editor')
        }}
      />
    )
  }

  if (step === 'editor' && editorSource) {
    return (
      <ExerciseLibraryProvider>
        <ReusableProgramFormView
          editorSource={editorSource}
          onBack={() => {
            if (editorSource.kind === 'template') {
              setStep('template-picker')
              return
            }
            setStep('choice')
          }}
        />
      </ExerciseLibraryProvider>
    )
  }

  return null
}

export default ReusableProgramCreateFlow

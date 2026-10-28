'use client'

import { Button } from '@virtality/ui/components/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClientT } from '@/i18n/use-client-t'
import { redirect, useRouter } from 'next/navigation'
import { H2, P } from '@/components/typography'
import ExerciseLibraryList from '@/components/exercise-library/exercise-library-list'
import ExerciseGrid from '@/components/exercise-library/exercise-grid'
import { FormInput } from '@/components/ui/form'
import LoadingScreen from '@/components/feedback/loading-screen'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import { useEffect } from 'react'
import {
  getQueryClient,
  useExercise,
  useORPC,
  useReusableProgram,
  useUpdateReusableProgram,
  useUpdateReusableProgramExercises,
} from '@virtality/react-query'
import { withRom } from '@/lib/with-rom'
import {
  reusableProgramExercisesForCatalogSeed,
  reusableProgramMetadataForEdit,
} from '@/lib/reusable-program-edit-seed'
import { notify } from '@/lib/notify'
import {
  ReusableProgramFormSchema,
  type ReusableProgramForm,
  canSubmitReusableProgram,
  isStarterTemplateProgram,
  reusableProgramExercisesForEditSubmit,
} from '@/lib/program-library-submit'
import { useCatalogFirstAuthoringFlow } from '@/hooks/use-catalog-first-authoring-flow'

interface ReusableProgramEditFormProps {
  programId: string
}

const PAGE_SHELL_CLASSNAME =
  'h-screen-with-nav container mx-auto flex flex-col gap-6 p-4'

const ReusableProgramEditForm = ({
  programId,
}: ReusableProgramEditFormProps) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const { state, handler } = useExerciseLibrary()
  const { selectedExercises, deferredRemovalIds } = state
  const { updateExercises } = handler
  const { t } = useClientT(['programs', 'common'])
  const { data: exercises, isLoading: isLoadingExercises } = useExercise()
  const { isCatalogStep, isSelectedListStep, goToSelectedList, goToCatalog } =
    useCatalogFirstAuthoringFlow()

  const { data: existingProgram, isLoading } = useReusableProgram({
    id: programId,
  })

  const { mutate: updateProgram, isPending: isUpdating } =
    useUpdateReusableProgram({})

  const { mutate: updateProgramExercises, isPending: isUpdatingExercises } =
    useUpdateReusableProgramExercises({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.list.key(),
        })
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.find.key({ input: { id: programId } }),
        })
        router.push('/programs')
      },
    })

  useEffect(() => {
    if (!existingProgram || !exercises) return

    if (isStarterTemplateProgram(existingProgram)) {
      notify.error(t('editor.starterTemplateLocked'))
      router.replace('/programs')
      return
    }

    const seededExercises = reusableProgramExercisesForCatalogSeed(
      existingProgram.exercises,
      exercises,
    )

    updateExercises(withRom(seededExercises))
    // Seed once when the edit form opens; keyed on program id and catalog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProgram?.id, exercises])

  const form = useForm<ReusableProgramForm>({
    resolver: zodResolver(ReusableProgramFormSchema),
    defaultValues: { name: '' },
    values: {
      name: existingProgram
        ? reusableProgramMetadataForEdit(existingProgram).name
        : '',
    },
  })

  const onSubmit = (values: ReusableProgramForm) => {
    if (!existingProgram || isStarterTemplateProgram(existingProgram)) return

    const submitCheck = canSubmitReusableProgram(
      values.name,
      selectedExercises,
      deferredRemovalIds,
    )

    if (submitCheck.ok === false) {
      if (submitCheck.reason === 'exercises') {
        return notify.error(t('editor.noExercisesError'))
      }
      return
    }

    const programExercises = reusableProgramExercisesForEditSubmit(
      selectedExercises,
      deferredRemovalIds,
      programId,
    )

    updateProgram({ id: programId, name: values.name.trim() })
    updateProgramExercises({
      reusableProgramId: programId,
      exercises: programExercises,
    })
  }

  const handleCancel = () => redirect('/programs')

  const showProgramNameField = isSelectedListStep

  let secondaryNav: { onClick: () => void; label: string }
  if (isCatalogStep) {
    secondaryNav = { onClick: goToSelectedList, label: t('common:btn.back') }
  } else {
    secondaryNav = { onClick: handleCancel, label: t('common:btn.cancel') }
  }

  if (isLoading || isLoadingExercises || isUpdating || isUpdatingExercises) {
    return (
      <div className={PAGE_SHELL_CLASSNAME}>
        <LoadingScreen />
      </div>
    )
  }

  if (!existingProgram || isStarterTemplateProgram(existingProgram)) {
    return null
  }

  if (isSelectedListStep) {
    return (
      <div className={PAGE_SHELL_CLASSNAME}>
        <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <H2>{t('editor.editTitle')}</H2>
              <P className='text-muted-foreground'>
                {t('editor.editDescription')}
              </P>
            </div>

            <div key='settings-actions' className='flex shrink-0 gap-2'>
              <Button type='button' onClick={secondaryNav.onClick}>
                {secondaryNav.label}
              </Button>
              <Button type='button' onClick={goToCatalog}>
                {t('editor.addExercises')}
              </Button>
              <Button
                type='submit'
                variant='primary'
                form='reusableProgramEditForm'
              >
                {t('common:btn.submit')}
              </Button>
            </div>
          </div>
          <form
            id='reusableProgramEditForm'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {showProgramNameField && (
              <FormInput
                control={form.control}
                name='name'
                label={t('editor.name')}
                inputClassName='max-w-62.5'
              />
            )}
          </form>
          <div className='overflow-auto'>
            <ExerciseLibraryList showExerciseLibraryAccess={false} />
          </div>
        </div>
      </div>
    )
  }

  const selectedCount = selectedExercises.length
  const selectedExerciseCountLabel =
    selectedCount === 0
      ? t('editor.selectedNone')
      : t('editor.selected', { count: selectedCount })

  return (
    <div className={PAGE_SHELL_CLASSNAME}>
      <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <H2>{t('editor.addExercises')}</H2>
            <P className='text-muted-foreground'>
              {t('editor.editCatalogDescription')}
            </P>
          </div>

          <div
            key='catalog-actions'
            className='flex shrink-0 items-center gap-3'
          >
            <span className='text-muted-foreground text-sm'>
              {selectedExerciseCountLabel}
            </span>
            <Button type='button' onClick={secondaryNav.onClick}>
              {secondaryNav.label}
            </Button>
            <Button type='button' variant='primary' onClick={goToSelectedList}>
              {t('editor.continue')}
            </Button>
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-auto'>
          <ExerciseGrid />
        </div>
      </div>
    </div>
  )
}

export default ReusableProgramEditForm

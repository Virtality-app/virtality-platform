'use client'

import { Button } from '@virtality/ui/components/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClientT } from '@/i18n/use-client-t'
import { useRouter } from 'next/navigation'
import { H2, P } from '@/components/typography'
import ExerciseLibraryList from '@/components/exercise-library/exercise-library-list'
import ExerciseGrid from '@/components/exercise-library/exercise-grid'
import { FormInput } from '@/components/ui/form'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import LoadingScreen from '@/components/feedback/loading-screen'
import { generateUUID } from '@virtality/shared/utils'
import {
  getQueryClient,
  useORPC,
  useCreateReusableProgram,
  useCreateReusableProgramExercises,
  useExercise,
} from '@virtality/react-query'
import { notify } from '@/lib/notify'
import { useEffect } from 'react'
import type { CompleteReusableProgram } from '@/types/models'
import { withRom } from '@/lib/with-rom'
import { afterCreateHref } from '@/lib/home-picker-return'
import {
  ReusableProgramFormSchema,
  type ReusableProgramForm,
  canSubmitReusableProgram,
  reusableProgramExercisesForCreateSubmit,
} from '@/lib/program-library-submit'
import {
  starterTemplateCatalogSelection,
  suggestedProgramNameFromTemplate,
} from '@/lib/starter-template-create'
import { useCatalogFirstAuthoringFlow } from '@/hooks/use-catalog-first-authoring-flow'
import { CATALOG_CATALOG_FIRST_AUTHORING_STEP } from '@/lib/catalog-first-authoring-flow'

type EditorSource =
  | { kind: 'scratch' }
  | { kind: 'template'; template: CompleteReusableProgram }

interface ReusableProgramFormViewProps {
  editorSource?: EditorSource
  onBack?: () => void
}

const ReusableProgramFormView = ({
  editorSource = { kind: 'scratch' },
  onBack,
}: ReusableProgramFormViewProps) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const { state, handler } = useExerciseLibrary()
  const { selectedExercises, deferredRemovalIds } = state
  const { updateExercises } = handler
  const { t } = useClientT(['programs', 'common'])
  const { data: exercises, isLoading: isLoadingExercises } = useExercise()
  const isScratch = editorSource.kind === 'scratch'
  const isTemplate = editorSource.kind === 'template'
  const isCatalogFirstCreate = isScratch || isTemplate
  const { isCatalogStep, isSelectedListStep, goToSelectedList, goToCatalog } =
    useCatalogFirstAuthoringFlow(
      isScratch
        ? { initialStep: CATALOG_CATALOG_FIRST_AUTHORING_STEP }
        : undefined,
    )
  const isCatalogFirstCatalogStep = isCatalogFirstCreate && isCatalogStep
  const isCatalogFirstSelectedListStep =
    isCatalogFirstCreate && isSelectedListStep

  const { mutateAsync: createProgram, isPending: isCreating } =
    useCreateReusableProgram({})

  const { mutate: createProgramExercises, isPending: isCreatingExercises } =
    useCreateReusableProgramExercises({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.list.key(),
        })

        router.push(
          afterCreateHref(
            'programId',
            variables.reusableProgramId,
            '/programs',
          ),
        )
      },
    })

  const suggestedName = isTemplate
    ? suggestedProgramNameFromTemplate(editorSource.template.name)
    : ''

  const form = useForm<ReusableProgramForm>({
    resolver: zodResolver(ReusableProgramFormSchema),
    defaultValues: { name: suggestedName },
  })

  useEffect(() => {
    if (editorSource.kind !== 'template' || !exercises) return

    const catalogSelection = starterTemplateCatalogSelection(
      editorSource.template.exercises,
      exercises,
      generateUUID,
    )

    updateExercises(withRom(catalogSelection.selectedExercises))
    form.setValue(
      'name',
      suggestedProgramNameFromTemplate(editorSource.template.name),
    )
    // Seed once when the template editor opens; catalog/template identity only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editorSource.kind === 'template' ? editorSource.template.id : null,
    exercises,
  ])

  const onSubmit = async (values: ReusableProgramForm) => {
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

    const program = await createProgram({ name: values.name.trim() })
    const programExercises = reusableProgramExercisesForCreateSubmit(
      selectedExercises,
      deferredRemovalIds,
      program.id,
      generateUUID,
    )

    createProgramExercises({
      reusableProgramId: program.id,
      exercises: programExercises,
    })
  }

  const handleCancel = () => router.push('/programs')

  const showProgramNameField = isSelectedListStep

  let secondaryNav: { onClick: () => void; label: string }
  if (isCatalogFirstCatalogStep) {
    secondaryNav = { onClick: goToSelectedList, label: t('common:btn.back') }
  } else if (onBack) {
    secondaryNav = { onClick: onBack, label: t('common:btn.back') }
  } else {
    secondaryNav = { onClick: handleCancel, label: t('common:btn.cancel') }
  }

  if (isCreating || isCreatingExercises || (isTemplate && isLoadingExercises)) {
    return (
      <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
        <LoadingScreen />
      </div>
    )
  }

  if (isCatalogFirstSelectedListStep) {
    const heading = isTemplate
      ? t('editor.finalizeTitle')
      : t('editor.createTitle')
    const settingsDescription = isTemplate
      ? t('editor.finalizeDescription')
      : t('editor.createDescription')

    return (
      <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
        <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <H2>{heading}</H2>
              <P className='text-muted-foreground'>{settingsDescription}</P>
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
                form='reusableProgramForm'
                data-tour='program-submit'
              >
                {t('common:btn.submit')}
              </Button>
            </div>
          </div>
          <form id='reusableProgramForm' onSubmit={form.handleSubmit(onSubmit)}>
            {showProgramNameField && (
              <FormInput
                control={form.control}
                name='name'
                label={t('editor.name')}
                data-tour='program-name'
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
  const catalogCopy = isTemplate
    ? {
        heading: t('editor.catalogTemplateTitle'),
        description: t('editor.catalogTemplateDescription'),
      }
    : {
        heading: t('editor.addExercises'),
        description: t('editor.catalogDescription'),
      }

  return (
    <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
      <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <H2>{catalogCopy.heading}</H2>
            <P className='text-muted-foreground'>{catalogCopy.description}</P>
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
            <Button
              type='button'
              variant='primary'
              onClick={goToSelectedList}
              data-tour='program-catalog-continue'
            >
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

export default ReusableProgramFormView

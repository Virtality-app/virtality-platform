'use client'

import { Button } from '@virtality/ui/components/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClientT } from '@/i18n/use-client-t'
import { redirect, useRouter } from 'next/navigation'
import { H2 } from '@/components/ui/typography'
import capitalize from 'lodash.capitalize'
import ExerciseLibraryList from '@/components/ui/exercise-library-list'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@virtality/ui/components/input'
import LoadingScreen from '@/components/ui/loading-screen'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import { useEffect } from 'react'
import {
  getQueryClient,
  useORPC,
  useReusableProgram,
  useUpdateReusableProgram,
  useUpdateReusableProgramExercises,
} from '@virtality/react-query'
import { withRom } from '@/lib/with-rom'
import { toast } from 'react-toastify'
import {
  ReusableProgramFormSchema,
  type ReusableProgramForm,
  canSubmitReusableProgram,
  isStarterTemplateProgram,
  reusableProgramExercisesForEditSubmit,
} from '@/lib/program-library-submit'
import { ZERO_ENABLED_VARIANTS_MESSAGE } from '@/lib/program-submit-enabled-variants'

interface ReusableProgramEditFormProps {
  programId: string
}

const ReusableProgramEditForm = ({
  programId,
}: ReusableProgramEditFormProps) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const { state, handler } = useExerciseLibrary()
  const { selectedExercises, deferredRemovalIds } = state
  const { updateExercises } = handler
  const { t } = useClientT('common')

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
    if (!existingProgram) return

    if (isStarterTemplateProgram(existingProgram)) {
      toast.error('Starter templates cannot be edited.')
      router.replace('/programs')
      return
    }

    updateExercises(withRom(existingProgram.exercises))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProgram])

  const form = useForm<ReusableProgramForm>({
    resolver: zodResolver(ReusableProgramFormSchema),
    defaultValues: { name: '' },
    values: { name: existingProgram?.name ?? '' },
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
        return toast.error(ZERO_ENABLED_VARIANTS_MESSAGE)
      }
      return
    }

    const exercises = reusableProgramExercisesForEditSubmit(
      selectedExercises,
      deferredRemovalIds,
      programId,
    )

    updateProgram({ id: programId, name: values.name.trim() })
    updateProgramExercises({ reusableProgramId: programId, exercises })
  }

  const handleCancel = () => redirect('/programs')

  if (isLoading || isUpdating || isUpdatingExercises) {
    return (
      <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-4'>
        <LoadingScreen />
      </div>
    )
  }

  if (!existingProgram || isStarterTemplateProgram(existingProgram)) {
    return null
  }

  return (
    <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-4'>
      <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
        <div className='flex justify-between'>
          <H2>Edit program</H2>

          <div className='flex gap-2'>
            <Button onClick={handleCancel}>{t('btn.cancel')}</Button>
            <Button variant='primary' form='reusableProgramEditForm'>
              {t('btn.submit')}
            </Button>
          </div>
        </div>
        <Form {...form}>
          <form
            id='reusableProgramEditForm'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{capitalize(field.name)}</FormLabel>
                  <FormControl>
                    <Input {...field} className='max-w-[250px]' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className='overflow-auto'>
          <ExerciseLibraryList />
        </div>
      </div>
    </div>
  )
}

export default ReusableProgramEditForm

'use client'

import { Button } from '@virtality/ui/components/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClientT } from '@/i18n/use-client-t'
import { useRouter } from 'next/navigation'
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
import { useExerciseLibrary } from '@/context/exercise-library-context'
import LoadingScreen from '@/components/ui/loading-screen'
import { generateUUID } from '@virtality/shared/utils'
import {
  getQueryClient,
  useORPC,
  useCreateReusableProgram,
  useCreateReusableProgramExercises,
} from '@virtality/react-query'
import { toast } from 'react-toastify'
import {
  ReusableProgramFormSchema,
  type ReusableProgramForm,
  canSubmitReusableProgram,
  reusableProgramExercisesForCreateSubmit,
} from '@/lib/program-library-submit'
import { ZERO_ENABLED_VARIANTS_MESSAGE } from '@/lib/program-submit-enabled-variants'

const ReusableProgramFormView = () => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const { state } = useExerciseLibrary()
  const { selectedExercises, deferredRemovalIds } = state
  const { t } = useClientT('common')

  const { mutateAsync: createProgram, isPending: isCreating } =
    useCreateReusableProgram({})

  const { mutate: createProgramExercises, isPending: isCreatingExercises } =
    useCreateReusableProgramExercises({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.list.key(),
        })

        router.push('/programs')
      },
    })

  const form = useForm<ReusableProgramForm>({
    resolver: zodResolver(ReusableProgramFormSchema),
    defaultValues: { name: '' },
  })

  const onSubmit = async (values: ReusableProgramForm) => {
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

    const program = await createProgram({ name: values.name.trim() })
    const exercises = reusableProgramExercisesForCreateSubmit(
      selectedExercises,
      deferredRemovalIds,
      program.id,
      generateUUID,
    )

    createProgramExercises({
      reusableProgramId: program.id,
      exercises,
    })
  }

  const handleCancel = () => router.push('/programs')

  if (isCreating || isCreatingExercises) {
    return (
      <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
        <LoadingScreen />
      </div>
    )
  }

  return (
    <div className='h-screen-with-nav container mx-auto flex flex-col gap-6 p-8'>
      <div className='flex h-full max-h-full flex-col space-y-2 overflow-hidden'>
        <div className='flex justify-between'>
          <H2>Create program</H2>

          <div className='flex gap-2'>
            <Button onClick={handleCancel}>{t('btn.cancel')}</Button>
            <Button variant='primary' form='reusableProgramForm'>
              {t('btn.submit')}
            </Button>
          </div>
        </div>
        <Form {...form}>
          <form id='reusableProgramForm' onSubmit={form.handleSubmit(onSubmit)}>
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

export default ReusableProgramFormView

import { ExerciseLibraryProvider } from '@/context/exercise-library-context'
import ReusableProgramEditForm from './_components/reusable-program-edit-form'

const EditReusableProgramPage = async (props: {
  params: Promise<{ programId: string }>
}) => {
  const { programId } = await props.params

  return (
    <ExerciseLibraryProvider>
      <ReusableProgramEditForm programId={programId} />
    </ExerciseLibraryProvider>
  )
}

export default EditReusableProgramPage

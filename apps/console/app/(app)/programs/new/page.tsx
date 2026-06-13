import { ExerciseLibraryProvider } from '@/context/exercise-library-context'
import ReusableProgramFormView from './_components/reusable-program-form'

const CreateReusableProgramPage = () => {
  return (
    <ExerciseLibraryProvider>
      <ReusableProgramFormView />
    </ExerciseLibraryProvider>
  )
}

export default CreateReusableProgramPage

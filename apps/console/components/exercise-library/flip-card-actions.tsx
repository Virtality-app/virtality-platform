import { useClientT } from '@/i18n/use-client-t'
import { MouseEvent } from 'react'
import { Ellipsis, Info, Star } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Exercise } from '@virtality/db'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@virtality/ui/components/dropdown-menu'
import {
  getQueryClient,
  useAddFavoriteExercise,
  useORPC,
  useRemoveFavoriteExercise,
} from '@virtality/react-query'
import {
  resolveFavoriteTargets,
  type FavoriteTargetRow,
} from './flip-card-favorites'

interface FlipCardActionsProps {
  exercise: Exercise
  favoriteExerciseId?: string | null
  familyFavoriteTargets?: FavoriteTargetRow[]
  handleFlip: (e: MouseEvent) => void
}

const FlipCardActions = ({
  exercise,
  favoriteExerciseId,
  familyFavoriteTargets,
  handleFlip,
}: FlipCardActionsProps) => {
  const { t } = useClientT('shared')
  const queryClient = getQueryClient()
  const orpc = useORPC()

  const { mutate: addFavoriteExercise } = useAddFavoriteExercise({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.favoriteExercise.list.key(),
      })
    },
  })
  const { mutate: removeFavoriteExercise } = useRemoveFavoriteExercise({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.favoriteExercise.list.key(),
      })
    },
  })
  const favoriteTargets = resolveFavoriteTargets(
    exercise,
    favoriteExerciseId,
    familyFavoriteTargets,
  )
  const anyFavorited = favoriteTargets.some((t) => t.favoriteRowId != null)

  const handleFavoriteMutation = (e: MouseEvent) => {
    e.stopPropagation()

    if (anyFavorited) {
      for (const t of favoriteTargets) {
        if (t.favoriteRowId) removeFavoriteExercise({ id: t.favoriteRowId })
      }
    } else {
      for (const t of favoriteTargets) {
        addFavoriteExercise({ exerciseId: t.exerciseId })
      }
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon-sm'
          variant='ghost'
          className='absolute top-2 right-2 z-20 bg-black/45 text-white hover:bg-black/65 hover:text-white'
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-9999'>
        <DropdownMenuItem onClick={handleFavoriteMutation}>
          {anyFavorited ? (
            <>
              <Star fill='yellow' />
              {t('exerciseLibrary.removeFavorite')}
            </>
          ) : (
            <>
              <Star />
              {t('exerciseLibrary.addFavorite')}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFlip}>
          <Info />
          {t('exerciseLibrary.information')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FlipCardActions

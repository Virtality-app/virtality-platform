import { useClientT } from '@/i18n/use-client-t'
import {
  familyMembersForLibrarySelection,
  libraryFamilySelectionState,
} from '@virtality/shared/utils'
import { Skeleton } from '@virtality/ui/components/skeleton'
import FlipCard from './flip-card'
import { directionBadgesWithSelection } from './exercise-grid-format'
import type { ExerciseGridState } from './use-exercise-grid'

interface ExerciseGridCardsProps {
  grid: ExerciseGridState
}

const ExerciseGridCards = ({ grid }: ExerciseGridCardsProps) => {
  const { t } = useClientT('shared')
  const { isSelected } = grid

  return (
    <div className='grid justify-items-center gap-4 sm:grid-cols-3 2xl:grid-cols-5'>
      {grid.isLoading ? (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton
              key={i}
              className='aspect-4/5 w-full sm:max-w-50 md:max-w-55 lg:max-w-60 xl:max-w-65'
            />
          ))}
        </>
      ) : grid.showEmptyState ? (
        <p className='text-muted-foreground col-span-full py-8 text-center text-sm'>
          {t('exerciseLibrary.noMatches')}
        </p>
      ) : (
        grid.displayedFamilies?.map((family, index) => {
          const selectionMembers = familyMembersForLibrarySelection(family)
          const selectionState = libraryFamilySelectionState(
            selectionMembers,
            isSelected ?? undefined,
          )
          const familyFavoriteTargets = selectionMembers.map((m) => ({
            exerciseId: m.id,
            favoriteRowId: grid.favoriteRowIdByExerciseId.get(m.id) ?? null,
          }))
          return (
            <FlipCard
              key={family.familyKey}
              exercise={family.representative}
              footerTitle={family.familyKey}
              directionBadges={directionBadgesWithSelection(family, isSelected)}
              isSelected={selectionState !== 'none'}
              familyFavoriteTargets={familyFavoriteTargets}
              onDirectionBadgeClick={(side) =>
                grid.toggleDirection(family, side)
              }
              onSelect={() => grid.toggleFamily(family)}
              tourTarget={index === 0 ? 'exercise-card' : undefined}
            />
          )
        })
      )}
    </div>
  )
}

export default ExerciseGridCards

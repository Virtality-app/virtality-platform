import { bodyGroupIconSrcForCategory } from '@/lib/body-group-icon'
import { equipmentIconSrcForItem } from '@/lib/equipment-icon'
import ExerciseFilterSection from './exercise-filter-section'
import ExerciseGridSearch from './exercise-grid-search'
import ExerciseGridCards from './exercise-grid-cards'
import { equipmentChipLabel } from './exercise-grid-format'
import { useExerciseGrid } from './use-exercise-grid'

const ExerciseGrid = () => {
  const grid = useExerciseGrid()

  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-2'>
      <ExerciseFilterSection
        dataTour='exercise-filters'
        title='Select By Body Part'
        options={grid.categories}
        selected={grid.selectedBodyParts}
        onToggle={grid.toggleBodyPart}
        iconSrcFor={bodyGroupIconSrcForCategory}
        iconSize={24}
      />

      <ExerciseFilterSection
        title='Select By Equipment'
        options={grid.equipmentKeys}
        selected={grid.selectedEquipmentKeys}
        onToggle={grid.toggleEquipment}
        iconSrcFor={equipmentIconSrcForItem}
        iconSize={400}
        labelFor={equipmentChipLabel}
      />

      <ExerciseGridSearch
        searchTerm={grid.searchTerm}
        onSearchTermChange={grid.setSearchTerm}
        favoritesOnly={grid.favoritesOnly}
        onToggleFavoritesOnly={grid.toggleFavoritesOnly}
      />

      <ExerciseGridCards grid={grid} />
    </div>
  )
}

export default ExerciseGrid

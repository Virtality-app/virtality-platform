import { useMemo, useState } from 'react'
import { getUUID } from '@/lib/utils'
import { withRom } from '@/lib/with-rom'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import {
  useExercise,
  useExerciseCategories,
  useExerciseItems,
  useFavoriteExercise,
} from '@virtality/react-query'
import {
  familyMemberForNearTermDirection,
  familyMembersForLibrarySelection,
  filterExerciseFamiliesForLibrary,
  libraryFamilySelectionState,
  type ExerciseFamilyForLibrary,
  type ExerciseLibraryFilterRow,
  type NearTermDirection,
} from '@virtality/shared/utils'

export type ExerciseGridState = ReturnType<typeof useExerciseGrid>

function toggleIn(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value]
}

export function useExerciseGrid() {
  const [searchTerm, setSearchTerm] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([])
  const [selectedEquipmentKeys, setSelectedEquipmentKeys] = useState<string[]>(
    [],
  )

  const { data: exercises, isLoading } = useExercise()
  const { data: categories } = useExerciseCategories()
  const { data: equipmentKeys } = useExerciseItems()
  const { data: favorites } = useFavoriteExercise()

  const { state, handler } = useExerciseLibrary()
  const { isSelected } = state
  const { selectExercise, removeExercise } = handler

  const toggleBodyPart = (category: string) => {
    setSelectedBodyParts((prev) => toggleIn(prev, category))
  }

  const toggleEquipment = (key: string) => {
    setSelectedEquipmentKeys((prev) => toggleIn(prev, key))
  }

  const favoriteExerciseIds = useMemo(
    () => favorites?.map((f) => f.exerciseId) ?? [],
    [favorites],
  )

  const favoriteRowIdByExerciseId = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of favorites ?? []) {
      if (!map.has(f.exerciseId)) map.set(f.exerciseId, f.id)
    }
    return map
  }, [favorites])

  const displayedFamilies = useMemo(() => {
    if (!exercises) return undefined
    return filterExerciseFamiliesForLibrary(exercises, {
      selectedBodyParts,
      selectedEquipmentKeys,
      searchTerm,
      favoritesOnly,
      favoriteExerciseIds,
    })
  }, [
    exercises,
    selectedBodyParts,
    selectedEquipmentKeys,
    searchTerm,
    favoritesOnly,
    favoriteExerciseIds,
  ])

  const addLibraryVariant = (exerciseId: string) => {
    if (!exercises) return
    const exerciseToAdd = exercises.find((ex) => ex.id === exerciseId)
    if (!exerciseToAdd || isSelected?.[exerciseId]) return
    selectExercise(
      withRom({
        exerciseId: exerciseToAdd.id,
        id: getUUID(),
        reps: 10,
        sets: 3,
        restTime: 5,
        holdTime: 1,
        speed: 1.0,
        exercise: exerciseToAdd,
      }),
    )
  }

  const toggleFamily = (
    family: ExerciseFamilyForLibrary<ExerciseLibraryFilterRow>,
  ) => {
    if (!exercises) return
    const selectionMembers = familyMembersForLibrarySelection(family)
    if (libraryFamilySelectionState(selectionMembers, isSelected) === 'full') {
      for (const m of selectionMembers) {
        removeExercise(m.id)
      }
      return
    }
    for (const m of selectionMembers) {
      addLibraryVariant(m.id)
    }
  }

  const toggleDirection = (
    family: ExerciseFamilyForLibrary<ExerciseLibraryFilterRow>,
    side: NearTermDirection,
  ) => {
    const member = familyMemberForNearTermDirection(family, side)
    if (!member) return
    if (isSelected?.[member.id]) {
      removeExercise(member.id)
      return
    }
    addLibraryVariant(member.id)
  }

  const showEmptyState = Boolean(
    !isLoading && exercises && displayedFamilies?.length === 0,
  )

  return {
    categories,
    equipmentKeys,
    selectedBodyParts,
    selectedEquipmentKeys,
    toggleBodyPart,
    toggleEquipment,
    searchTerm,
    setSearchTerm,
    favoritesOnly,
    toggleFavoritesOnly: () => setFavoritesOnly((prev) => !prev),
    isLoading,
    showEmptyState,
    displayedFamilies,
    isSelected,
    favoriteRowIdByExerciseId,
    toggleFamily,
    toggleDirection,
  }
}

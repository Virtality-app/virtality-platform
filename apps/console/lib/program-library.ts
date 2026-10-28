export type ProgramLibraryListRow = {
  id: string
  name: string
  updatedAt: Date
  exercises: { id: string }[]
}

export function getProgramExerciseCount(
  program: ProgramLibraryListRow,
): number {
  return program.exercises.length
}

export function filterProgramsBySearch<
  T extends Pick<ProgramLibraryListRow, 'name'>,
>(programs: T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return programs

  return programs.filter((program) =>
    program.name.toLowerCase().includes(normalizedQuery),
  )
}

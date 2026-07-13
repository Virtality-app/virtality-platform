export type PatientListRow = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export function filterPatientsBySearch<T extends PatientListRow>(
  patients: T[],
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return patients

  return patients.filter((patient) => {
    const haystack = [
      patient.name,
      patient.email,
      patient.phone,
      patient.id,
      patient.id.split('-')[0],
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

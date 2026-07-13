import { describe, expect, it } from 'vitest'
import { filterPatientsBySearch } from './patient-list'

const patients = [
  {
    id: 'abc-123-def',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
  },
  {
    id: 'ghi-456-jkl',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    phone: '555-0200',
  },
]

describe('filterPatientsBySearch', () => {
  it('returns all patients when the query is empty', () => {
    expect(filterPatientsBySearch(patients, '')).toEqual(patients)
    expect(filterPatientsBySearch(patients, '   ')).toEqual(patients)
  })

  it('matches name, email, phone, and short id', () => {
    expect(filterPatientsBySearch(patients, 'ada')).toHaveLength(1)
    expect(filterPatientsBySearch(patients, 'grace@example.com')).toHaveLength(
      1,
    )
    expect(filterPatientsBySearch(patients, '555-0200')).toHaveLength(1)
    expect(filterPatientsBySearch(patients, 'abc')).toHaveLength(1)
  })
})

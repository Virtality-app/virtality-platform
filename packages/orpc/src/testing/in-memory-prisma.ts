/**
 * A small in-memory stand-in for the Prisma client, for tests that call real
 * procedures. It evaluates `where` filters the way Prisma does, relation
 * filters included (`patient: { userId }`, `some`), so a test checks the
 * filter a handler actually sends, not one a hand-written fake assumes.
 *
 * It covers what the console procedures use. An operator it doesn't know
 * throws, so a test fails loudly instead of matching by accident.
 */

type Row = Record<string, unknown>
type Where = Record<string, unknown> | undefined
type Args = Record<string, unknown> | undefined

type Relation = {
  model: string
  kind: 'one' | 'many'
  /** Field on this row … */
  local: string
  /** … that equals this field on the related row. */
  foreign: string
}

const one = (model: string, local: string, foreign = 'id'): Relation => ({
  model,
  kind: 'one',
  local,
  foreign,
})
const many = (model: string, foreign: string): Relation => ({
  model,
  kind: 'many',
  local: 'id',
  foreign,
})

const RELATIONS: Record<string, Record<string, Relation>> = {
  user: {
    patients: many('patient', 'userId'),
    devices: many('device', 'userId'),
    favoriteExercise: many('favoriteExercise', 'userId'),
  },
  patient: {
    user: one('user', 'userId'),
    medicalHistory: many('medicalHistory', 'patientId'),
    patientSession: many('patientSession', 'patientId'),
    patientProgram: many('patientProgram', 'patientId'),
  },
  medicalHistory: { patient: one('patient', 'patientId') },
  patientSession: {
    patient: one('patient', 'patientId'),
    sessionExercise: many('sessionExercise', 'patientSessionId'),
    sessionData: many('sessionData', 'patientSessionId'),
    supplementalTherapy: many(
      'patientSessionSupplementalTherapyRel',
      'patientSessionId',
    ),
    sessionImmersiveVideo: one(
      'sessionImmersiveVideo',
      'id',
      'patientSessionId',
    ),
  },
  sessionExercise: {
    patientSession: one('patientSession', 'patientSessionId'),
    exercise: one('exercise', 'exerciseId'),
  },
  sessionData: {
    session: one('patientSession', 'patientSessionId'),
    sessionExercise: one('sessionExercise', 'sessionExerciseId'),
  },
  sessionImmersiveVideo: {
    patientSession: one('patientSession', 'patientSessionId'),
  },
  patientSessionSupplementalTherapyRel: {
    session: one('patientSession', 'patientSessionId'),
  },
  reusableProgram: {
    user: one('user', 'userId'),
    exercises: many('reusableProgramExercise', 'reusableProgramId'),
  },
  reusableProgramExercise: {
    reusableProgram: one('reusableProgram', 'reusableProgramId'),
  },
  device: {
    user: one('user', 'userId'),
    pairingAttempts: many('devicePairingAttempt', 'deviceRecordId'),
  },
  devicePairingAttempt: { device: one('device', 'deviceRecordId') },
  deviceVideoReport: {
    videos: {
      model: 'deviceVideo',
      kind: 'many',
      local: 'deviceId',
      foreign: 'deviceId',
    },
  },
  favoriteExercise: { user: one('user', 'userId') },
}

/** Column defaults the procedures rely on when they create a row. */
const DEFAULTS: Record<string, () => Row> = {
  patientSession: () => ({
    status: 'ACTIVE',
    kind: 'EXERCISE',
    createdAt: new Date(),
    completedAt: null,
    deletedAt: null,
    notes: null,
  }),
  sessionImmersiveVideo: () => ({ startedAt: new Date(), endedAt: null }),
  devicePairingAttempt: () => ({ createdAt: new Date() }),
}

let generatedIds = 0

class PrismaError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

const isPlainObject = (value: unknown): value is Row =>
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Date) &&
  !Array.isArray(value)

const comparable = (value: unknown) =>
  value instanceof Date ? value.getTime() : value

function equals(left: unknown, right: unknown) {
  if (left == null || right == null) return left == null && right == null
  return comparable(left) === comparable(right)
}

function matchScalar(value: unknown, condition: unknown): boolean {
  if (!isPlainObject(condition)) return equals(value, condition)

  return Object.entries(condition).every(([operator, operand]) => {
    if (operand === undefined) return true
    switch (operator) {
      case 'equals':
        return equals(value, operand)
      case 'in':
        return (operand as unknown[]).some((item) => equals(value, item))
      case 'notIn':
        return !(operand as unknown[]).some((item) => equals(value, item))
      case 'not':
        return !matchScalar(value, operand)
      case 'gt':
        return value != null && comparable(value)! > comparable(operand)!
      case 'gte':
        return value != null && comparable(value)! >= comparable(operand)!
      case 'lt':
        return value != null && comparable(value)! < comparable(operand)!
      case 'lte':
        return value != null && comparable(value)! <= comparable(operand)!
      case 'contains':
        return typeof value === 'string' && value.includes(operand as string)
      case 'startsWith':
        return typeof value === 'string' && value.startsWith(operand as string)
      default:
        throw new Error(`in-memory prisma: unknown operator "${operator}"`)
    }
  })
}

export function createInMemoryPrisma(seed: Record<string, Row[]>) {
  const tables = new Map<string, Row[]>()
  const table = (model: string) => {
    if (!tables.has(model)) tables.set(model, [])
    return tables.get(model)!
  }
  for (const [model, rows] of Object.entries(seed)) {
    table(model).push(...rows.map((row) => structuredClone(row)))
  }

  const related = (model: string, row: Row, key: string): Row[] => {
    const relation = RELATIONS[model]?.[key]
    if (!relation) return []
    const value = row[relation.local]
    if (value == null) return []
    return table(relation.model).filter((other) =>
      equals(other[relation.foreign], value),
    )
  }

  function matches(model: string, row: Row, where: Where): boolean {
    if (!where) return true
    return Object.entries(where).every(([key, condition]) => {
      if (condition === undefined) return true
      if (key === 'AND') {
        const parts = Array.isArray(condition) ? condition : [condition]
        return parts.every((part) => matches(model, row, part as Where))
      }
      if (key === 'OR') {
        return (condition as Where[]).some((part) => matches(model, row, part))
      }
      if (key === 'NOT') {
        const parts = Array.isArray(condition) ? condition : [condition]
        return !parts.some((part) => matches(model, row, part as Where))
      }

      const relation = RELATIONS[model]?.[key]
      if (!relation) return matchScalar(row[key], condition)

      const rows = related(model, row, key)
      if (relation.kind === 'one') {
        const inner = isPlainObject(condition)
          ? 'is' in condition
            ? condition.is
            : condition
          : condition
        if (inner === null) return rows.length === 0
        const [first] = rows
        return (
          first !== undefined && matches(relation.model, first, inner as Where)
        )
      }

      const filter = condition as { some?: Where; every?: Where; none?: Where }
      if (
        filter.some &&
        !rows.some((r) => matches(relation.model, r, filter.some))
      )
        return false
      if (
        filter.every &&
        !rows.every((r) => matches(relation.model, r, filter.every))
      )
        return false
      if (
        filter.none &&
        rows.some((r) => matches(relation.model, r, filter.none))
      )
        return false
      return true
    })
  }

  function shape(model: string, row: Row, args: Args): Row {
    const out: Row = { ...row }
    const spec = (args?.include ?? args?.select) as Row | undefined
    for (const [key, value] of Object.entries(spec ?? {})) {
      if (!value) continue
      if (key === '_count') {
        const counts: Row = {}
        const select = (value as { select: Row }).select
        for (const [name, countSpec] of Object.entries(select)) {
          const relation = RELATIONS[model]![name]!
          const where = isPlainObject(countSpec)
            ? (countSpec.where as Where)
            : undefined
          counts[name] = related(model, row, name).filter((r) =>
            matches(relation.model, r, where),
          ).length
        }
        out._count = counts
        continue
      }
      const relation = RELATIONS[model]?.[key]
      if (!relation) continue
      const nested = isPlainObject(value) ? value : undefined
      let rows = related(model, row, key).filter((r) =>
        matches(relation.model, r, nested?.where as Where),
      )
      if (typeof nested?.take === 'number') rows = rows.slice(0, nested.take)
      out[key] =
        relation.kind === 'one'
          ? rows[0]
            ? shape(relation.model, rows[0], nested)
            : null
          : rows.map((r) => shape(relation.model, r, nested))
    }
    return out
  }

  function insert(model: string, data: Row): Row {
    const row: Row = { ...DEFAULTS[model]?.() }
    const nestedCreates: [string, Row][] = []
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      if (RELATIONS[model]?.[key] && isPlainObject(value) && value.create) {
        nestedCreates.push([key, value.create as Row])
      } else {
        row[key] = value
      }
    }
    row.id ??= `generated-${++generatedIds}`
    if (table(model).some((other) => equals(other.id, row.id))) {
      throw new PrismaError('P2002', `${model}.id already exists`)
    }
    table(model).push(row)
    for (const [key, create] of nestedCreates) {
      const relation = RELATIONS[model]![key]!
      insert(relation.model, {
        ...create,
        [relation.foreign]: row[relation.local],
      })
    }
    return row
  }

  function apply(model: string, row: Row, data: Row) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      const relation = RELATIONS[model]?.[key]
      if (relation && isPlainObject(value) && value.update) {
        for (const other of related(model, row, key)) {
          apply(relation.model, other, value.update as Row)
        }
        continue
      }
      row[key] = value
    }
  }

  function delegate(model: string) {
    const findMany = (args: Args = {}) => {
      let rows = table(model).filter((row) =>
        matches(model, row, args.where as Where),
      )
      if (typeof args.skip === 'number') rows = rows.slice(args.skip)
      if (typeof args.take === 'number') rows = rows.slice(0, args.take)
      return rows.map((row) => shape(model, row, args))
    }
    const findFirst = (args: Args = {}) => findMany(args)[0] ?? null
    const orThrow = (args: Args) => {
      const row = findFirst(args)
      if (!row) throw new PrismaError('P2025', `No ${model} found`)
      return row
    }
    const single = (where: Where) => {
      const rows = table(model).filter((row) => matches(model, row, where))
      if (rows.length !== 1) {
        throw new PrismaError('P2025', `Record to change in ${model} not found`)
      }
      return rows[0]!
    }

    return {
      findMany: async (args?: Args) => findMany(args),
      findFirst: async (args?: Args) => findFirst(args),
      findUnique: async (args?: Args) => findFirst(args),
      findFirstOrThrow: async (args?: Args) => orThrow(args),
      findUniqueOrThrow: async (args?: Args) => orThrow(args),
      count: async (args?: Args) => findMany(args).length,
      create: async (args: { data: Row } & Row) =>
        shape(model, insert(model, args.data), args),
      createMany: async (args: { data: Row[] }) => {
        for (const data of args.data) insert(model, data)
        return { count: args.data.length }
      },
      update: async (args: { where: Where; data: Row } & Row) => {
        const row = single(args.where)
        apply(model, row, args.data)
        return shape(model, row, args)
      },
      updateMany: async (args: { where: Where; data: Row }) => {
        const rows = table(model).filter((row) =>
          matches(model, row, args.where),
        )
        for (const row of rows) apply(model, row, args.data)
        return { count: rows.length }
      },
      upsert: async (
        args: { where: Where; create: Row; update: Row } & Row,
      ) => {
        const row = table(model).find((r) => matches(model, r, args.where))
        if (row) {
          apply(model, row, args.update)
          return shape(model, row, args)
        }
        return shape(model, insert(model, args.create), args)
      },
      delete: async (args: { where: Where } & Row) => {
        const row = single(args.where)
        table(model).splice(table(model).indexOf(row), 1)
        return row
      },
      deleteMany: async (args: { where?: Where } = {}) => {
        const keep = table(model).filter(
          (row) => !matches(model, row, args.where),
        )
        const count = table(model).length - keep.length
        tables.set(model, keep)
        return { count }
      },
    }
  }

  const client: Record<string, unknown> = {
    $transaction: async (work: unknown) =>
      typeof work === 'function'
        ? (work as (tx: unknown) => Promise<unknown>)(prisma)
        : Promise.all(work as Promise<unknown>[]),
  }

  const prisma: Record<string, unknown> = new Proxy(client, {
    get(target, property: string) {
      if (property in target) return target[property]
      if (property === 'then') return undefined
      target[property] = delegate(property)
      return target[property]
    },
  })

  return {
    prisma,
    /** Every table as plain data, to check that a refused call changed nothing. */
    snapshot: () =>
      structuredClone(
        Object.fromEntries([...tables].filter(([, rows]) => rows.length > 0)),
      ),
  }
}

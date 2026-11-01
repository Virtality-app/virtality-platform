import { createHash } from 'node:crypto'

/**
 * Stable UUID for a seed record, so re-running the seed updates the same rows.
 * Formatted as a version 5 UUID (SHA-1 of a namespaced key).
 */
export function seedId(key: string): string {
  const hex = createHash('sha1')
    .update(`virtality-dev-seed:${key}`)
    .digest('hex')
  const variant = ((parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16)

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-')
}

/** Deterministic PRNG (mulberry32) keyed by a string, returning [0, 1). */
export function createRandom(key: string): () => number {
  let state = parseInt(
    createHash('sha1').update(key).digest('hex').slice(0, 8),
    16,
  )

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Groups exercises into families (Left/Right variants share a displayName),
 * keeping the order in which each family first appears.
 */
export function groupExerciseFamilies<T extends { displayName: string }>(
  exercises: readonly T[],
): T[][] {
  const families = new Map<string, T[]>()

  for (const exercise of exercises) {
    const family = families.get(exercise.displayName)
    if (family) family.push(exercise)
    else families.set(exercise.displayName, [exercise])
  }

  return [...families.values()]
}

/**
 * SessionData.value as the headset writes it: one point per rep, with a
 * `set_N` progress percentage for each completed set.
 */
export function buildSessionDataValue(input: {
  sets: number
  reps: number
  /** Typical score for this patient and exercise on their first session. */
  baseScore: number
  /** 0 for the patient's first session; scores improve as it grows. */
  sessionIndex: number
  random: () => number
}): string {
  const points: Record<string, number>[] = []

  for (let rep = 1; rep <= input.reps; rep++) {
    const point: Record<string, number> = { rep }

    for (let set = 1; set <= input.sets; set++) {
      const progressGain = input.sessionIndex * 2.5
      const setFatigue = (set - 1) * 4
      const noise = (input.random() - 0.5) * 16
      const score = input.baseScore + progressGain - setFatigue + noise
      point[`set_${set}`] = Math.min(100, Math.max(0, score))
    }

    points.push(point)
  }

  return JSON.stringify(points)
}

/** Local `hour:minute` on the day `daysAgo` days before `now`. */
export function daysAgoAt(
  now: Date,
  daysAgo: number,
  hour: number,
  minute = 0,
): Date {
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date
}

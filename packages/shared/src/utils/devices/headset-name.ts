/**
 * Provisioned Devices are named `Headset-01`, `Headset-02`, … within their
 * group: the customer's account once they own it, otherwise the Access Code
 * it waits on, otherwise staff inventory. Each group starts at 01, and a
 * headset joining a group takes the next number after the highest there.
 */
const HEADSET_NAME = /^Headset-(\d+)$/

export function formatHeadsetName(number: number): string {
  return `Headset-${String(number).padStart(2, '0')}`
}

function highestHeadsetNumber(names: string[]): number {
  return names.reduce((max, name) => {
    const match = HEADSET_NAME.exec(name)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
}

/** The next `count` names after the headsets already in a group. */
export function nextHeadsetNames(existing: string[], count: number): string[] {
  const highest = highestHeadsetNumber(existing)
  return Array.from({ length: count }, (_, i) =>
    formatHeadsetName(highest + 1 + i),
  )
}

export function nextHeadsetName(existing: string[]): string {
  return nextHeadsetNames(existing, 1)[0]!
}

/** Orders by headset number; names outside the scheme go last, by text. */
export function compareHeadsetNames(a: string, b: string): number {
  const numberOf = (name: string) => {
    const match = HEADSET_NAME.exec(name)
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY
  }
  return numberOf(a) - numberOf(b) || a.localeCompare(b)
}

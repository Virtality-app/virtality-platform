import type { HomePickerSelection } from './home-session-picker'

/**
 * Creating a patient, a program or pairing a headset from the home dashboard
 * brings the clinician back to it with that new item picked. The link out
 * carries `returnTo`: the dashboard URL holding what was already picked; the
 * page that creates the item adds its id and navigates there.
 */

export const RETURN_TO_PARAM = 'returnTo'

const pickerParams = {
  patientId: 'patient',
  programId: 'program',
  deviceId: 'device',
} as const satisfies Record<keyof HomePickerSelection, string>

export type HomePickerChoice = keyof typeof pickerParams

/** The dashboard URL that opens the picker on this selection. */
export function homePickerHref(
  selection: Partial<HomePickerSelection>,
): string {
  const params = new URLSearchParams()
  for (const key of Object.keys(pickerParams) as HomePickerChoice[]) {
    const id = selection[key]
    if (id) params.set(pickerParams[key], id)
  }
  const query = params.toString()
  return query ? `/?${query}` : '/'
}

/** Picks the dashboard was opened with; absent keys stay unset. */
export function readHomePickerSeed(
  params: URLSearchParams,
): Partial<HomePickerSelection> {
  const seed: Partial<HomePickerSelection> = {}
  for (const key of Object.keys(pickerParams) as HomePickerChoice[]) {
    const id = params.get(pickerParams[key])
    if (id) seed[key] = id
  }
  return seed
}

/** The same query without the picker params, once they have been read. */
export function withoutHomePickerParams(params: URLSearchParams): string {
  const rest = new URLSearchParams(params)
  for (const name of Object.values(pickerParams)) rest.delete(name)
  return rest.toString()
}

/** A create page link that comes back to `returnTo` when done. */
export function withReturnTo(href: string, returnTo: string): string {
  const separator = href.includes('?') ? '&' : '?'
  return `${href}${separator}${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`
}

/** Only the home dashboard is a valid return target. */
function homeReturnTo(value: string | null): URL | null {
  if (!value || !(value === '/' || value.startsWith('/?'))) return null
  return new URL(value, 'http://localhost')
}

/**
 * Where to go after creating `id`: the dashboard with it picked, or null when
 * the page was not opened from the dashboard.
 */
export function returnHrefWithChoice(
  search: string,
  choice: HomePickerChoice,
  id: string,
): string | null {
  const url = homeReturnTo(new URLSearchParams(search).get(RETURN_TO_PARAM))
  if (!url) return null
  url.searchParams.set(pickerParams[choice], id)
  return `${url.pathname}${url.search}`
}

/** After creating `id` in the browser: back to the dashboard that sent us, or `fallback`. */
export function afterCreateHref(
  choice: HomePickerChoice,
  id: string,
  fallback: string,
): string {
  return returnHrefWithChoice(window.location.search, choice, id) ?? fallback
}

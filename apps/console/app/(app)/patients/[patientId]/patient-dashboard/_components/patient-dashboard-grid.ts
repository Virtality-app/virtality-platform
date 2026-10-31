import { cn } from '@/lib/utils'

type DashboardGridFlags = {
  /** Immersive Video mode: no exercise list. */
  hideExerciseList?: boolean
}

/**
 * Three areas. `panel` holds the expiry banner, the toolbar and, during a
 * session, the session panel; `list` is the exercise list; `main` is the
 * chart, the casting view or the immersive video stack.
 *
 * Below 1526px everything stacks in reading order, with the exercise list
 * above the chart so the current exercise stays in view on a tablet. From
 * 1526px the list takes the left column beside the panel and main areas.
 */
export function dashboardGridClassName({
  hideExerciseList,
}: DashboardGridFlags): string {
  return cn(
    'container grid grid-cols-1 content-start items-start gap-4 p-4 sm:p-8',
    hideExerciseList
      ? "[grid-template-areas:'panel'_'main']"
      : "[grid-template-areas:'panel'_'list'_'main'] min-[1526px]:grid-cols-[minmax(18rem,3fr)_minmax(0,9fr)] min-[1526px]:[grid-template-areas:'list_panel'_'list_main']",
  )
}

export const dashboardPanelClassName =
  'flex min-w-0 flex-col gap-3 [grid-area:panel]'

export const dashboardExerciseListClassName =
  'flex max-h-[28rem] min-w-0 flex-col [grid-area:list] min-[1526px]:sticky min-[1526px]:top-20 min-[1526px]:max-h-[calc(100dvh-7rem)]'

/** Casting and the immersive video stack size themselves (aspect-ratio video). */
export const dashboardMainClassName = 'relative min-w-0 [grid-area:main]'

/** The progress chart needs a set height to draw into. */
export const dashboardChartClassName = cn(
  dashboardMainClassName,
  'h-[30rem] min-[1526px]:h-[40rem]',
)

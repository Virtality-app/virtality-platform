import type usePlotData from '@/hooks/use-plot-data'
import type { SkipSafeProgressFlowState } from '@/lib/skip-safe-progress-flow'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { DashboardState } from './types'

interface useSessionPlotProps {
  flow: SessionFlowRefs
  exercises: DashboardState['exercises']
  plot: ReturnType<typeof usePlotData>
}

const useSessionPlot = ({ flow, exercises, plot }: useSessionPlotProps) => {
  const { setPlotData } = plot.handler

  const syncPlotFromFlowState = (next: SkipSafeProgressFlowState) => {
    setPlotData([...next.currentExerciseProgress])
  }

  const progressDataClear = () => {
    const reps = exercises?.[flow.currExerciseRef.current]?.reps ?? 0
    setPlotData(flow.resetCurrentExerciseProgress(reps))
  }

  return { syncPlotFromFlowState, progressDataClear }
}

export type SessionPlotHandlers = ReturnType<typeof useSessionPlot>

export default useSessionPlot

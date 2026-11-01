import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import Chart from '@/components/charts/progress-chart'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { useExercise } from '@virtality/react-query'
import { getDisplayName } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'

const ChartCard = ({ className }: { className?: string }) => {
  const { state, plotData } = usePatientDashboard()
  const { exercises, activeExerciseData } = state
  const { data: defaultExercise } = useExercise()
  const { t } = useClientT('patient-dashboard')

  const chartTitle = getDisplayName(
    defaultExercise?.find((e) => e.id === activeExerciseData.id),
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {exercises && exercises?.length !== 0
            ? (chartTitle ?? t('chart.exerciseNotFound'))
            : t('chart.exerciseNotFound')}
        </CardTitle>
      </CardHeader>
      <CardContent className='min-h-0 flex-1'>
        {/* Fill the card's set height instead of the chart's default 16:9. */}
        <Chart data={plotData} className='aspect-auto h-full w-full' />
      </CardContent>
    </Card>
  )
}

export default ChartCard

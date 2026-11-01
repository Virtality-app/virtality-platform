import PatientDashboard from './_components/patient-dashboard'
import { PatientDashboardProvider } from '@/context/patient-dashboard-context'
import { ImmersiveVideoSessionProvider } from '@/context/immersive-video-session-context'

const PatientDashboardPage = async (props: {
  params: Promise<{ patientId: string }>
}) => {
  const { patientId } = await props.params

  return (
    <PatientDashboardProvider patientId={patientId}>
      <ImmersiveVideoSessionProvider>
        <PatientDashboard />
      </ImmersiveVideoSessionProvider>
    </PatientDashboardProvider>
  )
}

export default PatientDashboardPage

import PatientDashboard from './_components/patient-dashboard'
import { PatientDashboardProvider } from '@/context/patient-dashboard-context'
import { ImmersiveVideoSessionProvider } from '@/context/immersive-video-session-context'
import { DeviceContextProvider } from '@/context/device-context'

const PatientDashboardPage = async (props: {
  params: Promise<{ patientId: string }>
}) => {
  const { patientId } = await props.params

  return (
    <DeviceContextProvider>
      <PatientDashboardProvider patientId={patientId}>
        <ImmersiveVideoSessionProvider>
          <PatientDashboard />
        </ImmersiveVideoSessionProvider>
      </PatientDashboardProvider>
    </DeviceContextProvider>
  )
}

export default PatientDashboardPage

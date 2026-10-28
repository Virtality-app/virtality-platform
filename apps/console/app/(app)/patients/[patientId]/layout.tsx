import TabBar from './_components/tab-bar'
import PageTransition from '@/components/ui/page-transition'

export default async function PatientsLayout({
  children,
  params,
}: {
  params: Promise<{ patientId: string }>

  children: React.ReactNode
}) {
  const { patientId } = await params

  const dashboardURL = `/patients/${patientId}/patient-dashboard`
  const profileURL = `/patients/${patientId}/profile`

  return (
    <>
      <TabBar
        patientId={patientId}
        linkObject={[
          {
            textKey: 'tabs.dashboard',
            href: dashboardURL,
            featureAccess: true,
          },
          { textKey: 'tabs.profile', href: profileURL, featureAccess: true },
        ]}
      />
      <PageTransition>{children}</PageTransition>
    </>
  )
}

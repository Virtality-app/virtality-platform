import PartnerLogosDashboard from '@/components/partner-logos/partner-logos-dashboard'

export const dynamic = 'force-dynamic'

const PartnerLogosPage = () => {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>Partner logos</h1>
        <p className='text-muted-foreground mt-2'>
          Manage strategic and clinical partner logo assignments for the website
          Supported by section.
        </p>
      </div>
      <PartnerLogosDashboard />
    </div>
  )
}

export default PartnerLogosPage

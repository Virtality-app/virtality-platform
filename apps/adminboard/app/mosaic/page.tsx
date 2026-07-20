import MosaicDashboard from '@/components/mosaic/mosaic-dashboard'

export const dynamic = 'force-dynamic'

const MosaicPage = () => {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>Mosaic</h1>
        <p className='text-muted-foreground mt-2'>
          Compose the landing page photo and video mosaic between Testimonials
          and Promo Video.
        </p>
      </div>
      <MosaicDashboard />
    </div>
  )
}

export default MosaicPage

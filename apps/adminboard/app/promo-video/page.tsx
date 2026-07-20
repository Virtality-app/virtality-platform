import PromoVideoDashboard from '@/components/promo-video/promo-video-dashboard'

export const dynamic = 'force-dynamic'

const PromoVideoPage = () => {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>Promo video</h1>
        <p className='text-muted-foreground mt-2'>
          Manage the MP4 shown in the website landing promo section.
        </p>
      </div>
      <PromoVideoDashboard />
    </div>
  )
}

export default PromoVideoPage

import EmailDashboard from './email-dashboard'

const EmailPage = () => {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>Email Templates</h1>
        <p className='text-muted-foreground mt-2'>
          View, preview, and edit email templates. Use sample data for previews.
        </p>
      </div>
      <EmailDashboard />
    </div>
  )
}

export default EmailPage

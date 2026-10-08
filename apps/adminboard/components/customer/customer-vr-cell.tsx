export function CustomerVrCell({ canLaunchVr }: { canLaunchVr: boolean }) {
  return (
    <div
      role='img'
      aria-label={canLaunchVr ? 'VR access' : 'No VR access'}
      title={canLaunchVr ? 'VR access' : 'No VR access'}
    >
      {canLaunchVr ? '✅' : '❌'}
    </div>
  )
}

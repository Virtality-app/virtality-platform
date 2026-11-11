/** Marks a session the clinician closed with Don't Save. */
export function NotSavedBadge() {
  return (
    <span
      title='The clinician closed this session with Don’t Save'
      className='text-muted-foreground inline-flex items-center rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'
    >
      Not saved
    </span>
  )
}

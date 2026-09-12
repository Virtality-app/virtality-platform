export function isImmersiveVideoEmpty(row: {
  title: string
  description: string | null | undefined
  thumbnailKey?: string | null
  thumbnailUrl?: string | null
  uploadId?: string | null
  objectKey?: string | null
  filename?: string | null
  sizeBytes?: number | null
}): boolean {
  const hasThumbnail = Boolean(row.thumbnailKey ?? row.thumbnailUrl)
  const hasUpload = Boolean(row.uploadId)
  const hasFile = Boolean(row.objectKey ?? row.filename ?? row.sizeBytes)
  return (
    row.title === '' &&
    (row.description == null || row.description === '') &&
    !hasThumbnail &&
    !hasUpload &&
    !hasFile
  )
}

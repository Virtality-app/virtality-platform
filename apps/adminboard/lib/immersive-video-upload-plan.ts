export const IMMERSIVE_VIDEO_PART_SIZE_BYTES = 67_108_864

export function immersiveVideoPartCount(sizeBytes: number): number {
  if (sizeBytes <= 0) {
    return 0
  }
  return Math.ceil(sizeBytes / IMMERSIVE_VIDEO_PART_SIZE_BYTES)
}

export function immersiveVideoPartSlice(
  sizeBytes: number,
  partNumber: number,
): { start: number; end: number; size: number } {
  const start = (partNumber - 1) * IMMERSIVE_VIDEO_PART_SIZE_BYTES
  const end = Math.min(start + IMMERSIVE_VIDEO_PART_SIZE_BYTES, sizeBytes)
  return {
    start,
    end,
    size: Math.max(0, end - start),
  }
}

export function planImmersiveVideoParts(sizeBytes: number): {
  partCount: number
  parts: { partNumber: number; start: number; end: number; size: number }[]
} {
  const partCount = immersiveVideoPartCount(sizeBytes)
  const parts = Array.from({ length: partCount }, (_, index) => {
    const partNumber = index + 1
    return { partNumber, ...immersiveVideoPartSlice(sizeBytes, partNumber) }
  })
  return { partCount, parts }
}

export function resumeImmersiveVideoPartNumbers(
  uploadedPartNumbers: number[],
  partCount: number,
): number[] {
  const uploaded = new Set(uploadedPartNumbers)
  const missing: number[] = []
  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    if (!uploaded.has(partNumber)) {
      missing.push(partNumber)
    }
  }
  return missing
}

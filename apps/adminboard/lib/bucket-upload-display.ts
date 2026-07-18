export function formatBucketUploadFileCount(count: number): string {
  return `${count} file${count === 1 ? '' : 's'} selected.`
}

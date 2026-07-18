export function formatBucketUploadFileCount(count: number): string {
  return `${count} file${count === 1 ? '' : 's'} selected.`
}

export function getBucketUploadSelectedFileNames(
  files: Pick<File, 'name'>[],
): string[] {
  return files.map((file) => file.name)
}

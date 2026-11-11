import { Button } from '@/components/ui/button'

type SessionLogPaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function SessionLogPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: SessionLogPaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  return (
    <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm'>
      <span>
        {first}–{last} of {total.toLocaleString()}
      </span>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

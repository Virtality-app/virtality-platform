'use client'

import { createImmersiveVideoColumns } from '@/components/resources/immersive-videos/columns'
import { ImmersiveVideoDialog } from '@/components/resources/immersive-videos/immersive-video-dialog'
import FilterBadge from '@/components/ui/filter-badge'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoCatalogState } from '@/lib/immersive-video-admin-row'
import { publishPreconditionLabel } from '@/lib/immersive-video-admin-row'
import {
  readVideoDurationSec,
  useImmersiveVideoUpload,
} from '@/hooks/use-immersive-video-upload'
import {
  DataTableBody,
  DataTableFooter,
  DataTableHeader,
} from '@virtality/ui/components/data-table'
import { useResourceTable } from '@virtality/ui/lib/use-resource-table'
import {
  useCreateImmersiveVideo,
  useDiscardImmersiveVideoIfEmpty,
  useImmersiveVideoCatalog,
  usePublishImmersiveVideo,
} from '@virtality/react-query'
import { PlusSquare } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const STATE_FILTERS: ImmersiveVideoCatalogState[] = [
  'Draft',
  'Uploading',
  'Verifying',
  'Published',
  'Republishing',
  'Unpublished',
]

export default function ImmersiveVideoTable() {
  const catalog = useImmersiveVideoCatalog()
  const createVideo = useCreateImmersiveVideo()
  const discardIfEmpty = useDiscardImmersiveVideoIfEmpty()
  const publish = usePublishImmersiveVideo()
  const upload = useImmersiveVideoUpload({
    onCatalogChange: () => void catalog.refetch(),
  })
  const [dialogRowId, setDialogRowId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileTarget, setFileTarget] = useState<{
    id: string
    mode: 'start' | 'resume'
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const data = catalog.data ?? []
  const dialogRow = data.find((row) => row.id === dialogRowId) ?? null

  const handlePickedFile = async (row: ImmersiveVideoAdminRow, file: File) => {
    setPendingFile(file)
    const durationSec = await readVideoDurationSec(file)
    const mode = row.state === 'Uploading' ? 'resume' : 'start'
    await upload.startUpload(row.id, file, durationSec, mode)
  }

  const columns = useMemo(
    () =>
      createImmersiveVideoColumns({
        upload,
        onEdit: (row) => setDialogRowId(row.id),
        onUploadFile: (row) => {
          setFileTarget({ id: row.id, mode: 'start' })
          fileInputRef.current?.click()
        },
        onResumeUpload: (row) => {
          setFileTarget({ id: row.id, mode: 'resume' })
          fileInputRef.current?.click()
        },
        onPublish: (row) => {
          const reason = publishPreconditionLabel(row)
          if (reason) {
            toast.error(reason)
            return
          }
          publish.mutate(
            { id: row.id },
            {
              onError: (error) =>
                toast.error(getErrorMessage(error, 'Failed to publish')),
            },
          )
        },
      }),
    [publish, upload],
  )

  const { table, globalFilter, setGlobalFilter, setColumnFilters } =
    useResourceTable({
      data,
      columns,
      enableColumnFilters: true,
      getRowId: (row) => row.id,
    })

  return (
    <div className='p-8'>
      <input
        ref={fileInputRef}
        type='file'
        accept='video/*,.mp4,.m4v,.mov,.webm,.mkv'
        className='hidden'
        onChange={(event) => {
          const file = event.target.files?.[0]
          const target = fileTarget
          event.target.value = ''
          if (!file || !target) return
          const row = data.find((item) => item.id === target.id)
          if (row) void handlePickedFile(row, file)
        }}
      />
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filters={
          <div className='flex flex-wrap gap-2'>
            {STATE_FILTERS.map((state) => (
              <FilterBadge
                key={state}
                name={state}
                onClick={() => {
                  setColumnFilters((current) => {
                    const existing = current.find(
                      (filter) => filter.id === 'state',
                    )
                    const selected = new Set(
                      Array.isArray(existing?.value)
                        ? (existing.value as string[])
                        : [],
                    )
                    if (selected.has(state)) selected.delete(state)
                    else selected.add(state)
                    return [
                      ...current.filter((filter) => filter.id !== 'state'),
                      { id: 'state', value: [...selected] },
                    ]
                  })
                }}
              />
            ))}
          </div>
        }
      >
        <Button
          variant='primary'
          className='ml-auto flex items-center'
          onClick={() =>
            createVideo.mutate(undefined, {
              onSuccess: (result) => setDialogRowId(result.id),
              onError: (error) =>
                toast.error(getErrorMessage(error, 'Failed to create video')),
            })
          }
        >
          <PlusSquare />
          Create
        </Button>
      </DataTableHeader>
      <DataTableBody
        table={table}
        columns={columns}
        isLoading={catalog.isPending}
        rowNavigation={(id) => setDialogRowId(id)}
      />
      <DataTableFooter table={table} />
      <ImmersiveVideoDialog
        open={dialogRowId != null}
        row={dialogRow}
        pendingFile={pendingFile}
        upload={upload}
        onFile={(file) => {
          if (dialogRow) void handlePickedFile(dialogRow, file)
        }}
        onOpenChange={(open) => {
          if (open) return
          const id = dialogRowId
          setDialogRowId(null)
          setPendingFile(null)
          if (id) {
            discardIfEmpty.mutate({ id })
          }
        }}
      />
    </div>
  )
}

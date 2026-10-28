'use client'

import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@virtality/ui/components/dropdown-menu'
import { Archive, Copy, Ellipsis, Files, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getQueryClient,
  useCopyReusableProgram,
  useORPC,
  useRetireReusableProgram,
} from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'

interface ProgramActionsCellProps {
  programId: string
}

const ProgramActionsCell = ({ programId }: ProgramActionsCellProps) => {
  const router = useRouter()
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const { t } = useClientT(['programs', 'common'])
  const [retireOpen, setRetireOpen] = useState(false)
  const { mutate: retireProgram, isPending } = useRetireReusableProgram({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.reusableProgram.list.key(),
      })
      setRetireOpen(false)
    },
  })
  const { mutate: copyProgram, isPending: isCopyPending } =
    useCopyReusableProgram({
      onSuccess: (copiedProgram) => {
        queryClient.invalidateQueries({
          queryKey: orpc.reusableProgram.list.key(),
        })
        router.push(`/programs/${copiedProgram.id}/edit`)
      },
    })

  const copyId = () => {
    navigator.clipboard.writeText(programId)
  }

  const handleMakeCopy = () => copyProgram({ id: programId })

  const handleRetire = () => retireProgram({ id: programId })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost' className='size-6'>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent id='actions'>
          <DropdownMenuItem asChild>
            <Link href={`/programs/${programId}/edit`}>
              <Pencil />
              {t('actions.edit')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isCopyPending} onClick={handleMakeCopy}>
            <Files />
            {t('actions.makeCopy')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyId}>
            <Copy />
            {t('actions.copyId')}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant='destructive'
            onClick={() => setRetireOpen(true)}
          >
            <Archive />
            {t('actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={retireOpen} onOpenChange={setRetireOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('retire.title')}</DialogTitle>
            <DialogDescription>{t('retire.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRetireOpen(false)}>
              {t('common:btn.cancel')}
            </Button>
            <Button
              variant='destructive'
              disabled={isPending}
              onClick={handleRetire}
            >
              {t('retire.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProgramActionsCell

'use client'

import { Button } from '@virtality/ui/components/button'
import RetireProgramDialog from '@/components/dialogs/retire-program-dialog'
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
      <RetireProgramDialog
        programId={programId}
        open={retireOpen}
        onOpenChange={setRetireOpen}
      />
    </>
  )
}

export default ProgramActionsCell

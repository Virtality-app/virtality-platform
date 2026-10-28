'use client'

import { Badge } from '@virtality/ui/components/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TranslationTableRow } from '@/lib/translation-rows'
import { TranslationField } from '@/components/translations/translation-field'
import { useTranslationEditForm } from '@/components/translations/use-translation-edit-form'

type TranslationEditDialogProps = {
  row: TranslationTableRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

function greekHint(status: TranslationTableRow['status']) {
  switch (status) {
    case 'needs-review':
      return 'Agent draft. Save keeps it as written.'
    case 'outdated':
      return 'The English changed after this was translated.'
    default:
      return undefined
  }
}

function TranslationEditForm({
  row,
  onDone,
}: {
  row: TranslationTableRow
  onDone: () => void
}) {
  const form = useTranslationEditForm(row, onDone)
  const showDraftHint =
    row.status === 'outdated' &&
    row.greekDraft !== null &&
    row.greekDraft !== row.greek

  return (
    <>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-xs'>
          Repo default:{' '}
          <span className='text-foreground'>{row.defaultEnglish}</span>
        </p>
        <div className='space-y-1.5'>
          <TranslationField
            id='translation-english'
            label='English'
            value={form.english}
            onChange={form.setEnglish}
            missing={form.missingEnglish}
          />
          {row.englishOverridden && (
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>Overridden</Badge>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={form.isPending}
                onClick={form.resetEnglish}
              >
                Reset to default
              </Button>
            </div>
          )}
        </div>
        <TranslationField
          id='translation-greek'
          label='Greek'
          value={form.greek}
          onChange={form.setGreek}
          missing={form.greek.trim() === '' ? [] : form.missingGreek}
          hint={greekHint(row.status)}
        />
        {showDraftHint && (
          <p className='text-muted-foreground text-xs'>
            Latest Greek draft:{' '}
            <span className='text-foreground'>{row.greekDraft}</span>
          </p>
        )}
      </div>
      <DialogFooter>
        <Button
          type='button'
          variant='primary'
          disabled={!form.canSave || form.isPending}
          onClick={form.save}
        >
          {row.status === 'needs-review' ? 'Approve' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function TranslationEditDialog({
  row,
  open,
  onOpenChange,
}: TranslationEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit translation</DialogTitle>
          <DialogDescription>
            {row.namespace} · {row.key}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <TranslationEditForm row={row} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

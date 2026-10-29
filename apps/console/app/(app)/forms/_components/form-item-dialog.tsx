'use client'

import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ReactNode } from 'react'
import { useClientT } from '@/i18n/use-client-t'

export function FormItemDialog({
  children,
  formItem,
}: {
  children: ReactNode
  formItem: { title: string; url: string }
}) {
  const { t } = useClientT(['home', 'common'])
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='flex h-9/10 max-w-3/5! flex-col max-xl:max-w-9/10!'>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className='flex-1'>
          <iframe src={formItem.url} width='auto' className='size-full'>
            {t('forms.loading')}
          </iframe>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>{t('common:btn.close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

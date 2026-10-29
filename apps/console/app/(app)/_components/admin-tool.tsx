'use client'

import { Button } from '@virtality/ui/components/button'
import { GripVertical } from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@virtality/ui/components/popover'
import { Label } from '@virtality/ui/components/label'
import { Input } from '@virtality/ui/components/input'
import { ChangeEvent, useState } from 'react'
import { notify } from '@/lib/notify'
import { useClientT } from '@/i18n/use-client-t'
import { authClient } from '@/auth-client'
import useIsAuthed from '@/hooks/use-is-authed'
import useMounted from '@/hooks/use-mounted'
import {
  setForceRenewPrompt,
  useForceRenewPrompt,
} from '@/lib/dev-force-renew-prompt'

const AdminTool = ({ isImpersonating }: { isImpersonating?: boolean }) => {
  const { t } = useClientT('home')
  const { data, isPending } = useIsAuthed()
  const mounted = useMounted()
  const user = data?.user
  const [open, setOpen] = useState(false)
  const [host, setHost] = useState('')
  const forceRenewPrompt = useForceRenewPrompt()

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    const { value } = target
    setHost(value)
  }

  const handleImpersonate = async () => {
    if (host === '') return

    const { error } = await authClient.admin.impersonateUser({
      userId: host, // required
    })

    if (error) {
      console.error('[Error]: ', error.code, ', message: ', error.message)
      return
    }

    setHost('')
    window.location.reload()
  }

  const handleStopImpersonate = async () => {
    const { error } = await authClient.admin.stopImpersonating()
    if (error) {
      console.error('[Error]: ', error.code, ', message: ', error.message)
      return
    }
    window.location.reload()
  }

  const testVerificationEmail = async () => {
    try {
      await authClient.sendVerificationEmail({
        email: 's.pnevmatikakis@virtality.app',
        callbackURL: 'http://localhost:3001',
      })
    } catch (error) {
      console.error(error)
      notify.error({ key: 'admin.verificationEmailFailed', ns: 'home' })
    }
  }

  if (!mounted || isPending) return null

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        {(user?.role === 'admin' || isImpersonating) && (
          <Button
            onClick={() => setOpen(!open)}
            className='absolute top-10 right-0 h-10 rounded-l-full pr-1 hover:w-11.5'
          >
            <GripVertical />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className='grid grid-rows-2 gap-1'>
          <Label htmlFor='userId'>{t('admin.userId')}</Label>
          <Input
            type='text'
            id='userId'
            value={host}
            onChange={handleInputChange}
          />

          <Button onClick={handleImpersonate}>{t('admin.impersonate')}</Button>
          <Button onClick={handleStopImpersonate}>
            {t('admin.stopImpersonate')}
          </Button>
          <Button disabled onClick={testVerificationEmail}>
            {t('admin.sendEmail')}
          </Button>
          <Button onClick={() => setForceRenewPrompt(!forceRenewPrompt)}>
            {forceRenewPrompt
              ? t('admin.hideRenewPrompt')
              : t('admin.forceRenewPrompt')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AdminTool

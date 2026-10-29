'use client'
import { Button } from '@virtality/ui/components/button'
import { notify } from '@/lib/notify'
import { authClient } from '@/auth-client'
import { Field, FieldSet } from '@/components/ui/field'
import { useListAccounts, useORPC } from '@virtality/react-query'
import { X } from 'lucide-react'
import { SOCIAL_PROVIDERS } from '@/data/static/providers'
import { Badge } from '@virtality/ui/components/badge'
import { useQueryClient } from '@tanstack/react-query'
import { Account } from 'better-auth'
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from '@virtality/ui/components/tooltip'
import { useClientT } from '@/i18n/use-client-t'

export const SignInMethods = () => {
  const { t } = useClientT(['user', 'common'])
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const { data: accounts } = useListAccounts()

  const handleUnlinkAccount = async (account: Account) => {
    await authClient.unlinkAccount({
      providerId: account.providerId,
      fetchOptions: {
        onSuccess: () => {
          notify.success({ key: 'profile.toast.accountUnlinked', ns: 'user' })

          queryClient.invalidateQueries({
            queryKey: orpc.account.list.key(),
          })
        },
        onError: (error) => {
          console.error(error)
          notify.error({ key: 'profile.toast.accountUnlinkFailed', ns: 'user' })
        },
      },
    })
  }

  return (
    <Field>
      <FieldSet>
        <div className='text-xl font-bold'>{t('profile.signInMethods')}</div>
        {accounts?.map((account) => {
          const provider = SOCIAL_PROVIDERS.find(
            (provider) => provider.name === account.providerId,
          )

          if (account.providerId === 'credential') return

          return (
            <Badge key={account.id} variant='outline' className='gap-2 p-2'>
              <span className='text-sm' style={{ color: provider?.color }}>
                {provider?.icon}
              </span>
              <span className='text-sm capitalize'>{provider?.name}</span>
              <div className='border-l pl-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleUnlinkAccount(account)}
                    >
                      <X />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='bottom'>
                    {t('profile.unlink')}
                    <TooltipArrow className='dark:fill-white' />
                  </TooltipContent>
                </Tooltip>
              </div>
            </Badge>
          )
        })}
      </FieldSet>
    </Field>
  )
}

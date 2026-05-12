import { auth } from '@virtality/auth'
import { authed } from '../../middleware/auth.ts'

export const listAccounts = authed
  .route({ path: '/account/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { headers } = context
    const accounts = await auth.api.listUserAccounts({
      headers,
    })
    return accounts
  })

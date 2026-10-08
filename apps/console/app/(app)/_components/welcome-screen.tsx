'use client'

import { H1 } from '@/components/ui/typography'
import { useRow, useStore } from 'tinybase/ui-react'
import { UserLocalData } from '@/types/models'
import useIsAuthed from '@/hooks/use-is-authed'
import useMounted from '@/hooks/use-mounted'
import { Skeleton } from '@/components/ui/skeleton'
import AdminTool from './admin-tool'
import AccountMismatchDialog from './account-mismatch-dialog'
import SidebarTip from './sidebar-tip'
import DropdownTip from './dropdown-tip'

/** The original `/` page, shown while the home dashboard is switched off. */
const WelcomeScreen = ({ isImpersonating }: { isImpersonating?: boolean }) => {
  const { data, isPending } = useIsAuthed()
  const mounted = useMounted()

  const store = useStore()
  const userLocalData = useRow('users', data?.user.id ?? '') as UserLocalData

  const showSuggestionSidebar = userLocalData.dashboardSuggestionSidebar ?? true
  const showSuggestionDropdown =
    userLocalData.dashboardSuggestionDropdown ?? true

  const handleSidebarTipClose = () => {
    if (!data || !showSuggestionSidebar) return

    store?.setCell('users', data.user.id, 'dashboardSuggestionSidebar', false)
  }

  const handleDropdownTipClose = () => {
    if (!data || !showSuggestionDropdown) return
    store?.setCell('users', data.user.id, 'dashboardSuggestionDropdown', false)
  }

  const user = data?.user

  return (
    <section className='h-screen-with-header relative flex flex-col justify-center p-10'>
      <AccountMismatchDialog />
      <AdminTool isImpersonating={isImpersonating} />

      <div className='container'>
        <H1>
          <span>Welcome, </span>
          {isPending || !mounted ? (
            <Skeleton className='inline-block h-6 w-40' />
          ) : (
            <span>{user?.name}</span>
          )}
          <span>, to the</span>
          <span className='text-vital-blue-700'> Virtality </span>
          <span>Console.</span>
        </H1>
      </div>
      <div className='flex flex-1 items-center'>
        {showSuggestionSidebar && (
          <SidebarTip handleSidebarTipClose={handleSidebarTipClose} />
        )}
      </div>

      {showSuggestionDropdown && (
        <DropdownTip handleDropdownTipClose={handleDropdownTipClose} />
      )}
    </section>
  )
}

export default WelcomeScreen

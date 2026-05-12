import { authClient } from '@/auth-client'
import { headers as getHeaders } from 'next/headers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, Key, UserIcon } from 'lucide-react'
import SessionsTab from './_components/sessions-tab'
import ProfileInfo from './_components/profile-info'
import { redirect } from 'next/navigation'

const ProfilePage = async () => {
  const headers = await getHeaders()

  const { data: sessionData, error: sessionError } =
    await authClient.getSession({
      fetchOptions: { headers },
    })

  if (!sessionData) redirect('/sign-in')

  const { data: sessionList, error: sessionListError } =
    await authClient.listSessions({
      fetchOptions: { headers },
    })

  const { user, session } = sessionData

  return (
    <div className='h-full dark:bg-zinc-950'>
      <div className='mx-auto max-w-3xl p-4'>
        <Tabs defaultValue='info'>
          <TabsList className='w-full gap-2'>
            <TabsTrigger value='info'>
              <UserIcon />
              Info
            </TabsTrigger>
            <TabsTrigger value='organizations'>
              <Building />
            </TabsTrigger>
            <TabsTrigger value='sessions'>
              <Key />
              Sessions
            </TabsTrigger>
          </TabsList>
          <TabsContent value='info'>
            <ProfileInfo user={user} />
          </TabsContent>
          <TabsContent value='organizations'>Organizations</TabsContent>
          <TabsContent value='sessions'>
            <SessionsTab
              sessions={sessionList ?? []}
              currentSessionToken={session.token}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfilePage

'use client'
import { useCallback, useState } from 'react'
import { notify } from '@/lib/notify'
import { authClient } from '@/auth-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  useORPC,
  useStartAccountDeletion,
  useUpdateUserInfo,
} from '@virtality/react-query'
import { invalidateActivePendingAccountDeletion } from './profile-info-form'
import {
  baseURL,
  BasicInfoFormSchema,
  EmailFormSchema,
  toFormValues,
  type EmailForm,
  type SessionUser,
  type UserForm,
} from './profile-info-form'

export const useProfileInfo = (user: SessionUser) => {
  const { refetch: refetchSession } = authClient.useSession()
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  const basicInfoForm = useForm<UserForm>({
    resolver: zodResolver(BasicInfoFormSchema),
    defaultValues: toFormValues(user),
  })

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: { email: user?.email ?? '' },
  })

  const syncFormFromSession = useCallback(async () => {
    await refetchSession({ query: { disableCookieCache: true } })

    const { data: freshSession } = await authClient.getSession({
      query: { disableCookieCache: true },
    })

    const freshUser = freshSession?.user
    if (!freshUser) return

    basicInfoForm.reset(toFormValues(freshUser), { keepDirty: false })
  }, [basicInfoForm, refetchSession])

  const { mutate: updateUserInfo, isPending: isUpdatingUser } =
    useUpdateUserInfo({
      onSuccess: async () => {
        notify.success({ key: 'profile.toast.updated', ns: 'user' })
        await syncFormFromSession()
      },
      onError: (error) => {
        console.error(error)
        notify.error({ key: 'profile.toast.updateFailed', ns: 'user' })
      },
    })

  const onSubmitBasicInfo = (data: UserForm) => {
    updateUserInfo({
      name: data.name,
      phoneNumber: data.phoneNumber ?? null,
      image: data.image ?? undefined,
    })
  }

  const onSubmitEmail = async (data: EmailForm) => {
    if (data.email === user.email) return

    setIsUpdatingEmail(true)

    await authClient.changeEmail({
      newEmail: data.email,
      callbackURL: `${baseURL}/user/${user.id}/profile`,
      fetchOptions: {
        onSuccess: () =>
          void notify.success({
            key: 'profile.toast.emailVerification',
            ns: 'user',
          }),
        onError: (error) => {
          console.error(error)
          notify.error({ key: 'profile.toast.emailUpdateFailed', ns: 'user' })
        },
      },
    })

    setIsUpdatingEmail(false)

    emailForm.reset({ email: user.email ?? '' }, { keepDirty: false })
  }

  const { mutate: startAccountDeletion, isPending: isStartingDeletion } =
    useStartAccountDeletion({
      onSuccess: async () => {
        await invalidateActivePendingAccountDeletion(queryClient, orpc)
        notify.success({ key: 'profile.toast.deletionStarted', ns: 'user' })
      },
      onError: (error) => {
        console.error(error)
        notify.error({ key: 'profile.toast.deletionStartFailed', ns: 'user' })
      },
    })

  const handleDeleteUser = () => {
    startAccountDeletion(undefined)
  }

  return {
    isStartingDeletion,
    isUpdatingEmail,
    isUpdatingUser,
    basicInfoForm,
    emailForm,
    onSubmitBasicInfo,
    onSubmitEmail,
    handleDeleteUser,
  }
}

'use client'
import { Input } from '@virtality/ui/components/input'
import { useClientT } from '@/i18n/use-client-t'
import { Fragment } from 'react'
import { Button } from '@virtality/ui/components/button'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@virtality/ui/components/separator'
import {
  useActivePendingAccountDeletion,
  useActivePendingPasswordChange,
  useHasPassword,
} from '@virtality/react-query'
import { ControllerField } from './controller-field'
import { ImageField } from './profile-image-field'
import { PasswordCardBody } from './profile-password-card-body'
import { DeleteAccountCard } from './profile-delete-account-card'
import { SignInMethods } from './profile-sign-in-methods'
import { useProfileInfo } from './use-profile-info'
import {
  getBasicInfoFormFields,
  getEmailFormField,
  toFormValues,
  type SessionUser,
} from './profile-info-form'

interface ProfileInfoProps {
  user: SessionUser
}

const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const { t } = useClientT(['user', 'common'])
  const basicInfoFormFields = getBasicInfoFormFields(t)
  const emailFormField = getEmailFormField(t)
  const { data: hasPassword, isLoading: isLoadingHasPassword } =
    useHasPassword()
  const {
    data: activePendingPasswordChange,
    isLoading: isLoadingPendingPasswordChange,
  } = useActivePendingPasswordChange()
  const {
    data: activePendingAccountDeletion,
    isLoading: isLoadingPendingAccountDeletion,
  } = useActivePendingAccountDeletion()

  usePageViewTracking({
    props: { route_group: 'user', tab_view: 'user-profile' },
  })

  const {
    isStartingDeletion,
    isUpdatingEmail,
    isUpdatingUser,
    basicInfoForm,
    emailForm,
    onSubmitBasicInfo,
    onSubmitEmail,
    handleDeleteUser,
  } = useProfileInfo(user)

  return (
    <div className='flex flex-col gap-6 rounded-lg'>
      <Card>
        <form onSubmit={basicInfoForm.handleSubmit(onSubmitBasicInfo)}>
          <CardContent>
            <FieldGroup className='mb-6'>
              <ControllerField
                name='image'
                control={basicInfoForm.control}
                meta={basicInfoFormFields['image']}
              >
                {({ field }) => <ImageField field={field} user={user} />}
              </ControllerField>

              {(['name', 'phoneNumber'] as const).map((name) => (
                <Fragment key={name}>
                  <Separator />
                  <ControllerField
                    name={name}
                    meta={basicInfoFormFields[name]}
                    control={basicInfoForm.control}
                  >
                    {({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={basicInfoFormFields[name].placeholder}
                        value={(field.value ?? '') as string}
                      />
                    )}
                  </ControllerField>
                </Fragment>
              ))}

              <Separator />

              <SignInMethods />
            </FieldGroup>
          </CardContent>
          <CardFooter className='border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                basicInfoForm.reset(toFormValues(user), { keepDirty: false })
              }}
              disabled={!basicInfoForm.formState.isDirty || isUpdatingUser}
            >
              {t('profile.clearChanges')}
            </Button>
            <Button
              type='submit'
              className='ml-auto'
              disabled={!basicInfoForm.formState.isDirty || isUpdatingUser}
            >
              {isUpdatingUser ? t('profile.saving') : t('common:btn.save')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
          <CardContent>
            <FieldGroup className='mb-6'>
              <ControllerField
                name='email'
                control={emailForm.control}
                meta={emailFormField['email']}
              >
                {({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    type='email'
                    name={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={emailFormField['email'].placeholder}
                    value={(field.value ?? '') as string}
                  />
                )}
              </ControllerField>
            </FieldGroup>
          </CardContent>
          <CardFooter className='border-t'>
            <Button
              type='submit'
              className='ml-auto'
              disabled={!emailForm.formState.isDirty || isUpdatingEmail}
            >
              {isUpdatingEmail ? t('profile.saving') : t('profile.change')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>
            {t('profile.password.title')}
          </CardTitle>
        </CardHeader>

        <PasswordCardBody
          isLoading={isLoadingHasPassword || isLoadingPendingPasswordChange}
          hasPassword={hasPassword}
          activePendingPasswordChange={activePendingPasswordChange}
        />
      </Card>

      <DeleteAccountCard
        isLoading={isLoadingPendingAccountDeletion}
        pending={activePendingAccountDeletion}
        isStarting={isStartingDeletion}
        onDelete={handleDeleteUser}
      />
    </div>
  )
}

export default ProfileInfo

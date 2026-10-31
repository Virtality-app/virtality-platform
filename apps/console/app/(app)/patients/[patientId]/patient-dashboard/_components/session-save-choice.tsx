import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { SessionCompletionSaveChoice } from '@virtality/shared/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useClientT } from '@/i18n/use-client-t'
import type { SessionCompletionDialogState } from '@/lib/session-completion-dialog'

interface SessionSaveChoiceProps {
  completionState: SessionCompletionDialogState
  setCompletionState: Dispatch<SetStateAction<SessionCompletionDialogState>>
  showUpdateSourceProgram: boolean
  sourceProgramName?: string | null
}

/** The Session Completion Save Choice: leave the Program Library, update it, or save a new program. */
const SessionSaveChoice = ({
  completionState,
  setCompletionState,
  showUpdateSourceProgram,
  sourceProgramName,
}: SessionSaveChoiceProps) => {
  const { t } = useClientT('patient-dashboard')
  const { saveChoice } = completionState

  return (
    <fieldset className='space-y-3'>
      <legend className='mb-3 text-sm font-medium'>
        {t('sessionDialog.programLibrary')}
      </legend>
      <RadioGroup
        value={saveChoice}
        onValueChange={(value) =>
          setCompletionState((current) => ({
            ...current,
            saveChoice: value as SessionCompletionSaveChoice,
            showUpdateConfirmation: false,
          }))
        }
      >
        <div className='flex items-start gap-3'>
          <RadioGroupItem
            value={SessionCompletionSaveChoice.FINISH_ONLY}
            id='finish-only'
          />
          <Label htmlFor='finish-only' className='font-normal'>
            {t('sessionDialog.finishOnly')}
          </Label>
        </div>

        {showUpdateSourceProgram && (
          <div className='flex items-start gap-3'>
            <RadioGroupItem
              value={SessionCompletionSaveChoice.UPDATE_SOURCE_PROGRAM}
              id='update-source-program'
            />
            <Label htmlFor='update-source-program' className='font-normal'>
              {t('sessionDialog.updateProgram')}
              {sourceProgramName ? ` (${sourceProgramName})` : ''}
            </Label>
          </div>
        )}

        <div className='flex items-start gap-3'>
          <RadioGroupItem
            value={SessionCompletionSaveChoice.SAVE_AS_NEW_PROGRAM}
            id='save-as-new-program'
          />
          <Label htmlFor='save-as-new-program' className='font-normal'>
            {t('sessionDialog.saveAsNew')}
          </Label>
        </div>
      </RadioGroup>

      {saveChoice === SessionCompletionSaveChoice.SAVE_AS_NEW_PROGRAM && (
        <div className='space-y-2'>
          <Label htmlFor='new-program-name'>
            {t('sessionDialog.programName')}
          </Label>
          <Input
            id='new-program-name'
            value={completionState.newProgramName}
            onChange={(event) =>
              setCompletionState((current) => ({
                ...current,
                newProgramName: event.target.value,
              }))
            }
          />
        </div>
      )}

      {saveChoice === SessionCompletionSaveChoice.UPDATE_SOURCE_PROGRAM &&
        completionState.showUpdateConfirmation && (
          <p className='text-muted-foreground text-sm' role='alert'>
            {t('sessionDialog.overwriteWarning')}
          </p>
        )}
    </fieldset>
  )
}

export default SessionSaveChoice

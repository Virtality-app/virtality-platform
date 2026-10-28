import {
  useResetTranslation,
  useUpsertTranslation,
} from '@virtality/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  missingPlaceholders,
  type TranslationTableRow,
} from '@/lib/translation-rows'

export function useTranslationEditForm(
  row: TranslationTableRow,
  onDone: () => void,
) {
  const [english, setEnglish] = useState(row.english)
  const [greek, setGreek] = useState(row.greek)
  const upsert = useUpsertTranslation()
  const reset = useResetTranslation()

  const missingEnglish = missingPlaceholders(row.defaultEnglish, english)
  const missingGreek = missingPlaceholders(english, greek)
  const englishChanged = english !== row.english
  // Re-saving unchanged Greek approves a draft and clears an outdated flag.
  const greekChanged =
    greek.trim() !== '' && (greek !== row.greek || row.status !== 'done')
  const canSave =
    (englishChanged || greekChanged) &&
    english.trim() !== '' &&
    missingEnglish.length === 0 &&
    (greek.trim() === '' || missingGreek.length === 0)

  const target = { namespace: row.namespace, key: row.key }
  const fail = (message: string) => (error: Error) => {
    toast.error(`${message}: ${error.message}`)
  }

  const save = async () => {
    try {
      // English first: Greek is stamped with the English it was written from.
      if (englishChanged) {
        await upsert.mutateAsync({ locale: 'en', ...target, value: english })
      }
      if (greek.trim() !== '' && (greekChanged || englishChanged)) {
        await upsert.mutateAsync({ locale: 'el', ...target, value: greek })
      }
      toast.success('Translation saved')
      onDone()
    } catch (error) {
      fail('Failed to save translation')(error as Error)
    }
  }

  const resetEnglish = () =>
    reset.mutate(
      { locale: 'en', ...target },
      {
        onSuccess: () => {
          toast.success('English reset to default')
          onDone()
        },
        onError: fail('Failed to reset translation'),
      },
    )

  return {
    english,
    setEnglish,
    greek,
    setGreek,
    missingEnglish,
    missingGreek,
    canSave,
    save,
    resetEnglish,
    isPending: upsert.isPending || reset.isPending,
  }
}

import { skipToken, useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'

export const useEmailTemplates = () => {
  const orpc = useORPC()
  return useQuery(orpc.email.templates.list.queryOptions())
}

export const useEmailTemplate = (templateId: string | null) => {
  const orpc = useORPC()
  return useQuery(
    orpc.email.templates.get.queryOptions({
      input: templateId ? { templateId } : skipToken,
    }),
  )
}

export const useEmailTemplatePreview = (templateId: string | null) => {
  const orpc = useORPC()
  return useQuery(
    orpc.email.templates.preview.queryOptions({
      input: templateId ? { templateId } : skipToken,
    }),
  )
}

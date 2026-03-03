import { z } from 'zod'

export const WaitlistSchema = z.object({
  email: z.email({
    message: 'Provide valid email example@domain.com',
  }),
})

export type WaitlistSchemaType = z.infer<typeof WaitlistSchema>

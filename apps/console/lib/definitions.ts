import { z } from 'zod/v4'
import { translateMessage } from '@/i18n/translate-message'
import { isPatientLanguage, isPatientSex } from './patient-form-validation'
import { isValidNumber } from './utils'
import { isValidPassword } from '@virtality/shared/utils'

export const RoleEnum = z.enum(['admin', 'owner', 'user', 'employee'])

export type Role = z.infer<typeof RoleEnum>

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().min(1).email(),
  image: z.string().nullable().optional(),
  phoneNumber: z.string().max(15).nullable(),
})

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(32),
  email: z.email(),
  // image: z.string().nullable().optional(),
  phoneNumber: z.string().max(15).nullable(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type SignInForm = z.infer<typeof SignInSchema>

export const SignUpSchema = z.object({
  name: z.string().trim().min(1).max(32),
  email: z.email(),
  password: z.string().check(isValidPassword),
})

export type SignUpForm = z.infer<typeof SignUpSchema>

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  category: z.string(),
  direction: z.string(),
  image: z.url().nullable(),
  bodyPart: z.string(),
  item: z.string().nullable(),
})

export const ExerciseArraySchema = z.array(ExerciseSchema)

export const SessionExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  patientSessionId: z.string(),
  reps: z.number(),
  sets: z.number(),
  restTime: z.number(),
  holdTime: z.number(),
  speed: z.number(),
})

export const SessionExerciseArraySchema = z.array(SessionExerciseSchema)

export const PatientFormSchema = z.object({
  name: z.string().nonempty(),
  weight: z
    .string()
    .refine(isValidNumber, {
      error: translateMessage('weight_positive'),
    })
    .optional(),
  height: z
    .string()
    .refine(isValidNumber, {
      error: translateMessage('height_positive'),
    })
    .optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return val.length >= 10 && val.length <= 15
      },
      {
        error: translateMessage('phone_length'),
      },
    ),
  email: z.string().refine(
    (val) => {
      if (!val) return true

      if (z.regexes.email.test(val)) return true
      else return false
    },
    {
      error: translateMessage('invalid_email'),
    },
  ),
  dob: z.string().optional(),
  sex: z.string().refine(isPatientSex, {
    error: translateMessage('sex_required'),
  }),
  image: z.instanceof(File).or(z.string()).optional().nullable(),
  language: z.string().refine(isPatientLanguage, {
    error: translateMessage('language_required'),
  }),
  occupation: z.string().optional(),
  // medical history
  anamneses: z.string().nullable(),
  complaints: z.string().nullable(),
  expectations: z.string().nullable(),
  diagnosis: z.string().nullable(),
  nprs: z.string().nullable(),
})

export type PatientFormInput = z.input<typeof PatientFormSchema>
export type PatientForm = z.infer<typeof PatientFormSchema>

export const DeviceSchema = z.object({
  id: z.string(),
  deviceId: z.string().nullable(),
  userId: z.string(),
  name: z.string().min(1).max(32),
  model: z
    .string()
    .nonempty({ error: translateMessage('model_required') })
    .nullable(),
  lastUsed: z.date(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const ProgressDataSchema = z.object({
  previousRep: z.number(),
  progress: z.number(),
})

export type ProgressData = z.infer<typeof ProgressDataSchema>

export const BugReportFormSchema = z.object({
  title: z.string().min(2),
  platform: z.enum(['web', 'vr'], {
    error: translateMessage('platform_required'),
  }),
  description: z.string().min(10).max(500),
  image: z.array(z.instanceof(File)).or(z.string()).optional().nullable(),
})

export type BugReportForm = z.infer<typeof BugReportFormSchema>

import { adminAuthed } from '../../middleware/admin.ts'
import { z } from 'zod'
import { patientScopeFilter, UNKNOWN_OWNER_ID } from './analytics-filters.ts'
import { buildEffectivenessReport } from './effectiveness-report-aggregation.ts'
import { sessionActivity } from './session-activity.ts'

const MIN_WINDOW_DAYS = 3
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const getUTCDayStart = (date: Date): Date => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  return new Date(Date.UTC(year, month, day))
}

const getUTCDayAfter = (date: Date): Date => {
  const nextDay = new Date(date)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  return nextDay
}

const toISODate = (date: Date): string => date.toISOString().slice(0, 10)

const getInclusiveDaysBetween = (from: Date, to: Date): number =>
  Math.floor((to.getTime() - from.getTime()) / ONE_DAY_MS) + 1

const EffectivenessReportInput = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    ownerUserId: z.string().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const fromDay = getUTCDayStart(value.from)
    const toDay = getUTCDayStart(value.to)

    if (fromDay.getTime() > toDay.getTime()) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: '"to" must be on or after "from".',
      })
      return
    }

    const daysInWindow = getInclusiveDaysBetween(fromDay, toDay)

    if (daysInWindow < MIN_WINDOW_DAYS) {
      ctx.addIssue({
        code: 'custom',
        path: ['from'],
        message: `Date window must be at least ${MIN_WINDOW_DAYS} days.`,
      })
    }
  })

const getDefaultEffectivenessWindowUTC = (): { from: Date; to: Date } => {
  const to = getUTCDayStart(new Date())
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 29)
  return { from, to }
}

const getEffectivenessReport = adminAuthed
  .route({
    path: '/dashboard/analytics/effectiveness-report',
    method: 'GET',
  })
  .input(EffectivenessReportInput.optional())
  .handler(async ({ context, input }) => {
    const { prisma } = context

    const defaultWindow = getDefaultEffectivenessWindowUTC()
    const from = input ? getUTCDayStart(input.from) : defaultWindow.from
    const to = input ? getUTCDayStart(input.to) : defaultWindow.to
    const toExclusive = getUTCDayAfter(to)
    const ownerUserId =
      input?.ownerUserId === undefined
        ? undefined
        : input.ownerUserId === null
          ? UNKNOWN_OWNER_ID
          : input.ownerUserId

    const patients = await prisma.patient.findMany({
      where: patientScopeFilter,
      select: {
        id: true,
        userId: true,
      },
    })

    const sessions = await prisma.patientSession.findMany({
      where: {
        deletedAt: null,
        completedAt: {
          not: null,
          gte: from,
          lt: toExclusive,
        },
        status: 'COMPLETED',
        patient: patientScopeFilter,
      },
      select: {
        patientId: true,
        createdAt: true,
        completedAt: true,
        sessionData: {
          select: {
            value: true,
          },
        },
        sessionExercise: {
          select: {
            sets: true,
            reps: true,
            holdTime: true,
            speed: true,
          },
        },
      },
    })

    const userIds = [
      ...new Set(
        patients
          .map((patient) => patient.userId)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    ]

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })

    const userNamesById = users.reduce<Record<string, string | null>>(
      (acc, user) => {
        acc[user.id] = user.name
        return acc
      },
      {},
    )

    const report = buildEffectivenessReport({
      patients,
      sessions: sessions.map((session) => ({
        patientId: session.patientId,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt!.toISOString(),
        sessionData: session.sessionData,
        sessionExercises: session.sessionExercise,
      })),
      userNamesById,
      from: toISODate(from),
      to: toISODate(to),
      ownerUserId,
    })

    return {
      from: toISODate(from),
      to: toISODate(to),
      ...report,
      byUser: report.byUser.map((user) => ({
        ...user,
        userId: user.userId === UNKNOWN_OWNER_ID ? null : user.userId,
      })),
      ownerOptions: report.ownerOptions,
    }
  })

export const dashboard = {
  getEffectivenessReport,
  ...sessionActivity,
}

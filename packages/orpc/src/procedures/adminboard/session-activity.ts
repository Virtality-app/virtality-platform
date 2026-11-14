import type { PrismaClient } from '@virtality/db'
import { adminAuthed } from '../../middleware/admin.ts'
import { z } from 'zod'
import { dashboardPatientScope } from './analytics-filters.ts'
import {
  resolveDashboardWindow,
  toISODate,
  validateDashboardWindow,
  type DashboardWindowInput,
} from './dashboard-window.ts'
import { buildSessionActivityReport } from './session-activity-report.ts'
import { SESSION_SAVED_FILTERS, buildSessionLog } from './session-log.ts'
import { SESSION_TYPES } from './session-type.ts'

const windowSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    allTime: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    const issue = validateDashboardWindow(value)
    if (issue) {
      ctx.addIssue({
        code: 'custom',
        path: [issue.path],
        message: issue.message,
      })
    }
  })

const loadWindow = async (
  prisma: PrismaClient,
  input: DashboardWindowInput,
) => {
  const first = input.allTime
    ? await prisma.patientSession.findFirst({
        where: { patient: dashboardPatientScope },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      })
    : null
  return resolveDashboardWindow(input, first?.createdAt ?? null)
}

const loadUserNames = async (
  prisma: PrismaClient,
  userIds: (string | null)[],
): Promise<Record<string, string | null>> => {
  const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))]
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  })
  return Object.fromEntries(users.map((user) => [user.id, user.name]))
}

const getSessionActivity = adminAuthed
  .route({ path: '/dashboard/analytics/session-activity', method: 'GET' })
  .input(
    windowSchema.and(
      z.object({ granularity: z.enum(['day', 'week']).default('week') }),
    ),
  )
  .handler(async ({ context, input }) => {
    const { prisma } = context
    const { from, to, toExclusive } = await loadWindow(prisma, input)

    // Every session counts: session status is not reliable, and Don't Save
    // sessions (`deletedAt` set) still happened, as did sessions of
    // patients who were deleted later.
    const [patients, sessions] = await Promise.all([
      prisma.patient.findMany({
        where: dashboardPatientScope,
        select: { id: true, name: true, userId: true },
      }),
      prisma.patientSession.findMany({
        where: {
          createdAt: { gte: from, lt: toExclusive },
          patient: dashboardPatientScope,
        },
        select: {
          patientId: true,
          createdAt: true,
          completedAt: true,
          deletedAt: true,
        },
      }),
    ])

    const userNamesById = await loadUserNames(
      prisma,
      patients.map((patient) => patient.userId),
    )

    return buildSessionActivityReport({
      from: toISODate(from),
      to: toISODate(to),
      granularity: input.granularity,
      patients,
      sessions: sessions.map((session) => ({
        patientId: session.patientId,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        deletedAt: session.deletedAt?.toISOString() ?? null,
        // Immersive Video playback is not recorded on sessions yet.
        videoMinutes: null,
      })),
      userNamesById,
    })
  })

const getSessionLog = adminAuthed
  .route({ path: '/dashboard/analytics/session-log', method: 'GET' })
  .input(
    windowSchema.and(
      z.object({
        type: z.enum(['all', ...SESSION_TYPES]).default('all'),
        ownerUserId: z.string().default('all'),
        saved: z.enum(SESSION_SAVED_FILTERS).default('all'),
        search: z.string().max(100).default(''),
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(5).max(100).default(25),
      }),
    ),
  )
  .handler(async ({ context, input }) => {
    const { prisma } = context
    const { from, toExclusive } = await loadWindow(prisma, input)

    const sessions = await prisma.patientSession.findMany({
      where: {
        createdAt: { gte: from, lt: toExclusive },
        patient: dashboardPatientScope,
      },
      select: {
        id: true,
        createdAt: true,
        completedAt: true,
        deletedAt: true,
        nprs: true,
        sourceProgramName: true,
        program: { select: { name: true } },
        patient: { select: { id: true, name: true, userId: true } },
        _count: { select: { sessionExercise: true } },
      },
    })

    const userNamesById = await loadUserNames(
      prisma,
      sessions.map((session) => session.patient.userId),
    )

    return buildSessionLog(
      sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        deletedAt: session.deletedAt?.toISOString() ?? null,
        patientId: session.patient.id,
        patientName: session.patient.name,
        userId: session.patient.userId,
        programName: session.program?.name ?? session.sourceProgramName,
        exerciseCount: session._count.sessionExercise,
        nprs: session.nprs,
        // Immersive Video playback is not recorded on sessions yet.
        videoMinutes: null,
      })),
      userNamesById,
      input,
    )
  })

export const sessionActivity = {
  getSessionActivity,
  getSessionLog,
}

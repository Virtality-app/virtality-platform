import type usePatientDashboardState from '@/hooks/use-patient-dashboard-state'

type PatientDashboardStateHook = ReturnType<typeof usePatientDashboardState>

export type DashboardState = PatientDashboardStateHook['state']
export type DashboardHandler = PatientDashboardStateHook['handler']

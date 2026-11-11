/**
 * Product analytics event contract for the clinician console.
 *
 * Client events are captured in the browser for things only the UI knows
 * (clicks, dialogs, launch attempts). Server events are captured by the API
 * at the point a change is persisted, so ad blockers and closed tabs cannot
 * drop them. An event lives in exactly one of the two maps.
 *
 * Never put patient names, notes, medical history or other free text in a
 * property. Send ids, counts, lengths and fixed enum values only.
 */

export type ProgramSource = 'reusable_program' | 'quick_start'
export type SessionMode = 'main' | 'free' | 'immersive'
export type SkipDirection = 'back' | 'forward'
export type NavItem =
  | 'devices'
  | 'VR experiences'
  | 'patients'
  | 'programs'
  | 'guides'
  | 'forms'
  | 'landing_page'
  | 'user_profile'
export type PatientProfileTab = 'basic-info' | 'medical-history' | 'sessions'
export type TourId = 'device' | 'patient' | 'program' | 'session'
export type LaunchBlockedReason =
  | 'no_exercises'
  | 'entitlement_pending'
  | 'entitlement_expired'
  | 'console_disconnected'
  | 'headset_absent'
  | 'missing_scene_settings'
export type LaunchEntry = 'manual' | 'launch_intent'
export type SaveChoice =
  | 'finish_only'
  | 'update_source_program'
  | 'save_as_new_program'
export type ProgramOrigin = 'scratch' | 'copy'

export type ClientEventPayloadMap = {
  console_session_started: Record<string, never>
  console_session_ended: {
    duration_sec: number
    end_reason: 'inactive_timeout' | 'tab_close' | 'manual'
  }
  nav_item_clicked: { item: NavItem }

  guided_tour_started: { tour_id: TourId; start_step: number }
  guided_tour_completed: { tour_id: TourId; step_count: number }
  guided_tour_dismissed: {
    tour_id: TourId
    step: number
    step_count: number
    reason: 'closed' | 'left_page'
  }
  session_picker_launched: {
    program_source: ProgramSource
    has_headset: boolean
    reused_last_program: boolean
  }

  patient_created: { time_spent_sec: number }
  patient_profile_updated: Record<string, never>
  patient_deleted: Record<string, never>
  /** Patient profile tabs are local state, so `$pageview` does not see them. */
  patient_tab_viewed: { tab: PatientProfileTab }

  session_launch_attempted: {
    mode: SessionMode
    program_source: ProgramSource
    exercise_count: number
    entry: LaunchEntry
  }
  session_launch_blocked: {
    reason: LaunchBlockedReason
    program_source: ProgramSource
  }
  session_paused: { program_source: ProgramSource }
  session_resumed: { program_source: ProgramSource }
  dashboard_mode_selected: { mode: SessionMode }
  exercise_skipped: { direction: SkipDirection }
  warmup_started: Record<string, never>
  coach_toggled: { enabled: boolean }
  casting_started: { enabled: boolean; device_id?: string }
  casting_stopped: {
    enabled: boolean
    duration_sec?: number
    device_id?: string
  }
  session_notes_saved: { session_id: string; notes_length: number }
  supplemental_therapy_selected: {
    session_id: string
    therapy_count: number
    includes_other: boolean
  }
  session_deleted_without_save: { session_id: string }

  quickstart_continue: Record<string, never>
  quickstart_continue_save_prompt_shown: Record<string, never>
  quickstart_continue_save_prompt_dismissed: Record<string, never>
  quickstart_continue_save_prompt_saved: Record<string, never>
  quickstart_program_created: Record<string, never>

  immersive_video_play_requested: { video_id: string }
  immersive_video_download_requested: { video_id: string }
}

export type ServerEventPayloadMap = {
  treatment_session_started: {
    patient_session_id: string
    patient_id: string
    program_source: ProgramSource
    reusable_program_id?: string
    exercise_count: number
  }
  treatment_session_completed: {
    patient_session_id: string
    save_choice: SaveChoice
    exercise_count: number
    duration_sec?: number
  }
  treatment_session_interrupted: {
    patient_session_id: string
    retained_exercise_count: number
    retained_progress_count: number
  }

  program_created: { program_id: string; origin: ProgramOrigin }
  program_renamed: { program_id: string }
  program_retired: { program_id: string }

  headset_added: { device_record_id: string }
  headset_pairing_started: { device_record_id: string }
  headset_paired: { device_record_id: string }
  headset_removed: { device_record_id: string }
}

export type ClientEventName = keyof ClientEventPayloadMap
export type ServerEventName = keyof ServerEventPayloadMap

// A Record, so adding a client event without listing it here fails to compile.
const clientEventNames: Record<ClientEventName, true> = {
  console_session_started: true,
  console_session_ended: true,
  nav_item_clicked: true,
  guided_tour_started: true,
  guided_tour_completed: true,
  guided_tour_dismissed: true,
  session_picker_launched: true,
  patient_created: true,
  patient_profile_updated: true,
  patient_deleted: true,
  patient_tab_viewed: true,
  session_launch_attempted: true,
  session_launch_blocked: true,
  session_paused: true,
  session_resumed: true,
  dashboard_mode_selected: true,
  exercise_skipped: true,
  warmup_started: true,
  coach_toggled: true,
  casting_started: true,
  casting_stopped: true,
  session_notes_saved: true,
  supplemental_therapy_selected: true,
  session_deleted_without_save: true,
  quickstart_continue: true,
  quickstart_continue_save_prompt_shown: true,
  quickstart_continue_save_prompt_dismissed: true,
  quickstart_continue_save_prompt_saved: true,
  quickstart_program_created: true,
  immersive_video_play_requested: true,
  immersive_video_download_requested: true,
}

/** Runtime list of client event names, for validating events the API receives. */
export const CLIENT_EVENT_NAMES = Object.keys(
  clientEventNames,
) as ClientEventName[]

/** A contract event as we store it in our own database. */
export type StoredProductEvent = {
  /** Shared with the PostHog copy of the event. */
  id: string
  event: ClientEventName | ServerEventName
  userId: string
  properties: Record<string, unknown>
  source: 'client' | 'server'
  sessionId?: string
}

/**
 * Person properties. Identity and profile fields are set by the console on
 * identify; the `first_*` / `last_*` milestones are set by server events.
 */
export type PersonProperties = {
  email?: string
  name?: string
  role?: string
  is_internal?: boolean
  email_verified?: boolean
  signup_at?: string
  locale?: string
  first_headset_paired_at?: string
  first_program_created_at?: string
  first_treatment_session_at?: string
  last_treatment_session_at?: string
}

/**
 * Staff are filtered out of product dashboards by this flag. Testers count as
 * real users: some clinics doing real work hold the tester role.
 */
export function isInternalRole(role: string | null | undefined): boolean {
  return role === 'admin'
}

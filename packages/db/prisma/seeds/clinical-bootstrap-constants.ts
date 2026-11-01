/**
 * Copies of real catalog exercises, inserted only when the database has no
 * enabled exercises (e.g. a fresh local database).
 */
export const FALLBACK_EXERCISES = [
  {
    id: '313',
    name: 'ActiveWristExtension_L',
    displayName: 'Active Wrist Extension',
    category: 'wrist',
    direction: 'Left',
    item: null,
    image:
      'https://cdn.virtality.app/exercises/thumbnail/active_wrist_extension.png',
    video: 'https://cdn.virtality.app/exercises/active_wrist_extension.mp4',
    description:
      'With the arm extended in front and the elbow straight, the wrist actively bends upward (into extension) as far as comfortable, holds briefly, then returns slowly to the starting position without using the other hand for assistance.',
    enabled: true,
    isNew: false,
  },
  {
    id: '312',
    name: 'ActiveWristExtension_R',
    displayName: 'Active Wrist Extension',
    category: 'wrist',
    direction: 'Right',
    item: null,
    image:
      'https://cdn.virtality.app/exercises/thumbnail/active_wrist_extension.png',
    video: 'https://cdn.virtality.app/exercises/active_wrist_extension.mp4',
    description:
      'With the arm extended in front and the elbow straight, the wrist actively bends upward (into extension) as far as comfortable, holds briefly, then returns slowly to the starting position without using the other hand for assistance.',
    enabled: true,
    isNew: false,
  },
  {
    id: '311',
    name: 'ArmCirclesExternal',
    displayName: 'Arm Circles External',
    category: 'shoulder',
    direction: 'Both',
    item: null,
    image:
      'https://cdn.virtality.app/exercises/thumbnail/arm_circles_external.png',
    video: 'https://cdn.virtality.app/exercises/ArmCirclesExternal.mp4',
    description:
      'Standing tall with both arms extended out to the sides at shoulder height, the arms make small controlled circles in an outward direction (toward the back of the body), keeping elbows straight and shoulders relaxed.\n',
    enabled: true,
    isNew: true,
  },
  {
    id: '310',
    name: 'ArmCirclesInternal',
    displayName: 'Arm Circles Internal',
    category: 'shoulder',
    direction: 'Both',
    item: null,
    image:
      'https://cdn.virtality.app/exercises/thumbnail/arm_circles_internal.png',
    video: 'https://cdn.virtality.app/exercises/ArmCirclesInternal.mp4',
    description:
      'Standing tall with both arms extended out to the sides at shoulder height, the arms make small controlled circles in an inward direction (toward the front of the body), keeping elbows straight and shoulders relaxed.\n',
    enabled: true,
    isNew: true,
  },
  {
    id: '114',
    name: 'AssistedAbductionto180°_L',
    displayName: 'Assisted Abduction to 180°',
    category: 'shoulder',
    direction: 'Left',
    item: 'bar',
    image:
      'https://cdn.virtality.app/exercises/thumbnail/assisted_abduction_to_180.png',
    video: 'https://cdn.virtality.app/exercises/AssistedAbductionto180.mp4',
    description:
      'Using the opposite hand to guide a dowel, the involved arm is slowly lifted outward and upward toward 180°, then returned to the start position, keeping the spine neutral throughout.',
    enabled: true,
    isNew: false,
  },
  {
    id: '115',
    name: 'AssistedAbductionto180°_R',
    displayName: 'Assisted Abduction to 180°',
    category: 'shoulder',
    direction: 'Right',
    item: 'bar',
    image:
      'https://cdn.virtality.app/exercises/thumbnail/assisted_abduction_to_180.png',
    video: 'https://cdn.virtality.app/exercises/AssistedAbductionto180.mp4',
    description:
      'Using the opposite hand to guide a dowel, the involved arm is slowly lifted outward and upward toward 180°, then returned to the start position, keeping the spine neutral throughout.',
    enabled: true,
    isNew: false,
  },
] as const

export type SeedProgramKey = 'mobility' | 'range-of-motion'

/**
 * Reusable programs built from existing exercises: each takes whole exercise
 * families (both sides) starting at `familyOffset` in name order. Settings are
 * the most common ones in real sessions.
 */
export const SEED_PROGRAMS = [
  {
    key: 'mobility',
    name: 'Upper Limb Mobility',
    familyOffset: 0,
    familyCount: 2,
    settings: { sets: 2, reps: 8, restTime: 6, holdTime: 1, speed: 1 },
  },
  {
    key: 'range-of-motion',
    name: 'Range of Motion Progression',
    familyOffset: 2,
    familyCount: 2,
    settings: { sets: 3, reps: 10, restTime: 30, holdTime: 1, speed: 1 },
  },
] as const satisfies readonly {
  key: SeedProgramKey
  name: string
  familyOffset: number
  familyCount: number
  settings: {
    sets: number
    reps: number
    restTime: number
    holdTime: number
    speed: number
  }
}[]

export type SeedSessionPlan = {
  daysAgo: number
  hour: number
  durationMinutes: number
  programKey: SeedProgramKey
  /** Program positions the patient skipped; their SessionData is `[]`. */
  skippedPositions?: readonly number[]
}

export type SeedPatient = {
  key: string
  pinned: boolean
  patient: {
    name: string
    email: string
    phone: string
    dob: string | null
    sex: string
    weight: string
    height: string
    occupation: string
    language: 'Greek' | 'English'
  }
  medicalHistory: {
    anamneses: string
    complaints: string
    expectations: string
    diagnosis: string
    nprs: string
  }
  sessions: readonly SeedSessionPlan[]
}

export const SEED_PATIENTS: readonly SeedPatient[] = [
  {
    key: 'giorgos',
    pinned: true,
    patient: {
      name: 'Γιώργος Παπαδόπουλος',
      email: 'giorgos.papadopoulos@example.com',
      phone: '6941234567',
      dob: '1968-04-12',
      sex: 'male',
      weight: '82',
      height: '176',
      occupation: 'Λογιστής',
      language: 'Greek',
    },
    medicalHistory: {
      anamneses:
        'Πτώση πριν από 10 εβδομάδες. Ακινητοποίηση με γύψο για 6 εβδομάδες.',
      complaints: 'Δυσκαμψία στον καρπό και πόνος στον ώμο στην ανύψωση.',
      expectations: 'Επιστροφή στη δουλειά στον υπολογιστή χωρίς πόνο.',
      diagnosis: 'Κάταγμα κερκίδας δεξιού καρπού μετά από ακινητοποίηση.',
      nprs: '6',
    },
    sessions: [
      { daysAgo: 20, hour: 10, durationMinutes: 22, programKey: 'mobility' },
      { daysAgo: 17, hour: 10, durationMinutes: 19, programKey: 'mobility' },
      {
        daysAgo: 14,
        hour: 11,
        durationMinutes: 17,
        programKey: 'mobility',
        skippedPositions: [1],
      },
      { daysAgo: 10, hour: 10, durationMinutes: 21, programKey: 'mobility' },
      {
        daysAgo: 6,
        hour: 9,
        durationMinutes: 24,
        programKey: 'range-of-motion',
      },
      {
        daysAgo: 3,
        hour: 10,
        durationMinutes: 23,
        programKey: 'range-of-motion',
      },
      {
        daysAgo: 1,
        hour: 12,
        durationMinutes: 25,
        programKey: 'range-of-motion',
      },
    ],
  },
  {
    key: 'emma',
    pinned: false,
    patient: {
      name: 'Emma Clarke',
      email: 'emma.clarke@example.com',
      phone: '',
      dob: '1985-09-30',
      sex: 'female',
      weight: '64',
      height: '168',
      occupation: 'Graphic designer',
      language: 'English',
    },
    medicalHistory: {
      anamneses: 'Gradual onset over three months. No trauma.',
      complaints: 'Pain when reaching overhead and sleeping on the left side.',
      expectations: 'Reach the top shelf and sleep through the night.',
      diagnosis: 'Left shoulder impingement.',
      nprs: '4',
    },
    sessions: [
      {
        daysAgo: 12,
        hour: 17,
        durationMinutes: 20,
        programKey: 'range-of-motion',
      },
      {
        daysAgo: 5,
        hour: 17,
        durationMinutes: 21,
        programKey: 'range-of-motion',
      },
      {
        daysAgo: 2,
        hour: 18,
        durationMinutes: 19,
        programKey: 'range-of-motion',
      },
    ],
  },
  {
    key: 'daniel',
    pinned: false,
    patient: {
      name: 'Daniel Hughes',
      email: 'daniel.hughes@example.com',
      phone: '07700900123',
      dob: '1952-01-18',
      sex: 'male',
      weight: '88',
      height: '181',
      occupation: 'Retired',
      language: 'English',
    },
    medicalHistory: {
      anamneses: 'Stroke eight months ago with right-sided weakness.',
      complaints: 'Reduced control of the right wrist and shoulder.',
      expectations: 'Dress and eat without help.',
      diagnosis: 'Post-stroke right upper limb hemiparesis.',
      nprs: '3',
    },
    sessions: [
      { daysAgo: 1, hour: 11, durationMinutes: 18, programKey: 'mobility' },
    ],
  },
  {
    // A patient just added through the console form: defaults, no sessions.
    key: 'maria',
    pinned: false,
    patient: {
      name: 'Μαρία Κωνσταντίνου',
      email: '',
      phone: '',
      dob: null,
      sex: '',
      weight: '',
      height: '',
      occupation: '',
      language: 'Greek',
    },
    medicalHistory: {
      anamneses: '',
      complaints: '',
      expectations: '',
      diagnosis: '',
      nprs: '5',
    },
    sessions: [],
  },
]

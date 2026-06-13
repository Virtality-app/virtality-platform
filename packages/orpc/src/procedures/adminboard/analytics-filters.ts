export const FAKE_PATIENT = {
  name: { contains: 'test' },
}

export const INTERNAL_USERS = [
  '5gCcsOn9Tz4IF9ommSp2DvoiJsTsphTw', //Tasos
  '9ygYLzpviL1OapAKamGyLAqqByKsHsnG', //Tasos_Admin
  'OuL7y4Xb2DU2PMIAFnOu4OHqHvMdPfrY', //Stelios
  'PySE5EEdRduUMYaVRDFhIg32agudrY4K', //Stelios_Admin
  'lb88hVACN6FxCPJcLQGzQng3iWg9jVsV', //Katerina
  'UAql4zqL2KMRk1cjwwq5yirDq6pbIw4b', //Katerina_Admin
  'Bhn4gUOtOZZcOh3qQ9VKPiEfAAXCbhx2', //TestUser_1
  'rC5H7G9vjOhvGnM5gagD9bKkFU4JM5rJ', //TestUser_2
  'mb1eDQAdr2sP08gEdggLfOTYbb0RoOug', //Jerry
  'zCPmoGefgoVQfYiP5MZ7C9d8ml9PfljT', //Lefteris
  '9RMfagtuXvlxXVgc0VpBOw2gPq5yISRQ', //Ξανθίππη Κοντογιάννη
  '0glxtznlckihDNxjZAszARJQVLOOhrBp', // Nikos
]

export const UNKNOWN_OWNER_ID = '__unknown_owner__'
export const UNKNOWN_OWNER_LABEL = 'Unknown owner'

export const patientScopeFilter = {
  deletedAt: null,
  NOT: [FAKE_PATIENT],
  userId: {
    notIn: INTERNAL_USERS,
  },
}

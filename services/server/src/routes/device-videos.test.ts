import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type CatalogRow = {
  id: string
  state: string
  version: number
  objectKey: string | null
  sizeBytes: bigint | null
  checksum: string | null
  uploadObjectKey?: string | null
  uploadSizeBytes?: bigint | null
}

type Store = {
  devices: Array<{ deviceId: string; deletedAt: Date | null }>
  reports: Map<
    string,
    { deviceId: string; freeBytes: bigint; reportedAt: Date }
  >
  videos: Array<{
    deviceId: string
    videoId: string
    status: string
    version: number | null
    bytesDownloaded: bigint | null
    sizeBytes: bigint | null
    reason: string | null
  }>
  catalog: CatalogRow[]
}

const { store, prisma } = vi.hoisted(() => {
  const store: Store = {
    devices: [],
    reports: new Map(),
    videos: [],
    catalog: [],
  }

  function deviceMatches(
    device: Store['devices'][number],
    where: Record<string, unknown>,
  ): boolean {
    if (
      typeof where.deviceId === 'string' &&
      device.deviceId !== where.deviceId
    ) {
      return false
    }
    if (Object.prototype.hasOwnProperty.call(where, 'deletedAt')) {
      if (where.deletedAt === null && device.deletedAt != null) {
        return false
      }
    }
    if (Array.isArray(where.AND)) {
      return where.AND.every((part) =>
        deviceMatches(device, part as Record<string, unknown>),
      )
    }
    return true
  }

  const prisma = {
    device: {
      findFirst: vi.fn(
        async ({ where }: { where: Record<string, unknown> }) =>
          store.devices.find((device) => deviceMatches(device, where)) ?? null,
      ),
    },
    deviceVideoReport: {
      upsert: vi.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: { deviceId: string }
          create: { deviceId: string; freeBytes: bigint; reportedAt: Date }
          update: { freeBytes: bigint; reportedAt: Date }
        }) => {
          const next = store.reports.has(where.deviceId)
            ? {
                ...store.reports.get(where.deviceId)!,
                ...update,
              }
            : create
          store.reports.set(where.deviceId, next)
          return next
        },
      ),
    },
    deviceVideo: {
      deleteMany: vi.fn(async ({ where }: { where: { deviceId: string } }) => {
        store.videos = store.videos.filter(
          (video) => video.deviceId !== where.deviceId,
        )
      }),
      createMany: vi.fn(async ({ data }: { data: Store['videos'] }) => {
        store.videos.push(...data)
      }),
    },
    immersiveVideo: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return store.catalog.find((row) => row.id === where.id) ?? null
      }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prisma),
    ),
  }

  return { store, prisma }
})

vi.mock('@virtality/db', () => ({ prisma }))

const { deviceVideoRoutes } = await import('./device-videos.ts')

const app = new Hono().route('/api/v1/device-videos', deviceVideoRoutes)

function resetStore() {
  store.devices = [{ deviceId: 'headset-1', deletedAt: null }]
  store.reports = new Map()
  store.videos = []
  store.catalog = []
}

function catalogVideo(overrides: Partial<CatalogRow> = {}): CatalogRow {
  return {
    id: 'video-1',
    state: 'Published',
    version: 2,
    objectKey: 'immersive-videos/video-1/v2.mp4',
    sizeBytes: 1_024n,
    checksum: 'abc123',
    uploadObjectKey: 'immersive-videos/video-1/v3.mp4',
    uploadSizeBytes: 2_048n,
    ...overrides,
  }
}

describe('device-videos routes', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  it('PUT replaces an empty library and upserts the report header', async () => {
    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 42,
        videos: [],
      }),
    })

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(store.videos).toEqual([])
    const report = store.reports.get('headset-1')
    expect(report?.freeBytes).toBe(42n)
    expect(report?.reportedAt).toBeInstanceOf(Date)
  })

  it('PUT stores unknown videoIds', async () => {
    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: [
          {
            videoId: 'not-in-catalog',
            status: 'ready',
            version: 1,
            sizeBytes: 10,
          },
        ],
      }),
    })

    expect(response.status).toBe(204)
    expect(store.videos).toEqual([
      expect.objectContaining({
        deviceId: 'headset-1',
        videoId: 'not-in-catalog',
        status: 'ready',
        version: 1,
        sizeBytes: 10n,
      }),
    ])
  })

  it('PUT replace-all shrinks existing rows', async () => {
    await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: [
          { videoId: 'a', status: 'ready' },
          { videoId: 'b', status: 'paused' },
        ],
      }),
    })

    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 2,
        videos: [{ videoId: 'a', status: 'ready' }],
      }),
    })

    expect(response.status).toBe(204)
    expect(store.videos.map((video) => video.videoId)).toEqual(['a'])
    expect(store.reports.get('headset-1')?.freeBytes).toBe(2n)
  })

  it('PUT returns 404 UNPAIRED when the headset is not paired', async () => {
    store.devices = []

    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: [],
      }),
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: 'UNPAIRED',
      message: 'Headset is not paired.',
    })
    expect(store.reports.size).toBe(0)
  })

  it('PUT returns 404 when the only matching Device is soft-deleted', async () => {
    store.devices = [
      {
        deviceId: 'headset-1',
        deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]

    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: [],
      }),
    })

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'UNPAIRED' })
  })

  it('PUT returns 400 for an invalid body', async () => {
    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'headset-1' }),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'INVALID_REQUEST',
      message: 'Invalid device videos report.',
    })
  })

  it("PUT returns 400 when status is 'absent'", async () => {
    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: [{ videoId: 'video-1', status: 'absent' }],
      }),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ error: 'INVALID_REQUEST' })
  })

  it('PUT returns 400 when the library has 65 entries', async () => {
    const response = await app.request('/api/v1/device-videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'headset-1',
        freeBytes: 1,
        videos: Array.from({ length: 65 }, (_, index) => ({
          videoId: `video-${index}`,
          status: 'ready',
        })),
      }),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ error: 'INVALID_REQUEST' })
  })

  it('GET returns the live Published download descriptor', async () => {
    store.catalog = [catalogVideo()]

    const response = await app.request(
      '/api/v1/device-videos/video-1?deviceId=headset-1',
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({
      videoId: 'video-1',
      version: 2,
      url: 'https://cdn.virtality.app/immersive-videos/video-1/v2.mp4',
      sizeBytes: 1024,
      checksum: 'abc123',
    })
  })

  it('GET Republishing serves live version and objectKey, not upload*', async () => {
    store.catalog = [
      catalogVideo({
        state: 'Republishing',
        version: 2,
        objectKey: 'immersive-videos/video-1/v2.mp4',
        sizeBytes: 1_024n,
        checksum: 'live-sum',
        uploadObjectKey: 'immersive-videos/video-1/v3.mp4',
        uploadSizeBytes: 9_999n,
      }),
    ]

    const response = await app.request(
      '/api/v1/device-videos/video-1?deviceId=headset-1',
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      version: 2,
      url: 'https://cdn.virtality.app/immersive-videos/video-1/v2.mp4',
      sizeBytes: 1024,
      checksum: 'live-sum',
    })
    expect(JSON.stringify(body)).not.toContain('v3.mp4')
  })

  it.each(['Draft', 'Uploading', 'Verifying', 'Unpublished'] as const)(
    'GET returns VIDEO_UNAVAILABLE for %s',
    async (state) => {
      store.catalog = [catalogVideo({ state })]

      const response = await app.request(
        '/api/v1/device-videos/video-1?deviceId=headset-1',
      )

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: 'VIDEO_UNAVAILABLE',
        message: 'Video is not available.',
      })
    },
  )

  it('GET returns VIDEO_UNAVAILABLE for an unknown id', async () => {
    const response = await app.request(
      '/api/v1/device-videos/missing?deviceId=headset-1',
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'VIDEO_UNAVAILABLE' })
  })

  it('GET returns UNPAIRED for an unpaired headset', async () => {
    store.devices = []

    const response = await app.request(
      '/api/v1/device-videos/video-1?deviceId=headset-1',
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'UNPAIRED' })
  })

  it('GET returns UNPAIRED when the only Device is soft-deleted', async () => {
    store.devices = [
      {
        deviceId: 'headset-1',
        deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]
    store.catalog = [catalogVideo()]

    const response = await app.request(
      '/api/v1/device-videos/video-1?deviceId=headset-1',
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'UNPAIRED' })
  })

  it('GET unpaired wins over an unknown video', async () => {
    store.devices = []

    const response = await app.request(
      '/api/v1/device-videos/missing?deviceId=headset-1',
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ error: 'UNPAIRED' })
  })

  it('GET returns 400 when deviceId is missing', async () => {
    const response = await app.request('/api/v1/device-videos/video-1')

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'INVALID_REQUEST',
      message: 'Invalid download request.',
    })
  })
})

/**
 * Every app a demo can record, keyed by the name passed to `pnpm demo`.
 * `signIn` apps need a saved sign-in from `pnpm demo:login <app>` first.
 */
export const demoApps = {
  console: { baseURL: 'http://localhost:3001', signIn: true },
  adminboard: { baseURL: 'http://localhost:3002', signIn: true },
  website: { baseURL: 'http://localhost:3000', signIn: false },
} as const satisfies Record<string, { baseURL: string; signIn: boolean }>

export type DemoAppName = keyof typeof demoApps

export const isDemoAppName = (name: string): name is DemoAppName =>
  Object.hasOwn(demoApps, name)

/** better-auth's session cookie (`packages/auth`), not the admin one. */
export const SESSION_COOKIE = /^(__Secure-)?virtality(_preview)?_session$/

export const authStatePath = (app: DemoAppName) =>
  new URL(`./.auth/${app}.json`, import.meta.url).pathname

/** Recording window, also the GIF's size. */
export const DEMO_VIEWPORT = { width: 1280, height: 800 }

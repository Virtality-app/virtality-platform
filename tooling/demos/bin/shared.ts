import { demoApps, isDemoAppName, type DemoAppName } from '../apps.ts'

export const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

export const parseApp = (arg: string | undefined, usage: string) => {
  const names = Object.keys(demoApps).join(', ')
  if (!arg) fail(`${usage}\n  apps: ${names}`)
  if (!isDemoAppName(arg!)) fail(`Unknown app "${arg}". Apps: ${names}`)
  return arg as DemoAppName
}

/** Fails with the command to run when the app's dev server isn't up. */
export const assertAppRunning = async (app: DemoAppName) => {
  const { baseURL } = demoApps[app]
  try {
    await fetch(baseURL, {
      redirect: 'manual',
      signal: AbortSignal.timeout(60_000),
    })
  } catch {
    fail(
      `${app} isn't answering at ${baseURL}. Start it first: pnpm --filter @virtality/${app} dev`,
    )
  }
}

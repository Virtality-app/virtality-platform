import { createAppLogger } from '@virtality/shared/observability'

export const serverLogger = createAppLogger({
  serviceName: 'console',
  defaultAttributes: {
    runtime: 'nextjs-server',
  },
})

import { createAppLogger } from '@virtality/shared/observability'

export const serverLogger = createAppLogger({
  serviceName: 'website',
  defaultAttributes: {
    runtime: 'nextjs-server',
  },
})

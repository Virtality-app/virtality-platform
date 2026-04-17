import { createAppLogger } from '@virtality/shared/observability'

export const serverLogger = createAppLogger({
  serviceName: 'adminboard',
  defaultAttributes: {
    runtime: 'nextjs-server',
  },
})

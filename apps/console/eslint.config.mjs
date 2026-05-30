import nextConfig from '@virtality/eslint-config/next'
import { config as sharedUiConfig } from '@virtality/eslint-config/shared-ui'

export default [...nextConfig, ...sharedUiConfig]

import { fileURLToPath, URL } from 'node:url'

import sharedConfig from 'demo-shared/vite.config.mjs'
import { mergeConfig } from 'vite'

export default mergeConfig(sharedConfig, {
  root: fileURLToPath(new URL('../demo-shared', import.meta.url)),
  define: {
    BUILD_VARIANT: JSON.stringify('SPM'),
  },
})

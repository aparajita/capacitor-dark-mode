import { defineConfig } from 'rollup'

export default defineConfig({
  plugins: [],
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorDarkMode',
      globals: {
        '@capacitor/core': 'capacitorExports',
        '@capacitor/status-bar': 'statusBar',
      },
      sourcemap: Boolean(process.env.SOURCE_MAP),
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: Boolean(process.env.SOURCE_MAP),
      inlineDynamicImports: true,
    },
  ],
  external: ['@capacitor/core', '@capacitor/status-bar'],
})

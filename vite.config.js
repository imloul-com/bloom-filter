import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative assets for subdomain root and when proxied under a path (e.g. /tools/bloom-filter).
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
}))

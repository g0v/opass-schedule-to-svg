import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import sirv from 'sirv'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'serve-data-from-dist',
      apply: 'serve',
      configureServer(server) {
        const distDataDir = path.resolve(process.cwd(), 'dist', 'data')
        server.middlewares.use('/data', sirv(distDataDir, { dev: true, etag: true }))
      },
    },
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

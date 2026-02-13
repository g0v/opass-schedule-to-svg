import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import sirv from 'sirv'

const PROJECT_NAME = 'opass-schedule-to-svg'

// https://vite.dev/config/
export default defineConfig({
  base: `/${PROJECT_NAME}/`,
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'serve-data-from-dist',
      apply: 'serve',
      configureServer(server) {
        const distDataDir = path.resolve(process.cwd(), 'dist', 'data')
        server.middlewares.use(`/${PROJECT_NAME}/data`, sirv(distDataDir, { dev: true, etag: true }))
      },
    },
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

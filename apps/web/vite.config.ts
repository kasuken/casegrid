import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { linkPreviewsPlugin } from './build/linkPreviews.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), linkPreviewsPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', '**/node_modules/**', '**/dist/**'],
  },
})

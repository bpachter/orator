import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/orator/',
  optimizeDeps: {
    include: ['plotly.js-dist-min'],
  },
})

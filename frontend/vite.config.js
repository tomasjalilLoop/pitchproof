import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev proxy so the partner console can call the backend's /analyses
    // endpoints same-origin. Points at Tomi's backend (default :3000).
    // Override with VITE_BACKEND_ORIGIN if it runs elsewhere.
    proxy: {
      '/analyses': {
        target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('browser-image-compression')) return 'vendor-compression'
          if (id.includes('react-router-dom') || id.includes('react-router')) return 'vendor-router'
        },
      },
    },
  },
})



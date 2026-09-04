import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''
      ),
    },
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
  }
})



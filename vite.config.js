import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@context': '/src/context',
      '@pages': '/src/pages',
      '@layout': '/src/layout',
      '@views': '/src/views',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@features': '/src/features',
    },
  },
})

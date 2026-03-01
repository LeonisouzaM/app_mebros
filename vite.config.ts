import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Área de Membros',
        short_name: 'Membros',
        description: 'Sua plataforma de cursos exclusiva.',
        theme_color: '#1a1f2e',
        background_color: '#eaf0f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://ui-avatars.com/api/?name=APP&background=1a1f2e&color=fff&size=192',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://ui-avatars.com/api/?name=APP&background=1a1f2e&color=fff&size=512',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

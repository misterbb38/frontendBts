import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   // 👈 nouveau plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),         // active le scan + le build Tailwind
  ],
})

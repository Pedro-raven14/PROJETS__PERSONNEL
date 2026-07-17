import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    /**
     * Proxy Vite : redirige les requêtes /api/* vers le backend NestJS.
     *
     * Sans ce proxy, le navigateur bloquerait les requêtes cross-origin
     * (frontend sur :5173, backend sur :3000).
     * Avec le proxy, Vite fait office de passerelle :
     * GET /api/recipes → redirigé vers http://localhost:3000/api/recipes
     *
     * Cela évite les problèmes CORS en développement.
     * En production, on utilise la variable VITE_API_URL à la place.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Pas de rewrite : /api/recipes → http://localhost:3000/api/recipes
      },
    },
  },
})

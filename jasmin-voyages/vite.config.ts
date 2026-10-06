import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Maquette autonome (npm run maquette) : chemins relatifs et un seul fichier JavaScript, intégré à la page.
  const maquette = mode === 'maquette'
  return {
    base: maquette ? './' : '/',
    // Valeur figée au build : sur le site en ligne, le code propre à la maquette est retiré du JavaScript.
    define: { 'import.meta.env.VITE_DEMO': JSON.stringify(maquette ? '1' : '') },
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2022',
      cssMinify: true,
      modulePreload: maquette ? false : undefined,
      rolldownOptions: {
        output: maquette
          ? { codeSplitting: false }
          : {
              // Bibliothèques dans des fichiers séparés : mieux mis en cache entre deux mises à jour du site.
              codeSplitting: {
                groups: [
                  { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
                  { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils|lenis)[\\/]/ },
                ],
              },
            },
      },
    },
  }
})

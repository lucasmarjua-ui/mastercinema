import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Servidor de desarrollo (`npm run dev`): sirve un HTML mínimo propio en
// src/hero/dev/, aislado del index.html real del sitio, para iterar el hero
// con HMR sin arrastrar el resto de la página estática (categorías, tiendas,
// modales, Firebase...).
export default defineConfig({
  plugins: [react()],
  root: 'src/hero/dev',
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/hero/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        // Paleta ya establecida en shared/theme.css (sala de cine / alfombra
        // roja) -- se reutiliza aquí en vez del blue-700 de la referencia.
        brand: {
          DEFAULT: '#8f1329',
          bright: '#c62841',
          deep: '#4a0912',
        },
        gold: {
          DEFAULT: '#d4af37',
          bright: '#f3d675',
        },
      },
    },
  },
  // El sitio ya tiene su propio CSS (shared/theme.css) fuera de #hero-root.
  // El preflight de Tailwind resetea selectores globales (h1, button, a...)
  // y pisaría esos estilos existentes, así que se desactiva: solo se aplican
  // las clases de utilidad que usa explícitamente el árbol de React.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

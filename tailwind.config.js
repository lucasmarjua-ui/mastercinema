/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/hero/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['Archivo', 'Inter', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Paleta "Leader" ya establecida en shared/theme.css: negro de sala,
        // papel y ámbar de cuenta atrás. Mismos valores que --ink/--paper/--amber.
        amber: {
          DEFAULT: '#ff7a1a',
          bright: '#ffb35c',
          deep: '#a63e00',
        },
        paper: '#f2ede2',
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

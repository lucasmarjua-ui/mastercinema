import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build de producción: NO usa el modo "app" de Vite (que se adueñaría de
// index.html). En su lugar compila el hero como una librería independiente:
// un único <script type="module"> + una hoja de estilos, con nombres de
// archivo fijos, para que el index.html estático del sitio los referencie
// directamente sin que Vite reescriba el resto de la página.
export default defineConfig({
  plugins: [react()],
  // En modo "app" Vite sustituye process.env.NODE_ENV automáticamente; en
  // modo librería no siempre lo hace, y React lo lee en tiempo de ejecución
  // -- sin esto, el bundle revienta en el navegador con "process is not
  // defined" en cuanto React intenta arrancar.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/hero/main.tsx',
      formats: ['es'],
      fileName: () => 'mastercinema-hero.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name === 'style.css' ? 'mastercinema-hero.css' : 'assets/[name][extname]',
      },
    },
  },
});

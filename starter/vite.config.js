import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Mehrseitig: jede HTML-Datei im Wurzelordner ist eine eigene Seite.
// Seitenwechsel laufen über native View Transitions (siehe base.css), kein SPA-Router nötig.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        projekt: resolve(import.meta.dirname, 'projekt.html'),
      },
    },
  },
});

import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/main.js'
    },
    outDir: 'dist',
    assetsDir: '', // keep assets flat
    sourcemap: true
  }
});

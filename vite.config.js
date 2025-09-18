import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // project root
  base: '/dist/', // output base path
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: '/src/main.js'
    }
  }
});

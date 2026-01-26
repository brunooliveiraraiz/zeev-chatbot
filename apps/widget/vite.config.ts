import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages deployment configuration
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/zeev-chatbot/' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});

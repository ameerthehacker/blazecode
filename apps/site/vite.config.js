import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import templatesPlugin from './vite-plugins/template';

export default defineConfig({
  plugins: [react(), svgr(), templatesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('monaco-editor')) {
            return 'monaco-editor';
          } else if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});

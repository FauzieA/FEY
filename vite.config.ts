import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- Add this import
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Add the plugin here
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
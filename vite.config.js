import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Tauri expects a fixed port in dev
  server: {
    port: 1420,
    strictPort: true,
  },
  // Prevent vite from obscuring Rust errors
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Linux; no need for legacy targets
    target: ['es2021', 'chrome105'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})

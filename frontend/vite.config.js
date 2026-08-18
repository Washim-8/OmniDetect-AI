import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    rollupOptions: {
      output: {
        manualChunks: {
          onnx: ['onnxruntime-web'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  worker: {
    format: 'es',
    plugins: [],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  optimizeDeps: {
    include: ['onnxruntime-web'],
    esbuildOptions: {
      target: 'es2018',
    },
  },
})

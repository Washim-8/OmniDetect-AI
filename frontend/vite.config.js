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
        manualChunks(id) {
          if (id.includes('onnxruntime-web')) return 'onnx'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react'
        },
      },
    },
  },
  worker: {
    format: 'es',
    plugins: () => [],
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
    rolldownOptions: {
      target: 'es2018',
    },
  },
})

import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';

const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es']
    },
    outDir: resolve(__dirname, 'public'),
    rollupOptions: {
        output: {
          assetFileNames: '[name][extname]',
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
        },   
    },
    copyPublicDir: true
  },
  publicDir: resolve(__dirname, 'src/static'),
  envPrefix: 'CTP_',
});

import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';

const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Components',
      fileName: 'components',
      formats: ['es']
    },
    outDir: resolve(__dirname, 'public'),
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]'
      }
    },
    copyPublicDir: true
  },
  publicDir: resolve(__dirname, 'src/static'),
  envPrefix: 'CTP_',
});

import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main.ts'),
        'stores-map': resolve(__dirname, 'src/components/stores-map/index.ts'),
        'product-prices': resolve(__dirname, 'src/components/product-prices/index.ts'),
        'step-variant-selector': resolve(__dirname, 'src/components/step-variant-selector/index.ts'),
        'split-shipping': resolve(__dirname, 'src/components/split-shipping/index.ts'),
        'split-shipping-checkout': resolve(__dirname, 'src/components/split-shipping-checkout/index.ts'),
        'address-form': resolve(__dirname, 'src/components/split-shipping-checkout/address-form.ts'),
        'address-preview': resolve(__dirname, 'src/components/split-shipping-checkout/address-preview.ts'),
        'delivery-method': resolve(__dirname, 'src/components/split-shipping-checkout/delivery-method.ts'),
        'split-item': resolve(__dirname, 'src/components/split-shipping-checkout/split-item.ts')
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    outDir: resolve(__dirname, 'public'),
    rollupOptions: {
      external: ['lit', 'lit/decorators.js'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        chunkFileNames: '[name]-[hash].js',
      },   
    },
    copyPublicDir: true
  },
  plugins: [
    dts({
      outDir: 'public/types',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      rollupTypes: true,
    })
  ],
  publicDir: resolve(__dirname, 'src/static'),
  envPrefix: 'CTP_',
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/style.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'maplibre-gl',
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-text-style',
    '@tiptap/extension-font-family',
    '@tiptap/extension-color',
    '@tiptap/extension-text-align',
    '@tiptap/extension-underline',
    '@tiptap/extension-highlight',
    '@tiptap/core',
  ],
  jsx: 'automatic',
});

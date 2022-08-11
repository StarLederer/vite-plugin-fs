import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/plugin/index.ts', 'src/abstraction/index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
  format: ['esm'],
  target: 'node14',
  outDir: 'lib',
  external: ['virtual:fs'],
});

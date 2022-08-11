import type { Plugin } from 'vite';
import FsServer from './server';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin[] {
  const options = resolveOptions(userOptiuons);

  const virtualModuleId = 'virtual:fs';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  let server: null | FsServer = null;

  let isProd = true; // Assume prod unless otherwise is certain

  return [
    // Serve-time plugin
    {
      name: 'vite-plugin-fs',

      apply: 'serve',

      config(_, env) {
        if (env.mode === 'development') {
          isProd = false;
        }

        return {
          build: {
            rollupOptions: {
              external: [virtualModuleId],
            },
          },
          optimizeDeps: {
            exclude: [virtualModuleId],
          },
        };
      },

      async buildStart() {
        if (!isProd) {
          server = new FsServer(options);
          await server.start();
        }
      },

      resolveId(id) {
        if (id === virtualModuleId) {
          return resolvedVirtualModuleId;
        }

        return null;
      },

      load(id) {
        if (typeof server?.activePort === 'number') {
          if (id === resolvedVirtualModuleId) {
            return `export const activePort = ${server.activePort}`;
          }
        }

        return null;
      },

      closeBundle() {
        server?.stop();
      },
    },
    // Build time plugin
    {
      name: 'vite-plugin-fs',

      apply: 'build',

      resolveId(id) {
        if (id === virtualModuleId) {
          this.error('virtual:fs imported in production code, that is not allowed. It is likely caused by importing vite-plugin-fs/browser. Please find a way not to do that, making a vite plugin is a great start.');
        }

        return null;
      },
    },
  ];
}

export default VitePluginFs;

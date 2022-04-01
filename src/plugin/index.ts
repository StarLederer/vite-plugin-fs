import type { Plugin } from 'vite';
import FsServer from './server';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin {
  const options = resolveOptions(userOptiuons);

  const virtualModuleId = '@vite-plugin-fs-runtime';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  let server: null | FsServer = null;

  let isProd = true; // Assume prod unless otherwise is certain

  return {
    name: 'vite-plugin-fs',

    apply: 'serve',

    config(_, env) {
      if (env.mode === 'development') {
        isProd = false;
      }
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
  };
}

export default VitePluginFs;

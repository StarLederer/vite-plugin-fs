import type { Plugin, UserConfig } from 'vite';
import FsServer from './server';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin {
  const options = resolveOptions(userOptiuons);

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

    buildStart() {
      if (!isProd) {
        server = new FsServer(options);
        server.start();
      }
    },

    closeBundle() {
      server?.stop();
    },
  };
}

export default VitePluginFs;

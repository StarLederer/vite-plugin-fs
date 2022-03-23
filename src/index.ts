import type { Plugin, UserConfig } from 'vite';
import FsServer from './server/FsServer';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin {
  const options = resolveOptions(userOptiuons);

  let server: null | FsServer = null;

  let isProd = true; // Assume prod unless otherwise is certain

  return {
    name: 'vite-plugin-fs',

    apply: 'serve',

    config(_, env) {
      const config: UserConfig = {};

      if (env.mode === 'development') {
        isProd = false;

        if (options.proxy.enable) {
          config.server = {};
          config.server.proxy = {};
          config.server.proxy[options.proxy.path] = {
            target: `http://localhost:${options.port}`,
            changeOrigin: true,
            rewrite: (path) => path.substring(options.proxy.path.length),
          };
        }
      }

      return config;
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

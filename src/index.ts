import type { Plugin, UserConfig } from 'vite';
import FsServer from './server/FsServer';
import Abstraction from './abstraction';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin {
  const options = resolveOptions(userOptiuons);

  let server: null | FsServer = null;

  return {
    name: 'vite-plugin-fs',

    apply: 'serve',

    config() {
      const config: UserConfig = {};

      if (options.proxy.enable) {
        config.server = {};
        config.server.proxy = {};
        config.server.proxy[options.proxy.path] = {
          target: `http://localhost:${options.port}`,
          changeOrigin: true,
          rewrite: (path) => path.substring(options.proxy.path.length),
        };
      }

      return config;
    },

    buildStart() {
      server = new FsServer(options);
      server.start();
    },

    closeBundle() {
      server?.stop();
    },
  };
}

export default VitePluginFs;
export { Abstraction as fs };

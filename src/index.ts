import type { Plugin, UserConfig } from 'vite';
import startApi from './startApi';
import { UserOptions, resolveOptions } from './Options';

function VitePluginFs(userOptiuons: UserOptions = {}): Plugin {
  const options = resolveOptions(userOptiuons);

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

    configResolved({ root }) {
      startApi(root, options);
    },

    //   configureServer(server) {
    //     server.middlewares.use((req, res, next) => {
    //       // custom handle request...
    //     });
    //   },

    // transform(raw, id) {
    //   if (!filter(id)) { return; }
    //   try {
    //     return markdownToVue(id, raw);
    //   } catch (e: any) {
    //     this.error(e);
    //   }
    // },
    // async handleHotUpdate(ctx) {
    //   if (!filter(ctx.file)) { return; }

    //   const defaultRead = ctx.read;
    //   ctx.read = async function () {
    //     return markdownToVue(ctx.file, await defaultRead());
    //   };
    // },
  };
}

export default VitePluginFs;

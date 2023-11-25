import * as http from 'http';
import { resolve } from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import getPort from 'get-port';

import { Options } from '../Options';
import get from './requests/get';
import post from './requests/post';
import del from './requests/delete';

class FsServer {
  app: Koa<Koa.DefaultState, Koa.DefaultContext>;

  rootDir: string;

  activePort: number | undefined;

  options: Options;

  server?: http.Server;

  constructor(options: Options) {
    this.options = options;
    this.rootDir = resolve(this.options.rootDir);

    const app = new Koa();
    app.use(bodyParser({
      enableTypes: ['json', 'text'],
    }));
    app.use(cors());

    app.use(get(this.resolvePath));
    app.use(post(this.resolvePath));
    app.use(del(this.resolvePath));

    this.app = app;
  }

  async start(silent?: boolean): Promise<void> {
    const port = await getPort({ port: this.options.port });

    this.server = this.app.listen(port);

    if (!silent) {
      // eslint-disable-next-line no-console
      console.log('\x1b[41m');
      // eslint-disable-next-line no-console
      console.log(`fs relay server is running on port ${port}`);
      // eslint-disable-next-line no-console
      console.log(
        'Please be careful since any requests to this server can modify your actual file system',
      );
      // eslint-disable-next-line no-console
      console.log(
        `\x1b[43m\x1b[30mThe relay server sees ${this.rootDir} as root. Everything outside this directory is safe`,
      );
      // eslint-disable-next-line no-console
      console.log('\x1b[0m');
    }

    this.activePort = port;
  }

  stop(): void {
    this.server?.close();
    this.server = undefined;
  }

  resolvePath = (path: string): string => {
    let cleanPath = path;
    while (cleanPath.length > 0 && cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    const p = resolve(this.rootDir, cleanPath);
    if (!p.startsWith(this.rootDir)) {
      throw new Error('ABOVEROOT');
    } else {
      return p;
    }
  };
}

export default FsServer;

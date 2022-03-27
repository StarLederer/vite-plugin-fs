import * as http from 'http';
import { resolve } from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import { Options } from '../Options';
import get from './requests/get';
import post from './requests/post';
import del from './requests/delete';

class FsServer {
  server: http.Server;

  rootDir: string;

  options: Options;

  constructor(options: Options) {
    this.options = options;
    this.rootDir = resolve(this.options.rootDir);

    const app = new Koa();
    app.use(bodyParser());
    app.use(cors());

    app.use(get(this.resolvePath));
    app.use(post(this.resolvePath));
    app.use(del(this.resolvePath));

    this.server = http.createServer(app.callback());
  }

  start(silent?: boolean): void {
    this.server.listen(7070, () => {
      if (!silent) {
        // eslint-disable-next-line no-console
        console.log('\x1b[41m');
        // eslint-disable-next-line no-console
        console.log(`fs server is running on port ${this.options.port} and on /_fs`);
        // eslint-disable-next-line no-console
        console.log(
          'Please be careful since any requests to this server can modify your actual file system',
        );
        // eslint-disable-next-line no-console
        console.log(
          `${!this.options.goAboveRoot ? '\x1b[43m\x1b[30m' : ''}Clamping to ${this.rootDir} is ${this.options.goAboveRoot
            ? 'OFF! A DELETE request to ../ will wipe the parent of this directory!'
            : 'on. Everything outside this directory is safe'
          }`,
        );
        // eslint-disable-next-line no-console
        console.log('\x1b[0m');
      }
    });
  }

  stop(): void {
    this.server.close();
  }

  resolvePath = (path: string): string => {
    let cleanPath = path;
    while (cleanPath.length > 0 && cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    if (this.options.goAboveRoot) {
      return resolve(this.rootDir, cleanPath);
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
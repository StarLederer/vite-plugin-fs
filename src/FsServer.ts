import * as fs from 'fs/promises';
import * as http from 'http';
import { resolve, dirname } from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import Router from 'koa-router';

import { Options } from './Options';

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

    const router = new Router();
    router.get('/', (ctx) => {
      ctx.body = {
        status: 'success',
      };
    });

    app.use(router.routes());

    this.server = http.createServer(app.callback());
  }

  start(): void {
    this.server.listen(7070, () => {
      console.log('\x1b[41m');
      console.warn(`fs server is running on port ${this.options.port} and on /_fs`);
      console.warn(
        'Please be careful since any requests to this server can modify your actual file system',
      );
      console.warn(
        `${!this.options.goAboveRoot ? '\x1b[43m\x1b[30m' : ''}Clamping to ${this.rootDir} is ${this.options.goAboveRoot
          ? 'OFF! A DELETE request to ../ will wipe the parent of this directory!'
          : 'on. Everything outside this directory is safe'
        }`,
      );
      console.log('\x1b[0m');
    });
  }

  stop() {
    this.server.close();
  }

  private resolvePath(path: string): string {
    if (this.options.goAboveRoot) {
      return resolve(this.rootDir + path);
    }

    let p = resolve(this.rootDir + path);
    if (!p.startsWith(this.rootDir)) p = this.rootDir;
    return p;
  }
}

export default FsServer;

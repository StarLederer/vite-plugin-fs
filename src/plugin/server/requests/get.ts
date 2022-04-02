import * as fs from 'fs/promises';
import Router from 'koa-router';
import type {
  SimpleDirent,
  SimpleStats,
} from '../../../common/ApiResponses';
import isNodeError from '../../../common/isNodeError';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Readers

  async function readFile(
    path: string,
  ): Promise<Buffer> {
    const data = await fs.readFile(path);
    return data;
  }

  async function readdir(
    path: string,
    withFileTypes?: boolean,
  ): Promise<string[] | SimpleDirent[]> {
    if (!withFileTypes) {
      const items: string[] = await fs.readdir(path);
      return items;
    }

    const dirents = await fs.readdir(path, { withFileTypes: true });
    const items: SimpleDirent[] = [];
    dirents.forEach((dirent) => {
      const simpleDirent: SimpleDirent = {
        name: dirent.name,
        dir: dirent.isDirectory(),
      };
      if (dirent.isFile() || dirent.isDirectory()) { items.push(simpleDirent); }
    });
    return items;
  }

  async function stat(path: string): Promise<SimpleStats> {
    const stats = await fs.stat(path);
    if (stats.isFile() || stats.isDirectory()) {
      const simpleStats: SimpleStats = {
        ...stats,
        dir: stats.isDirectory(),
      };
      return simpleStats;
    }

    throw new Error();
  }

  //
  // Get request routing

  const router = new Router();

  router.get(/.*/, async (ctx) => {
    ctx.status = 500;
    ctx.body = 'Relay server error';

    let path;
    try {
      path = resolvePath(ctx.path);
    } catch (err) {
      if (isNodeError(err)) {
        ctx.status = 403;
        ctx.body = err.message;
      }
      return;
    }

    if (ctx.query.cmd) {
      // readFile command
      if (ctx.query.cmd === 'readFile') {
        try {
          const response = await readFile(path);
          ctx.status = 200;
          ctx.body = response;
          return;
        } catch (err) {
          if (isNodeError(err)) {
            if (err.code === 'ENOENT') {
              ctx.status = 404;
              ctx.body = err.message;
              return;
            }

            ctx.status = 400;
            ctx.body = err.message;
          }
          return;
        }
      }

      // readdir command
      if (ctx.query.cmd === 'readdir') {
        if (ctx.query.withFileTypes) {
        // readdir withFileTypes
          try {
            const response = (await readdir(path, true)) as SimpleDirent[];
            ctx.status = 200;
            ctx.body = response;
            return;
          } catch (err) {
            if (isNodeError(err)) {
              if (err.code === 'ENOENT') {
                ctx.status = 404;
                return;
              }

              ctx.status = 400;
              ctx.body = err.message;
            }
            return;
          }
        } else {
          // pure readdir command
          try {
            const response = await readdir(path);
            ctx.status = 200;
            ctx.body = response;
            return;
          } catch (err) {
            if (isNodeError(err)) {
              if (err.code === 'ENOENT') {
                ctx.status = 404;
                return;
              }
              ctx.status = 400;
              ctx.body = err.message;
            }
            return;
          }
        }
      }

      // stat command
      if (ctx.query.cmd === 'stat') {
        try {
          const response = await stat(path);
          ctx.status = 200;
          ctx.body = response;
          return;
        } catch (err) {
          if (isNodeError(err)) {
            if (err.code === 'ENOENT') {
              ctx.status = 404;
              return;
            }
            ctx.status = 400;
            ctx.body = err.message;
          }
        }
      }

      // Other commands ...
    } else {
      ctx.status = 400;
      ctx.body = 'Command query param not specified';
    }
  });

  return router.routes();
}

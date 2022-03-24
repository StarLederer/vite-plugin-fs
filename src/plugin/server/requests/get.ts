import * as fs from 'fs/promises';
import type { Stats } from 'fs';
import Router from 'koa-router';
import type {
  ApiResponse,
  FileResponse,
  DirResponse,
  SimpleDirent,
  SimpleStats,
  StatResponse,
} from 'src/common/ApiResponse';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Readers

  async function readIfFile(
    path: string,
    stats: Stats,
  ): Promise<FileResponse | null> {
    if (stats.isFile()) {
      const data = await fs.readFile(path);
      return {
        type: 'file',
        data,
      };
    }

    return null;
  }

  async function readIfDir(
    path: string,
    stats: Stats,
    detailed = false,
  ): Promise<DirResponse | null> {
    if (stats.isDirectory()) {
      let items: any[];
      if (!detailed) {
        items = await fs.readdir(path);
      } else {
        const dirents = await fs.readdir(path, { withFileTypes: true });
        items = [];
        dirents.forEach((dirent) => {
          const simpleDirent: SimpleDirent = {
            name: dirent.name,
            dir: dirent.isDirectory(),
          };
          if (dirent.isFile() || dirent.isDirectory()) { items.push(simpleDirent); }
        });
      }
      return {
        type: 'dir',
        items,
      };
    }

    return null;
  }

  function statIfSupported(stats: Stats): StatResponse | null {
    if (stats.isFile() || stats.isDirectory()) {
      const simpleStats: SimpleStats = {
        ...stats,
        dir: stats.isDirectory(),
      };
      return {
        type: 'stats',
        stats: simpleStats,
      };
    }

    return null;
  }

  //
  // Get request routing

  const router = new Router();

  router.get(/.*/, async (ctx) => {
    const path = resolvePath(ctx.path);

    try {
      // Generate response
      let response: ApiResponse | null = null;
      const stats = await fs.stat(path);

      // .../request?command=...
      if (ctx.query.command) {
        if (ctx.query.command === 'readfile') {
          // readFile command
          response = await readIfFile(path, stats);
        } else if (ctx.query.command === 'readdir') {
          // readdir command
          response = await readIfDir(path, stats);
        } else if (ctx.query.command === 'readdir-detailed') {
          // readdir command
          response = await readIfDir(path, stats, true);
        } else if (ctx.query.command === 'stat') {
          // stat command
          response = statIfSupported(stats);
        } else {
          // invalid command
          response = {
            type: 'error',
            code: 400,
            message: `Unknown command ${ctx.query.command.toString()}`,
          };
        }
      } else {
        // no command (try to read file and dir)
        response = (await readIfFile(path, stats)) ?? (await readIfDir(path, stats));
      }

      // Check if response is not null
      if (response) {
        // Check if response is not an ErrorResponse
        if (response.type !== 'error') {
          ctx.status = 200;
          ctx.body = response;
        } else {
          ctx.status = response.code;
          ctx.body = response.message;
        }
      } else {
        // Response is null
        ctx.status = 500;
      }
    } catch (err: any) {
      // Could not fs.stat() the path
      if (err.code === 'ENOENT') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
    }
  });

  return router.routes();
}

import * as fs from 'fs/promises';
import { dirname } from 'path';
import Router from 'koa-router';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Post request routing

  const router = new Router();

  router.delete(/.*/, async (ctx) => {
    const path = resolvePath(ctx.path);
    const dir = dirname(path);

    let recursive = false;
    let force = false;
    if (ctx.query.recursive) recursive = true;
    if (ctx.query.force) force = true;

    try {
      await fs.rm(path, { recursive, force });
      ctx.status = 200;
    } catch (err: any) {
      // Couldn't rm
      if (err.code === 'ENOENT') {
        // File doesn't exist
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
    }
  });

  return router.routes();
}

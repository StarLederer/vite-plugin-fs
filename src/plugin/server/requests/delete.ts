import * as fs from 'fs/promises';
import Router from 'koa-router';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Post request routing

  const router = new Router();

  router.delete(/.*/, async (ctx) => {
    let path;
    try {
      path = resolvePath(ctx.path);
    } catch (err: any) {
      ctx.status = 403;
      ctx.body = err.message;
      return;
    }

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
      } else if (err.code === 'ERR_FS_EISDIR') {
        // Tried ro rm a directory
        ctx.status = 400;
      } else {
        // Unknown error
        ctx.status = 500;
      }

      ctx.body = err.message;
    }
  });

  return router.routes();
}

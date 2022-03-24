import * as fs from 'fs/promises';
import Router from 'koa-router';
import instanceOfNodeError from 'src/common/instanceofNodeError';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Post request routing

  const router = new Router();

  router.delete(/.*/, async (ctx) => {
    const path = resolvePath(ctx.path);

    let recursive = false;
    let force = false;
    if (ctx.query.recursive) recursive = true;
    if (ctx.query.force) force = true;

    try {
      await fs.rm(path, { recursive, force });
      ctx.status = 200;
    } catch (err: any) {
      console.log(err);
      if (instanceOfNodeError(err, TypeError)) {
        // Couldn't rm
        if (err.code === 'ENOENT') {
          // File doesn't exist
          ctx.status = 404;
        } else if (err.code === 'ERR_FS_EISDIR') {
          // Tried ro rm a directory
          ctx.status = 405;
        } else {
          // Unknown error
          ctx.status = 500;
        }
      }
    }
  });

  return router.routes();
}

import * as fs from 'fs/promises';
import Router from 'koa-router';
import isNodeError from '../../../common/isNodeError';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Delete request routing

  const router = new Router();

  router.delete(/.*/, async (ctx) => {
    ctx.status = 500;
    ctx.body = 'Relay server error';

    let path;
    try {
      path = resolvePath(decodeURIComponent(ctx.path));
    } catch (err) {
      if (isNodeError(err)) {
        ctx.status = 403;
        ctx.body = err.message;
      }
      return;
    }

    if (ctx.query.cmd) {
      if (ctx.query.cmd === 'rm') {
        let recursive = false;
        let force = false;
        if (ctx.query.recursive) recursive = true;
        if (ctx.query.force) force = true;

        try {
          await fs.rm(path, { recursive, force });
          ctx.status = 200;
        } catch (err) {
          if (isNodeError(err)) {
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

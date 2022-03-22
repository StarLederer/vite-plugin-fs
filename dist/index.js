var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/FsServer.ts
import {
  createServer
} from "http";
import { resolve } from "path";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "koa-cors";
import Router from "koa-router";
var FsServer = class {
  constructor(options) {
    __publicField(this, "server");
    __publicField(this, "rootDir");
    __publicField(this, "options");
    this.options = options;
    this.rootDir = resolve(this.options.rootDir);
    const app = new Koa();
    app.use(bodyParser());
    app.use(cors());
    const router = new Router();
    router.get("/", (ctx) => {
      ctx.body = {
        status: "success"
      };
    });
    app.use(router.routes());
    this.server = createServer(app.callback());
  }
  start() {
    this.server.listen(7070, () => {
      console.log("[41m");
      console.warn(`fs server is running on port ${this.options.port} and on /_fs`);
      console.warn("Please be careful since any requests to this server can modify your actual file system");
      console.warn(`${!this.options.goAboveRoot ? "[43m[30m" : ""}Clamping to ${this.rootDir} is ${this.options.goAboveRoot ? "OFF! A DELETE request to ../ will wipe the parent of this directory!" : "on. Everything outside this directory is safe"}`);
      console.log("[0m");
    });
  }
  stop() {
    this.server.close();
  }
  resolvePath(path) {
    if (this.options.goAboveRoot) {
      return resolve(this.rootDir + path);
    }
    let p = resolve(this.rootDir + path);
    if (!p.startsWith(this.rootDir))
      p = this.rootDir;
    return p;
  }
};
var FsServer_default = FsServer;

// src/Options.ts
var defaultOptions = {
  port: 7070,
  rootDir: "",
  goAboveRoot: false,
  proxy: {
    enable: true,
    path: "/_fs"
  }
};
function resolveOptions(userOptiuons) {
  return Object.assign(defaultOptions, userOptiuons);
}

// src/index.ts
function VitePluginFs(userOptiuons = {}) {
  const options = resolveOptions(userOptiuons);
  let server = null;
  return {
    name: "vite-plugin-fs",
    apply: "serve",
    config() {
      const config = {};
      if (options.proxy.enable) {
        config.server = {};
        config.server.proxy = {};
        config.server.proxy[options.proxy.path] = {
          target: `http://localhost:${options.port}`,
          changeOrigin: true,
          rewrite: (path) => path.substring(options.proxy.path.length)
        };
      }
      return config;
    },
    buildStart() {
      server = new FsServer_default(options);
      server.start();
    },
    closeBundle() {
      server == null ? void 0 : server.stop();
    }
  };
}
var src_default = VitePluginFs;
export {
  src_default as default
};

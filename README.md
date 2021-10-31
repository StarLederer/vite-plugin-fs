# [vite-plugin-fs](https://npmjs.com/package/vite-plugin-fs)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Interact with fs by fetching requests from a local API.

> This plugin is in early acces. Do not publish anything with this plugin in it, especially in SSR mode! SSR mode has not been tested!!!

## What's already working

- Fetching a GET requests to execute fs.reafFile fs.readdir and fs.stat
- Limiting of where API can go to protect your file system

## What's not working yet

- POST and DELETE requests
- Hot reloads
- SSR support (potentially)
- Authentication (potentially)

## Setup

1. Add `vite-plugin-fs` to your project

```bash
pnpm install vite-plugin-fs
```

2. Add the plugin to `vite.config.js`

```ts
// vite.config.js
import fs from "vite-plugin-fs";

export default {
  plugins: [fs()],
};
```

## Options

```ts
export interface Options {
  /**
   * Port to serve the API at
   *
   * @default 7070
   */
  port?: number;

  /**
   * Root directory for fs requests relative to the project directory.
   *
   * @default '/'
   */
  rootDir?: string;

  /**
   * Allow going above rootDir.
   * Enabling this is really dangerous! Any request to the API will be able to read and modify files anywhere on your system. Indended for personal use only.
   *
   * @default false
   */
  goAboveRoot?: boolean;

  // This option might get removed in the future versions
  proxy?: {
    /**
     * Inject a proxy to the vite config.
     *
     * @default true
     */
    enable: boolean;

    /**
     * Proxy path.
     *
     * @default '/_fs'
     */
    path: string;
  };
```

## Usage

API is only included in the serve mode. At build time the plugin does nothing. SSR has not been tested, so DO NOT USE THIS PLUGIN IS SSR MODE.

Currently the API only accepts GET requests and returns results of fs.readFile fs.readdir and fs.stat functions, but there are plans to implement POST and DELETE requests to create, modify and delete files in the near future. The API only supports files and directories. Other types of file system elements will result in 404 exceptions.

To read a file or dir

```ts
await fetch(`http://localhost:7070/path/to/somewhere`);
// if file found, returns {type: 'file', data: RESULT OF fs.readFile(.../path/to/somewhere)}
// if directory found, returns {type: 'dir', items: ['child1', 'child2'...]}
```

To read a file set the **command** querry to **readfile**

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=readfile`);
// if file found, returns {type: 'file', data: RESULT OF fs.readFile(.../path/to/somewhere)}
```

To read a directory set the **command** querry to **readdir**

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=readdir`);
// if directory found, returns {type: 'dir', items: ['child1', 'child2'...]}
```

To execute fs.stat set the **command** querry to **stat**

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=stat`);
// if directory found, returns {type: 'stats', stats: {...RESULTS_OF fs.stat(), dir: RESULT OF fs.stat().isDirectory()}}
```

## Example of displaying contents of a directory with a recursive Vue component

```vue
<!-- Dirent.vue -->

<script>
import { ref } from "vue";

export default {
  name: "Dirent",
  props: {
    dir: String,
  },
  setup(props) {
    const children = ref([]);

    fetch(`http://localhost:7070${props.dir}?command=stat`)
      .then((response) => response.json())
      .then((a) => {
        if (a.stats.dir) {
          fetch(`http://localhost:7070${props.dir}`)
            .then((response) => response.json())
            .then((b) => {
              children.value = b.items;
            });
        }
      });

    return {
      children,
    };
  },
};
</script>

<template>
  <li>
    <span>{{ dir }}</span>
    <ul>
      <Dirent v-for="child in children" :dir="`${dir}/${child}`" />
    </ul>
  </li>
</template>
```

```vue
<!-- App.vue -->

<script>
import Dirent from "./components/Dirent.vue";
</script>

<template>
  <ul>
    <Dirent dir="/src" />
  </ul>
</template>
```

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-fs/latest.svg
[npm-version-href]: https://npmjs.com/package/vite-plugin-fs
[npm-downloads-src]: https://img.shields.io/npm/dm/vite-plugin-fs.svg
[npm-downloads-href]: https://npmjs.com/package/vite-plugin-fs
[license-src]: https://img.shields.io/npm/l/nuxt-content-writer.svg
[license-href]: https://npmjs.com/package/nuxt-content-writer

# [vite-plugin-fs](https://npmjs.com/package/vite-plugin-fs)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Interact with fs by fetching requests to a local API.

> **New:** A convenient abstraction has been implemented. Check out new docs below.

> **New:** SSR and production builds have been somewhat tested. No signs of this plugin were found. This plugin is now somewhat safe to deploy.

## What's already working

- Fetching a GET requests to execute fs.reafFile fs.readdir and fs.stat
- Fetching a POST request to execute fs.writeFile
- Fetching a DELETE request to execute fs.rm
- Limiting of where API can go to protect your file system

## What is planned before v1.0.0

- [x] A node-fs-like abstaction of the api
- [ ] Automated tests
- [x] Checking that this plugin is not included in production and SSR builds

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
   * Port to serve the API at.
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
   * Enabling this is really dangerous!
   * Any request to the API will be able to read
   * and modify files anywhere on your system.
   * Indended for personal use only.
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

The relay server only works in dev mode but the abstraction module can still be included in production, it is up to you to ensure it is not. There is no significant consequewnces to inclusing the abstractions layer in production since it will just make requests to a an inactive API endpoint, however, it is unnecessary code that should not be shipped to users.

This plugin runs a relay server that allows the browser to communicate with node. There are two ways to interact with the relay server:

- use the abstraction API (**recommended**),
- fetch network requests (low level, might change).

### Abstraction API

The abstraction API is designed to act as much like node fs as possible.

Import the abstraction API in your browser code

```vue
<script>
  import fs from "vite-plugin-fs/browser";
</script>
```

To read a file

```ts
const file = await fs.readFile('path/to/somewhere');
```

To read a directory

```ts
const dir = await fs.readdir('path/to/somewhere');
```

To stat a path

```ts
const stats = await fs.stat('path/to/somewhere');
```

To write a file

```ts
// Currently only strings are supported as the second argument
await fs.writeFile('path/to/somewhere', 'File content');
```

To delete a file

```ts
await fs.rm('path/to/somewhere');
```

To delete a file or directory

```ts
await fs.rm('path/to/somewhere', { recursive: true });
```

### Network requests

This is a more direct way to interact with the relay server, however, it is inconvenient, error-prone and there is no type checking. While this method is documented, it is not recommended to use and the docs for it might get removed. The API for network requests might also change a lot, unlike the abstraction API that will always act as much like node fs as possible.

To read a file

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=readFile`);
```

To read a directory

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=readdir`);
```

To execute fs.stat

```ts
await fetch(`http://localhost:7070/path/to/somewhere?command=stat`);
```

To write a file

```ts
await fetch(`http://localhost:7070/path/to/somewhere`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({data}),
});
// writes body.data to the file at the given path. Creates the parent directories if they don't already exist.
```

To delete a file

```ts
await fetch(`http://localhost:7070/path/to/somewhere`, { method: 'DELETE' });
// deletes the file or direcoty if it exists. Returns 500 if the path is not a file or an empty folder

await fetch(`http://localhost:7070/path/to/somewhere?recursive=true&force=true`, { method: 'DELETE' });
// deletes the file or direcoty if it exists. Also deletes non-empty directories. Similar to rm -rf
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

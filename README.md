# [vite-plugin-fs](https://npmjs.com/package/vite-plugin-fs)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Interact with fs by fetching requests to a local API.

> ~**New:** Everything planned before v1.0.0 has been implemented. Release candidate is ready.~ This was published by mistake but beta in on the way.

> **New:** A convenient abstraction has been implemented. Check out new docs below.

## What's already working

- Fetching a GET requests to execute fs.reafFile fs.readdir and fs.stat
- Fetching a POST request to execute fs.writeFile
- Fetching a DELETE request to execute fs.rm
- Limiting of where API can go to protect your file system

## What is planned before v1.0.0

- [x] A node-fs-like abstaction of the api
- [x] Automated tests
- [x] Checking that this plugin is not included in production and SSR builds
- [x] No Typescript errors
- [x] All config options actually work
- [x] Port taken error handling
- [ ] Better examples

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
interface UserOptions {
  /**
   * Port to serve the API at.
   * Chooses a random one if the one specified is taken.
   * Usually you don't need to configure this.
   *
   * @default 7070
   */
  port?: number;

  /**
   * Root directory visible to browser.
   *
   * @default '/'
   *
   * @example
   * './src/content'
   */
  rootDir?: string;
```

## Usage

The relay server only works in dev mode but the abstraction module can still be included in production, it is up to you to ensure it is not. There is no significant consequewnces to inclusing the abstractions layer in production since it will just make requests to a an inactive API endpoint, however, it is unnecessary code that should not be shipped to users.

This plugin runs a relay server that allows the browser to communicate with node. There are two ways to interact with the relay server:

- use the abstraction API (**recommended**),
- fetch network requests (not supported).

### Abstraction API

The abstraction API is designed to act as much like node fs as possible.

Import the abstraction API in your browser code

```ts
import fs from 'vite-plugin-fs/browser';

// To read a file
const file = await fs.readFile('path/to/somewhere');

// To read a directory
const dir = await fs.readdir('path/to/somewhere');

// To stat a path
const stats = await fs.stat('path/to/somewhere');

// To write a file
// Currently only strings are supported as the second argument
await fs.writeFile('path/to/somewhere', 'File content');

// To delete a file
await fs.rm('path/to/somewhere');

// To delete a file or directory (rm -r)
await fs.rm('path/to/somewhere', { recursive: true });
```

### Network requests

*Do not use this method in production!*

This is a more direct way to interact with the relay server, however, it is inconvenient, error-prone and does not have a stable API. Breaking changes to this method are not documented. **This method is documented purely for educational reasons.** Only use this method if you want to play around with the plugin and better understand what it does in the background.

```ts
import { activePort } from '@vite-plugin-fs-runtime';

const url = `http://localhost:${activePort}`;

(async () => {
  // To read a file
  const fileData = await fetch(`${url}/path/to/somewhere?cmd=readFile`);

  // To read a directory
  const directoryEntries = await fetch(`${url}/path/to/somewhere?cmd=readdir`);

  // To execute fs.stat
  const stats = await fetch(`${url}/path/to/somewhere?cmd=stat`);

  // To write a file
  // (Creates the parent directories if they don't already exist automatically)
  await fetch(`${url}/path/to/somewhere?cmd?=writeFile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({data}),
  });

  // To delete a file
  await fetch(`${url}/path/to/somewhere?cmd=rm`, { method: 'DELETE' });

  // To delete a file or directory (rm -rf)
  await fetch(`${url}/path/to/somewhere?cmd=rm&recursive=true&force=true`, { method: 'DELETE' });
})();
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

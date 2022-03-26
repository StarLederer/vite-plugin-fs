interface UserOptions {
  port?: number;
  rootDir?: string;
  goAboveRoot?: boolean;
  proxy?: {
    enable: boolean;
    path: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options extends Required<UserOptions> {}

const defaultOptions: Options = {
  port: 7070,
  rootDir: '',
  goAboveRoot: false,
  proxy: {
    enable: true,
    path: '/_fs',
  },
};

function resolveOptions(userOptiuons: UserOptions): Options {
  return Object.assign(defaultOptions, userOptiuons);
}

export {
  UserOptions,
  Options,
  defaultOptions,
  resolveOptions,
};

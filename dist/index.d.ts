import { Plugin } from 'vite';

interface UserOptions {
    port?: number;
    rootDir?: string;
    goAboveRoot?: boolean;
    proxy?: {
        enable: boolean;
        path: string;
    };
}

declare function VitePluginFs(userOptiuons?: UserOptions): Plugin;

export { VitePluginFs as default };

/// <reference types="./worker-configuration.d.ts" />

declare module 'h3' {
    interface H3EventContext {
        cf: CfProperties;
        cloudflare: {
            context: ExecutionContext;
            env: Env;
            request: Request;
        };
    }
}

export { };

// declare module '@libwebp-wasm/gif2webp' {
//     interface Gif2WebPModule {
//         convert(data: Uint8Array): Uint8Array;
//     }
//     function gif2webp(): Promise<Gif2WebPModule>;
//     export default gif2webp;
// }

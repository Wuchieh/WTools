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

declare module 'swiper/css' {
    const css: string;
    export default css;
}

declare module 'swiper/css/navigation' {
    const css: string;
    export default css;
}

export { };

// declare module '@libwebp-wasm/gif2webp' {
//     interface Gif2WebPModule {
//         convert(data: Uint8Array): Uint8Array;
//     }
//     function gif2webp(): Promise<Gif2WebPModule>;
//     export default gif2webp;
// }

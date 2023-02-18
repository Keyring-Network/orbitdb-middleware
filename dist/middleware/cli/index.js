import parser from "./parser.js";
export async function cli(command, ctxMiddleware) {
    await parser()
        .middleware(ctxMiddleware)
        .parse(command);
}

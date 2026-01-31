// esbuild.config.mjs

export function getConfig(mode) {
    const isDev = mode === "dev";

    const common = {
        entryPoints: ["src/main.ts"],
        bundle: true,
        outdir: "dist",
        format: "esm",
        target: "es2019",
        sourcemap: true,
    };

    if (isDev) {
        return {
            ...common,
        };
    }

    return {
        ...common,
        minify: true,
    };
}
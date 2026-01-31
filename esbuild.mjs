#!/usr/bin/env node
import esbuild from "esbuild";
import { getConfig } from "./esbuild.config.mjs";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { URL } from "url";

// нужно, чтобы корректно считать cwd для ES-модуля
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
let mode = "build";

for (const a of args) {
    if (a.startsWith("--mode")) {
        const [, value] = a.split("=");
        if (value) mode = value;
    }
}

const isDev = mode === "dev";
const config = getConfig(mode);

if (!isDev) {
    // обычный build
    await esbuild.build(config);
    console.log("✅ Build complete");
    process.exit(0);
}

// DEV: watch + свой статический сервер
const ctx = await esbuild.context(config);
await ctx.watch();
console.log("🔁 Watching for changes...");

const PORT = 5173;
const ROOT_DIR = path.resolve(__dirname); // корень проекта (там index.html, src, static, dist)

const server = http.createServer((req, res) => {
    try {
        const requestUrl = new URL(req.url, `http://${req.headers.host}`);
        let pathname = requestUrl.pathname;

        if (pathname === "/") {
            pathname = "/index.html";
        }

        const filePath = path.join(ROOT_DIR, pathname);

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                res.end("404 Not Found");
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            let contentType = "application/octet-stream";

            if (ext === ".html") contentType = "text/html; charset=utf-8";
            else if (ext === ".js") contentType = "text/javascript; charset=utf-8";
            else if (ext === ".css") contentType = "text/css; charset=utf-8";
            else if (ext === ".ttf") contentType = "font/ttf";
            else if (ext === ".otf") contentType = "font/otf";
            else if (ext === ".woff") contentType = "font/woff";
            else if (ext === ".woff2") contentType = "font/woff2";
            else if (ext === ".png") contentType = "image/png";
            else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
            else if (ext === ".svg") contentType = "image/svg+xml";

            res.statusCode = 200;
            res.setHeader("Content-Type", contentType);

            const stream = fs.createReadStream(filePath);
            stream.on("error", () => {
                res.statusCode = 500;
                res.end("500 Internal Server Error");
            });
            stream.pipe(res);
        });
    } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("500 Internal Server Error");
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
});
#!/usr/bin/env node

import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

export function createStaticServer({ port = 4173, host = "127.0.0.1" } = {}) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const requestedPath = decodeURIComponent(url.pathname);
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    let absolutePath = path.join(root, safePath);

    if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
      absolutePath = path.join(absolutePath, "index.html");
    }

    if (!absolutePath.startsWith(root) || !existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": contentType(absolutePath) });
    createReadStream(absolutePath).pipe(response);
  });

  return {
    url: `http://${host}:${port}`,
    listen: () =>
      new Promise((resolve) => {
        server.listen(port, host, () => resolve(server));
      }),
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

if (import.meta.url === pathToFileImport(process.argv[1])) {
  const port = Number(readArg("--port") ?? 4173);
  const host = readArg("--host") ?? "127.0.0.1";
  const app = createStaticServer({ port, host });
  await app.listen();
  console.log(`Digital Publishing static server: ${app.url}`);
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function pathToFileImport(value) {
  if (!value) return "";
  return new URL(`file://${path.resolve(value)}`).href;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".mjs": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }[ext] ?? "application/octet-stream"
  );
}

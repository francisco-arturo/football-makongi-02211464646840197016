import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const target = resolve(ROOT, `.${decoded}`);
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  return target;
}

export function createServer() {
  return createHttpServer(async (request, response) => {
    const requestUrl = request.url || "/";
    let target = safePath(requestUrl === "/" ? "/index.html" : requestUrl);

    if (!target) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    try {
      let info = await stat(target);
      if (info.isDirectory()) {
        target = resolve(target, "index.html");
        info = await stat(target);
      }
      const content = await readFile(target);
      response.writeHead(200, {
        "Content-Type": MIME[extname(target).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      });
      response.end(content);
    } catch {
      if (!extname(target)) {
        try {
          const content = await readFile(resolve(ROOT, "index.html"));
          response.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-store" });
          response.end(content);
          return;
        } catch {
          /* fall through to 404 */
        }
      }
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const requestedPort = process.env.PORT === undefined ? 4173 : Number(process.env.PORT);
  const server = createServer();

  const announce = () => {
    const port = server.address().port;
    console.log(`Makongi FC prototype running at http://127.0.0.1:${port}`);
    console.log("Press Ctrl+C to stop.");
  };

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && requestedPort !== 0) {
      console.warn(`Port ${requestedPort} is busy; using the next free port.`);
      server.listen(0, "127.0.0.1", announce);
      return;
    }
    throw error;
  });

  server.listen(Number.isFinite(requestedPort) ? requestedPort : 4173, "127.0.0.1", announce);
}

import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 4173;
const DIST = path.resolve("dist");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  const rawHost = (req.headers.host || "").toLowerCase();
  const hostname = rawHost.split(":")[0];
  const isAdminHost = hostname.startsWith("admin.") || hostname === "admin.localhost";
  const isAdminRoute = urlPath === "/admin" || urlPath.startsWith("/admin/");

  if (!isAdminHost && isAdminRoute) {
    const notFoundFile = path.join(DIST, "404.html");
    if (fs.existsSync(notFoundFile)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(notFoundFile).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>");
  }

  let filePath = path.join(DIST, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (path.extname(urlPath)) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    filePath = path.join(DIST, "index.html");
  }
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range && (ext === ".mp4" || ext === ".webm")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});

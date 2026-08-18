import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, relative } from "node:path";
import { createError, getRequestURL, sendStream, setHeader } from "h3";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function findDocsRoot() {
  const candidates = [
    join(process.cwd(), ".docs"),
    join(process.cwd(), ".output", "docs"),
    join(process.cwd(), "docs")
  ];

  return candidates.find((candidate) => existsSync(join(candidate, "index.html"))) || candidates[0];
}

function resolveDocsFile(pathname: string) {
  const docsRoot = findDocsRoot();
  let requestedPath: string;

  try {
    requestedPath = decodeURIComponent(pathname.replace(/^\/docs\/?/, ""));
  } catch {
    return null;
  }

  requestedPath = requestedPath.replace(/\/+$/, "") || "index.html";
  if (!requestedPath.includes(".")) {
    requestedPath += ".html";
  }
  if (requestedPath.includes("\\") || requestedPath.includes("\0")) {
    return null;
  }

  const filePath = normalize(join(docsRoot, requestedPath));
  const relativePath = relative(docsRoot, filePath);
  if (relativePath.startsWith("..") || relativePath.includes("..\\") || !existsSync(filePath)) {
    return null;
  }

  return statSync(filePath).isFile() ? filePath : null;
}

export default defineEventHandler((event) => {
  const filePath = resolveDocsFile(getRequestURL(event).pathname);

  if (!filePath) {
    throw createError({ statusCode: 404, statusMessage: "Docs page not found" });
  }

  setHeader(event, "content-type", contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream");
  return sendStream(event, createReadStream(filePath));
});

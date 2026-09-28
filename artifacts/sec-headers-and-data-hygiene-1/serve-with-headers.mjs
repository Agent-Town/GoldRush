#!/usr/bin/env node
/**
 * serve-with-headers.mjs — serve `dist/` the way Cloudflare Pages will, i.e. WITH `_headers`.
 *
 * WHY THIS EXISTS. `npx vite preview` serves the production bundle but knows nothing about
 * `public/_headers`: that file is a Pages (and Cloudflare) mechanism, consumed at deploy time. So a
 * preview boot cannot answer the question task sec-headers-and-data-hygiene-1 item 1 asks — "does
 * the report-only policy produce ZERO violations in a real boot?" — because the browser never
 * receives the policy. This is the smallest honest instrument: the same `dist/` bytes, served with
 * the header rules parsed out of `dist/_headers`, so the Content-Security-Policy-Report-Only header
 * reaches Chromium exactly as it will in production.
 *
 * It is evidence, not a shipped tool: it lives under artifacts/ with the report it produced, and it
 * is never part of the game, the deploy or a gate.
 *
 * usage: node artifacts/sec-headers-and-data-hygiene-1/serve-with-headers.mjs <port> [distDir]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const port = Number(process.argv[2] ?? 5314);
const distDir = path.resolve(process.argv[3] ?? 'dist');
const headersFile = path.join(distDir, '_headers');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.ktx2': 'image/ktx2',
  '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/** Cloudflare `_headers`: patterns at column 0, indented `Name: value` lines, `#` comments. */
function parseHeaderFile(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: [] };
      rules.push(current);
      continue;
    }
    const match = /^\s+([A-Za-z0-9-]+):[ \t]*(.*)$/.exec(line);
    if (match && current) current.headers.push([match[1], match[2]]);
  }
  return rules;
}

function matches(pattern, pathname) {
  if (!pattern.includes('*')) return pattern === pathname;
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(pathname);
}

const rules = existsSync(headersFile) ? parseHeaderFile(readFileSync(headersFile, 'utf8')) : [];
if (!rules.length) {
  console.error(`serve-with-headers: no rules parsed from ${headersFile}; refusing to serve a headerless tree.`);
  process.exit(2);
}

/** Least specific first, so a longer pattern overrides a shorter one on the same header name. */
function headersFor(pathname) {
  const applied = new Map();
  for (const rule of rules.filter((rule) => matches(rule.pattern, pathname)).sort((a, b) => a.pattern.length - b.pattern.length)) {
    for (const [name, value] of rule.headers) applied.set(name, value);
  }
  return applied;
}

function resolveFile(pathname) {
  const clean = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidate = path.join(distDir, clean);
  if (!candidate.startsWith(distDir)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const index = path.join(candidate, 'index.html');
    return existsSync(index) ? index : null;
  }
  if (existsSync(candidate)) return candidate;
  // SPA fallback, the same shape `vite preview` uses, so a deep link behaves the same way.
  return path.extname(clean) ? null : path.join(distDir, 'index.html');
}

createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const file = resolveFile(url.pathname);
  const extra = headersFor(url.pathname);
  if (!file || !existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', ...Object.fromEntries(extra) });
    response.end('not found\n');
    return;
  }
  const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  response.writeHead(200, {
    'content-type': type,
    'content-length': statSync(file).size,
    ...Object.fromEntries(extra),
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`serve-with-headers: ${distDir} on http://127.0.0.1:${port} with ${rules.length} header rule(s)`);
  for (const [name, value] of headersFor('/index.html')) console.log(`  /index.html  ${name}: ${value}`);
});

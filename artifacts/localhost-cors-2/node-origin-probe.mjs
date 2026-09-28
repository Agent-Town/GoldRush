#!/usr/bin/env node
/**
 * node-origin-probe.mjs (localhost-cors-2): does Node's own fetch or WebSocket put an Origin header on the
 * wire? Loopback only: one http server on 127.0.0.1, port 0, in this process; nothing else is contacted.
 * Why it matters: a caller that sends no Origin takes every door's no-origin path (corsHeaders returns
 * the base headers and the request proceeds), so the localhost rule cannot touch it.
 * usage (repo root): node artifacts/localhost-cors-2/node-origin-probe.mjs
 */
import { createServer } from 'node:http';

const seen = [];
const server = createServer((req, res) => {
  seen.push({ method: req.method, url: req.url, origin: req.headers.origin ?? '(none)', upgrade: req.headers.upgrade ?? '' });
  if (req.headers.upgrade) {
    res.writeHead(426);
    res.end();
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('ok');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
await fetch(`${base}/get`);
await fetch(`${base}/post`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
await new Promise((resolve) => {
  const socket = new WebSocket(`${base.replace('http', 'ws')}/ws`);
  socket.addEventListener('error', () => resolve());
  socket.addEventListener('close', () => resolve());
  setTimeout(resolve, 2000);
});
server.close();
console.log(`node-origin-probe: node ${process.version}, loopback server, what arrived`);
for (const row of seen) console.log(`${row.method} ${row.url} origin=${row.origin}${row.upgrade ? ` upgrade=${row.upgrade}` : ''}`);

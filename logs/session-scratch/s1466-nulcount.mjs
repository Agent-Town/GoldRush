// s1466: count raw 0x00 bytes directly, per file. grep's "binary" heuristic is an inference;
// a byte count is the fact. Validates my own control-arm discriminator before I trust it.
import { readFileSync } from 'node:fs';
for (const p of process.argv.slice(2)) {
  let buf;
  try { buf = readFileSync(p); } catch (e) { console.log(`${p}: UNREADABLE (${e.code})`); continue; }
  let n = 0; const sites = [];
  for (let i = 0; i < buf.length; i++) if (buf[i] === 0) { n++; if (sites.length < 6) sites.push(i); }
  // line numbers for the first few sites
  const lineOf = (off) => buf.subarray(0, off).toString('utf8').split('\n').length;
  console.log(`${p}: ${buf.length} bytes, ${n} raw NUL${n === 1 ? '' : 's'}` +
    (n ? `  lines: ${sites.map(lineOf).join(', ')}` : ''));
}

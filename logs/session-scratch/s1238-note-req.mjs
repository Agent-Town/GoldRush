import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
let h = lines[0];

const anchor = '**F)** Shell gate rejects';
const note =
  '**F)** ⚠️ **`tasks/queue/janitor-refresh-lane-a.req` is a FILE sitting in the queue ROOT, and it will crash a naive queue-counter** — it crashed mine (`ENOTDIR` from `readdirSync` over `tasks/queue/*`). **Do NOT tidy it: it is TRACKED, deliberately inert, self-documenting, and re-verified s1073.** Its first line reads *"INERT — DO NOT ACT ON THIS FILE"* and explains why twice over (the runner globs `tasks/janitor/*.req`, never `tasks/queue/`). I nearly dispositioned it as debris and read it first, which is the only reason I did not. **Filter to directories when counting queues.** ';

if (!h.includes(anchor)) { console.error('ANCHOR MISSING'); process.exit(9); }
h = h.replace(anchor, note + '**G)** Shell gate rejects');

lines[0] = h;
writeFileSync(P, lines.join('\n'));
console.log('note added; line-1 chars:', h.length);

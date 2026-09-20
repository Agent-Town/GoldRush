import fs from 'node:fs';
const P = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
let s = fs.readFileSync(P, 'utf8');
const before = Buffer.byteLength(s);
const linksBefore = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;

const SUBS = [
  ['## Codex failures / walls', '## Codex walls'],
  ['## Fire perms / env', '## Fire perms'],
  ['## Content / art', '## Content/art'],
  ['[**`git cherry` says `+` for content 100% on main**]', '[**`git cherry` `+` for content on main**]'],
  ['[**sibling worktree node_modules SYMLINKS into main**]', '[**sibling worktree node_modules → main**]'],
  ["[**DERIVE a master's expected pass count from its CURE**]", '[**DERIVE expected pass count from the CURE**]'],
  ['[**a DRY board can be an UNREGISTERED pile**]', '[**DRY board = UNREGISTERED pile**]'],
  ['[**author+drain in one fire mints F-ID COLLISIONS**]', '[**author+drain mints F-ID COLLISIONS**]'],
  ['[**your gate battery blocks the master you just queued**]', '[**your gate battery blocks your new master**]'],
  ['[**md lists FAILURES only; denominator in compact JSON**]', '[**md lists FAILURES; denominator in JSON**]'],
  ['[**spawned child inherits `NODE_TEST_CONTEXT` → exits 0**]', '[**child inherits `NODE_TEST_CONTEXT` → exits 0**]'],
  ['[**the SAME FILE may already solve the class**]', '[**the SAME FILE may already solve it**]'],
  ['[**UNCOMMITTED work in main dies in MINUTES**]', '[**UNCOMMITTED work in main dies fast**]'],
  ['[**keys in a FILE, not a shell-quoted probe**]', '[**keys in a FILE, not a shell probe**]'],
  ['[**merge THREE-WAY, never off a two-dot diff**]', '[**merge THREE-WAY, not a two-dot diff**]'],
];
let hits = 0;
for (const [from, to] of SUBS) { if (s.includes(from)) { s = s.split(from).join(to); hits++; } else console.log('MISS:', from.slice(0, 55)); }

fs.writeFileSync(P, s);
const after = Buffer.byteLength(s);
const linksAfter = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;
console.log(`subs ${hits}/${SUBS.length} · bytes ${before} -> ${after} (saved ${before - after})`);
console.log(`links ${linksBefore} -> ${linksAfter} ${linksBefore === linksAfter ? 'ALL PRESERVED ✓' : 'LOST ✗'}`);
console.log(`< 17.1KiB (17510)? ${after < 17510 ? 'YES ✓' : 'NO'}   headroom vs 24.4KiB read limit: ${24986 - after} bytes`);

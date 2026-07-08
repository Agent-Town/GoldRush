import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const raw = readFileSync(p, 'utf8');
const nl = raw.indexOf('\n');
const oldLine1 = raw.slice(0, nl);
const rest = raw.slice(nl + 1);
const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const intent = `ACTIVE ${stamp} (s178 fire) — root-cause + escalate ③ e2-science-tree (VERIFIED architectural blocker, not a re-queueable no-op); no drain available (lane/m4 baron LIVE, lanes dry).`;
// trim the s177 archive bullet to keep STATUS.md from unbounded growth (full text in git history)
const trimmed = oldLine1.length > 900 ? oldLine1.slice(0, 900) + ' …[full text in git @0ee6062]' : oldLine1;
const archiveBullet = `- **s177 handoff (line-1 archive):** ${trimmed}`;
writeFileSync(p, `${intent}\n${archiveBullet}\n${rest}`);
console.log('LOCKED s178:', stamp);

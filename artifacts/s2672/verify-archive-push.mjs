// s2672 — PROVE the offsite half, the way F-2668-2 was proved and not the way it was first
// claimed: "a tree that lists a filename is not a recoverable byte" (s2670). `git push`
// exiting 0 is a claim about a transfer, not about what a future reader can get back.
//
// This fetches the pushed branch into a THROWAWAY temp repo (never the working repo —
// F-E1T-3: a depth-1 blobless fetch into it marked the whole repo shallow AND partial and
// redded a guard on main for an hour), lists what the tree actually holds, and compares the
// archive's BLOB ID for every mirror against `git hash-object` of our own local file. A
// blob id equal on both sides is a byte-for-byte identity proof over the whole series.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveMirrorDest } from '../../scripts/ledger-mirror-dest.mjs';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const BRANCH = 'ledger-backups';
const REMOTE = execFileSync('git', ['remote', 'get-url', 'archive'], { cwd: REPO, encoding: 'utf8' }).trim();
const local = resolveMirrorDest().dir;
const NAME = /^ledger-\d{4}-\d{2}-\d{2}\.db$/;

const work = mkdtempSync(path.join(tmpdir(), 'verify-archive-'));
const git = (args, cwd = work) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
try {
  execFileSync('git', ['init', '-q', work]);
  git(['remote', 'add', 'origin', REMOTE]);
  // Blobless: the tree and its blob IDS are what the question needs; the bytes are only
  // downloaded for the one spot-check below.
  git(['fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', BRANCH]);

  const tree = git(['ls-tree', '-r', '-l', 'FETCH_HEAD']).split('\n').filter(Boolean)
    .map((l) => {
      const [meta, file] = l.split('\t');
      const [, , sha, size] = meta.split(/\s+/);
      return { file, sha, size: Number(size), base: path.basename(file) };
    })
    .filter(e => NAME.test(e.base));

  const localFiles = readdirSync(local).filter(n => NAME.test(n)).sort();
  console.log(`archive branch  : ${BRANCH} @ ${git(['rev-parse', '--short', 'FETCH_HEAD'])}`);
  console.log(`on the archive  : ${tree.length} dated mirror(s), ${tree.reduce((t, e) => t + e.size, 0)} B`);
  console.log(`on this disk    : ${localFiles.length} dated mirror(s), ${localFiles.reduce((t, n) => t + statSync(path.join(local, n)).size, 0)} B`);

  const onArchive = new Set(tree.map(e => e.base));
  const missing = localFiles.filter(n => !onArchive.has(n));
  console.log(`local days NOT on the archive : ${missing.length}${missing.length ? ` (${missing.join(', ')})` : ''}`);

  // THE IDENTITY PROOF. git hash-object of our file must equal the archive's blob id.
  let same = 0, differ = [];
  for (const e of tree) {
    const mine = git(['hash-object', path.join(local, e.base)], REPO);
    if (mine === e.sha) same++; else differ.push(`${e.base}: archive ${e.sha} vs local ${mine}`);
  }
  console.log(`blob identity   : ${same}/${tree.length} byte-for-byte equal to the local mirror`);
  for (const d of differ) console.log(`  DIFFERS ${d}`);

  // And one REAL download, because a blob id is still a claim about bytes nobody fetched.
  const spot = tree[0];
  git(['fetch', '-q', 'origin', BRANCH]); // now with blobs
  const bytes = execFileSync('git', ['cat-file', 'blob', spot.sha], { cwd: work, maxBuffer: 64 << 20 });
  const magic = bytes.subarray(0, 15).toString('latin1');
  console.log(`spot download   : ${spot.base} — ${bytes.length} B, header ${JSON.stringify(magic)}, ` +
    `size matches tree: ${bytes.length === spot.size}`);
  console.log(`verdict         : ${same === tree.length && missing.length === 0 && magic.startsWith('SQLite format 3') ? '✅ THE SERIES IS RECOVERABLE FROM THE PRIVATE ARCHIVE' : '⛔ NOT PROVEN'}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

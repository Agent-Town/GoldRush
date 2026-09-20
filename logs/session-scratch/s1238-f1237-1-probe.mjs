// s1238: re-measure F-1237-1 and TEST ITS RECOMMENDED CURE before authoring a master from it.
// Never touches a tracked path: fixture trees live under os.tmpdir() and are torn down in finally.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { walkSubject, subjectFiles } from '../../scripts/lib/subject-tree.mjs';

const SUBJECT = { dir: 'scripts', ext: '.mjs', floor: 2 };
let root;
const out = [];
const say = (s) => { out.push(s); console.log(s); };

try {
  root = mkdtempSync(join(tmpdir(), 'gr-s1238-f1237-'));
  const subjectDir = join(root, SUBJECT.dir);
  mkdirSync(subjectDir, { recursive: true });
  writeFileSync(join(subjectDir, 'a.mjs'), '// a\n');
  writeFileSync(join(subjectDir, 'b.mjs'), '// b\n');
  const locked = join(subjectDir, 'locked');
  mkdirSync(locked);
  writeFileSync(join(locked, 'hidden.mjs'), '// hidden\n');

  // A: does chmod 000 actually produce a read error on this platform, as the cure assumes?
  chmodSync(locked, 0o000);
  let rawReaddir = 'NO ERROR — cure premise FALSE';
  try { readdirSync(locked); } catch (e) { rawReaddir = e.code; }
  say(`A. readdirSync on a chmod-000 dir  -> ${rawReaddir}`);

  // B: fail-CLOSED arm (the default). Must THROW — this is the branch's else side.
  let closed = 'NO THROW';
  try { walkSubject(root, SUBJECT); } catch (e) { closed = e.code || e.message; }
  say(`B. walkSubject default (fail-closed) -> ${closed}`);

  // C: fail-OPEN arm (ignoreReadErrors:true, the UNTESTED branch). Must swallow and
  //    return the readable files only -- hidden.mjs must be ABSENT from the result.
  let open;
  try {
    const files = walkSubject(root, SUBJECT, { ignoreReadErrors: true });
    open = `returned ${files.length} files: ${files.map((f) => f.slice(root.length + 1)).sort().join(', ')}`;
  } catch (e) { open = `THREW ${e.code} — branch did NOT swallow`; }
  say(`C. walkSubject ignoreReadErrors     -> ${open}`);

  // D: does the fail-open path still reach the FLOOR assertion afterwards? A swallowed
  //    subtree lowers the count, so the floor is what turns silence into a red.
  let floorAtRisk;
  try {
    const files = subjectFiles(root, { ...SUBJECT, floor: 3 }, { ignoreReadErrors: true });
    floorAtRisk = `NO RED despite floor 3 with only ${files.length} readable — floor did not fire`;
  } catch (e) { floorAtRisk = `RED: ${e.message}`; }
  say(`D. floor 3 vs 2 readable + 1 locked -> ${floorAtRisk}`);

  chmodSync(locked, 0o755); // restore so the teardown can recurse
} finally {
  if (root) {
    try { chmodSync(join(root, SUBJECT.dir, 'locked'), 0o755); } catch {}
    rmSync(root, { recursive: true, force: true });
    say(`teardown: removed ${root}`);
  }
}

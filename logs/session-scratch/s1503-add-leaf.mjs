import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

/** goals.json is a tree: goals -> subgoals[] -> tasks[]. Find the node holding the anchor leaf. */
let host = null;
let i = -1;
let seen = false;
const walk = (node) => {
  for (const t of node.tasks ?? []) {
    if (t.id === 'e9-dome-basin-socket') { host = node; i = node.tasks.indexOf(t); }
    if (t.id === 'e9-arsenal-socket') seen = true;
  }
  for (const s of node.subgoals ?? []) walk(s);
};
for (const top of g.goals) walk(top);
if (!host) throw new Error('anchor leaf e9-dome-basin-socket not found');
if (seen) throw new Error('leaf e9-arsenal-socket already exists');

const notes = [
  'ERA-SOCKET class #7 and the first EPOCH-WIDE one: E9ArsenalSystem is named as a blocker in all four census rows (docs/bench/e9-readiness-census.md:19-22) and in the summary (:10), so this narrows four rows where the canal socket narrowed one.',
  'DELIBERATELY AUTHORED UNDISPATCHED (F-1503-2): its evidence surface is e2e/er01-e9-census.spec.ts + docs/bench/e9-readiness-census.md, the SAME two files lane-b e9-dome-basin-socket rewrites, and there is no third place to put it (nine er01 census specs exist, zero standalone socket specs). Dispatching both at once would have manufactured a 3-way graft on one spec loop plus two independent narrowings of the same rows - Mistake #12 and #15, in advance. Pre-flight STEP 3 is an INVERTED safe-dupe that STOPs unless src/sim/E9CanalSocket.ts already exists, so an early dispatch refuses itself rather than colliding.',
  'EVIDENCE RE-MEASURED, NOT INHERITED (F-1503-1): F-1502-3 called the arsenal DOM-free off a FILE-SCOPED grep - the same probe that would have cleared DredgeQueenBossSystem while document.createElement sat in its instance field initialisers. s1503 re-ran it over the 25-file RUNTIME import closure (import-type edges excluded, they carry no runtime edge) and the conclusion HOLDS: no unguarded module-level DOM access. But the closure contains one dormant instance of exactly that hazard at src/systems/E7SignalSystem.ts:92, harmless ONLY because nothing constructs the class.',
  'E9ArsenalPresentation (constructed eagerly at E9ArsenalSystem.ts:43) was read in full: every instance field initialiser is pure three, no TextureLoader/CanvasTexture/Image/document.',
  'All 8 constructor deps already exist headlessly in HeadlessContractSim (events :163, enemies :165, hero :166, combat :186, build :187) and e2e/er01-e5-census.spec.ts:128-139 already proves the borrow mechanism, since TS private is compile-time only and vite.ssrLoadModule returns any.',
  'The two un-runnable consumers to COUNT are CombatSystem.update (so no shooter ever fires, fires/outcomes stay empty) and EnemyPool.update (so a fence slow is computed and integrated by nothing).',
].join(' ');

host.tasks.splice(i + 1, 0, {
  id: 'e9-arsenal-socket',
  title: 'E9 census: socket epoch-wide E9ArsenalSystem headlessly as src/sim/E9ArsenalSocket.ts and COUNT the two consumers it does not run (narrows F-ER01-E9-1 in ALL FOUR rows; the AGENT-READY 0 of 4 headline must NOT move)',
  taskFile: 'lane-e9-arsenal-socket.md',
  lane: 'lane-c',
  status: 'authored-undispatched',
  attempts: 0,
  authoredBy: 's1503 fire (FIRE-AUTHORED)',
  authorNotes: notes,
  dependsOn: ['e9-dome-basin-socket'],
});

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf inserted into', host.id, 'after index', i, '- tasks now', host.tasks.length);

// land-lib.cjs — the node half of the attended landing tool (scripts/attended/land.sh). Every piece of logic that used to be
// hand-spliced into per-landing bash scripts lives here, reads the landing's JSON config, and is unit-tested by
// scripts/attended-land.test.mjs. cwd for every command is the CHAIN WORKTREE unless noted.
//   env <cfg> <out.sh>                 write bash assignments (single-quoted, escape-safe) for land.sh to source
//   resolve <cfg> <file>               resolve one conflicted file inside a git merge by the config's policy (exit 3 = unhandled)
//   pin <cfg> <storeShort> <hash>      append a same-era pin to assets/engine-era.json (prints PIN=#N `hash8`), or "already pinned"
//   review <cfg> <gates> <mergeSha> <laneSha> <pinText> <storeShort>   write the review file (title, header, body file, evidence table)
//   bookkeep <cfg> <mergeSha> <pinText>   leaf -> merged, ledger row prepended, STATUS line-1 phrase before the desk header (idempotent)
//   verdict <cfg> <gates>              exit 1 with reasons when a gate section carries an unallowed red
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULTS = {
  unionPaths: ['tasks/BACKLOG.md', 'docs/*', 'logs/*.md', 'reviews/*.md', 'artifacts/*.md', '.gitignore'],
  theirsOnMain: ['STATUS.md', 'tasks/goals.json', 'logs/*', 'scripts/law-pointer-baseline.json'],
  oursOnLane: ['scripts/law-pointer-baseline.json'],
  mdThreeWay: ['artifacts/sol/map-art-campaign-2/report.md', 'reviews/sol-map-art-current-status-20260909.md'],
  guards: [
    'scripts/skillmd-guard.test.mjs', 'scripts/same-game-audit.test.mjs', 'scripts/view-schema-guard.test.mjs',
    'scripts/gate-caller-audit.test.mjs', 'scripts/citation-title-guard.test.mjs', 'scripts/no-emdash-guard.test.mjs',
    'scripts/deploy-budget.test.mjs', 'scripts/deploy-mirror-allowlist.test.mjs', 'scripts/claimed-spec-harness-guard.test.mjs',
  ],
  allowedBattery: [
    'fixture owners remove their temp directories',
    'rotation registry stays outside the engine identity corpus',
    'the landed registry names the live engine and stays outside its hash corpus',
    'the live board is green under this guard',
    'contention is advisory, correctly counted, and absent when alone',
  ],
  warmup: ['/', '/?contract=the-claim'],
};

const LOCK_SHAPES = [/^ACTIVE/, /lock ACTIVE/, / ACTIVE \(s\d+ fire\)/, /\(s\d+ fire\) ACTIVE/];
function isLockLine(line1) { return LOCK_SHAPES.some((re) => re.test(line1)); }

function loadConfig(file) {
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
  const problems = [];
  for (const k of ['tag', 'branch', 'port', 'mergeMessage', 'review', 'bookkeeping']) if (cfg[k] === undefined) problems.push('missing ' + k);
  if (!/^[a-z0-9-]+$/.test(String(cfg.tag || ''))) problems.push('tag must be [a-z0-9-]');
  if (!Number.isInteger(cfg.port) || cfg.port < 1024) problems.push('port must be an integer >= 1024');
  if (!['pin', 'unchanged'].includes(cfg.hash || 'pin')) problems.push("hash must be 'pin' or 'unchanged'");
  if ((cfg.hash || 'pin') === 'pin' && !cfg.pinCause) problems.push('pinCause required when hash=pin');
  const r = cfg.review || {}; for (const k of ['path', 'title', 'body']) if (!r[k]) problems.push('review.' + k + ' required');
  const b = cfg.bookkeeping || {}; for (const k of ['taskFile', 'rowKey', 'rowText', 'statusPhrase']) if (!b[k]) problems.push('bookkeeping.' + k + ' required');
  for (const [k, v] of Object.entries({ rowKey: b.rowKey, statusPhrase: b.statusPhrase })) if (v && /F-[A-Z0-9]+-\d+/.test(v) && k === 'statusPhrase') problems.push('statusPhrase must not name an F-ID (the desk guards read it as a desk item)');
  if (problems.length) throw new Error('config: ' + problems.join('; '));
  const gates = Object.assign({ releaseBuild: true, payload: true, halo: true, nullFloors: true, releaseSuite: false, functions: false, ledgerBattery: false, specs: [], allowedE2E: [] }, cfg.gates || {});
  gates.guards = [...DEFAULTS.guards, ...(gates.guards || [])];
  gates.allowedBattery = [...DEFAULTS.allowedBattery, ...(gates.allowedBattery || [])];
  gates.warmup = gates.warmup || DEFAULTS.warmup;
  const merge = Object.assign({}, DEFAULTS, cfg.merge || {});
  return Object.assign({ hash: 'pin', deploy: true, preview: false, evidenceDir: 'artifacts/' + cfg.tag }, cfg, { gates, merge });
}

const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
function envFile(cfg) {
  const g = cfg.gates; const b = (v) => (v ? '1' : '0');
  const lines = {
    TAG: cfg.tag, BR: cfg.branch, PORT: cfg.port, HASH_MODE: cfg.hash, DEPLOY: b(cfg.deploy), PREVIEW: b(cfg.preview), CURE: cfg.cure || '',
    G_RELEASE_BUILD: b(g.releaseBuild), G_PAYLOAD: b(g.payload), G_HALO: b(g.halo), G_NULL_FLOORS: b(g.nullFloors), G_RELEASE_SUITE: b(g.releaseSuite),
    G_FUNCTIONS: b(g.functions), G_LEDGER: b(g.ledgerBattery), GUARDS: g.guards.join(' '), SPECS: g.specs.join(' '), WARMUP: g.warmup.join(' '),
    WARMUP_SPEC: g.warmupSpec || '', REVIEW_PATH: cfg.review.path, EVIDENCE_DIR: cfg.evidenceDir, TASK_FILE: cfg.bookkeeping.taskFile,
  };
  return Object.entries(lines).map(([k, v]) => `${k}=${q(v)}`).join('\n') + '\n';
}

function globMatch(pattern, file) {
  if (pattern.endsWith('/*')) return file.startsWith(pattern.slice(0, -1));
  return pattern === file;
}
function union(file) {
  let t = fs.readFileSync(file, 'utf8');
  t = t.replace(/<<<<<<< [^\n]*\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [^\n]*\n/g, (m, a, b) => a + b);
  if (/^(<<<<<<<|=======|>>>>>>>)/m.test(t)) throw new Error('markers remain ' + file);
  fs.writeFileSync(file, t);
}
function rosterUnion(file, preferMain) {
  // package.json: both sides appended tests to test:node-guards; keep the preferred side's file and add the other side's tests.
  const show = (stage) => JSON.parse(execFileSync('git', ['show', `:${stage}:${file}`], { encoding: 'utf8' }));
  const ours = show(2), theirs = show(3);
  const keep = preferMain ? theirs : ours, other = preferMain ? ours : theirs; // on the LANE merge ours=main; on the MAIN merge theirs=main
  const k = 'test:node-guards';
  const have = keep.scripts[k].split(' ');
  const add = other.scripts[k].split(' ').filter((x) => x.endsWith('.test.mjs') && !have.includes(x));
  keep.scripts[k] = have.concat(add).join(' ');
  for (const s in other.scripts) if (!(s in keep.scripts)) keep.scripts[s] = other.scripts[s];
  fs.writeFileSync(file, JSON.stringify(keep, null, 2) + '\n');
  return add;
}
function resolve(cfg, file, phase) {
  const m = cfg.merge;
  if (m.mdThreeWay.some((p) => globMatch(p, file))) { execFileSync('node', [path.join(__dirname, 'md-3way.cjs'), file], { stdio: 'inherit' }); return 'md-3way'; }
  if (file === 'package.json') { const add = rosterUnion(file, phase === 'main'); return 'roster union (+' + add.join(',') + ')'; }
  if (file === 'assets/engine-era.json') throw Object.assign(new Error('engine-era conflict (another pin landed) — needs hands'), { code: 3 });
  if (phase === 'lane' && m.oursOnLane.some((p) => globMatch(p, file))) { execFileSync('git', ['checkout', '--ours', '--', file]); return 'ours (main)'; }
  if (phase === 'main' && m.theirsOnMain.some((p) => globMatch(p, file))) { execFileSync('git', ['checkout', '--theirs', '--', file]); return 'theirs (main)'; }
  if (m.unionPaths.some((p) => globMatch(p, file))) { union(file); return 'union'; }
  if (/^(logs\/suite-red-inventory\.md|e2e\/)/.test(file)) throw Object.assign(new Error('hand 3-way needed: ' + file), { code: 3 });
  throw Object.assign(new Error('UNHANDLED conflict: ' + file), { code: 3 });
}

function pin(cfg, storeShort, hash) {
  const e = JSON.parse(fs.readFileSync('assets/engine-era.json', 'utf8'));
  const i = e.pins.findIndex((p) => p.engineHash === hash);
  if (i >= 0) return { text: `#${i + 1} \`${hash.slice(0, 8)}\` (already pinned)`, changed: false };
  const last = e.pins[e.pins.length - 1];
  const n = e.pins.length + 1;
  const p = { engineHash: hash, pinnedAt: new Date().toISOString().slice(0, 10), cause: `same era, pin #${n}: ${cfg.pinCause} The store unchanged at ${storeShort}. ${cfg.review.path}` };
  for (const k of Object.keys(last)) if (!(k in p)) p[k] = Array.isArray(last[k]) ? [] : last[k];
  e.pins.push(p); e.engineHash = hash;
  fs.writeFileSync('assets/engine-era.json', JSON.stringify(e, null, 2) + '\n');
  return { text: `#${n} \`${hash.slice(0, 8)}\``, changed: true };
}

const PICKS = [
  ['tsc / build / e1', 'tsc/build/e1:'], ['strict release build (the assertion)', 'build:release'], ['first-town payload', 'first-town payload:'],
  ['halo', 'halo:'], ['null floors', 'null floors:'], ['law-pointer', 'law-pointer:'], ['named guards', 'guards:'],
  ['the ledger battery', 'ledger battery:'], ['the three functions gates', 'functions gates:'], ['the release suite under its own config', 'release suite'],
  ['e2e both projects, --workers=1', 'e2e:'], ['full npm run test:node-guards (before the pin)', 'battery:'], ['engine hash', 'engine hash'],
];
function pick(gates, prefix) { const l = gates.split('\n').filter((x) => x.startsWith(prefix)); return l.length ? l[l.length - 1].slice(prefix.length).trim() : null; }
function evidenceTable(gatesText) {
  const rows = PICKS.map(([label, prefix]) => [label, pick(gatesText, prefix)]).filter(([, v]) => v !== null);
  return ['| Check | Result |', '| --- | --- |', ...rows.map(([l, v]) => `| ${l} | \`${v.replace(/\|/g, '/').slice(0, 220)}\` |`)].join('\n');
}
function review(cfg, gatesFile, mergeSha, laneSha, pinText, storeShort) {
  const gates = fs.readFileSync(gatesFile, 'utf8');
  const bodyPath = path.isAbsolute(cfg.review.body) ? cfg.review.body : path.join(process.env.GR_REPO_ROOT || process.cwd(), cfg.review.body); // the review body lives in the PRIMARY repo, not the chain
  const body = fs.readFileSync(bodyPath, 'utf8').trim();
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z';
  const head = `# ${cfg.review.title}\n\n**Branch** \`${cfg.branch}\` at \`${laneSha.slice(0, 9)}\` · **merge** \`${mergeSha.slice(0, 9)}\` · engine hash ${pinText} · drained attended ${stamp} in a detached chain worktree with the scratch store at \`${storeShort}\`${cfg.deploy ? '; deployed' : '; no deploy'} (scripts/attended/land.sh, config \`${cfg.tag}\`).\n\n**Verdict: LANDED.**\n\n`;
  const evidence = `\n\n### Evidence (this drain's gates on the merged tree)\n${evidenceTable(gates)}\n`;
  fs.mkdirSync(path.dirname(cfg.review.path), { recursive: true });
  fs.writeFileSync(cfg.review.path, head + body + evidence);
  return cfg.review.path;
}

function bookkeep(cfg, mergeSha, pinText) {
  const today = new Date().toISOString().slice(0, 10); const short = mergeSha.slice(0, 9); const b = cfg.bookkeeping;
  const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8')); let hit = 0;
  const walk = (n) => { if (!n || typeof n !== 'object') return; if (n.taskFile === b.taskFile) { hit++; if (n.status !== 'merged') Object.assign(n, { status: 'merged', mergeHash: mergeSha, mergedAt: today, review: cfg.review.path, drainedBy: b.drainedBy || ('attended ' + today + ' (scripts/attended/land.sh ' + cfg.tag + ')') }); } for (const k in n) walk(n[k]); };
  walk(g); if (hit !== 1) throw new Error('goal leaf for ' + b.taskFile + ': found ' + hit);
  fs.writeFileSync('tasks/goals.json', JSON.stringify(g, null, 2) + '\n');
  let bl = fs.readFileSync('tasks/BACKLOG.md', 'utf8');
  if (!bl.includes(b.rowKey)) bl = `${b.rowEmoji || '✅'} **${b.rowKey} — \`${b.taskFile.replace(/\.md$/, '')}\` as \`${short}\` (drained attended ${today}).** ${b.rowText.replace('{PIN}', pinText)} \`${cfg.review.path}\`.\n` + bl;
  fs.writeFileSync('tasks/BACKLOG.md', bl);
  const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
  // NOTE: no lock check here. In the chain, STATUS line 1 is a SNAPSHOT of main at merge time (a fire may have been mid-run); the
  // live lock (line 1 on main AND the tasks/.fire.lock directory) is land.sh's fast-forward gate, and the phrase is re-applied after the main merge.
  if (!lines[0].includes(b.rowKey)) {
    const m = lines[0].match(/🔺 \*\*OWNER.{0,3}S DESK — (\d+) [^*]{0,40}\*\*/); const h = m ? lines[0].indexOf(m[0]) : -1;
    if (h < 0) throw new Error('no OWNER\'S DESK header on line 1');
    lines[0] = lines[0].slice(0, h) + `**${b.rowKey} (attended ${today}) as \`${short}\`: ${b.statusPhrase.replace('{PIN}', pinText)} — \`${cfg.review.path}\`.** ` + lines[0].slice(h);
    fs.writeFileSync('STATUS.md', lines.join('\n'));
  }
  return { short, today };
}

function section(gates, from, to) { const i = gates.indexOf('\n' + from); if (i < 0) return ''; const j = gates.indexOf('\n' + to, i + 1); return gates.slice(i, j < 0 ? undefined : j); }
function verdict(cfg, gatesFile) {
  const gates = fs.readFileSync(gatesFile, 'utf8'); const g = cfg.gates; const reasons = [];
  const e2e = section(gates, 'e2e:', 'battery start').split('\n').filter((l) => /^\d+\) \[/.test(l)).filter((l) => !g.allowedE2E.some((re) => new RegExp(re).test(l)));
  if (g.specs.length && e2e.length) reasons.push('unattributed e2e reds: ' + e2e.join(' ; '));
  if (g.releaseSuite) { const rel = section(gates, 'release suite', 'e2e start').split('\n').filter((l) => /^\d+\) \[/.test(l)); if (rel.length) reasons.push('release suite reds: ' + rel.join(' ; ')); }
  const bat = section(gates, 'battery:', 'dirt after battery').split('\n').filter((l) => l.startsWith('✖')).filter((l) => !g.allowedBattery.some((s) => l.includes(s)));
  if (bat.length) reasons.push('battery reds: ' + bat.join(' ; '));
  if (!/\nguards: .*fail 0/.test(gates)) reasons.push('named guards red');
  if (!/\nlaw-pointer: rc=0/.test(gates)) reasons.push('law-pointer red');
  if (g.nullFloors && !/\nnull floors: rc=0/.test(gates)) reasons.push('null floors moved');
  if (g.releaseBuild && !/\nbuild:release[^\n]*rc=0/.test(gates)) reasons.push('strict release build red');
  if (g.ledgerBattery && !/\nledger battery: rc=0/.test(gates)) reasons.push('ledger battery red');
  if (g.functions && !/\nfunctions gates: accounts rc=0 \| mp rc=0 \| stats rc=0/.test(gates)) reasons.push('functions gates red');
  if (!/\ntsc\/build\/e1: 0 \/ 0 \/ 0/.test(gates)) reasons.push('tsc/build/e1 red');
  return reasons;
}

module.exports = { DEFAULTS, isLockLine, loadConfig, envFile, resolve, rosterUnion, union, pin, evidenceTable, review, bookkeep, verdict, globMatch };

if (require.main === module) {
  const [cmd, cfgPath, ...rest] = process.argv.slice(2);
  try {
    if (cmd === 'islock') { process.exit(isLockLine(cfgPath || '') ? 0 : 1); }
    const cfg = loadConfig(cfgPath);
    if (cmd === 'env') { fs.writeFileSync(rest[0], envFile(cfg)); console.log('env written'); }
    else if (cmd === 'resolve') { console.log(rest[0] + ': ' + resolve(cfg, rest[0], rest[1] || 'lane')); }
    else if (cmd === 'pin') { const r = pin(cfg, rest[0], rest[1]); console.log('PIN=' + r.text); }
    else if (cmd === 'review') { console.log('review: ' + review(cfg, rest[0], rest[1], rest[2], rest[3], rest[4])); }
    else if (cmd === 'bookkeep') { const r = bookkeep(cfg, rest[0], rest[1]); console.log('bookkeeping: leaf merged, row, STATUS phrase (' + r.short + ')'); }
    else if (cmd === 'verdict') { const r = verdict(cfg, rest[0]); if (r.length) { console.log(r.join('\n')); process.exit(1); } console.log('verdict: clean'); }
    else { console.error('unknown command ' + cmd); process.exit(2); }
  } catch (e) { console.error(e.message); process.exit(e.code || 1); }
}

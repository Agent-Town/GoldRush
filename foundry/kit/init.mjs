#!/usr/bin/env node
// THE FOUNDRY KIT — factory scaffolder. Zero dependencies.
//
//   node init.mjs /path/to/new-game "Game Name"
//
// Scaffolds a complete Foundry factory (the machine described in foundry/00-09):
// directory tree, instantiated 09-templates, runner scripts, launchd plist,
// Claude Code allowlist, config, and a README pointing into the book.
//
// Idempotent by refusal: an existing non-empty target directory is NEVER
// touched — the script refuses loudly and exits 1. Nothing is ever overwritten.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(KIT_DIR, '..', '09-templates');

// ---------------------------------------------------------------- arguments
const [target, gameName] = process.argv.slice(2);
if (!target || !gameName) {
  console.error('usage: node init.mjs /path/to/new-game "Game Name"');
  process.exit(1);
}
const ROOT = path.resolve(target);
const NAME = gameName.trim();
const SLUG = NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!SLUG) {
  console.error(`FATAL: "${gameName}" yields an empty slug — give the game a name with letters or digits.`);
  process.exit(1);
}
const TODAY = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------ refusal
if (fs.existsSync(ROOT)) {
  const entries = fs.readdirSync(ROOT).filter((e) => e !== '.DS_Store');
  if (entries.length > 0) {
    console.error(`REFUSED: ${ROOT} exists and is not empty (${entries.length} entries).`);
    console.error('The Foundry Kit never overwrites. Pick a fresh directory, or empty this one yourself.');
    process.exit(1);
  }
}
if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error(`FATAL: templates not found at ${TEMPLATES_DIR}`);
  console.error('The kit must live beside the Foundry book (foundry/kit/ next to foundry/09-templates/).');
  process.exit(1);
}

// -------------------------------------------------------------- write plan
// Everything is planned first, written second — a failure mid-plan writes nothing.
const written = [];
function put(rel, content, { mode } = {}) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs)) {
    console.error(`REFUSED: ${rel} already exists — never overwriting.`);
    process.exit(1);
  }
  fs.writeFileSync(abs, content, mode ? { mode } : {});
  written.push(rel);
}

function instantiate(templateFile) {
  const raw = fs.readFileSync(path.join(TEMPLATES_DIR, templateFile), 'utf8');
  // Only the identity tokens are substituted; every other <placeholder> is the
  // adopter's to fill (they are the adoption work, per book chapter 08).
  return raw
    .replaceAll('<PROJECT NAME>', NAME)
    .replaceAll('<PROJECT>', NAME)
    .replaceAll('<project>', NAME)
    .replaceAll('<date>', TODAY);
}

// ------------------------------------------------------------ directory tree
const DIRS = [
  'tasks/queue/main', 'tasks/queue/lane-a', 'tasks/queue/lane-b',
  'tasks/queue/lane-c', 'tasks/queue/lane-d', 'tasks/queue/art',
  'tasks/done', 'tasks/failed', 'tasks/runs', 'tasks/running', 'tasks/janitor',
  'reviews', 'specs', 'docs', 'logs', 'worktrees', 'scripts', '.claude',
];
fs.mkdirSync(ROOT, { recursive: true });
for (const d of DIRS) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
// keep the empty working dirs alive in git
for (const d of DIRS.filter((x) => x.startsWith('tasks/') || x === 'reviews' || x === 'specs' || x === 'logs')) {
  put(path.join(d, '.gitkeep'), '');
}

// ----------------------------------------------------- instantiated templates
put('CLAUDE.md', instantiate('CLAUDE-template.md'));
put('scripts/fire.md', instantiate('fire-template.md'));
put('tasks/TEMPLATE-task-master.md', instantiate('task-master-template.md'));
put('reviews/TEMPLATE-review.md', instantiate('review-template.md'));
put('docs/TEMPLATE-specialist-queue.md', instantiate('sol-queue-template.md'));
put('docs/TEMPLATES-INDEX.md', instantiate('README.md'));

// ------------------------------------------------------------- kit scripts
// Copied verbatim from the kit — they read foundry.config.json at runtime.
for (const script of ['fire-runner.sh', 'lane-runner.sh', 'dashboard-gen.sh', 'health-watch.sh']) {
  const src = path.join(KIT_DIR, script);
  if (!fs.existsSync(src)) {
    console.error(`FATAL: kit script missing: ${src}`);
    process.exit(1);
  }
  put(path.join('scripts', script), fs.readFileSync(src, 'utf8'), { mode: 0o755 });
}

// ------------------------------------------------------------------- config
const config = {
  name: NAME,
  slug: SLUG,
  repoPath: ROOT,
  fire: {
    model: 'claude-opus-4-8',
    cadenceSeconds: 300,
    protocol: 'scripts/fire.md',
    logDir: 'logs',
    lockStaleMinutes: 50,
    logRetentionDays: 14,
    claudeConfigDir: '',
  },
  runner: {
    implementerBin: 'codex',
    defaultModel: 'gpt-5.6-sol',
    defaultEffort: 'medium',
    pollSeconds: 15,
    logRetentionDays: 3,
    lockPattern: 'ACTIVE 2',
    cleanDirs: ['test-results', 'playwright-report'],
    slots: {
      main: { autoCommit: false },
      'lane-a': {}, 'lane-b': {}, 'lane-c': {}, 'lane-d': {},
      art: { addPaths: ['assets', 'artifacts'] },
    },
  },
  dashboard: {
    out: 'logs/dashboard.html',
    goalsFile: 'tasks/goals.json',
    pendingDir: '',
    refreshSeconds: 30,
  },
  health: { logFile: 'logs/health.log' },
};
put('foundry.config.json', JSON.stringify(config, null, 2) + '\n');

// -------------------------------------------------------------- launchd plist
put(`scripts/com.${SLUG}.fire.plist`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.${SLUG}.fire</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${ROOT}/scripts/fire-runner.sh</string>
  </array>
  <key>StartInterval</key>
  <integer>${config.fire.cadenceSeconds}</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>WorkingDirectory</key>
  <string>${ROOT}</string>
  <key>StandardOutPath</key>
  <string>/tmp/${SLUG}-fire-launchd.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/${SLUG}-fire-launchd.err</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
</dict>
</plist>
`);

// ----------------------------------------------------------------- seed files
put('STATUS.md', `Last updated: ${TODAY} — factory scaffolded by the Foundry Kit; no lock held. Read CLAUDE.md §1 before touching anything.

<!-- Line 1 above is THE lock + state line. A fire rewrites it to "ACTIVE <ISO> (s<N> fire) — <intent>"
     while it owns main, and back to a handoff line when done. Law bullets accumulate below. -->
`);

put('tasks/BACKLOG.md', `# ${NAME} — BACKLOG
### THE complete work ledger. Completeness Law: if work isn't here, it doesn't exist.
Rules: the event and its ledger line land in ONE commit · superseded lines are retired (✅ / archived), never deleted · gates are written as "GATE: <checkable condition>" · owner-blocking items are "OWNER: <one line + recommendation>".

## OWNER'S DESK
(nothing waiting)

## LADDERS (one section per slot; fires refill top-to-bottom, respecting GATE lines)
### main
- (empty — author the first task master from your first spec; see tasks/TEMPLATE-task-master.md)
### lane-a
### lane-b
### lane-c
### lane-d
### art
`);

put('tasks/goals.json', JSON.stringify({ goals: [] }, null, 2) + '\n');

put('AGENTS.md', `# ${NAME} — implementer contract
### Read by the implementer (Codex or equivalent) before EVERY task. Scaffolded by the Foundry Kit — fill the <placeholders> as you adopt (book chapter 08, "the implementer contract").

1. **One task.** You implement EXACTLY the numbered scope of the one task file you were given. Nothing else.
2. **Read order:** this file · the task's READ-FIRST list · nothing speculative.
3. **Pre-flight verbatim.** Run the task's pre-flight block exactly as written; if it says STOP, you stop and report.
4. **Report, don't fix.** Adjacent problems you notice go in your report as findings. Fixing out of scope is a violation.
5. **Firewall.** The task's TOUCH-ONLY list is the whole set of files you may modify.
6. **Evidence.** Your self-check runs the named suites; a run that changes nothing must WRITE WHY into its report.
7. **Red lines:** <your product's content red-lines — the ADR-001 equivalents. Write these on day one; they are cheap now and expensive to retrofit.>
`);

put('worktrees/README.md', `# worktrees/ — lane working trees live here
Lanes do not exist until you create them. For each lane slot you want live:

    git worktree add worktrees/<slot> -b lane/<slot>
    (cd worktrees/<slot> && <install deps, e.g. npm install>)

The runner picks the lane up on its next cycle (tasks/queue/<slot>/ already exists).
KIT SAFETY (differs from the original Gold Rush runner — see the kit's DIVERGENCES.md):
a queued task for a slot whose worktree is MISSING fails that pickup loudly into
tasks/failed/NO-WORKTREE-* — it never falls back to running at the repo root.
`);

const settings = {
  permissions: {
    allow: [
      'Read', 'Glob', 'Grep', 'Edit', 'Write',
      'Bash(npm run build)', 'Bash(npm run build:*)', 'Bash(npm test)', 'Bash(npm test *)',
      'Bash(npx tsc:*)', 'Bash(npx playwright:*)', 'Bash(npx vite:*)', 'Bash(node:*)',
      'Bash(git add:*)', 'Bash(git commit:*)', 'Bash(git status:*)', 'Bash(git diff:*)',
      'Bash(git log:*)', 'Bash(git show:*)', 'Bash(git merge:*)', 'Bash(git worktree:*)',
      'Bash(git branch:*)', 'Bash(git checkout:*)', 'Bash(git push origin *)',
      'Bash(git remote add origin *)',
      'Bash(ls:*)', 'Bash(cat:*)', 'Bash(cp:*)', 'Bash(mv:*)', 'Bash(mkdir:*)',
      'Bash(diff:*)', 'Bash(grep:*)', 'Bash(find:*)', 'Bash(head:*)', 'Bash(tail:*)',
      'Bash(wc:*)', 'Bash(timeout:*)',
      'Bash(curl -s http://localhost:*)', 'Bash(curl -s http://127.0.0.1:*)',
      'Bash(rm -rf test-results)', 'Bash(rm -rf playwright-report)', 'Bash(rm -rf /tmp/*)',
      'Bash(pkill -f vite)', 'Bash(pkill -f vite:*)',
    ],
    deny: [
      'Bash(git push --force:*)', 'Bash(git push -f:*)',
      'Bash(git push --force *)', 'Bash(git push -f *)',
      'Bash(git reset --hard:*)',
      'Bash(rm -rf /Users:*)', 'Bash(rm -rf .git:*)',
      'Bash(sudo:*)',
      'WebFetch', 'WebSearch',
    ],
  },
};
put('.claude/settings.json', JSON.stringify(settings, null, 2) + '\n');

put('README.md', `# ${NAME} — a Foundry factory
Scaffolded ${TODAY} by the Foundry Kit. The machine this repo runs is documented in
**the Foundry book** (foundry/00–09 in the kit's source repo); this README is the ignition sequence.

## What just got scaffolded
- \`CLAUDE.md\` — the constitution seed (book ch. 01). Fill its <placeholders>; it is the file every session reads first.
- \`AGENTS.md\` — the implementer contract (ch. 02/08). Write your content red-lines TODAY.
- \`STATUS.md\` — line 1 is the lock + truth line (ch. 03).
- \`tasks/\` — queues (main, lane-a..d, art), done/, failed/, runs/, running/, BACKLOG.md, goals.json.
- \`scripts/\` — fire.md (fire protocol seed, ch. 02/09), fire-runner.sh, lane-runner.sh, dashboard-gen.sh, health-watch.sh, com.${SLUG}.fire.plist.
- \`foundry.config.json\` — every knob the scripts read (paths, models, cadences, per-slot add scopes).
- \`.claude/settings.json\` — the headless-session allowlist (deny list included: no force-push, no reset --hard).
- \`worktrees/\` — empty; lanes are created on demand (see worktrees/README.md).

## Ignition (in order — book ch. 08 explains WHY this order)
1. \`git init && git add -A && git commit -m "chore: foundry scaffold"\` — then CREATE THE REMOTE and push (Mistake #11: weeks of work on one disk).
2. Fill CLAUDE.md + AGENTS.md placeholders. Write your first spec in specs/.
3. Author your first task master from \`tasks/TEMPLATE-task-master.md\`, drop a copy in \`tasks/queue/main/\`.
4. Log in once: \`claude\` (orchestrator) and your implementer CLI (e.g. \`codex\`), so headless runs are authenticated.
5. Start the runner in a terminal: \`bash scripts/lane-runner.sh\` (try \`--dry-run\` first).
6. Gate the first outputs BY HAND ~ten times (ch. 08: the manual reps teach you what your gates need to be). Write review files from \`reviews/TEMPLATE-review.md\`.
7. Only then light the fires: \`cp scripts/com.${SLUG}.fire.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.${SLUG}.fire.plist\` (try \`bash scripts/fire-runner.sh --dry-run\` first).
8. Dashboard: \`bash scripts/dashboard-gen.sh\` writes logs/dashboard.html; \`bash scripts/health-watch.sh status\` is the 2-second board.

## The laws you cannot skip
A done-move is NOT done — only a drain with evidence is done (ch. 03). Path-scoped \`git add\` only.
Every incident becomes a NAMED entry in CLAUDE.md §5 the same day (ch. 04 — the mistake catalog is the factory's real moat).
`);

// -------------------------------------------------------------------- report
console.log(`Foundry factory scaffolded: ${ROOT}`);
console.log(`  name: ${NAME}   slug: ${SLUG}`);
console.log(`  ${written.length} files written, ${DIRS.length} directories created.`);
console.log('Next: read README.md — ignition is 8 steps, in order.');

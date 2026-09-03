// s2490 — F-2490-1: guard the UNTRACKED COUNT in lane-usable.mjs.
//
// THE DEFECT THIS EXISTS FOR: `git status --porcelain` COLLAPSES a wholly-untracked
// directory into ONE entry (`?? artifacts/e4-roads-and-convoys/`), so a count taken
// from it counts ENTRIES, not FILES, and the gap is UNBOUNDED — one line can stand
// for a megabyte. `lane-usable` reported `lane-b … untracked=1` for 11 files / 1.0 MB
// of gate evidence sitting one `git clean -fd` from gone (F-2489-1), and `clean -fd`
// deletes FILES. The cure is one flag, `--untracked-files=all`, in `dirt()`.
//
// WHY A GUARD AND NOT JUST A COMMENT (F-1667-1's lesson — an un-annotated cure can
// undo itself): the flag is one token, it looks like a redundant default to a reader
// tidying up, and removing it restores the blind spot SILENTLY — the verdict word,
// the exit code and every other number stay byte-identical, so nothing reds. It is
// also unreachable from `lane-usable-dirt-parse.test.mjs`, which by DESIGN takes the
// porcelain TEXT and never the worktree (F-1416-1), so the flag lives in exactly the
// seam that file cannot see — F-2209-1's rule: extracting a decision to make it
// testable creates a new untested seam at the CALL SITE.
//
// This guard cannot false-fire on lawful operation: it asserts a property of OUR OWN
// CODE against a fixture we build, never a property of the live board (F-1460-1 — a
// guard that reds during ordinary correct operation is excused into uselessness).
//
// @cwd-invariant-collection-guard is NOT claimed here: this spawns node, not
// playwright --list, so it is not a collection guard.

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Anchored to this file, never to process.cwd() — F-2220-1.
const HERE = dirname(fileURLToPath(import.meta.url))
const SUBJECT = join(HERE, 'lane-usable.mjs')

// Every sync spawn is BOUNDED — F-2430-1. An unbounded spawnSync blocks node's event
// loop, so --test-timeout can never fire and a wedged child hangs the battery forever.
const BOUND = { timeout: 240_000, killSignal: 'SIGKILL' }

const git = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, ...BOUND })

// A fixture repo with ONE linked worktree under `worktrees/`, because fleet() selects
// on the path shape /worktrees/<slot>$ and reports nothing otherwise. The worktree
// holds a WHOLLY-UNTRACKED directory of `fileCount` files — the exact shape that
// collapses. Ground truth is therefore known and > 1.
function fixture(fileCount = 3) {
  const root = mkdtempSync(join(tmpdir(), 'lane-usable-uall-'))
  git(['init', '-q', '-b', 'main'], root)
  git(['config', 'user.email', 'guard@example.invalid'], root)
  git(['config', 'user.name', 'guard'], root)
  writeFileSync(join(root, 'seed.txt'), 'seed\n')
  git(['add', 'seed.txt'], root)
  git(['commit', '-qm', 'seed'], root)
  git(['worktree', 'add', '-q', '-b', 'lane/x', join(root, 'worktrees', 'lane-x')], root)

  const evidence = join(root, 'worktrees', 'lane-x', 'artifacts', 'evidence')
  mkdirSync(evidence, { recursive: true })
  for (let i = 0; i < fileCount; i++) writeFileSync(join(evidence, `run-${i}.log`), `run ${i}\n`)
  return root
}

// Run a subject (the real file, or a manufactured variant) against the fixture.
function run(root, subject = SUBJECT) {
  const r = spawnSync('node', [subject, '--all'], {
    cwd: root, encoding: 'utf8', maxBuffer: 64 << 20, ...BOUND,
  })
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
}

const untrackedOf = (stdout) => {
  const row = stdout.split('\n').find((l) => /^lane-x\s/.test(l))
  if (!row) return null
  const m = row.match(/untracked=(\d+)/)
  return m ? Number(m[1]) : null
}

// A manufactured variant of the subject.
//
// ⚠️ IT MUST KEEP THE BASENAME `lane-usable.mjs`, AND THAT IS NOT A STYLE CHOICE —
// the subject's own module-main predicate is a REGEX ON ITS FILENAME
// (`lane-usable.mjs:622`: `/(^|\/)lane-usable\.mjs$/.test(process.argv[1])`), so a
// variant written as `.tmp-variant-xxx.mjs` never runs `main()` and exits **rc=0 with
// 0 B of stdout and no stderr** — indistinguishable from a subject that simply
// reported nothing. Measured s2490: my first draft did exactly that and the TEETH arm
// read `null`, which its sanity assertion caught. This is F-2215-1's silent-control
// trap wearing a new costume: there the silencer was a /tmp symlink, here it is a
// filename. So the variant goes in its own temp DIRECTORY, named correctly, with the
// one relative import (`./lane-residue.mjs`) copied beside it — which also keeps
// one-shot scratch out of `scripts/` (F-1665-1).
//
// `variantOf` ASSERTS ITS EDIT MATCHED — a variant that changed nothing is a
// construction refusal, not evidence about the defect (F-2477-1's method note).
//
// It DERIVES the call site by regex rather than matching one hardcoded spelling, and
// that is load-bearing: a teeth sweep s2490 ran against a hardcoded needle scored the
// LAWFUL short form (`-uall`) as a construction refusal — a FALSE RED on a correct
// cure — while letting a genuinely over-general one (`--ignored`) pass 7 of 8 arms.
// A selector narrower than the property it guards accuses the innocent and exonerates
// the guilty in the same pass.
const DIRT_CALL = /git\(\[('status'[^\]]*)\], \{ cwd: worktree \}\)/

function variantOf(replacementArgs) {
  const src = readFileSync(SUBJECT, 'utf8')
  const m = src.match(DIRT_CALL)
  assert.ok(m, 'variant precondition: dirt()\'s git status call must be findable')
  const patched = src.replace(DIRT_CALL, `git([${replacementArgs}], { cwd: worktree })`)
  assert.notEqual(patched, src, 'variant precondition: the edit must actually change the subject')
  const dir = mkdtempSync(join(tmpdir(), 'lane-usable-variant-'))
  writeFileSync(join(dir, 'lane-usable.mjs'), patched)
  copyFileSync(join(HERE, 'lane-residue.mjs'), join(dir, 'lane-residue.mjs'))
  return join(dir, 'lane-usable.mjs')
}

test('CONTROL: the fixture really does collapse, and the guard can see it (F-2215-1)', () => {
  const root = fixture(3)
  const entries = git(['status', '--porcelain'], join(root, 'worktrees', 'lane-x'))
    .split('\n').filter(Boolean).length
  const files = git(['status', '--porcelain', '--untracked-files=all'], join(root, 'worktrees', 'lane-x'))
    .split('\n').filter(Boolean).length
  // Assert the control's OWN validity before believing anything it measures: if these
  // were equal the fixture would not reproduce the defect and every arm below would
  // pass while measuring nothing.
  assert.equal(entries, 1, 'fixture must collapse to ONE porcelain entry')
  assert.equal(files, 3, 'fixture must hold THREE real untracked files')
  assert.ok(files > entries, 'fixture must reproduce the entries-vs-files gap')
})

test('the subject RUNS against the fixture and reports the lane (not a vacuous pass)', () => {
  const root = fixture(3)
  const { status, stdout } = run(root)
  assert.equal(status, 0, 'subject must exit 0 on a healthy fixture')
  assert.ok(stdout.length > 0, 'subject must produce output — a silent arm measures nothing')
  assert.notEqual(untrackedOf(stdout), null, 'subject must print a lane-x row with an untracked= count')
})

test('untracked= counts FILES, not porcelain ENTRIES (the defect)', () => {
  const root = fixture(3)
  assert.equal(untrackedOf(run(root).stdout), 3, 'untracked= must report 3 files, not 1 collapsed entry')
})

test('the count scales with FILES — a bigger directory is a bigger number', () => {
  // Pins the property rather than one magic value: under the defect this stays 1
  // however large the directory grows, which is precisely the unbounded gap.
  const root = fixture(11)
  assert.equal(untrackedOf(run(root).stdout), 11, 'untracked= must track the file count, not stay pinned at 1')
})

test('dirt() passes --untracked-files=all to git status (the flag is load-bearing)', () => {
  const src = readFileSync(SUBJECT, 'utf8')
  const m = src.match(/function dirt\s*\([^)]*\)\s*\{[\s\S]*?\n\}/)
  assert.ok(m, 'dirt() must be findable — if this refuses, the cure has been restructured, re-read it')
  assert.match(
    m[0],
    /--untracked-files=all|'-uall'|"-uall"/,
    'dirt() must ask git for ALL untracked files; without it the count collapses to entries (F-2490-1)',
  )
})

test('REVERSE CONTROL: the verdict word and exit code are NOT changed by the flag', () => {
  // The cure must move the COUNT and nothing else. lane-b's safety answer was never
  // wrong (F-2489-1 states this plainly), and a cure that moved a verdict would be a
  // regression wearing a fix's clothes.
  const root = fixture(3)
  const { status, stdout } = run(root)
  const row = stdout.split('\n').find((l) => /^lane-x\s/.test(l))
  assert.equal(status, 0)
  assert.match(row, /ahead=0/, 'a fresh lane must still read ahead=0')
  assert.match(stdout, /USABLE/, 'the verdict word must still be reached')
})

test('REVERSE CONTROL: a genuinely clean lane still reports untracked=0', () => {
  // Guards against an over-general "cure" that inflates every count.
  const root = fixture(0)
  assert.equal(untrackedOf(run(root).stdout), 0, 'a clean lane must report 0, not a phantom')
})

test('REVERSE CONTROL: gitignored build output moves NO bucket and NO verdict', () => {
  // The over-general cure this catches, and NOTHING else does: adding `--ignored`
  // alongside `-uall` also reports every ignored file. On the four *-salvage trees
  // that is 10,043 files of `dist/` and playwright scratch (F-2486-1) — a number that
  // would drown the real evidence this cure exists to surface.
  //
  // ⚠️ ASSERT THE TRACKED BUCKET AND THE VERDICT, NOT MERELY `untracked=`. A first
  // draft of this arm checked `untracked=` alone and MISSED the variant entirely
  // (measured s2490): git prints ignored paths as `!! path`, and `classifyDirt` sorts
  // only `??` into `untracked`, so `!!` lines fall through to the TRACKED bucket —
  // which is the bucket that DRIVES the DIRTY verdict and freezes a lane. The
  // over-general cure is therefore worse than it looks, and the obvious control is
  // blind to it: it inflates the one number that has teeth.
  const root = fixture(0)
  const lane = join(root, 'worktrees', 'lane-x')
  writeFileSync(join(lane, '.gitignore'), 'build/\n')
  git(['add', '.gitignore'], lane)
  git(['-c', 'user.email=g@x', '-c', 'user.name=g', 'commit', '-qm', 'ignore build'], lane)
  mkdirSync(join(lane, 'build'), { recursive: true })
  for (let i = 0; i < 5; i++) writeFileSync(join(lane, 'build', `out-${i}.js`), 'x')

  const { stdout } = run(root)
  const row = stdout.split('\n').find((l) => /^lane-x\s/.test(l))
  assert.ok(row, 'lane-x must still be reported')
  assert.equal(untrackedOf(stdout), 0, 'ignored build output must not be counted as untracked')
  assert.match(row, /tracked-dirt=0/, 'ignored build output must not be counted as TRACKED dirt')
  assert.doesNotMatch(stdout, /DIRTY/, 'a lane holding only ignored build output must not read DIRTY')
})

test('TEETH: the pre-cure subject reds this guard (proven by manufacturing the defect)', () => {
  const root = fixture(3)
  const defect = variantOf("'status', '--porcelain'")
  const out = run(root, defect)
  // Assert the variant RAN before reading what it says (F-2215-1): a control whose
  // failure mode is silence cannot be told from the silence it measures.
  assert.equal(out.status, 0, `variant must exit 0; stderr: ${out.stderr.slice(0, 300)}`)
  assert.ok(out.stdout.length > 0, 'variant produced NO output — construction refusal, not evidence')
  const got = untrackedOf(out.stdout)
  assert.equal(got, 1, 'sanity: the manufactured defect must reproduce the collapse (1 entry for 3 files)')
  assert.notEqual(got, 3, 'the defect must NOT report the true file count — else this guard has no teeth')
})

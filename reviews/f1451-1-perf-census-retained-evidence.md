# f1451-1 — the E1 perf census publishes to `latest/`, never over retained evidence

- **Slice:** `f1451-1-perf-census-retained-evidence` (master `tasks/f1451-1-perf-census-publishes-over-retained-evidence.md`, FIRE-AUTHORED s1451)
- **Branch / tip:** `lane/perf` @ `e7d9a1e4` — base `7b918e3e`, lane ahead=1
- **Merged:** `caae255148b4691f6ab77adb1cc4538bdfdaf1f1` (s1452, two-parent `--no-ff`)
- **Gated by:** s1452 fire, detached worktree `worktrees/gate-s1452`, scratch port **5243**, `--workers=1`

## VERDICT: MERGE

## What it does

`e2e/e1-perf-pass.spec.ts` joined the shared default battery at `e21fa3d3`. Its `STAGE` defaulted to
`'after'`, so every ordinary `npx playwright test` republished its census and screenshots straight over
`artifacts/e1-perf-pass/after/` — the retained proof of the s1440 perf pass. The cure changes the
default to a neutral `'latest'` and gitignores the two paths that default now produces. Three lines of
code plus two `.gitignore` lines. Explicit `E1_PERF_STAGE=after` still works for anyone deliberately
re-recording the arm, and `before/` was never writable by the default path in the first place.

```
-const STAGE = process.env.E1_PERF_STAGE ?? 'after';
+// `before` and `after` are retained evidence; ordinary runs publish regenerable output to `latest`.
+const STAGE = process.env.E1_PERF_STAGE ?? 'latest';
```

## The load-bearing proof is DIRT, not the green

⭐ **A green on the cured arm proves nothing about this defect, because the spec always passed.**
It never failed an assertion — what it did wrong was *where it wrote*. So pass/fail cannot discriminate
between "the cure works" and "the cure does nothing"; only a dirt count can. Both arms were therefore
run through **one committed code path** (`artifacts/f1451-1/gate-battery.mjs`) differing in exactly one
variable (`E1_PERF_STAGE`), same tree, same host, same shell, same scratch server, same `--workers=1`.

| Arm | `E1_PERF_STAGE` | RC | Wall | Tracked files dirtied under `artifacts/e1-perf-pass` |
|---|---|---|---|---|
| **cured** (no override — exactly as the battery runs it) | *(default `latest`)* | **0** | 120.8 s | **0** |
| **control** (the pre-cure default, one variable flipped) | `after` | **0** | 139.1 s | **22** — 20 PNGs + `census-after-{desktop,mobile}-chrome.json` |

**Both arms are RC=0.** That is the point: the control reproduces F-1451-1 in full while passing, which
is precisely why the original defect survived its own merge gate.

⚠️ **The zero is a cure, not an empty run** — the probe was verified to have a subject before it was
believed. The cured arm wrote **20 PNGs + 2 census files** into `artifacts/e1-perf-pass/latest/`, and
`git check-ignore -v` attributes them to the two new rules:

```
.gitignore:11:artifacts/e1-perf-pass/latest/         → latest/desktop-chrome-the-claim.png
.gitignore:12:artifacts/e1-perf-pass/census-latest-*.json → census-latest-desktop-chrome.json
```

The control arm ran **last and inside the throwaway detached worktree** (§3.0b), so the 22 overwrites
it deliberately caused never existed anywhere near main; the worktree was restored (`git checkout --`,
dirt back to `""`) and then removed.

## Evidence table

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (no output, rc 0) |
| `npm run build` | ✓ built in **985 ms**; asset-diet ceiling respected (1,158,214 / 1,500,000 bytes) |
| Slice spec, desktop-chrome + mobile-chrome, `--workers=1` | **2 passed (2.0m)**, cured arm |
| Console / page errors | zero — the spec's own assertions cover both the census page and the snapshot page, on **both** projects (mobile-chrome = the 390px arm), so the boot probe is inside the gate rather than beside it |
| `npm run test:node-guards` | **RC=0** on the merged tree |
| `npm run test:ledger-guards` | run as the **last act** of the fire, after the bookkeeping commit (F-1300-4) |

## Merge classification

Base `7b918e3e`; main moved **3 commits** since (`0d0f43d3`, `c05ae716`, `ec12213d`) — all STATUS/task
bookkeeping. Main touched **none** of the lane's three paths, so this is pure **LANE-TOUCHED** and the
`ort` merge was clean with no conflict resolution to record.

| Path | Class |
|---|---|
| `e2e/e1-perf-pass.spec.ts` | LANE-TOUCHED (3 lines: 1 changed, 1 comment added) |
| `.gitignore` | LANE-TOUCHED (+2) |
| `artifacts/f1451-1/REPORT.md` | LANE-TOUCHED (new, 117 lines) |

**Adjacent readers re-derived by grep, not inherited:** the only other reference to
`E1_PERF_STAGE` in executable code is `artifacts/f1440-2/gate-battery.mjs:34`, which sets it
**explicitly** to `'gate'` — so the default change structurally cannot reach it. No test, script or
config reads `artifacts/e1-perf-pass`.

## Findings

**F-1452-1 — 🟢 non-blocking, no corrective queued.** The master's estimate of the blast radius (and
the s1451 handoff's, which said "~26") is **22**, measured. Not a defect in the cure — the cure is
sized by behaviour, not by the estimate — but the number is recorded here so no future reader
re-derives a 26 that was never true. 10 PNGs per project (5 maps × {plain, pressure}) + 1 census per
project = 22.

**Gitignoring `latest/` is lawful under the RETENTION LAW, stated because the pairing of "retention"
and "gitignore" in one slice deserves an explicit ruling rather than a silent one.** The law protects
factory *history* — run logs, reports, evidence — from untracked deletion. `latest/` is per-run
regenerable churn produced by an ordinary gate execution, cited by nothing, and its whole purpose is to
keep the retained `before/`/`after/` arms from being overwritten. The slice **increases** retention
safety. Deliberate evidence runs still publish under an explicit stage and stay tracked.

## Standing notes for the next fire

- 🚫 Do **not** "simplify" this by removing the `latest/` gitignore rules — the default path writes
  there every battery run, and without them main goes untracked-dirty instead of tracked-dirty.
- 🚫 Do **not** re-record or tidy `artifacts/e1-perf-pass/before/` or `after/`.
- 🚫 Do **not** read a green on this spec as evidence about where it writes (that is the whole finding).

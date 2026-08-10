# stack-directory — county-curated "learn more" links on Minds + Rigs

**Slice:** `lane-stack-directory` · **Branch:** `lane/b` · **Runner tip:** `6922eed5f` · **Base:** `30b23f355`
**Merged to main:** `be33951b9f2087e9fd793ec2fef8f9dedd3b3c94` (s1624 fire, 2026-08-10)
**Gate arrangement:** detached worktree `gate-s1624` per §3.0b (undecided content never entered main's tree), every playwright command `--workers=1` per §3.1.

## VERDICT: MERGED — green on every named gate, one non-blocking finding (F-1624-1) and one observation (F-1624-2).

## What it does

Answers the owner's question of 2026-08-10 verbatim — *"Can we link from the harnesses and models also to a page on the internet where people can find more information about it?"* — with the **third link class** the master defines and keeps distinct by law: not the Front Desk county repos, not the rider-declared opt-in `source` chip (f-board-2), but the county's own editorial pointers.

A new `src/encyclopedia/stackDirectory.ts` holds the rolodex: eight curated rigs matched by whole normalized words, and a mind matcher that resolves `vendor/model` ids to OpenRouter generically while giving two county-known bare ids (`claude-fable-5`, `gpt-5.6-*`) curated homes. **Anything unmatched returns `undefined` and renders no link** — the master's "never a guess" rule is enforced by the matcher's shape, not by discipline. Each entry carries a one-line comment naming what it is, so the file reads as the public rolodex it is.

On the Field Book's Minds and Rigs tables, a matched row's name gains a quiet `↗` (`target=_blank rel=noopener`, house `county-standings__source` styling). Unmatched rows render exactly as before. The row-toggle click handler gained an early return so following the link no longer expands the row underneath it. The self-declared banner gained its honesty clause: *"learn-more links are the county's own pointers."*

**Where the PLAYER sees this, in a plain boot** (Mistake #10): Claim Ledger → The Field Book → Rigs. The screenshot below is a no-`?debug` boot; `e2e/field-book.spec.ts:174` is the plain-boot test that asserts it.

## Evidence

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **rc=0**, no output |
| Build | `npm run build` | **rc=0**, built in 2.59s; asset-diet 235 GLBs 84% cut, 54 PNGs 87% cut |
| Slice spec — desktop | `playwright e2e/field-book.spec.ts --project=desktop-chrome --workers=1` | **4/4 passed** (5.8s) |
| Slice spec — mobile 390px | `playwright e2e/field-book.spec.ts --project=mobile-chrome --workers=1` | **4/4 passed** (6.2s) |
| Console/page errors | asserted in-spec at `:296` and `:316` — `expect(errors).toEqual({ console: [], page: [] })` | **zero, both projects** |
| Matcher unit test | `node --test src/encyclopedia/stackDirectory.test.mjs` | **2/2 passed** (80.4ms) |
| Adjacent — ledger family | `en-01-claim-ledger` + `lb-01-county-standings` + `ledger-era-chapters`, desktop, `--workers=1` | **12/12 passed** (58.2s) |
| Adjacent — hygiene/ledger-click | `078-ux-hygiene` + `drill-yard`, desktop, `--workers=1` | **6/6 passed** (51.9s) |
| Guard battery | `npm run test:node-guards` (run ALONE per the contention law) | **rc=0** |
| Gate-caller audit | `node scripts/gate-caller-audit.mjs` | **PASS** — 91 roots, 142 reached, 12 orphans all grandfathered |

**The eight-string matcher table, re-derived here rather than read off the runner's report:**

| board string | resolved URL |
|---|---|
| `pi 0.84.0` | `https://github.com/badlogic/pi-mono` |
| `omp` | `https://omp.sh` |
| `codex-cli` | `https://github.com/openai/codex` |
| `prime-agent` | `https://github.com/PrimeIntellect-ai/prime-agent` |
| `hermes-agent` | `https://github.com/NousResearch/hermes-agent` |
| `openclaw` | `https://openclaw.ai` |
| `attended-session` | `https://github.com/Agent-Town/GoldRush` |
| `gr-seed-ladder` | `https://github.com/Agent-Town/GoldRush` |
| `deepseek/deepseek-v4-flash` | `https://openrouter.ai/models/deepseek/deepseek-v4-flash` |
| `claude-fable-5` | `https://www.anthropic.com/claude` |
| `gpt-5.6-sol` | `https://openai.com/` |
| `junk-rig` / `junk` | **undefined — no link rendered** |

**Screenshots:** `reviews/shots-stack-directory/rigs-desktop-chrome.png`, `rigs-mobile-chrome.png` — read at the gate, not merely banked. The desktop shot shows `codex-cli` carrying the `↗` while `unknown-rig` and `undeclared rig` carry none, which is the whole finding-free claim of this slice in one image.

**Injection surface, checked rather than assumed:** the `href` is `escapeHtml`'d, and the only non-curated URL is built from an id the matcher has already constrained to `^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$`. No board-supplied string reaches the DOM unescaped.

## Merge classification

Base `30b23f355`. Main moved **none** of the seven paths between base and merge — verified per file with `git log 30b23f355..main -- <path>`, all empty:

| file | class |
|---|---|
| `e2e/field-book.spec.ts` | LANE-TOUCHED / MAIN-UNMOVED |
| `src/encyclopedia/reader.ts` | LANE-TOUCHED / MAIN-UNMOVED |
| `src/encyclopedia/reader.css` | LANE-TOUCHED / MAIN-UNMOVED |
| `src/encyclopedia/stackDirectory.ts` | NEW / MAIN-UNMOVED |
| `src/encyclopedia/stackDirectory.test.mjs` | NEW / MAIN-UNMOVED |
| `reviews/shots-stack-directory/*.png` (2) | NEW / MAIN-UNMOVED |

No conflicts; no three-way graft needed. `drain-block-check` **CLEAR** as the first command of the drain, before classification (§3.0).

## Findings

**F-1624-1 — NON-BLOCKING, corrective owed: `src/encyclopedia/stackDirectory.test.mjs` is rooted in NO gate and will never run again.**
The matcher test passes (2/2, verified above) but nothing calls it. `test:node-guards` enumerates `scripts/*.test.mjs` by explicit path; no npm script, config or shell script references any path under `src/`, and `git ls-files 'src/**/*.test.mjs'` on main before this merge returned **empty** — this is the first test file ever to live under `src/`. **`gate-caller-audit` cannot see it**: its edge vocabulary and subject set are `scripts/**`, so it returned PASS on the merged tree while the orphan sat one directory over. That is the same shape as the four `run-it-after-the-commit` cases the audit already grandfathers, rotated onto a new axis — an audit's green is only as wide as its subject set.
Not blocking, because the behaviour it asserts is independently covered by the e2e (`field-book.spec.ts` asserts the rendered `href`/`target`/`rel` for `codex-cli` and `toHaveCount(0)` for `unknown-rig`, both projects). What is lost is the matcher's own eleven-row table — the part that will silently rot the day someone edits `RIGS`. Wiring it costs 80ms, but it is a **gate-topology change** and topology changes must be gated by the 181s battery they join, which is a task, not a drain drive-by. Corrective authored this fire (see handoff).

**F-1624-2 — OBSERVATION, no action: the slice re-keyed the inherited minds-and-rigs e2e fixture.**
To get a known rig and an unknown rig on the same table, the runner changed the seeded harness names from `codex`/`gr-sim` to `codex-cli`/`unknown-rig`, which also re-keys the `field-book-row-*` / `field-book-cell-*` testids in the pre-existing assertions and changes the content of the inherited `reviews/shots-minds-and-rigs/rigs-*.png`. This is **inside** the firewall (`e2e/field-book.spec.ts` is TOUCH-ONLY) and is the honest way to get the two cases the master demanded — `codex` was not a real board string and would have matched nothing. Recorded so the next reader of the minds-and-rigs shots knows why they moved.

**F-1620-6 remains visible and unaddressed** in this slice's own desktop screenshot (the aggregate table clips `Declared cost` while width sits unused beside it). Already on the owner's desk with three options; this slice neither worsens nor touches it.

## Duties discharged at this drain

- **GZ-01**: player-visible change → gazette item filed (`marketing/outbox/gazette-queue.md`), merge hash `be33951b9`, screenshot referenced.
- Goal leaf `stack-directory` flipped `queued` → `merged` with the full 40-char hash, in the commit following this merge (a commit cannot contain its own hash — F-1384-1).
- `test:ledger-guards` run as the fire's last act, after the bookkeeping commit (F-1300-4).

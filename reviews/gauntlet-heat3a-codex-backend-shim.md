# gauntlet-heat3a-codex-backend-shim — drain review (s2272)

**Slice:** `gauntlet-heat3a-codex-backend-shim` · **Branch:** `lane/b` · **Lane tip:** `4dea86459` · **Merge:** `16f347fb2`
**Base:** `main` at `9f9ea97c1` (the s2272 lock commit) · **Gated in:** detached worktree `gate-s2272/` (§3.0b), merged tree `6ea404d45`

## VERDICT: MERGE — the honest version of what the owner asked for, gated on the merged tree, with two findings neither of which blocks.

## What it does

The owner asked (2026-08-24, verbatim) that guest harnesses "run hermes, openclaw and all of them on Codex/subscription".
No OpenAI-compatible endpoint existed on this machine. This slice builds the smallest honest one: a
**localhost-only** `POST /v1/chat/completions` + `GET /v1/models` on `127.0.0.1:8899`, which translates each request
into exactly one `codex exec --ephemeral --json` process and translates the result back into OpenAI shape.

The mechanism question the master demanded be answered first *was* answered: codex 0.149.1 exposes
`app-server`/`mcp-server`/`exec-server` but no raw completions endpoint, so the shim wraps the **public `exec` mode**
rather than reverse-engineering a private one. It never reads, copies, prints or translates `~/.codex/auth.json` —
auth stays owned by Codex. The explicitly out-of-bounds OpenRouter key in `.env.local` is untouched and unreferenced.
`docs/ops/codex-shim.md` states the billing truth plainly, including the honest caveat that this is an *agent-turn
compatibility bridge, not a raw chat-completions endpoint* — Codex's own agent instructions ride along in every turn,
which is why one trivial completion costs ~16.7k input tokens.

## Evidence (all on the MERGED tree, in the detached gate worktree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, 1.56 s; asset-diet ceilings respected (herald 1,158,214 B of 1,500,000 B) |
| `server/codex-shim/serve.test.mjs` (own suite) | **4/4 pass, 0 fail, rc=0, 16.7 s** |
| ↳ live subscription round trip | `model=gpt-5.6-luna`, usage `16,741 prompt + 19 completion = 16,760`, reasoning 9, **latency 10.5 s** |
| ↳ concurrency arm | 3 parallel requests, **6.0 / 4.8 / 6.0 s**, no session sharing |
| ↳ auth-absent skip path | `CODEX_HOME=/tmp/no-codex-auth-s2272` → **rc=0**, 2 skipped *loudly* with reason, the 2 pure arms still green |
| `npm run test:ledger-guards` | 605 tests, **603 pass / 2 fail** — both fails attributed *away* from this slice by control, see F-2272-2 |
| `gate-caller-audit` | RED on arrival (2 new gates, no caller) → **PASS** after a reasoned baseline entry, see F-2272-1 |
| client surface | **untouched** — zero `src/`, `e2e/`, `public/` paths in the diff; no boot probe is meaningful here and none is claimed |

**The drain's re-run is the free control on the runner's headline** — I did not inherit "4/4 green". I re-ran it on the
merged tree and it genuinely rode the subscription, reproducing the runner's reported model and token figures.

## Merge classification

Base `9f9ea97c1`; lane/b was **1 ahead, 8 behind**. Purely additive: **406 insertions, 0 deletions, 0 renames.**

| Path | Class | Resolution |
|---|---|---|
| `server/codex-shim/serve.mjs` | LANE-ONLY (new) | taken |
| `server/codex-shim/serve.test.mjs` | LANE-ONLY (new) | taken |
| `server/codex-shim/tool-response.schema.json` | LANE-ONLY (new) | taken |
| `docs/ops/codex-shim.md` | LANE-ONLY (new) | taken |
| `package.json` | **BOTH-MOVED** | 3-way; see below |
| `tasks/BACKLOG.md` | BOTH-MOVED | 3-way, both sides kept |

**`package.json` checked by content, not by the merge's silence.** `git diff main lane/b` renders the whole
`test:ledger-guards` line as changed, which reads alarmingly like a lane rewriting the battery. It is the opposite:
main had *added* a guard leg while the lane sat branched, so the lane's copy was one leg behind. Verified on the
merged file rather than assumed — **`test:ledger-guards` is byte-identical to main's (71 legs vs the lane's 70),
zero script keys lost, exactly two keys added (`codex-shim`, `test:codex-shim`).** Firewall respected in full.

## Security read (this slice accepts requests and spends the owner's subscription, so it got one)

Read line by line, not grepped. Binds `127.0.0.1` only (`serve.mjs:230`); rejects any request carrying an `Origin`
header with 403 before any spend (`:130`), which the test asserts by counting backend calls; requires
`application/json` (`:131`); caps the body at 1 MiB (`:207`); caps concurrency (`:132`); runs the child with
`--ephemeral --skip-git-repo-check --ignore-user-config --ignore-rules -s read-only` in `tmpdir()`, so no repo state
is reachable and no thread persists between requests (`:90–95`). Error paths construct their own strings and never
echo child stdout/stderr, so a backend failure cannot leak transcript or auth material (`:96`, `:197`). Model ids are
allow-listed and unknown ids are rejected rather than silently remapped (`:135`). No secret is logged anywhere.

## Findings

**F-2272-1 — the slice ships two gates nothing calls, and rooting them would spend the owner's subscription. NON-BLOCKING; recorded in the baseline with its measurement.**
`gate-caller-audit` (in `test:ledger-guards`) redded on arrival: `npm:test:codex-shim` and `server/codex-shim/serve.test.mjs`
were both NEW / NO CALLER. Disposition taken: **grandfathered with a reason**, the audit's own second lawful remedy,
on the established `npm:test:asset-diet` (52.3 s) and `halo-reextraction-check` (+28%) precedent. The reason this one
is *not* a drive-by rubber stamp, and is stronger than either precedent: those two were held back for **wall time**,
whereas rooting this would spend **~16.7k prompt tokens of the owner's Codex allowance on every drain** — CLAUDE.md
§7.3 makes anything spending money an owner decision. Second, independent ground: the live arm depends on a
third-party service over the network, so an outage would red every unrelated drain and the gate would be excused
into uselessness within a week (F-1460-1, the `cross-engine` fate).
**Stated plainly rather than waved at: this IS a partial coverage hole.** Unlike `npm:verify:visual` ("nothing to
wire"), 2 of the 4 tests here are pure — no auth, no network, 15 ms — and one of them,
*"browser-origin requests cannot spend subscription quota"*, is a genuine security assertion protecting the very
allowance the entry declines to spend. **Recommendation: split the file** — pure arms into a rooted guard, live arms
behind the auth skip and owner-gated. That is an implementation change, so it is a corrective task, not a drain's
drive-by. → **owner's desk** (the spend question) + corrective task (the split).

**F-2272-2 — every lawful drain gate reds twice, because §3.0b mandates the very cwd that `drain-block-check` refuses. NON-BLOCKING for this slice; NOT this slice's defect; a live defect in the factory's own gate.**
`test:ledger-guards` reported 2 failures in `scripts/block-class-guard.test.mjs`:
*"every blocked leaf is visible to the §3.0 drain guard (denominator parity)"* and *"every blocked leaf refuses the
drain under the name a fire would type"* (`e10-lore-owner-read` exiting 2 where 1 was expected).

**Attributed by control, not by argument** — three runs, one variable:

| Tree | cwd | Result |
|---|---|---|
| main, no slice | repo root | **rc=0, PASS** |
| merged | `gate-s2272/` (linked worktree) | rc=1, 3 pass / **2 fail** |
| **pre-merge main, SAME linked worktree** | `gate-s2272/` | rc=1, 3 pass / **2 fail** |

The third row is decisive: the identical tree *without* the slice reds identically. The slice is exonerated.

Mechanism, read from the code rather than guessed: `block-class-guard.test.mjs:91` and `:108` call
`spawnSync('node', ['scripts/drain-block-check.mjs', …], { encoding: 'utf8' })` with **no `cwd` option**, so the child
inherits the test process's cwd. Under §3.0b that cwd is a **linked worktree** — and s2224's F-2223-1 cure makes
`drain-block-check` refuse there by design (`⛔ CANNOT VERIFY — DO NOT DRAIN, DO NOT QUEUE off this run`, exit 2),
correctly, because a lane's frozen board is never a lawful source for "has main shipped this?".

So two individually-correct laws collide: **§3.0b orders the gate into a linked worktree; `test:ledger-guards` chains a
guard that spawns a tool which refuses from one.** This is precisely the collision F-2225-1 anticipated and
deliberately designed *around* for `attended-owed-audit` — which was cured to **DECLARE, not REFUSE**, expressly so it
would not red the mandated detached gate. `block-class-guard.test.mjs` never received the same treatment.
The direction is safe (a loud refusal, never a false green), so nothing has ever been mis-merged on it — but a battery
that reds on every law-abiding drain is the textbook F-1460-1 candidate for being excused into uselessness, and the
excusing has to be re-derived by hand by every fire that drains.
**Not cured here on purpose:** the fix is a judgement about which board the assertion should ask about (the test reads
the *local* `goals.json` while spawning a tool that would then be pointed at *main*'s — a careless `cwd: repoRoot()`
could make the denominator-parity assertion compare two different boards, s2221's reverse-control shape). Curing a
guard wrongly makes a gate lie. → **corrective task authored this fire.**

## Where does the player see this?

Nowhere, and that is correct — this is factory infrastructure, not a player-facing change. No GZ-01 gazette item is
owed for it and no deploy was run. What the *county* eventually sees is heat-3b's standings, which this endpoint
exists to make possible.

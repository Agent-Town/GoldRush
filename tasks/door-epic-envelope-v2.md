# Task door-epic-envelope-v2: ONE law for the whole door envelope — duration, bytes, entries AND the L1 reader cap all derive from the contract (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2309, re-authoring `door-epic-envelope` after its lawful STOP. This is a FIREWALL WIDENING of one file plus one derivation rule; scope items 1–7 are INHERITED VERBATIM from the v1 master and are NOT re-litigated here.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: AGENTS.md; **`tasks/door-epic-envelope.md`** (the v1 master — its Why, Scope 1–7 and Firewall are inherited; read it in full before starting); **the v1 leaf `stopNote` in `tasks/goals.json`** (the runner's own binding re-author instruction, quoted below); **F-2302-1** (`tasks/BACKLOG.md:10` — the joint-unsatisfiability finding); `reviews/door-tick-ceiling-v2.md` + its merge `d8cae3c3b` (the per-contract derivation pattern this master EXTENDS); `artifacts/gauntlet-heat6-20260825/e1-baron/` (the two SECURED Baron tapes — your gate).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

⚠️ At authoring time (s2309) `node scripts/lane-usable.mjs lane-c` read **USABLE — `ahead=0 behind=13 paths=0 tracked-dirt=0 untracked=0`**. The v1 run reverted its own provisional edits, so the lane is clean and the safe-dupe path should apply with nothing to discard. If it does not, that is a real change since authoring — STOP and report it.

## Why (the v1 run STOPPED lawfully on a FOURTH axis its firewall did not cover — s2308, runner-declared, 213,614 tokens)

The v1 master's own honesty guard ordered exactly this outcome: *"If a FOURTH axis emerges behind these (another calibrated-to-300s limit), STOP and name it with numbers."* The runner did, reverted its provisional edits, and left `lane/c` clean. **That was a firewall SUCCESS, not a failure — nothing landed, so v1's entire scope is still to do.**

The leaf's `stopNote` states the wall and the binding cure, verbatim:

> The wall is the BYTE axis rather than a fourth envelope axis: server/ledger/serve.mjs:64-71 requestBody() retains chunks only while the accumulated body is at most 256*1024 bytes, and the compact Baron tape is 463,569 bytes, so the SQLite/L1 arm returns HTTP 400 bad_json before functions/api/standings.ts can validate it. The KV arm passed 171 provisional checks; the SQLite arm rejected the first banked Baron POST. server/ledger/serve.mjs is outside TOUCH-ONLY. **Re-author with server/ledger/serve.mjs and its focused ledger-server suite in scope, DERIVING that reader cap from the same maximum lawful request size as the outer standings.ts body cap rather than adding another independent number.** The nginx mirror has no client_max_body_size, so its 1 MiB default still admits the proposed sub-1-MiB envelope and needs no config change.

**VERIFIED AT SOURCE s2309, independently of the runner report (Mistake #4 — a stopNote is an inherited claim):**

- `server/ledger/serve.mjs:64–71` `requestBody()` — `if (bytes <= 256 * 1024) chunks.push(chunk);` and `return { body: Buffer.concat(chunks), bytes, tooLarge: bytes > 256 * 1024 };`. **The `256 * 1024` literal appears TWICE and is derived from nothing.**
- `server/ledger/serve.mjs:52` — `if (tooLarge) headers.set('content-length', String(bytes));`. This is a deliberate honesty mechanism: on truncation it declares the TRUE size so the outer law can refuse correctly. Keep it; it is what makes the cure work.
- `functions/api/standings.ts:115` `const MAX_TAPE_BYTES = 64 * 1024;` · `:116` `const MAX_JSON_BYTES = MAX_TAPE_BYTES + 4 * 1024;` — **`MAX_JSON_BYTES` is "the outer standings.ts body cap" the stopNote names.** Enforced in `readJson()` at `:1175` (declared content-length) and `:1177` (actual encoded bytes), both throwing `413 reel_too_large`.

**THE FAILURE CHAIN, AND IT REFINES THE stopNote — read this before you code.** The stopNote says the 400 happens *"before standings.ts can validate it"*. Measured at source, it happens **inside `readJson`, after BOTH size checks pass**:

1. Body arrives at 463,569 B → `requestBody` keeps only the first 262,144 B, sets `tooLarge`.
2. `:52` honestly sets `content-length: 463569`.
3. `readJson :1175` — declared 463,569 vs `MAX_JSON_BYTES`. **TODAY this refuses `413 reel_too_large`, which is CORRECT.** Once scope 1–3 raise the envelope past 463,569, it PASSES.
4. `readJson :1177` — actual bytes are now the **truncated 262,144**, which is under the raised cap → PASSES.
5. `JSON.parse(truncated)` **throws** → falls through to `throw new HttpError(400, 'bad_json')`.

So the 256 KiB reader cap is **inert today and becomes the binding wall the moment the envelope is raised past it**, and it fails as `bad_json` — a refusal that blames the payload's syntax rather than its size. That is the whole defect: an independent number in an inner layer silently overriding the outer law, and lying about why.

**Mechanically the prescribed derivation is possible — verified s2309:** `loadLedgerHandlers()` (`server/ledger/serve.mjs:12–36`) already calls `vite.ssrLoadModule('/functions/api/standings.ts')`, so the constant can be shared rather than duplicated.

⚖️ **SCOPE HONESTY — READ THIS AND DO NOT SETTLE IT YOURSELF.** 🔺 **F-2299-2 is an OPEN owner-desk item** whose own recommendation is *(b) keep 64 KiB and treat "fits the envelope" as part of what the Baron door ASKS*. This master does **not** settle it: it implements the envelope law the attended session dispatched on 2026-08-25 (`tasks/BACKLOG.md:1`, which adopts F-2302-1's recommendation), and it is reversible — a lane branch, gated before merge. If the owner rules (b), this work is reverted rather than merged. **Do not write anything into this slice that claims F-2299-2 is answered.**

## Scope

**Items 1–7 are INHERITED VERBATIM from `tasks/door-epic-envelope.md` — read them there and execute them unchanged.** They are not restated here so the two masters cannot drift. Item 8 is the only new scope.

8. **THE FOURTH AXIS — the L1 reader cap derives, it does not decide.**
   a. Remove both `256 * 1024` literals from `server/ledger/serve.mjs` `requestBody()`. The reader's cap MUST be the same maximum lawful request size as the outer `standings.ts` body cap (`MAX_JSON_BYTES`), obtained from that module — **not a second number, not a copied literal, not a rounded-up "safe" value.**
   b. Export the cap from `functions/api/standings.ts` (it is currently module-private) and consume it in `serve.mjs`. `loadLedgerHandlers()` already `ssrLoadModule`s that file; capture the value where the routes are captured.
   c. **The injected-handlers path is a real branch and must be answered, not ignored:** `createLedgerServer({ handlers })` (`serve.mjs:40`) skips `loadLedgerHandlers()` entirely, so the derived value is not available on that path. Choose ONE and say which in your report: (i) resolve the cap independently of the routes so both paths get it, or (ii) accept an explicit `maxRequestBytes` option whose DEFAULT is the derived value. **If neither is clean, STOP and report — do not fall back to a literal.**
   d. Keep the `:52` honesty mechanism intact. After the cure, a body over the lawful size must still reach the outer law and be refused **`413 reel_too_large`**, never `400 bad_json`.
   e. **Tests, in the existing suites — do NOT mint a new top-level guard script.** Add to `scripts/test-standings.mjs` and/or `scripts/test-ledger-worker.mjs`: (i) a body at exactly the lawful maximum is ACCEPTED through the L1/SQLite arm; (ii) a body over it is refused **`413 reel_too_large`** with that exact error code, **not** `bad_json`; (iii) an assertion that pins the reader cap EQUAL to the outer cap, so the two can never drift apart again. If you believe a standalone guard script is genuinely required, root it in `test:stats` in the SAME commit and say why in your report.

## Firewall

Touch ONLY: everything v1's firewall allows (`functions/api/standings.ts`, `src/game/RunTape.ts` door-validation sites only, `src/playbook/PlaybookFormat.ts` constant SPLIT only, `public/skill.md` if needed with guards re-pinned, the suites, the BACKLOG row) **PLUS `server/ledger/serve.mjs`** and the ledger-server suites `scripts/test-standings.mjs`, `scripts/test-ledger-worker.mjs`, `scripts/test-accounts.mjs`.

NO changes to: sim mechanics, ranking, worker logic. **NO nginx / `ops/droplet/**` edits** — the mirror has no `client_max_body_size` and its 1 MiB default already admits a sub-1-MiB envelope, so STATE the implication in your report and edit nothing. No behaviour change to playbook authoring (the constant split is a rename + comment only). No other file under `src/**` or `functions/**`.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green. `npm run test:stats` green (this is `test-stats` + `test-standings` + `test-ledger-worker` — the ledger-server suites). `npm run test:accounts` green. The playbook suite unmodified-green. Both backends exercised via the L1 seam — **KV and SQLite arms both, since the v1 run passed 171 checks on KV and failed on SQLite; a KV-only green is exactly the false green that hid this axis.**

**THE GATE:** both banked Baron tapes (`artifacts/gauntlet-heat6-20260825/e1-baron/`) SUBMIT and poll `verified` through the local flow (validator + worker). Quote the verdict slips. If the tapes verify on KV but not SQLite, that is a FINDING, not a pass.

Report the three-axis table (now four), the constant split, the reader-cap derivation and which injected-handlers branch you chose, the Baron proof, the nginx line, and the worker wall-time delta for a ~464 KB replay.

End: READY-FOR-GATES + the above.

## No-op / honesty guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

If a **FIFTH** axis emerges behind these (another limit calibrated to the 300-second ordinary contract, or another independent number in a layer the envelope must pass through), **STOP and name it with numbers, with its file:line** — exactly as v1 did. That stop is a success and will be re-authored the same way. Do NOT widen your own firewall to reach it.

## Ledger duty for the DRAIN of this slice (not for you)

When this merges, `door-epic-envelope` (v1) must be retired as `superseded` recording `supersededBy: door-epic-envelope-v2`, in the drain's bookkeeping commit — otherwise `scripts/stopped-leaf-supersession-guard.test.mjs` reds the moment this leaf ships while v1 still reads `stopped`.

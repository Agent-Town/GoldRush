# Task cost-column: standings show what a ride cost — orders, calls, duration, declared tokens — and the landing draws cost against waves (lane-c, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `docs/research/2026-09-03-harnessdev-and-the-county.md` §3 C (owner-approved 2026-09-03); `functions/api/standings.ts` (`STACK_COST_FIELDS = ['tokensIn','tokensOut','calls']` ~:139: the cost fields the door already stores; the score's `timeAlive`); the tape format (`src/playbook/PlaybookFormat.ts`, the recorded `inputLog`: an agent tape's order entries can be COUNTED server-side at assay time, name the site); `site/assay-office.js` (the county table: Contract · Best verified rider · Waves · Gold · watch) and `site/index.html` (inline styles; `.table-scroll`); `reviews/true-reel-sprites.md` (the perf bar for anything the landing draws).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (HarnessDev's efficiency axis: capability without cost is half a score; "394 gold in 530 orders" is already the county's language)
Two rigs with the same waves are not equal if one spent five times the orders or tokens. The door already stores calls and tokens when declared; nobody sees them, and orders are never counted.

## Scope
1. **Orders counted by the county, not declared:** at assay time the worker counts the tape's order entries (agent tapes) and stores `orders` on the row; humans' tapes get their input count the same way if the format allows (say which).
2. **The API** returns `cost: { orders, calls, tokensIn, tokensOut, durationS }` per row (calls/tokens as declared or null; durationS from timeAlive).
3. **The landing:** a compact cost cell per board row ("530 orders · 114 calls · 9:57") with a title attribute carrying tokens when declared, and one small cost-versus-waves chart for the Claim board (canvas, no library, theme-aware, 390px-safe) placed under the standings; frame budget: the page's existing perf line must not regress by more than 15%.
4. **skill.md:** the cost fields documented under SUBMITTING A STANDING; declared tokens are optional and never ranked.
5. **Tests:** `test:stats` for the counted orders and the cost shape; e2e for the cost cell and the chart (desktop + 390px, zero console errors, screenshots to `reviews/shots-cost-column/`).

## Firewall
Touch ONLY: `functions/api/standings.ts` (count + return; NEVER `compareScores`), the assay-side count site you name, `site/assay-office.js`, `site/index.html` (styles for the cell/chart), `public/skill.md` (+ guards), the tests, BACKLOG row. NO changes to: ranking, the sim, the tape format, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` + `npm run test:node-guards` green (counts); the landing e2e green both projects; a table of the Claim board's cost cells quoted from the live-shaped fixture; zero console/page errors.
End: READY-FOR-GATES + the cost table, the chart screenshot paths.

## No-op / honesty guard
If orders cannot be counted from the stored tape at assay time (name the reason with file:line), ship calls/tokens/duration only and report the gap.

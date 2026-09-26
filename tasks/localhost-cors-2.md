# Task localhost-cors-2: the production localhost refusal keys on an explicit development variable instead of the mail key, and the six doors that still admit localhost unconditionally join it

⛔ GATE-SIDE HOLD: run by the attended session as an Opus 5.5 implementer at maximum effort; not for a Codex lane. Follows `small-fixes-1` (F-SEC2-2, F-SF1-1, F-SF1-8) and `kv-counters-to-ledger-2` (which edits `standings.ts` and `_multiplayer.ts` too).

You are the implementer for Gold Rush, working in a scratch worktree cut by the attended session (Claude Opus 5.5 on the owner's Anthropic subscription; never Codex): `/Users/robin/Claude/Projects/wt-lc2`, branch `fix/localhost-cors-2`, cut from main AFTER both `small-fixes-1` and `kv-counters-to-ledger-2` landed (verify both in `git log --oneline main`; else STOP and report).

READ FIRST: AGENTS.md; `reviews/small-fixes-1.md` (F-SF1-8: the Pages production environment holds exactly one variable, `ASSAY_WORKER_SECRET`, measured through the Cloudflare API by variable names on 2026-09-25; so a predicate on `RESEND_API_KEY` never bites there) and `artifacts/small-fixes-1/report.md` (F-SF1-1 with the six doors and lines as of that report, the in-process probes `bugs-cors-probe.mjs` and `other-doors-cors-probe.mjs`); `functions/api/_bugs.ts` and `functions/api/_accounts.ts` (the current predicate `devOrigins = !env.RESEND_API_KEY` and the CORS builder); the six doors: `functions/api/redeem.ts`, `standings.ts`, `refusals.ts`, `telemetry.ts`, `stats.ts`, `_multiplayer.ts` (find their localhost arms by grep; the report's line numbers have moved); `.dev.vars` or its example if one exists, `wrangler.toml`, `docs/ops/ops-evening-2026-09.md` (how variables reach Pages).

Pre-flight: `git -C /Users/robin/Claude/Projects/wt-lc2 status --short` must show no modified TRACKED file outside the two factory-churn classes: (a) `logs/**`, (b) `artifacts/**`, `reviews/shots-*` and any `.png` (F-1407-1, FACTORY-CHURN EXCEPTION: list them and proceed); `git log main..HEAD` empty. `npm run build` green before touching anything. Node 26 first on PATH (`export PATH=/opt/homebrew/bin:$PATH`).

## Why (F-SF1-1 and F-SF1-8, 2026-09-25)
small-fixes-1 closed the bug office's unconditional localhost arm by keying it on `RESEND_API_KEY` being set. The mail key lives on the droplet, not on Pages: production holds only `ASSAY_WORKER_SECRET`, so the predicate reads "development" in production and the office keeps admitting localhost after that deploy (no regression, no fix). Six more doors never had the arm gated at all. A production default must refuse; development must opt in explicitly.

## Scope
1. **The predicate.** One shared helper (in `functions/api/_cors.ts` or the existing CORS module) reads `env.ALLOW_LOCALHOST_ORIGINS === '1'` and nothing else; `_bugs.ts` and `_accounts.ts` move onto it; the `RESEND_API_KEY` reading is removed from the CORS path. Add `ALLOW_LOCALHOST_ORIGINS=1` to the development variables file the local server reads (`.dev.vars`, gitignored, with an example file if the repo keeps one) and document it in the ops evening runbook as NOT to be set on Pages.
2. **The six doors.** Each localhost arm keys on the same helper; the site's own origins stay allowed as today; an unconfigured setup (no variable) refuses localhost in every door.
3. **The probe.** Extend the in-process probe to all eight doors: for each, production (no variable) refuses localhost with no allow-origin header, admits the site's origins; development (variable set) admits localhost. Counts before and after in the report.
4. **Local play still works.** The dev server and the e2e batteries that exercise doors in process set the variable where they need it (measure which do; the default e2e fixtures mock the API, so expect none); `test:accounts`, `test:mp`, `test:stats` green.
5. **Report** `artifacts/localhost-cors-2/report.md`.

## Firewall
Touch ONLY: `functions/api/_bugs.ts`, `_accounts.ts`, `redeem.ts`, `standings.ts` (the CORS arm only; not the grammar, not the redirect), `refusals.ts`, `telemetry.ts`, `stats.ts`, `_multiplayer.ts` (the CORS arm only), a shared CORS helper module, `.dev.vars*`, `docs/ops/ops-evening-2026-09.md`, `scripts/test-accounts.mjs`, `scripts/test-multiplayer.mjs`, the probes under `artifacts/localhost-cors-2/**`. NO changes to: `src/**`, `server/**`, `wrangler.toml` bindings, secrets, the ledgers.

## Self-check (evidence, not vibes)
tsc and build green; the functions gates and the node-guards battery under the drain lock; the probe's counts. Commits path-scoped, prefix `fix:`, one concern per commit, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Take the drain lock (`bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c ...`) only for the full node-guards battery and the functions gates. No em or en dashes. No network call leaves the machine; nothing is deployed by you. If the Write tool refuses the report file, write it with a Bash heredoc. If you find yourself about to exit without changes, WRITE WHY into the report first.
End: READY-FOR-GATES + the probe counts before and after + the doors changed + anything adapted.

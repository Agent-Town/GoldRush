# Sol findings — verification, deployment, and operations

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** release-gate coherence, Worker harnesses, preview fidelity, production coverage, browser matrix, deploy semantics, hosting documentation, and test-config sprawl.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-VERIFY-001` No single production-representative release gate | P1 | Factory gates are extensive but manual/distributed | `sol/release-gate-contract` |
| `F-SOL-VERIFY-002` Accounts and MP harnesses cannot start | P1 | Task 067 covers MP game restore, not harness boot | `sol/worker-compatibility-pin` |
| `F-SOL-VERIFY-003` Preview suite contains dev-only behavior | P1 | Same root as TRUST-002; dedupe implementation | `sol/preview-suite-contract` |
| `F-SOL-VERIFY-004` Agent tool tests can skip in production | P1 | No production-bundle corrective found | `sol/production-agent-tool-tests` |
| `F-SOL-VERIFY-005` Start-screen keyboard baseline is stale | P2 test defect | Claim Ledger insertion caused it | `sol/start-menu-keyboard-test` |
| `F-SOL-VERIFY-006` General browser coverage is Chromium-only | P2 public-readiness | 058 has one WebKit slice only | `sol/browser-matrix-baseline` |
| `F-SOL-VERIFY-007` Deploy script is machine-specific and reports failure as success | P1 ops | Best-effort fire law explains exit 0; no release wrapper | `sol/deploy-result-contract` |
| `F-SOL-VERIFY-008` Hosting docs/config do not describe the real backend | P1 ops | Accounts/telemetry/MP shipped incrementally | `sol/deployment-contract-docs` |
| `F-SOL-VERIFY-009` Test configuration has accumulated competing truths | P2 maintenance | Historical gates intentionally retained in places | `sol/playwright-config-consolidation` |

## F-SOL-VERIFY-001 — [P1] There is no one command that proves the deployable product is green

**Evidence**

- `package.json:6-16` splits build, default Playwright, accounts, multiplayer, preview, visual, and canvas checks into independent scripts.
- No files exist under `.github/workflows`; remote merges have no enforced CI gate.
- `playwright.config.ts:20-55` runs against Vite development by default with project parallelism.
- `playwright.preview.config.ts:4-13` attempts the full suite against production preview, but `F-SOL-VERIFY-003` makes that suite deterministically red.
- Playwright listed 1,050 project-expanded tests in 132 files; a full run is expensive enough that the factory uses many slice-specific batteries and historical configs.
- The audit's core/start/stress sample passed 20 and failed 2 stale assertions; the full regression was not run once deterministic release blockers were established.

**Impact**

Large test volume creates confidence locally, but no reproducible command or CI status proves the exact production artifact plus Functions/Worker bindings is releasable.

**Recommendation for triage**

Define a tiered release contract: fast PR gate, source-touch matrix, production artifact smoke, Worker/API contract battery, and scheduled full regression. Make one command/CI workflow aggregate their result without discarding the existing slice evidence discipline.

## F-SOL-VERIFY-002 — [P1] The accounts and multiplayer Worker harnesses fail before assertions

**Evidence**

- `npm run test:accounts` and `npm run test:mp` both failed at Worker startup during the audit: requested compatibility date/runtime was `2026-07-09` while the bundled runtime supported `2026-07-08`.
- `scripts/test-accounts.mjs:147-168` launches `wrangler pages dev` without `--compatibility-date`.
- `scripts/test-multiplayer.mjs:120-156` pins the standalone room Worker to `2026-07-08`, but `163-181` launches the Pages process without a date.
- `scripts/test-stats.mjs:114-128` demonstrates the working pattern by passing `--compatibility-date 2026-07-08`; its 44 checks passed.

**Impact**

Critical account and multiplayer server behavior is currently untestable through the advertised scripts, independent of application correctness.

**Recommendation for triage**

Pin one supported compatibility date in a checked-in config/shared helper used by every Wrangler harness and deploy path; prove all three harnesses start before changing API behavior.

## F-SOL-VERIFY-003 — [P1] The production-preview suite includes tests that require Vite's development filesystem

**Evidence**

- `playwright.preview.config.ts:4-13` runs the same e2e directory against `vite preview`.
- `e2e/m5-04-offline-queue.spec.ts:89-114` expects the UI to write an exact pending JSON file into the repository.
- That route exists only in `vite.config.ts:40-105` `configureServer` middleware.
- Production preview reproduced `JSON ready (HTTP 404)` instead of `Posted`.

**Impact**

`npm run test:preview` cannot be a green production gate, and a development-only mechanism is being asserted as player behavior.

**Recommendation for triage**

Deduplicate the product fix against `F-SOL-TRUST-002`. Separately classify tests as dev-tooling versus production contract; the preview suite must only assert behaviors the deployed artifact can provide.

## F-SOL-VERIFY-004 — [P1] Core agent-tool tests can silently skip against the production bundle

**Evidence**

- `e2e/m4-01-tool-surface.spec.ts:34-75` dynamically imports `/src/agent/ToolSurface.ts` into the browser instead of exercising only bundled public seams.
- The spec skips when that source import is unavailable in production preview (`e2e/m4-01-tool-surface.spec.ts:102-106`, with similar skips later in the file).
- `e2e/m4-05-*` uses the same source-import/skip pattern for agent permissions.

**Impact**

The production preview may report skipped tests precisely where bundling/export/integration errors need detection.

**Recommendation for triage**

Expose a debug-gated production test seam or test the public in-game tool surface/receipts end to end. Keep module-level tests separate from production artifact gates.

## F-SOL-VERIFY-005 — [P2 test defect] Start-screen keyboard test assumes an obsolete button order

**Evidence**

- `src/ui/menu/StartMenu.ts:128-131` orders actions Enter Town → Claim Ledger → Profile → Settings.
- `e2e/044-start-screen.spec.ts:92-100` presses ArrowDown once from Enter Town and expects Profile.
- Desktop and mobile both failed; focus correctly moved to Claim Ledger, so the product navigation appeared correct and the assertion stale.

**Impact**

Known-red noise weakens trust in adjacent gate failures.

**Recommendation for triage**

Update the test to traverse/verify the full current action order and Enter activation; do not remove Claim Ledger or weaken keyboard assertions.

## F-SOL-VERIFY-006 — [P2 public-readiness] Safari/iPad and Firefox behavior are largely untested

**Evidence**

- `playwright.config.ts:26-47` provides Desktop Chrome and Pixel 5 Chromium as general projects.
- `playwright.config.ts:48-55` runs WebKit only for `058-device-tiers.spec.ts`.
- No Firefox project exists.

**Impact**

WebGL, audio, touch, storage, worker, and layout differences on Safari/iPad can reach family testers without a broad regression signal.

**Recommendation for triage**

Add a small production smoke matrix for current Safari/iPad WebKit and Firefox before considering full-suite multiplication. Start with boot, first run, build interaction, audio unlock, save/continue, and Town.

## F-SOL-VERIFY-007 — [P1 ops] Deployment is hard-coded to one checkout and always exits zero

**Evidence**

- `scripts/deploy.sh:6-7` hard-codes `/Users/robin/Claude/Projects/Gold Rush`.
- `scripts/deploy.sh:17-18` turns a build failure into logged `ABORT` followed by exit 0.
- `scripts/deploy.sh:21-27` logs Pages failure but exits 0 unconditionally.
- The best-effort fire law intentionally says deploy must not block cadence, but the same script therefore cannot serve as an authoritative release result.

**Impact**

The script is non-portable and callers cannot distinguish deployed, skipped, build-failed, and deploy-failed outcomes from process status.

**Recommendation for triage**

Keep a best-effort wrapper for fires, but put real build/deploy logic in a portable script that returns meaningful exit codes and a machine-readable result; the wrapper can deliberately swallow/record that result.

## F-SOL-VERIFY-008 — [P1 ops] "Any static host" no longer describes the shipped product

**Evidence**

- `docs/DEPLOY.md:1-19` says `dist/` works on any static host and lists Netlify/GitHub Pages as alternatives.
- Accounts, telemetry, stats, and multiplayer use `functions/api/**`; multiplayer also needs a Durable Object Worker/binding.
- Assay posting currently uses dev-only middleware rather than any deployable backend.
- No single checked-in Wrangler project configuration declares all required bindings, compatibility dates, Pages Functions, and the companion multiplayer Worker.

**Impact**

Static hosting can render the client while silently losing advertised server features. Deployment state cannot be reproduced from the repository alone.

**Recommendation for triage**

Document static-offline versus full-Cloudflare capability modes, check in nonsecret binding/config contracts, and add post-deploy readback smokes for each enabled feature.

## F-SOL-VERIFY-009 — [P2 maintenance] Eighteen Playwright configs encode historical environment lore

**Evidence**

- The repository root contains 18 Playwright config variants, including `.stale` gate files and `pw.reuse.config.ts` that current docs call unsafe.
- `CLAUDE.md:25` states one evidence standard, while `STATUS.md` and task files carry environment-specific serial/preview exceptions.
- `package.json:9` still maps canonical `npm test` to the default dev configuration.

**Impact**

Agents can choose a config that is syntactically valid but semantically obsolete, producing false greens/reds and duplicated maintenance.

**Recommendation for triage**

Inventory each config as canonical, generated, historical evidence, or delete/archive candidate. Converge on a small shared base plus explicit project/port overrides; preserve historical facts in docs, not executable configs.

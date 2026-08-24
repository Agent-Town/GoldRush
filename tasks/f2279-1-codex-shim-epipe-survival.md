# Task f2279-1-codex-shim-epipe-survival: one rider hanging up must fail ONE request, not kill the county's shim (lane-b, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2282, from finding **F-2279-1** in the heat-4 drain review, which named this "the next lane-b master".

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST (paths, not vibes):
- `reviews/gauntlet-heat4-streaming-field.md` — finding **F-2279-1**, with the cost accounting. This is the WHY.
- `artifacts/gauntlet-heat4-20260824/shim-crash.txt` — the preserved stack. Read it before theorising; it names
  the exact event (`Emitted 'error' event on Socket instance`, `code: EPIPE`, `syscall: write`).
- `server/codex-shim/serve.mjs` — the subject. `createServer` is at `:123`; the streaming writer `sendStream`
  begins at `:216` and writes with a bare `response.write(...)`; the request-scoped `catch` at `:209` guards with
  `if (response.destroyed) return`. Understand why that guard does **not** prevent this crash before you change it.
- `server/codex-shim/serve.test.mjs` — the existing suite. **`:98` `client abort terminates the codex child
  process` is the closest existing arm — read it first, it is most of your harness.** Note `createCodexShimServer`
  accepts `{ codexBinary, completeFn }`, and `:135`/`:167` use a stubbed `completeFn`, so this whole task is
  testable with **no auth and no network**.
- `scripts/fire.md` — the F-2215-1 clause (*a control whose failure mode is silence cannot be told from the
  silence it measures*) and the F-1274-2 behaviour-neutrality standard. Both bind your evidence.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content already on main =
SAFE DUPE → `git checkout -B lane/b main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign
edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list,
proceed. Then `npm install --no-audit --no-fund`; build green.

⚠️ **`lane/b`'s `package.json` is STALE vs main and the leg you need (`test:codex-shim`) lives there.** The
safe-dupe reset above cures this. **Verify it did:** `npm run test:codex-shim --silent -- --help` must resolve the
script, and `grep -c '"test:codex-shim"' package.json` must return **1**. If it returns 0, STOP and report — do
not hand-add the script.

## Why (drain review F-2279-1, s2279, 2026-08-24 — an observed production loss, not a hypothesis)

The subscription shim is the path every county guest rides. During heat 4, after several concurrent riders had
streamed for many turns, a socket emitted `EPIPE` **with no `error` listener attached**, so Node terminated the
process:

```
Error: write EPIPE
    at WriteWrap.onWriteComplete [as oncomplete] (node:internal/stream_base_commons:87:19)
Emitted 'error' event on Socket instance   ·   code: EPIPE   ·   syscall: write
```

OpenClaw then took `ECONNREFUSED` on three attempts; OMP, Hermes and Prime all surfaced the same loss. **This is a
server-availability defect, not a guest DNF — no rider retry can cure a process that is absent.** It cost the heat
roughly half its program: OMP hill-mine 2 of 3, Hermes night-shift 2 of 3 and hill-mine 3 of 3, OpenClaw 8 of 9,
all unridden.

**CONFIRMED BY READING, s2282:** `grep -n "\.on('error'" server/codex-shim/serve.mjs` returns **nothing**. There is
no error handler on the server, on any response, or on any socket. The `if (response.destroyed) return` at `:209`
is a *check*, not a *handler*: it cannot help when a write is already in flight and the peer's RST arrives during
`onWriteComplete`, which is exactly what the stack shows.

## Scope (each item testable)

1. **Make a broken pipe fail ONE request and never the process.** Attach `error` handling so that a peer
   disconnecting — mid-stream or mid-write — is absorbed. Cover the streaming writer in `sendStream` as well as
   the non-streaming path; the crash was observed under streaming but the defect is the missing listener, not the
   mode. `EPIPE`/`ECONNRESET`/`ERR_STREAM_DESTROYED` from a hung-up client are **expected operating conditions** and
   must not be logged as errors at a level that would drown the log under normal rider churn.
2. **Decide the dead-child policy and WRITE IT DOWN in a comment at the site.** F-2279-1 poses it explicitly:
   should a dead `codex` child fail one request or the process? **Pick "fail the request, keep serving" unless you
   can show it is wrong** — a shim that dies takes every concurrent rider with it, which is precisely the measured
   harm. If you choose otherwise, justify it against that cost.
3. **Do NOT weaken what is already correct.** In particular the browser-origin quota refusal (`:167`'s subject) and
   the child-termination-on-abort behaviour (`:98`'s subject) must both still hold. **No error handler may swallow a
   genuine backend failure into a 200** — a rider must still be able to tell "your request failed" from "you won".
4. **Never log auth material.** The shim's standing constraint (127.0.0.1 only, no auth material ever logged) is
   unchanged; a new error path is exactly where a token leaks into a log. State in your report that you checked.
5. **A guard that PROVES the process survives — as a PURE arm.** Add to `server/codex-shim/serve.test.mjs` a test
   that manufactures the real condition: begin a streaming completion against a server built with a stubbed
   `completeFn`, have the client destroy its socket mid-stream, then assert **(a)** the server process is still
   alive and **(b)** a *subsequent* request on the same server still succeeds. Item (b) is the one that matters —
   "did not throw" is not survival. Use **no auth and no network** (`{ codexBinary: 'unused', completeFn }` as at
   `:135`/`:167`) so this arm runs in any shell. **It must carry no `skip`.**

## Self-check (run these, paste real numbers — a claim without its output is not evidence)

- `npm run test:codex-shim` → report **total / pass / fail / skipped**. The auth-gated arms will skip in a fire
  shell; that is expected and is **not** a result. Say which arms skipped and why.
- **Prove the new arm can actually red (F-2215-1).** On a **scratch copy**, revert your handler and confirm the new
  arm FAILS — ideally with the process dying rather than an assertion — then restore. Paste both outcomes. If it
  passes with the cure removed, it is decoration and item 5 is not done.
- **Behaviour-neutrality (F-1274-2):** every pre-existing arm that passed before your change still passes, with the
  same skip set. Paste the before/after counts and assert your control arm RAN (paste its output size) — a control
  whose failure mode is silence cannot be told from the silence it measures.
- `npx tsc --noEmit` → rc=0. `npm run build` → green.
- **NOT required:** playwright, `test:node-guards`, screenshots. This slice touches no `src/`, `e2e/`, `functions/`
  or asset path and renders nothing. Say so in your report rather than running them.
- ⚠️ **Do NOT root `test:codex-shim` into `test:ledger-guards`.** Whether to do that is **F-2272-1, an OPEN owner
  question on the desk** (it would spend the owner's Codex allowance on every drain). Out of scope here.

## Firewall

TOUCH-ONLY:
- `server/codex-shim/serve.mjs`
- `server/codex-shim/serve.test.mjs`

NO (report, never edit):
- `package.json` — the `test:codex-shim` leg already exists on main; if it appears missing your lane is stale, STOP.
- `scripts/gate-caller-baseline.json` — F-2272-1 grandfathered this suite deliberately; leave it.
- `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` — ledger surfaces; the drain owns them.
- Any `src/**`, `e2e/**`, `functions/**`, `assets/**`, `scripts/**`, `public/**`.

READY-FOR-GATES. Report: the dead-child policy you chose and **why**; every site you attached handling to and what
each absorbs; the before/after of your manufactured-defect proof; the full `test:codex-shim` counts with the skip
set named; your confirmation that no auth material can reach a log on the new paths; and anything you found that
contradicts this master's Why — a runner that reports a defect instead of fixing it is a firewall success.

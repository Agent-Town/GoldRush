# F-1636-4 — the fire-side wall probe runs a DIFFERENT codex binary than the runner, so it can never report the wall lifted

- **Raised:** s1636, 2026-08-10T19:1xZ (local, Bangkok UTC+07)
- **Status:** CURED for this incident (wall lifted); the LAW SURFACE still prescribes the broken probe — see "What must change".
- **Consequence discharged:** owner desk item **F-1631-3** ("buy Codex credits?") is **MOOT — no purchase needed.**

## The claim

`scripts/fire.md` §2.0 tells every fire, once per cycle, to probe:

> `codex exec "reply exactly: OK"` (short timeout); on success delete the flag …

In the fire shell, bare `codex` resolves to a binary that **cannot** address `gpt-5.6-sol` at all. The probe therefore fails for a reason that has nothing to do with the wall, and the fire reads that failure as confirmation. The wall self-perpetuates.

## The measurement

Three `@openai/codex` installs exist on this Mac:

| path | version | who resolves it |
|---|---|---|
| `/opt/homebrew/bin/codex` → `../lib/node_modules/@openai/codex` | **0.133.0** | **the fire shell** (`which -a codex` returns only this) |
| `~/.nvm/versions/node/v23.11.1/lib/node_modules/@openai/codex` | **0.145.0** | **the lane runner** (Robin's Terminal) |
| `~/.nvm/versions/node/v24.14.0/lib/node_modules/@openai/codex` | 0.115.0 | — |

`scripts/lane-runner-v3.sh:173` invokes bare `codex exec -m "${cx_model:-gpt-5.6-sol}" …`, so *which* codex runs is decided entirely by the PATH of the shell that launched the runner. Robin's Terminal has nvm's v23.11.1 first; the fire has homebrew's.

`lane-runner-v3.sh:172` records the floor: **CLI 0.144.1 knows 5.6 ids**. The fire's 0.133.0 is below it, so a fire-side `-m gpt-5.6-sol` request returns **HTTP 400 "requires a newer version of Codex"** — regardless of quota, regardless of the wall.

That is exactly the error s1635 saw and reported.

## What the evidence actually says

1. **The runner's binary reaches the model right now.** Probing with the *runner's* client:

   ```
   ~/.nvm/versions/node/v23.11.1/bin/node .../@openai/codex/bin/codex.js \
     exec -m gpt-5.6-sol -c model_reasoning_effort=low "reply exactly: OK"
   → OpenAI Codex v0.145.0 · model: gpt-5.6-sol · reply: OK · 13,008 tokens
   ```

2. **Three production runs had already proven it, two hours before the wall was questioned.** The 18:17 dispatch ran on the walled model and produced full slices:

   | run | model banner | outcome |
   |---|---|---|
   | `20260810-181709-lane-a-…-ap16-1-buildable-parity` | `gpt-5.6-sol` | 494,754 tokens, READY-FOR-GATES → **merged `8465f6b3`** |
   | `20260810-181709-lane-d-…-ap16-2-draft-reaches-door` | `gpt-5.6-sol` | 438,317 tokens, complete implementation |
   | `20260810-181709-lane-c-…-ap16-3-blast-verb` | `gpt-5.6-sol` | 220,739 tokens, complete implementation |

   No quota message in any of them. The wall was raised s1631 at 16:09Z; these ran at 18:17Z.

## Where s1635 got to, and the one inch it missed

s1635 deserves credit: it raised the version theory, then **refuted it itself** within the same fire on good evidence — the run-log banners say v0.145.0, so *the runner* was never below the floor, and the run that originally hit the wall died on a genuine quota message.

The inch it missed is that **the probe and the runner do not share a binary.** Having proven "the runner is v0.145.0", it concluded `codex --version` was merely "reporting the npm wrapper" and that the probe's HTTP 400 was noise. In fact the probe's HTTP 400 was a *true statement about the probe's own client* — a different install, genuinely too old. Both halves were right about different binaries; the error was assuming one subject.

This is the same shape s1635 named in its own handoff — *"a probe sharing a defaulted parameter with its subject stops measuring the subject"* — recurring one level down. There the defaulted parameter was the MODEL; here it is the **PATH**.

## What must change (owed, not done here)

`scripts/fire.md` §2.0's probe recipe is wrong as written and will re-manufacture this wall. The probe must pin the runner's client rather than trusting PATH — resolve it the way the runner does, or read the version out of the newest run-log banner and refuse to conclude anything if the probe binary is below the `lane-runner-v3.sh:172` floor.

⚠️ A fire that runs the §2.0 probe verbatim today still gets a false confirmation. Until the law is amended, **probe with the explicit nvm v23.11.1 path shown above**, and treat a bare-`codex` failure as evidence about the fire shell only.

## Actions taken

- `tasks/CODEX-WALL` **deleted** (§2.0: "on success delete the flag"). Archived first to `logs/runs-archive/wall-evidence/CODEX-WALL-s1631-to-s1636-LIFTED.md` per the RETENTION LAW — the wall file is factory history, not debris.
- No wall-class failures remained to re-queue: the only one, `requeued-s1632-gpt55-rc1-…asset-diet-fallback-provenance`, was already re-queued and drained at `7f9340baf`.
- Refills resume unconditionally; masters no longer need the `CODEX: model=gpt-5.5 effort=high` header, though it remains harmless and `gpt-5.5` remains merge-quality per F-1634-3.

## Honest limits

This proves `gpt-5.6-sol` **served requests at 2026-08-10T19:11 local**. It does not prove no quota ceiling exists. The original s1631 message named a reset at *Aug 16*, which suggests a longer-period cap that the 18:17 runs and this probe nonetheless passed — most likely a shorter rolling window that had reset. **If a fresh run dies on a usage-limit message, re-raise the wall with that run's log quoted** — but do not re-raise it on a bare-`codex` probe failure, which is now a known-false signal.

# Heat 10 — controller parity field

Date: 2026-09-01 (Asia/Bangkok)

## Verdict

**STOPPED AT THE MANDATORY EARLY PROBE; NO RIDER RODE.** The exact live build and Era 5 registry were derived correctly, and the shim passed SSE, abort/EPIPE survival, and post-stop checks. The detached arena was then contaminated by an operator npm invocation that rewrote the engine-hashed lockfile. The probe honestly minted that altered engine identity, and production correctly refused it as `reel_not_current`. Heat 10's `skew → STOP` law fired before PI or Prime was called.

## Leveling delta

| Rig | Map | Heat 9 R2 | Heat 10 | Delta |
|---|---|---|---|---|
| PI 0.73.1 | The Claim | secured w10/300s/2g; verified rank 6 | no ride — preflight stop | n/a |
| PI 0.73.1 | Night Shift | best death w3/109.433s/5g | no ride — preflight stop | n/a |
| PI 0.73.1 | Hill Mine | best death w2/85.5s/15g | no ride — preflight stop | n/a |
| PI 0.73.1 | Baron | best terminal death w12/327.567s/5g; two walls | no ride — preflight stop | n/a |
| Prime Agent 0.8.0 | The Claim | secured w10/300s/0g; verified rank 8 | no ride — preflight stop | n/a |
| Prime Agent 0.8.0 | Night Shift | best death w5/161.067s/0g; one wall | no ride — preflight stop | n/a |
| Prime Agent 0.8.0 | Hill Mine | best death w3/90.1s/0g | no ride — preflight stop | n/a |
| Prime Agent 0.8.0 | Baron | three 20m walls; boss not reached | no ride — preflight stop | n/a |

## Probe and papers

- Registry gate: Era 5, build `c13b4c24d`, registered current engine `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`.
- Probe tape: `agent-0b91cbb4-6d32a7d9-c339-404e-90c1-ad5bce2e1e19`; secured w10/300s/200g; tape papers build `c13b4c24d`, Era 5, altered engine `1934d6e52b9a93cc25ecf55451c3f74a3b595c6eaca45d73a92812e6b91f8cc1`.
- Door verdict: `reel_not_current`; no WATCH reel exists for a refused submission.

## Controller parity and budgets

The transport-only controller runner, authoring capture, charters, and submission helpers were prepared inside the heat evidence directory. No rig authored controller source, selected per-turn mode, or called a ride scored. Therefore authored-controller banking, iterate transcripts, and notebook generations are correctly empty. Per-rig elapsed field time was 0 minutes; per-map elapsed field time was 0 minutes; all 90-minute and 4.5-hour ceilings were honored.

## Restoration and firewall

- Gold Rush changes are confined to `artifacts/gauntlet-heat10-20260901/**`; no source, spec, review, STATUS, BACKLOG, existing e2e, or git history was touched.
- PI and Prime global configs were not edited. Fresh isolated `/tmp/heat10-*-state` directories were used; there is nothing global to restore.
- The heat-owned shim stopped; post-stop curl rc 7. No heat-owned Prime daemon was started, so pre-existing Prime processes were untouched.
- The commons was not edited or pushed. It remains `main...origin/main [ahead 3]`; there are no Heat 10 commons commits to list.
- No secret value appears in evidence.

## What leveling changed

Nothing was measured: controller parity never reached either rig. The only valid Heat 10 result is a preflight DNF caused by operator contamination of an engine-hashed input. Re-running requires a fresh task authorization because this master explicitly makes any early-probe skew a terminal stop; the corrected premise is to install with the detached arena as cwd and prove `git status --short` clean immediately before minting the probe.

READY-FOR-GATES


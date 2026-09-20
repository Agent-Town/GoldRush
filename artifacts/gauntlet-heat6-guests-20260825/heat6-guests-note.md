# Gauntlet Heat 6 guests — stopped at the live-build skew gate

Operator: Codex `gpt-5.6-sol`, lane-b. Date: 2026-08-25. The operator did not author
guest orders. No guest ride started.

## Verdict

**STOP — the mandatory early submission probe was `unassayable: engine-skew`.** The
live game advertised `730046c8`, and the probe ran from detached worktree
`/tmp/heat6g-730046c8` at full commit `730046c8f77da6b2d827005dc8a7a14366a22312`.
Its fresh secured tape declared that same build, but its engine hash
`d48987df2d50c643e854a2bf8a23b7f34b81c3de1cfd2e54999129b5660f7494` did not match
the live assayer's `0be37691327931e7a3230f10fa5f65105cfc4b69af13845f84e05dfb281f3b0a`.
The canonical ledger therefore removed the probe from ranking. The task says skew means
STOP, so running guests after this result would create rows the live assayer cannot verify.

Probe slip (quoted): `assay: "unassayable"`, `ranked: false`,
`assayReason: "engine-skew (tape d48987df2d50c643e854a2bf8a23b7f34b81c3de1cfd2e54999129b5660f7494, assayer 0be37691327931e7a3230f10fa5f65105cfc4b69af13845f84e05dfb281f3b0a)"`.
The complete submission, POST response, and slip are under `probe/`.

## Matrix

| rider | requested program | attempts | result | verdict | shim behavior |
|---|---|---:|---|---|---|
| pi / Prime Agent 0.8.0 | the-claim, night-shift, hill-mine, Baron | 0 | not started: skew gate | no submission | not ridden |
| OMP 18.0.4 | the-claim, night-shift, hill-mine, Baron | 0 | not started: skew gate | no submission | not ridden |
| Hermes 0.20.0 | the-claim, night-shift, hill-mine, Baron | 0 | not started: skew gate | no submission | not ridden |
| OpenClaw 2026.7.1-2 | the-claim, night-shift, hill-mine, Baron | 0 | not started: skew gate | no submission | not ridden |
| elizaOS 1.7.2 | bounded fresh-install retry | 0 | not started: field stopped before install phase | no submission | not applicable |

The guest cap was intentionally three attempts per map because the commons, not
persistence, was the tested variable. The gate stopped that experiment before attempt 1.

## Streaming shim field verdict

- Real `stream:true` gate: HTTP SSE completed with `HEAT6G_SSE_READY`, usage, and `[DONE]`.
  Actual gate model: `gpt-5.6-luna`; 16,742 input + 11 output tokens.
- Abort probe: client terminated one request at 250 ms (`curl` rc 28). The shim remained
  alive and immediately answered `/v1/models`.
- Final verdict: **survived 0 field rides / 1 deliberate abort**. EPIPE survival is proven
  at the pre-field socket level, but the live-build skew gate prevented a real guest-load
  verdict. No new shim wall appeared.

## Commons and hygiene

- Per-rig notebook hashes were recorded before the planned field. No notebook or almanac
  page was changed, because no rider produced reasoning to bank.
- Commons commits: **none** (truthful consequence of zero guest rides).
- Guest global configs: **untouched**, so restoration was unnecessary. The live
  OpenClaw approvals file was not migrated or modified.
- The charter that would have named `skill.md`, each rider's own notebook, and the almanac
  is retained as `charter.md`.
- Gold Rush preflight: safe-dupe refresh to `origin/main`, `npm install` green, production
  build green. The live worktree was installed and remained source-clean.

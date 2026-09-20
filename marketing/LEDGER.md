# Marketing publication ledger

Status: INITIALIZED 2026-07-11. This records owner-visible publication packages, not every raw capture. Raw media stays cataloged in `marketing/raw/INDEX.md`, the ten-era master at `marketing/raw/gen/the-ten-eras-reel.mp4`, stream evidence in `marketing/raw/stream/manifest-latest.json`, and generated art in `assets/LEDGER.md`.

Publication is always owner-gated. `APPROVED` means the package may enter the one-way valve; it does not prove that it was posted. When posting cannot be verified from the repository, the public state remains `UNVERIFIED`.

| Package | Pillar | Attachment | Approval | Public state | Cost | Response notes |
|---|---|---|---|---|---:|---|
| `outbox/2026-07-10-01-revival-post.md` | brand / game | `raw/gen/chain-e1-to-e2.mp4` | APPROVED 2026-07-10 | UNVERIFIED | existing bank | — |
| `outbox/2026-07-10-02-ticker-week.md` | game / weekly roundup | final catalog screenshot still needs an exact path | APPROVED 2026-07-10 | UNVERIFIED | $0 | — |
| `outbox/2026-07-10-03-riders-teaser.md` | game / multiplayer | `artifacts/mp-03/desktop-chrome-alice-two-heroes.png` | APPROVED 2026-07-10; hold condition remains in package | UNVERIFIED | $0 | — |
| `outbox/2026-07-11-04-one-claim-ten-eras.md` | game / saga | `reel/one-claim-ten-eras-16x9-2026-07-11.mp4` | DRAFT — OWNER APPROVAL REQUIRED | NOT POSTED | $0 new spend | Codex X publication cut of Fable's ten-era master; 41.1s, 1280×720, concept reel |

## One-way valve

Factory drafts in `marketing/outbox/` → owner approves the exact copy and attachment → a fire copies the approved package into `agenttown-social/approved/` → the Courier drafts/notifies or posts at its owner-set rung. Drafts never cross that boundary.

## Pilot QA — `one-claim-ten-eras`, 2026-07-11

- Delivery: 41.10s, 1280×720, 24fps, H.264 High + AAC stereo, 39,759,881 bytes, fast-start MP4.
- Integrity: full decode completed with zero media errors; integrated audio is −19.5 LUFS with −6.0 dBFS true peak.
- Canon/privacy: concept material only; no obsolete male Hero, children, profiles, firearms, gore, or peoples-as-enemies appear.
- Continuity: the E7→E8 source was trimmed before its generated label appears; E8→E9 uses an intentional dip-to-black because Red Fields is a departure to another world, not a valley evolution.
- Visual review: the first candidate's hard title mattes and accidental upper-frame seam were corrected. A fresh blind frame-and-crop review passed the final candidate with no blocking defects; title margins pass common 5% safety, with a noted conservative 10% title-safe caveat.
- SHA-256: `b6895b394e8243d0610cde958990c2ab0a13fe7ad32af924e40cae4cfe9e9751`.

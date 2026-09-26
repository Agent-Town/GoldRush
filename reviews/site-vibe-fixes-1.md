# Drain review: `site-vibe-fixes-1`, the landing page's art becomes files, its share card becomes art, its footer loses the token link (Opus 5.5 implementer at max effort; F-VIBE-2/-3/-5)

**Branch** `feat/site-vibe-fixes-1` at `05d989a65` · **merge** `b79e80acf` · engine hash unchanged (`642edcf6`, no pin) · drained attended 2026-09-26 13:45Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `svf1`).

**Verdict: LANDED.**

## What it does
The landing page (`site/index.html`) carried its three best illustrations only as base64 inside the HTML, pointed its share card at a HUD-cropped game frame, and linked a token chart from its footer. Now the three illustrations are byte-exact files under `site/assets/` (the heroine with her pan before a ridge of walkers, the heroine mid-fight, the Calculating House's glass hall; 1200x800 each; the page shrinks from 938,556 to 17,735 bytes), `og:image` and `twitter:image` point at a real 1200x630 share card made from the heroine-with-pan illustration by a committed, reproducible script (`scripts/site-share-card.mjs`, sharp), and the footer's token-chart link is gone, as the brand book §5 forbids token, crypto and price talk. Nothing else on the page changes.

## Evidence (the implementer's runs on the branch; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| byte-exactness of the three files | each decode re-encodes to the page's base64 exactly; each equals the decode of the base's string (Buffer.equals + SHA-256, plus an independent cmp); the HTML diff is exactly the three src values |
| share card | 1200x630, 223,899 B, `scripts/site-share-card.mjs --check` reproduces it byte for byte |
| site guards | 11 of 11; a negative control with one file missing reds the contract guard by name |
| build | rc 0 before and after; engine hash unchanged (no engine input touched) |
| render identity | desktop pixel-exact (0 px) for every non-footer pair over three runs; at 390 px only the footer differs strongly, the rest within Chromium full-page capture flicker at DPR 2.75 (F-SVF1-1) |
| node-guards | 1,037 tests, 1,027 pass, 5 fail, each reproduced identically on a clean control worktree at the base (desk-declaration refusing a stale linked worktree; two ledger-backup-pull rows and the sweep survivor from the missing `.env.local`; contention quiet on both) |

## Merge classification
Base `afd7393e9`; the branch touches only `site/index.html`, new files under `site/assets/`, `scripts/site-share-card.mjs` (new) and `artifacts/site-vibe-fixes-1/**`; main moved on none of them. LANE-TOUCHED only.

## Findings
- **F-SVF1-1 (non-blocking):** the 390 px capture comparison is bounded by Chromium's full-page flicker (up to 31 levels) and a raster shift when the page gets shorter at DPR 2.75; a height-matched control run closes it for anyone who needs the 390 px proof to zero.
- The site is deployed by `bash scripts/deploy-site.sh` after the fast-forward, by hand; `land.sh` deploys the game only. The drain verifies the live `og:image` tag and the three image URLs after that deploy.
- **F-SVF1-2 (owner's desk, taste):** the card's crop keeps the hat and the walkers and loses the gold in the pan; one number in the script reframes it. Declared by the cure.
- **F-SVF1-3/-4/-5/-8 (non-blocking):** the legacy page still uses the old key art as its own share card; the hero image's alt text; the cost chart and the JSON-LD `"price": "0"` blocks are kept (not token talk); optional alt tags on the card. Attended follow-ups for the next site pass.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 148 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1037 ℹ pass 1031 ℹ fail 1 ℹ skipped 5  13:45Z` |
| engine hash | `merged: 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a (pinned 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a)` |

## Deploy (attended, 2026-09-26 14:10Z)
- `bash scripts/deploy-site.sh` rc 0: the `agenttown` Pages project DEPLOYED (`https://39904ac3.agenttown.pages.dev`); `https://agenttown.pages.dev/` now serves the new page (`og:image` → `share-card.jpg`).
- **The live front page at `https://agenttown.app/` is NOT that project.** It is the droplet's nginx, `root /opt/goldrush/site` (`docs/ops/agenttown-server.md:20`), and that tree is synced by the GAME deploy (`scripts/deploy.sh` rsync `--include=/site/***`, line 401), so the live page still served the 2026-09-20 copy at this stamp (old `og:image`, the four image paths answering the old index as a fallback, one `dexscreener` hit). It updates at the next game deploy, which is the `charter-press-locked-lands-1` landing queued right behind this one; the drain verifies the live tags and the four image URLs after that deploy (F-SVF1-9: the site's own deploy script does not reach the host that serves the site).

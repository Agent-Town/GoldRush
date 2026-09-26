## What it does
The landing page (`site/index.html`) carried its three best illustrations only as base64 inside the HTML, pointed its share card at a HUD-cropped game frame, and linked a token chart from its footer. Now the three illustrations are byte-exact files under `site/assets/` (the heroine with her pan before a ridge of walkers, the heroine mid-fight, the Calculating House's glass hall; 1200x800 each; the page shrinks from 938,556 to 17,913 bytes), `og:image` and `twitter:image` point at a real 1200x630 share card made from the heroine-with-pan illustration by a committed, reproducible script (`scripts/site-share-card.mjs`, sharp), and the footer's token-chart link is gone, as the brand book §5 forbids token, crypto and price talk. Nothing else on the page changes.

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

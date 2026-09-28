# Report: site-vibe-fixes-1 (F-VIBE-2 share card, F-VIBE-3 illustrations as files, F-VIBE-5 footer token link)

**READY-FOR-GATES.** All five scope items are done, and three commits carry the site change. The landing's three illustrations are now byte-exact files. `og:image` and `twitter:image` point at an illustrated 1200x630 card built by a committed script. The footer's token link is gone. Desktop renders pixel-exact apart from the footer in every comparison over three runs. At 390 px the only strong differences sit in the footer, with a measured capture caveat (F-SVF1-1, non-blocking). No deploy, no live request, no new dependency.

- **Branch:** `feat/site-vibe-fixes-1` in `/Users/robin/Claude/Projects/wt-svf1`, base `afd7393e9` (F-SVF1-7 on the master's `be37d83cf`).
- **Implementer:** Claude Opus 5.5, at maximum effort.
- **For the drain:** after landing, the drain runs `scripts/deploy-site.sh`, which copies `site/.` into a stage and deploys it to the Pages project `agenttown`. The four new files under `site/assets/` ride that copy. Nothing here deployed anything, and nothing requested the live site, the county or the droplet.

## Pre-flight, as the master writes it
- `git status --short` showed only `?? node_modules`, the untracked symlink; no tracked file was modified.
- `git log main..HEAD` was empty. HEAD `afd7393e9` is an ancestor of main `ddbca2fa0`.
- `node_modules` was present, so no install was needed.
- `npm run build` ran before any change, under the drain lock: **rc 0** (tsc clean, vite built, asset-diet completed), 10:55Z at load 27.

## Premises, checked against the files before building on them
All of them hold as the master cites them:
- `site/index.html:13` and `:50` are `og:image` and `twitter:image`, pointing at `https://agenttown.app/assets/gold-rush-key-art.jpg`.
- `:164`, `:176` and `:191` are the three `data:image/jpeg;base64` images.
- `:237-240` is the footer, with the dexscreener link at `:239`.
- `docs/marketing/launch-video/treatment.md:252` is the F-VIBE-3 gap.
- `docs/marketing/BRAND-BOOK.md:31` is the §5 NEVER line.
- `sharp@^0.34.5` and `pngjs@^7.0.0` are declared devDependencies in `package.json`.

The vibe report does not rank the three illustrations against each other. Its only judgement among them is that the third "reads uncanny" (`artifacts/launch-video-vibe-check-1/viewing-log.md:82`, F-VIBE-4), so the master's default holds: the card is made from the heroine with her pan.

## Item 1 (F-VIBE-3): the illustrations become files. Commit `16c090887`
Each image is decoded from the page into `site/assets/`, and the same `<img>` tag now points at the file (relative `assets/...`, because `scripts/site-contract.test.mjs` documents that it cannot resolve a root-absolute path). The alt text is unchanged. The tool is `artifacts/site-vibe-fixes-1/extract-illustrations.mjs`: it maps images by alt text, never by position, and refuses to overwrite a file.

| File | Bytes | Pixels | Was | SHA-256 |
| --- | ---: | --- | --- | --- |
| `site/assets/heroine-with-pan-before-ridge-of-walkers.jpg` | 211,205 | 1200x800 | `:164`, the hero | `e1fe9e89e68869995fa39858cee5ecf7b434e0e23e7db3fd1b269beb476b6415` |
| `site/assets/heroine-mid-fight.jpg` | 208,743 | 1200x800 | `:176`, the For hands door | `a84a9dd5df040a7be0839d148910b1b95c088608bcee90b07eb064d3cb086aa4` |
| `site/assets/calculating-house-glass-hall.jpg` | 270,568 | 1200x800 | `:191`, the For minds door | `bf1d4ce2f7d0eab123d9b80255365d6c3cbd1b014d33b37f5939c973a393d8f6` |

All three are baseline sRGB JPEGs with 4:2:0 chroma and no ICC profile or orientation tag. ImageMagick estimates their quality at 62, 62 and 86. The third keeps the small EXIF and IPTC blocks it carried inline, because the copy is byte-exact.

**Byte-exactness, three independent ways:**
1. Each decoded buffer re-encodes to the page's base64 string exactly: 281,608, 278,324 and 360,760 characters. Node's decoder silently skips characters outside the alphabet, so a lossy decode would show here.
2. Each file equals the decode of the base revision's string, by `Buffer.equals` and by SHA-256 (`extract-illustrations.mjs --verify`).
3. `cmp` of each file against a separate decode made in the session scratchpad before any worktree change: rc 0, three times.

The extraction commit changes nothing else. `--verify --at 16c090887` reports `pageEqualsBaseWithOnlyTheThreeSrcSwaps: true` with 0 other lines differing. At the branch tip, the only lines that differ beyond those swaps are `[13, 50, 239]`, which are items 2 and 3.

`site/index.html` drops from 938,556 bytes to 17,913, and is 17,735 at the tip. A first visit now fetches 708,251 bytes (17,735 of HTML plus 690,516 of images) instead of 938,556: 24.5% fewer before compression, because the base64 overhead is gone.

**The contract guard sees the new references.** A negative control in a scratch copy, with `heroine-mid-fight.jpg` moved aside, reds `scripts/site-contract.test.mjs` by name: `index.html <img> points at "assets/heroine-mid-fight.jpg" but nothing exists there`.

## Item 2 (F-VIBE-2): a real share card. Commit `a7c75b5cd`
`og:image` and `twitter:image` (`:13`, `:50`) now read `https://agenttown.app/assets/share-card.jpg`.

- **The card:** `site/assets/share-card.jpg`, 1200x630, 223,899 bytes, baseline JPEG at quality 88, sRGB, no metadata, SHA-256 `ed192fe5059ab979645e4c0632d15aabd58642480407bbdc0674afdc890700bf`. It is illustrated, with no HUD and no text.
- **The command that reproduces it:** `node scripts/site-share-card.mjs`, run from the repository root. It uses sharp 0.34.5 (libvips 8.17.3), already a devDependency, to crop `1200x630+0+8` from `site/assets/heroine-with-pan-before-ridge-of-walkers.jpg` and encode at quality 88 with 4:2:0 chroma, optimised Huffman tables and no metadata.
- **The check:** `node scripts/site-share-card.mjs --check` rebuilds the card in memory and exits 1 unless it matches the committed card byte for byte. Two separate runs wrote identical bytes, and `--check` printed `identical: true` (rc 0).

**The frame, measured.** The plate is 1200x800, and a card keeps every column and 630 of the 800 rows. The hat's first dark row is 23: the first row with 8 or more pixels at luma under 100 across x 140 to 400. The gold in the pan sits in rows 680 to 728, where bright-yellow pixels per 10-row band peak at 46, 88, 74, 41 and 33, against 4 to 31 per band on the rim above. Holding both would take 706 rows, so no full-width card can.

The landing already answers this for the same plate: its hero frames the image with `object-position: 40% 5%` (`site/index.html:74`). In a 1200x630 cover box that starts 5% of 170, or 8.5 rows, down. The script floors that to 8, so the re-encode stays on the original's 8-pixel luma block grid. The card keeps the whole hat with sky above it, her gaze toward the ridge of walkers and the smoking locomotive, the teal beacons, and the pan's rim in her hand at the bottom edge. The gold does not fit. `artifacts/site-vibe-fixes-1/card-candidates.jpg` renders the alternatives from the same plate: crops at 8, 40, 70 and 110, and the whole plate on parchment or on ledger-ink with bars. Reframing is one constant, `TOP`, in the script (F-SVF1-2).

**The quality, measured** (PSNR of the re-encoded crop against the decoded crop; every setting encoded deterministically):

| Quality | Bytes | PSNR (dB) |
| ---: | ---: | ---: |
| 75 | 190,586 | 35.36 |
| 80 | 199,286 | 40.82 |
| 85 | 210,835 | 39.20 |
| 88 | 223,899 | 42.26 |
| 90 | 239,762 | 42.72 |
| 92 | 246,389 | 43.27 |
| 95 | 289,059 | 44.86 |

Quality 88 avoids compounding the plate's own quality-62 artifacts; 90 would cost 16 KB more for 0.46 dB.

**`gold-rush-key-art.jpg` stays in place.** Its SHA-256 `66afee3f35c4...` is unchanged, and no existing file under `site/assets/` was modified or deleted. What else references it, by `git grep`:
- `site/index-legacy-2026-08-13.html`, four times: `:18` and `:25` (that page's `og:image` and `twitter:image`), `:26` (a preload) and `:52` (its `<img>`). This page still deploys with `site/` (F-SVF1-3).
- `scripts/gazette-scan-space-guard.test.mjs:62`, as a sample path that `isPlayerPath` must accept.
- History and evidence only: `artifacts/launch-video-vibe-check-1/report.md:70` and `viewing-log.md:78`, `tasks/BACKLOG.md:3909`, `logs/session-scratch/s1231-F-1231-1-mutation-battery.md:66,90,91`, `logs/session-scratch/s1326-backlog-now.md:504`, `artifacts/f1541-2-pricing/fixture-s1529/tasks/BACKLOG.md:1115`, and this task's master.

`site/index.html` no longer references it.

## Item 3 (F-VIBE-5): the token link goes. Commit `21fe841e4`
The commit message quotes `docs/marketing/BRAND-BOOK.md` §5 Voice: "NEVER: tokens/crypto/price talk".

**The removed reference**, from `site/index.html:239`, is the separator and the link (164 characters):
` &nbsp;&middot;&nbsp; <a href="https://dexscreener.com/solana/3mnazsjrmgiz7jvvwe6icw4uscg4zjfefw2gmaexzxvi" target="_blank" rel="noopener noreferrer">$AGENTTOWN</a>`
The line now ends `<a href="#standings">Standings</a></span>`, and Play, The Gauntlet and Standings stay exactly as they were.

**The master's grep over the page's text**, with the base64 blanked first so that base64 letters cannot false-match:

| Pattern | Before | After | What the hits are |
| --- | ---: | ---: | --- |
| `dexscreener` | 1 | 0 | the footer link (`:239`), removed |
| `token` | 0 | 0 | |
| `$` | 1 | 0 | `$AGENTTOWN` (`:239`), removed |
| `solana`, `crypto` | 1, 0 | 0, 0 | the link's URL, removed |
| `AGENTTOWN` (case-sensitive) | 1 | 0 | the ticker, removed; the 10 case-insensitive hits left are the domain `agenttown.app` |
| `chart` | 5 | 5 | kept: the county board's cost-versus-waves canvas (`:135-137`, `:230`, `:232`), gated by `e2e/cost-column.spec.ts` |
| `price` | 2 | 2 | kept: the JSON-LD `Offer` blocks declaring the game and the benchmark free, `"price": "0"` (`:33`, `:43`) |

The last two rows are neither token nor price talk, and item 4 keeps the page's structure (F-SVF1-5). The rest of `site/` carries no token reference: `index-legacy-2026-08-13.html`, `news.html`, `llms.txt`, `robots.txt`, `sitemap.xml`, `assay-office.js`, `standing-rule.js` and `styles.css` have 0 hits for dexscreener, `$AGENTTOWN`, solana, crypto, pump.fun, raydium, jupiter and birdeye.

## Item 4: nothing else on the page changes
- **The page's lines:** beyond the three `src` swaps, exactly `[13, 50, 239]` differ from the base (`extract-illustrations.mjs --verify`). Copy, structure, CSS, the JSON-LD and every other line are byte-identical.
- **The headers:** `public/_headers` is untouched, and the security-headers guard is green.

## The rendered page, before and after: desktop and 390 px
The harness is `artifacts/site-vibe-fixes-1/capture-compare.mjs`. It serves four builds of `site/` on ports 5661 to 5664: the base `afd7393e9`, then the tree after each of the three commits. It captures full pages in the repo's own e2e shapes (`Desktop Chrome` 1280x800, and `Pixel 5` 390x844 at device pixel ratio 2.75, both on `channel: 'chromium'`), plus a `Pixel 5` at ratio 1, in light and in dark.

The page's calls to `agenttown.app` (7 per capture, all `/api/standings`) are answered locally with `200 {"ok":false}`. That drives the page's own "the wire is quiet" state, and nothing leaves the machine.

It ran three times under the drain lock (logs in `capture-runs/`). The committed `capture-compare.json` and `shots/` come from run 4 (batch 4): 36 captures in 48 s at load 9, one fresh browser per capture, and a second capture of the base and the tip as self-controls. Every capture had 0 console errors, 0 page errors and 0 aborted requests. Every local file was served 200 at its exact byte size, with 0 not-found. All three images loaded at 1200x800.

**Desktop is pixel-exact apart from the footer, in every comparison of all three runs:**
- base to files: 0 px, light and dark;
- files to card: 0 px, light and dark;
- the self-controls: 0 px.

The footer step changes 1,616 pixels, all in rows 2096 to 2107 at x 757 to 1136: the right-hand links, which shift right under `space-between` once the ticker is gone. The page height is unchanged at 2174. See `shots/footer-before-desktop-light.png`, `shots/footer-after-desktop-light.png` and `shots/footer-diff-desktop-light.png`.

**At 390 px every strong difference sits inside the footer, which loses exactly one line.** The footer's top is unchanged (CSS 3000.125). Its bottom moves from 3108.41 to 3089.98, a loss of 18.42 px, which is one line of the 11.52 px mono at line-height 1.6: without the ticker, the right-hand links fit on one line. The page height changes from 3172 to 3154, the same 18 px. `shots/footer-diff-mobile390-light.png` paints only the separator dot and `$AGENTTOWN` red. At ratio 2.75 in run 4:
- Base to files and files to card match exactly (0 px) in both schemes.
- Every pixel that moved 17 or more levels sits in device rows 8470 to 8537, inside the footer band (2,145 pixels in light, 2,148 in dark).

What is not exact at 390 px is F-SVF1-1, below.

**Full pages:** `shots/before-desktop-light.jpg` and `shots/after-desktop-light.jpg` (1280x2174), and `shots/before-mobile390-light.jpg` and `shots/after-mobile390-light.jpg` (390x3171 and 390x3153, scaled from the 2.75 capture to CSS width).

## Gates
| Check | Result |
| --- | --- |
| `npm run build` before any change (tsc + vite + asset-diet), under the lock | rc 0, 10:55Z, load 27 |
| `npm run build` after, under the lock | rc 0, 11:09Z, load 37 |
| `node --test scripts/site-contract.test.mjs scripts/site-security-headers.test.mjs` | 11 of 11, rc 0 |
| the two other guards that read `site/`, outside the battery roster (`standing-rule-surfaces`, `gazette-scan-space-guard`) | 10 of 10, rc 0 |
| `bash scripts/test-deploy-site-contract.sh` (`deploy-site.sh` untouched; wrangler stubbed) | PASS, rc 0 |
| `node scripts/site-share-card.mjs --check` | identical, rc 0 |
| `extract-illustrations.mjs --verify`, at `16c090887` and at the tip | 3 of 3 files byte-exact, rc 0 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, under the lock (11:09Z to 11:27Z, load 37 falling to 6) | 1,037 tests: 1,027 pass, 5 fail, 5 skipped. **All 5 reds reproduce identically on a clean control worktree at the base** (table below) |
| engine hash | `642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a` before and after, equal to the pin in `assets/engine-era.json`; none of its inputs is touched |
| em and en dashes in every file this task wrote | 0 (the copied logs keep the tools' own output verbatim) |

**The five battery reds, attributed by a control run.** The control was a detached worktree at `afd7393e9` (main at the branch point, clean), made in the session scratchpad without `.env.local`, exactly like this worktree. The red files ran on both trees, side by side and under the lock (`controls/`, `batches.txt`). The control worktree was removed afterwards; its `node_modules` symlink was unlinked first, and the shared `node_modules` is intact.

| Red | This branch | Clean control at the base | Cause |
| --- | --- | --- | --- |
| `desk-declaration-guard.test.mjs:163`, the live board is green | ✖ REFUSING | ✖ REFUSING, identical | A linked worktree whose STATUS.md line 1 (sha256 `3e434b4ed5ea`) is not main's (`ea1e68ec2a72`). The branch never touches STATUS.md, and the merged tree carries main's. |
| `ledger-backup-pull.test.mjs:11`, dry run prints a bounded plan | ✖ `GR_DROPLET_HOST missing` | ✖ identical | No `.env.local` in a worktree (never read or copied here). |
| `ledger-backup-pull.test.mjs:18`, today's local backup makes the pull a no-op | ✖ same | ✖ identical | Same. |
| `fixture-teardown.test.mjs:34`, the sweep | ✖ 1 survivor, `s2672-dest-*` | the offending child alone, `ledger-mirror-freshness-guard`: 24 of 25 and 1 survivor on both | Its test 23 fails at `:266` ("the pull must write to the destination in force, got:" empty), which is the same missing host, and leaves its fixture behind. |
| `node-guards-contention.test.mjs:124` | ✖ in the battery, "CONTENDED, 2 concurrent batteries" | ✔ run quietly, on both trees | Another battery ran beside this one on the host. |

## Findings (none blocks)
- **F-SVF1-1 (non-blocking; the capture instrument at 390 px):** Chromium's full-page captures of this page are not bit-stable, measured over three runs:
  - Random captures of one build differ from that build's other captures in the image band by up to 31 levels: 38,647 pixels at max 10, 127,300 at max 31, and 379,255 at max 6. This happened with one browser for every capture and with a fresh browser per capture.
  - At device pixel ratio 2.75, the shorter page rasterizes the images above the footer slightly differently: 5,270 weak pixels at max 15 in light and 5,120 at max 2 in dark, the same count in runs 3 and 4. At ratio 1 it does not.

  So at 390 px this task shows every strong difference inside the footer and exact matches where the captures are stable, but not an exact match of every row above the footer at ratio 2.75. **The cure someone can run later:** the committed revision of `capture-compare.mjs` adds three captures per build, where identical means any capture of one build matches any capture of the other exactly. It also adds the height-matched control: the tip captured with the lost 18.42 px added as padding below the footer, so only the page height is restored. Its batch was queued and withdrawn on the attended session's word to free the drain lock. Command: `node artifacts/site-vibe-fixes-1/capture-compare.mjs --port 5661 --scratch <dir outside the repo> --reps 3`, under `scripts/attended/dlock.sh`.
- **F-SVF1-2 (the owner's eye): the card keeps the hat, not the gold.** The measured trade-off is above. `TOP = 70` shows the gold's top half with 47 rows of the crown clipped; `TOP = 110` shows all of it with the crown gone. Change the constant, rerun the script and commit the card. `card-candidates.jpg` shows each option.
- **F-SVF1-3 (attended): the legacy page still shares the HUD frame.** `site/index-legacy-2026-08-13.html:18` and `:25` still name `gold-rush-key-art.jpg` as the card, and `deploy-site.sh` deploys that page too, because it copies all of `site/`. It is outside TOUCH-ONLY. Cure: point its two tags at `share-card.jpg`, or retire the page on the owner's word.
- **F-SVF1-4 (open from F-VIBE-4): the hero's alt text still calls the heroine a prospector.** It reads "A prospector on a river gold-claim...", the agent's word (`lore/characters.md`). Item 4 keeps copy unchanged, so it waits for the site copy pass.
- **F-SVF1-5 (the owner may overrule): two grep classes were kept.** The `price` hits are schema.org `Offer` blocks saying the game is free, structured data for search engines that a visitor never sees. The `chart` hits are the county cost chart. If the owner reads the `Offer` blocks as price talk, deleting them is a one-line change each.
- **F-SVF1-6 (ops, after the deploy): scrapers cache cards by URL.** The card's URL is new, so a fresh share fetches it, but posts shared before the deploy keep the old card until their platform re-scrapes. I made no live request, so the deployed URL stays unverified until the drain deploys.
- **F-SVF1-7 (the master): its named base is one commit early.** The master says the branch was cut from main at `be37d83cf`. It was cut at `afd7393e9`, the next commit, which authored this master. No effect.
- **F-SVF1-8 (optional): the head has no card alt text or size tags.** It carries no `og:image:alt`, `twitter:image:alt` or `og:image:width`/`height`. Platforms measure the image themselves, but alt text helps screen readers in feeds. Item 4 kept the head unchanged; each tag is a one-line addition if wanted.
- **The film's phase 2 (F-VIBE-3's other half):** the originals now live in this repository at the SHA-256s above. Mirroring them into the art store, which F-VIBE-3's cure also named, is outside this firewall.

## Where I adapted the master
- **The card's frame:** the master named the plate but not the crop. The crop follows the landing's own `object-position` for that plate, with the measurements and the alternatives recorded (F-SVF1-2).
- **The 390 px comparison:** the instrument turned out not to be bit-stable. I added a self-control, a ratio-1 shape and one fresh browser per capture, and I report the rest as F-SVF1-1 on the attended session's word instead of waiting longer for the lock.
- **The live county:** captures answer it locally rather than aborting, so the console stays clean where an abort would log `net::ERR_FAILED`.
- **Commit trailers:** each message carries the `Claude-Session:` line, as the vibe check's commits do, and ends with the master's `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line.
- **Kept on purpose:** the `chart` and `price` grep hits (F-SVF1-5).

## Evidence in `artifacts/site-vibe-fixes-1/`
- `extract-illustrations.mjs`: the extraction and its verifier.
- `capture-compare.mjs`: the capture harness (committed revision, unrun; see F-SVF1-1).
- `capture-compare.json`: run 4's facts and comparisons.
- `capture-runs/`: the logs of runs 2, 3 and 4.
- `shots/`: 4 full-page JPEGs (218 KB to 359 KB) and 6 lossless footer bands (8 KB to 30 KB).
- `card-candidates.jpg`: 335 KB.
- `node-checks.out.txt`: the node-only checks.
- `node-guards-battery.log`: the full battery, 196 KB, scanned for hosts and secrets (0 found).
- `controls/`: the red rows on the branch and on the control.
- `batches.txt`: the lock batches with their times and loads.

## Commits (branch `feat/site-vibe-fixes-1`)
- `16c090887` feat: the landing's three illustrations become files (F-VIBE-3)
- `a7c75b5cd` feat: an illustrated share card for the landing (F-VIBE-2)
- `21fe841e4` feat: the token link leaves the landing's footer (F-VIBE-5)
- The next commit holds this report and its evidence.

## REMAINING LIST IN ORDER
1. **The drain:** gates on the merged tree, then a path-scoped merge.
2. **After landing, the drain runs `scripts/deploy-site.sh`.** When a live look is allowed, confirm that `https://agenttown.app/assets/share-card.jpg` answers 200.
3. **Optionally, the F-SVF1-1 cure:** the controlled capture under the lock, about 2 minutes once admitted.
4. **Owner:** F-SVF1-2 (the hat or the gold) and F-SVF1-5 (the `Offer` blocks).
5. **Attended:** F-SVF1-3 (the legacy page's card), F-SVF1-4 (the hero alt text, with the site copy pass), optionally F-SVF1-8, and the originals into the art store if the film wants them there.

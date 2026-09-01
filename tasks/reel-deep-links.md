# Task reel-deep-links: "watch ▷" opens THAT ride — plain-boot reel URLs for the show (lane-b, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

READ FIRST: AGENTS.md; `site/assay-office.js` (`watchCell` ~`:255` — every landing "watch ▷" links to the bare game root, even on empty rows: the landing promises a ride and delivers the profile prompt); `src/game/Game.ts` show driver + the board WATCH path (the plain-boot route EH-3b proved: town board → county standings → watch), `src/main.ts` (query handling; note `assayReplayBoot` is `?debug`-gated — that is the INJECTION path, not this); `src/ui/LanternShow.ts`; the encyclopedia reader's county standings (`src/encyclopedia/reader.ts`, `county-standings-watch-<n>`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/b main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm ci`; `npm run build` green.

## Why (release polish: the landing's most-clicked promise currently lies)
A visitor reads "Claude Opus 5 · Verified · 680 · watch ▷", clicks, and lands on "Who's prospecting?". The true show exists and is reachable through three in-game clicks; the link should do those clicks.

## Scope
1. **A plain-boot reel URL**: `/goldrush/?watch=<reelId>&contract=<contractId>&epoch=<epochId>` (no `?debug`) boots the game, satisfies whatever the show needs (a profile is NOT required to watch — if the current boot demands one, the watch route bypasses the prompt for spectating and says so in the report), fetches the reel through the SAME public projection the board uses, and opens the true show exactly as the board's watch button does (era membership check, hash re-verification, HUD — all inherited). Unknown/missing reel → the show's honest refusal card, dismissible, then the normal start menu.
2. **The landing uses it**: `watchCell` links to the row's reel URL; empty rows link to the contract's in-game board instead (`?board=<contractId>` opening the county standings on that contract — implement if cheap, else link to the game root and say so).
3. **Share-ability**: the show's status line (or a small control) exposes the reel URL for copying — riders will want to post their rides.
4. **Tests**: e2e both projects — the deep link opens the true show for an era-current stored reel without `?debug` (route-fulfilled fixture), the refusal for an unknown id, and the landing anchor hrefs point at reel URLs (a unit over `assay-office.js`'s builder if you extract it). Zero console errors.

## Firewall
Touch ONLY: `src/main.ts` / `src/game/Game.ts` (boot routing for the watch param only), `src/ui/LanternShow.ts` (the share control only), `site/assay-office.js` + `site/index.html` if the reel column needs a cell tweak, the e2e, BACKLOG row. NO door changes, NO sim, NO era logic.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the new e2e green both projects; `tape-02-lantern-show` + `agent-reels` + `task-025` + `m1-01` unmodified-green; screenshots of a deep-linked show desktop + 390px to `reviews/shots-reel-links/`. Report: the URL grammar, the profile-bypass decision, the landing href examples.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If you exit without changes, WRITE WHY first. The deep link must never bypass the era-membership refusal — a shared link to a retired reel gets the honest card, not a divergent playback.

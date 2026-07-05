# Task 018: FULL-SUITE EVIDENCE RUN on Robin's Mac (MAIN folder, run NOW — unblocks the merge funnel)
You are Codex on Robin's Mac (native env, no walls). The sandbox gate fires cannot fit a 22-file regression + provisioning in 15 minutes; you CAN run it natively. This task produces EVIDENCE ONLY.
1. On the CURRENT main working tree (contains landed-but-ungated outputs: 013 tune, possibly 016 sprite fixes, 017 art files): `npx tsc`, `npm run build`, then the FULL Playwright regression, all spec files, desktop-chrome, --workers=1 (add mobile-chrome for vp-04/polish specs if present).
2. Write results to reviews/evidence/mac-fullsuite-$(date +%Y%m%d-%H%M).md: per-file pass/fail counts, every failure's name + first error line, tsc/build status, node/playwright versions, total runtime. Also append per-direction cycling matrix from the 016 e2e if it exists.
3. Commit ONLY that evidence file (git add reviews/evidence/... && git commit -m "evidence: mac full-suite run <date>"). Touch NOTHING else.
4. End: EVIDENCE-COMMITTED + one-line verdict (ALL GREEN / N failures listed).

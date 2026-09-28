# Audio music toggle: s2736 detached drain review

**Slice / branch / tip:** audio-music-toggle-1, sol/wave-lane-b at f2cdc6533462af167ecb363c3c461acb32008133; candidate c2ac179b1ecd05e25659c0903b07f14f0ef56c1a, saved as save/s2736-audio-toggle. Main base 9a809c63159fadc7e028fe2f98cc73e98d038768; merge base bbabf5617b0efca0b3bd0c5bf52d0797524f6909 (September 24).

**Verdict: HELD — browser and build gates pass; full integration gates remain unrun.** No source landing, goal closure, engine pin or deploy.

The player gets a Music on/off button in the run HUD, town bar, returning-player menu and first-boot card, with a synchronized Settings checkbox. It preserves the volume slider, stops only music, avoids downloads while off and stores the preference per profile. The source continuation fixed the actual profile registry; the earlier two failing isolation cases now pass. On a plain /?contract=the-claim boot, both viewport buttons receive their centre hit and preserve off across reload. Phone geometry is exactly 44 by 44 px; desktop 77.17 by 44 px. The plain phone screenshot was inspected directly.

| Check | Fresh result | Evidence |
|---|---|---|
| Detached installation | npm ci rc 0; tracked and untracked clean before merge | artifacts/s2736/npm-ci.txt; npm-ci-clean.txt |
| TypeScript / normal build / E1 build | all rc 0 | artifacts/s2736/static-gates.txt; release-gates.txt |
| E1 first-town payload | 34,352,905 B, below 52,000,000 B | artifacts/s2736/release-gates.txt |
| Own plus task/minimum adjacent browser suites | 74/74, desktop and phone, workers=1; includes own 10/10 | artifacts/s2736/browser-gates.txt |
| Plain run and reload | 2/2; zero console/page errors; ordinary clicks | artifacts/s2736/plain-gates.txt; plain-candidate/ |
| All ten own-suite error records | empty | artifacts/s2736/audio-error-records.json |
| Same-session frame interval p95, desktop | candidate 9.9 ms, clean main 10.0 ms; ratio 0.990 | artifacts/s2736/performance-comparison.json |
| Same-session frame interval p95, phone | candidate 9.7 ms, clean main 9.6 ms; ratio 1.0104 | same |
| Draw calls | candidate/control 84/84 desktop, 60/60 phone; stress test below 200 passed | plain comparison and browser gates |
| Pause slider geometry | needs scrolling at both 1280x800 and 390x844 | artifacts/s2736/pause-panel-*.json |
| Short non-browser gates | power budget, task guards, citations, gate callers: 4/4 | artifacts/s2736/remaining-short-guards.txt |
| Candidate evidence budget | 7.7 MB added, below 40 MB; no blob above 50 MB | artifacts/s2736/candidate-evidence-budget.txt; large-blobs.json |
| Full Node and diff-selected wrapper | NOT RUN in this fire | blocking remainder below |

**Merge classification.** All 53 changed paths are classified in artifacts/s2736/classification.json. Main also moved src/game/ProfileStorage.ts and src/town/TownScene.ts; both merged cleanly, and the merged hunks were inspected to preserve main's newer profile keys and town changes. Three add/add conflicts were regenerated artifacts/056 screenshots; main's copies were retained. All remaining paths are lane-only or new. No existing e2e assertions were changed by this drain. Store HEAD and main both remain 5793a967da46e8f00c0ba16f92f17dc10d36558d, clean. No final engine hash was measured.

**Adaptations and limitations.** The source HUD test uses debug parameters, so the drain added a separate plain-run probe under artifacts/s2736. Its first invocation failed before test collection because the inherited globalSetup path was relative to the nested config; the probe now resolves that same setup file explicitly. The initial rc 1 and corrected 2/2 receipt are both retained. The passing 74-case suite was not repeated. Frame intervals cover the sampled idle plain boot, not a whole-run performance guarantee.

**Why integration remains held.** The required full Node battery is still missing. The unchanged run-guards wrapper imposes 900 seconds per child; s2733 already recorded it terminating a progressing battery. Tape's fresh main receipt took 1,490,596.859 ms (about 24.8 minutes). Repeating that unchanged cap would not establish completion. Completing full candidate and post-fast-forward batteries exceeds the remaining bounded fire increment; no timeout, assertion or runner was weakened. The [drain skill](../.claude/skills/drain/SKILL.md) requires: "Full `npm run test:node-guards` on the merged tree before the pin, and again on main after the fast-forward". The literal diff-selected run-guards invocation also remains outstanding.

**Remaining list in order.**

1. Respect the attended Holds-4 landing custody; its prepared config is committed by this fire.
2. Resume this exact saved audio candidate on current main, complete full Node and diff-selected guards with the known wrapper limit addressed through the existing attended procedure; attribute every red on clean main. The four short guards do not substitute for this.
3. Measure engine identity last, append the same-era pin with the cause, complete the review and leaf/ledger drain commit, fast-forward and push; full Node on main, then attended publication.
4. Inheritance attempt 2 is separately ready for its own drain; audio harshness remains behind the toggle landing.

No new product defect was established. No task was dispatched or re-queued.

# Browser gate attribution, run 10

2026-09-24. Existing assertions and skips are unchanged. The 69-file HUD run finished **532 passed / 50 failed / 114 skipped**. The four-map mobile run finished **19 passed / 7 failed**. `m2-01-build-menu.spec.ts` passed all **14** cases across both Chrome projects.

The 57 failed attempts contain 56 unique test/project cases (mobile Baron appears in both suites). Exact pre-cure stylesheet controls reproduce **49 at the same assertion**. The remaining **7 pass a candidate rerun**. There is no persistent candidate-only failure in these controls, but the original browser gates remain red. A repeat pass is not silently substituted into the first-run totals.

The control serves `0aaa67564:src/ui/theme.css`; the before/after server receipts verify exact stylesheet hashes. Both control arms disable Vite HMR to avoid concurrent store writes reloading a test. The shared store is live and its per-arm head is recorded; this isolates stylesheet bytes, not an immutable historical asset tree.

| Case | Project | Initial assertion | Control / candidate result |
|---|---|---|---|
| `audio-integration.spec.ts:80` | desktop | L89: await page.getByTestId('start-menu-settings').click(); | Same assertion with pre-cure CSS |
| `audio-integration.spec.ts:80` | mobile | L89: await page.getByTestId('start-menu-settings').click(); | Same assertion with pre-cure CSS |
| `bt-01-tiers.spec.ts:205` | desktop | L216: await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull(); | Same assertion with pre-cure CSS |
| `bt-01-tiers.spec.ts:430` | desktop | L443: await expect.poll(() => hpEntry(page, 'palisade', palisade.index)).toBeNull(); | Same assertion with pre-cure CSS |
| `bt-01-tiers.spec.ts:205` | mobile | L216: await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull(); | Same assertion with pre-cure CSS |
| `bt-01-tiers.spec.ts:430` | mobile | L443: await expect.poll(() => hpEntry(page, 'palisade', palisade.index)).toBeNull(); | Same assertion with pre-cure CSS |
| `ceremony-framework.spec.ts:777` | desktop | L822: await expect(page.getByTestId('open-charter-press-site')).toHaveCount(0); | Pre-cure and candidate reruns pass |
| `ceremony-framework.spec.ts:777` | mobile | L822: await expect(page.getByTestId('open-charter-press-site')).toHaveCount(0); | Same assertion with pre-cure CSS |
| `e1-baron.spec.ts:411` | desktop | L302: .toEqual({ | Same assertion with pre-cure CSS |
| `e1-baron.spec.ts:411` | mobile | L302: .toEqual({ | Same assertion with pre-cure CSS |
| `e6-picnic-opening.spec.ts:386` | desktop | L445: expect(ended, 'an unbuilt run does end — this is a hold map, not a stroll').toBe(true); | Pre-cure and candidate reruns pass |
| `e7-playbook-rows.spec.ts:218` | mobile | L249: await page.getByTestId('playbook-record').click(); | Same assertion with pre-cure CSS |
| `e7-playbook-surface.spec.ts:33` | desktop | L49: await expect(page.getByTestId('playbook-toggle')).toBeVisible(); | Same assertion with pre-cure CSS |
| `e7-playbook-surface.spec.ts:54` | desktop | L106: await page.getByTestId('playbook-toggle').click(); | Pre-cure and candidate reruns pass |
| `e7-playbook-surface.spec.ts:33` | mobile | L49: await expect(page.getByTestId('playbook-toggle')).toBeVisible(); | Same assertion with pre-cure CSS |
| `e7-signal-systems.spec.ts:104` | desktop | L138: })).toBe(true); | Same assertion with pre-cure CSS |
| `e7-signal-systems.spec.ts:104` | mobile | L138: })).toBe(true); | Same assertion with pre-cure CSS |
| `en-02-e1-coverage.spec.ts:407` | desktop | L435: await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats'), { timeout: 12_000 }).toBe(1); | Same assertion with pre-cure CSS |
| `en-02-e1-coverage.spec.ts:407` | mobile | L435: await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats'), { timeout: 12_000 }).toBe(1); | Same assertion with pre-cure CSS |
| `feedback-fx.spec.ts:28` | desktop | L33: await expect(banner).toContainText('Stake your claim.'); | Same assertion with pre-cure CSS |
| `feedback-fx.spec.ts:28` | mobile | L33: await expect(banner).toContainText('Stake your claim.'); | Same assertion with pre-cure CSS |
| `m1-03-wave-pressure.spec.ts:31` | desktop | L35: expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0); | Same assertion with pre-cure CSS |
| `m1-03-wave-pressure.spec.ts:31` | mobile | L35: expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0); | Same assertion with pre-cure CSS |
| `m2-05b-overwhelm-valves.spec.ts:223` | mobile | L246: expect(wave1[1].lastPulseAt - wave1[0].lastPulseAt).toBeCloseTo(0.5, 4); | Pre-cure and candidate reruns pass |
| `m2-06-arsenal-blast-charge.spec.ts:131` | desktop | L155: expect(await page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0)).toBe(0); | Same assertion with pre-cure CSS |
| `m2-06-arsenal-blast-charge.spec.ts:212` | desktop | L228: await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 15_000 }).toBeGreaterThan(0); | Same assertion with pre-cure CSS |
| `m2-06-arsenal-blast-charge.spec.ts:131` | mobile | L155: expect(await page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0)).toBe(0); | Same assertion with pre-cure CSS |
| `m4-06-embodiment.spec.ts:298` | desktop | L305: expect(idle.fps).toBe(8); | Same assertion with pre-cure CSS |
| `m4-06-embodiment.spec.ts:298` | mobile | L305: expect(idle.fps).toBe(8); | Same assertion with pre-cure CSS |
| `mp-02-lockstep.spec.ts:687` | desktop | L705: await alice.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 }); | Same assertion with pre-cure CSS |
| `run-suspend.spec.ts:282` | desktop | L316: expect(legacy).toMatchObject({ restored: true, fallbackRingPresent: false, finalRingPresent: false }); | Pre-cure and candidate reruns pass |
| `run-suspend.spec.ts:282` | mobile | L316: expect(legacy).toMatchObject({ restored: true, fallbackRingPresent: false, finalRingPresent: false }); | Pre-cure and candidate reruns pass |
| `same-laws-harvest-parity.spec.ts:110` | mobile | L232: expect(run.status, run.stderr).toBe(0); | Pre-cure and candidate reruns pass |
| `ss-01-beats.spec.ts:103` | desktop | L88: await expect(card).toHaveAttribute('data-beat-id', id); | Same assertion with pre-cure CSS |
| `ss-01-beats.spec.ts:103` | mobile | L88: await expect(card).toHaveAttribute('data-beat-id', id); | Same assertion with pre-cure CSS |
| `task-037-assay-bench-ungate.spec.ts:202` | mobile | L211: expect(intersects(promptBox, await page.locator('#touch-controls').boundingBox())).toBe(false); | Same assertion with pre-cure CSS |
| `trail-guide.spec.ts:100` | desktop | L53: await expect(page.getByTestId('story-beat-card')).toHaveCount(0); | Same assertion with pre-cure CSS |
| `trail-guide.spec.ts:128` | desktop | L53: await expect(page.getByTestId('story-beat-card')).toHaveCount(0); | Same assertion with pre-cure CSS |
| `trail-guide.spec.ts:100` | mobile | L53: await expect(page.getByTestId('story-beat-card')).toHaveCount(0); | Same assertion with pre-cure CSS |
| `trail-guide.spec.ts:128` | mobile | L53: await expect(page.getByTestId('story-beat-card')).toHaveCount(0); | Same assertion with pre-cure CSS |
| `visual.spec.ts:113` | desktop | L118: expect(probes).toMatchObject({ | Same assertion with pre-cure CSS |
| `visual.spec.ts:212` | desktop | L230: .toBe('river'); | Same assertion with pre-cure CSS |
| `visual.spec.ts:113` | mobile | L118: expect(probes).toMatchObject({ | Same assertion with pre-cure CSS |
| `visual.spec.ts:212` | mobile | L230: .toBe('river'); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:196` | desktop | L98: await expect(note).toBeVisible(); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:293` | desktop | L301: await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon'); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:322` | desktop | L339: expect(boxes!.note.bottom).toBeLessThanOrEqual(boxes!.controls.top - 8); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:196` | mobile | L98: await expect(note).toBeVisible(); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:293` | mobile | L301: await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon'); | Same assertion with pre-cure CSS |
| `world-info-notes.spec.ts:322` | mobile | L339: expect(boxes!.note.bottom).toBeLessThanOrEqual(boxes!.controls.top - 8); | Same assertion with pre-cure CSS |
| `e1-night-shift.spec.ts:271` | mobile | L339: await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting)).toMatchObject({ | Same assertion with pre-cure CSS |
| `e1-night-shift.spec.ts:372` | mobile | L405: expect(await spriteLuminance(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT); | Same assertion with pre-cure CSS |
| `e1-night-shift.spec.ts:478` | mobile | L171: await page.waitForFunction( | Same assertion with pre-cure CSS |
| `e1-twin-banks.spec.ts:64` | mobile | L96: expect(snapshot.samples.center?.zone).toBe('river'); | Same assertion with pre-cure CSS |
| `e1-twin-banks.spec.ts:103` | mobile | L48: await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true); | Same assertion with pre-cure CSS |
| `e1-twin-banks.spec.ts:122` | mobile | L228: .toBe(true); | Same assertion with pre-cure CSS |

## Scope and retained evidence

The seven four-map failures are Baron animation-loaded, Night Shift fog/luminance/suspend, and Twin Banks zone/build/ford-route checks; all seven reproduce with pre-cure CSS. Trestle’s own mobile spec passes. These are held for their runtime/test owners; this task does not change those assertions or systems.

The 114 skips are existing opt-in or project-specific exclusions (see `existing-skip-inventory.json`), including the optional whole-board/secure play-outs and measurement rig. Neither project was omitted. `hud-spec-roster.json` records the 69-file selection.

Raw JSON and line logs retain each run. `failure-attribution.json` records original/control/recheck errors together. Failure PNGs and error contexts are committed; large trace archives remain local, with the final checksum inventory.

Release diagnostic: 26 passed / 4 failed. The CSS-off control fails all four selected cases. Both projects fail the asset guard on `motor-hauler` and Dry Gulch harvest channeling at `release-build.spec.ts:330`; desktop initially fails at briefing dismissal (:79), then its restored-CSS rerun reaches the same :330 failure as the control. The original compiled CSS is restored exactly. See `release-failure-attribution.json` and `release-css-control.json`.

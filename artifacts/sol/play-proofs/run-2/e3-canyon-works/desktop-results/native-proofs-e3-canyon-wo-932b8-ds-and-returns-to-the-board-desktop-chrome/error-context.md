# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e3-canyon-works.spec.ts >> e3-canyon-works plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:556:5

# Error details

```
Error: secures: CONNECT deadline missed: {"powered":0,"required":2,"byWave":8,"complete":false,"failed":true}; hero={"x":-13.128827849152522,"z":-7.8733852534181255}, gold=0; both galleries were not connected by wave 8

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic "Wave status":
      - generic:
        - generic: West ridge shadows want the gold!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 86 / 150
      - generic:
        - generic: Time
        - strong: 06:27
      - generic:
        - generic: Wave
        - strong: "12"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - 'region "Power ledger: 26 of 28 watts, 1 lit, 0 brown, 3 dark"':
      - generic: Grid
      - strong: 26/28W · 1L 0B 3D · CONNECT 0/2 W8
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 04:09 - Gathered 20 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "10"
        - strong: 64 / 84 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: P - catch your breath
  - region
```

# Test source

```ts
  818 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  819 |             );
  820 | 
  821 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  822 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  823 |         }
  824 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  825 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  826 |         }
  827 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  828 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  829 |         }
  830 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  831 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  832 |         }
  833 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  834 | 
  835 |         if (sawOverlay) {
  836 |           try {
  837 | 
  838 |             const before = initialScores;
  839 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  840 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  841 |             const scores = await readScores(page);
  842 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  843 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  844 |             row.banks = banked
  845 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  846 |               : fail(
  847 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  848 |                 );
  849 |           } catch (error) {
  850 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  851 |           }
  852 |         } else {
  853 |           row.banks = fail('skipped: never secured');
  854 |         }
  855 | 
  856 |         if (row.banks.ok) {
  857 |           try {
  858 |             for (let card = 0; card < 2; card += 1) {
  859 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  860 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  861 |                 await page.waitForTimeout(250);
  862 |               }
  863 |             }
  864 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  865 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  866 |             row.board = pass('the Book is on screen straight off the run ledger');
  867 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  868 |           } catch (error) {
  869 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  870 |           }
  871 |         } else {
  872 |           row.board = fail('skipped: never banked');
  873 |         }
  874 | 
  875 |         if (row.banks.ok) {
  876 |           try {
  877 |             const before = await rawScores(page);
  878 |             await page.goto('/');
  879 |             await page.waitForLoadState('domcontentloaded');
  880 |             const after = await rawScores(page);
  881 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  882 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  883 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  884 |             const reachedTavern = await walkToTavern(page, row);
  885 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  886 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  887 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  888 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  889 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  890 |           } catch (error) {
  891 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  892 |           }
  893 |         } else {
  894 |           row.reload = fail('skipped: never banked');
  895 |         }
  896 | 
  897 |         row.clean =
  898 |           consoleErrors.length === 0 && pageErrors.length === 0
  899 |             ? pass('0 console, 0 page')
  900 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  901 |       } finally {
  902 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  903 |         if (row.finalSnapshot) {
  904 |           row.objective = row.finalSnapshot.objective;
  905 |           if (!row.banks.ok) {
  906 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  907 |             row.simAtEnd = row.finalSnapshot.sim;
  908 |             row.hpAtEnd = row.finalSnapshot.hp;
  909 |             row.goldAtEnd = row.finalSnapshot.gold;
  910 |             row.runStateAtEnd = row.finalSnapshot.runState;
  911 |           }
  912 |         }
  913 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  914 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  915 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  916 |       }
  917 | 
> 918 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: CONNECT deadline missed: {"powered":0,"required":2,"byWave":8,"complete":false,"failed":true}; hero={"x":-13.128827849152522,"z":-7.8733852534181255}, gold=0; both galleries were not connected by wave 8
  919 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  920 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  921 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  922 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  923 |     });
  924 | }
  925 | 
  926 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  927 | 
  928 | async function rawScores(page: Page): Promise<string | null> {
  929 |   return page.evaluate(
  930 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  931 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  932 |   );
  933 | }
  934 | 
  935 | async function readScores(page: Page): Promise<Score[]> {
  936 |   const raw = await rawScores(page);
  937 |   try {
  938 |     const parsed = JSON.parse(raw ?? '[]');
  939 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  940 |   } catch {
  941 |     return [];
  942 |   }
  943 | }
  944 | 
  945 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  946 |   for (let step = 0; step < 70; step += 1) {
  947 |     const town = await page
  948 |       .evaluate(() => {
  949 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  950 |         if (!d) return null;
  951 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  952 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  953 |       })
  954 |       .catch(() => null);
  955 |     if (!town) return false;
  956 |     if (town.prompt === 'tavern') return true;
  957 |     if (!town.approach) return false;
  958 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  959 |   }
  960 |   row.notes.push('could not reach the tavern in 70 steps');
  961 |   return false;
  962 | }
  963 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e3-fairground.spec.ts >> e3-fairground plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:575:5

# Error details

```
Error: secures: Fair Wheel stopped irreversibly: {"active":true,"spinning":false,"hp":230.4,"maxHp":240,"outputWatts":0,"configuredWatts":24,"viewRadius":18,"x":0,"z":8}; flocks={"enabled":true,"count":3,"escortRadius":7,"speed":3.6,"home":{"x":0,"z":-30},"night":1,"attempts":6,"completions":1,"frights":4,"allCrossed":false,"flocks":[{"id":"flock-1","x":-20,"z":-30,"phase":"home","destination":"copper-pavilion","attempts":2,"crossings":1,"frights":1,"crossed":true},{"id":"flock-2","x":0,"z":-30,"phase":"home","destination":"ferris-wheel","attempts":2,"crossings":0,"frights":2,"crossed":false},{"id":"flock-3","x":20,"z":7.920000000000027,"phase":"outbound","destination":"silver-pavilion","attempts":2,"crossings":0,"frights":1,"crossed":false}]}; wheel and all three flock crossings not proved

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
        - generic: North bank shadows want the gold!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:49
      - generic:
        - generic: Wave
        - strong: "1"
    - region "Gold pouch":
      - strong: "30"
    - 'region "Power ledger: 0 of 12 watts, 0 lit, 0 brown, 2 dark"':
      - generic: Grid
      - strong: 0/12W · 0L 0B 2D
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 00:39 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "2"
        - strong: 8 / 20 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e15]: Rotate
    - button [ref=e16]: Weapon
    - button [ref=e17]: OK
  - region
```

# Test source

```ts
  849 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  850 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  851 |         }
  852 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  853 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  854 |         }
  855 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  856 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  857 |         }
  858 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  859 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  860 |         }
  861 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  862 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  863 |         }
  864 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  865 | 
  866 |         if (sawOverlay) {
  867 |           try {
  868 | 
  869 |             const before = initialScores;
  870 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  871 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  872 |             const scores = await readScores(page);
  873 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  874 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  875 |             row.banks = banked
  876 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  877 |               : fail(
  878 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  879 |                 );
  880 |           } catch (error) {
  881 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  882 |           }
  883 |         } else {
  884 |           row.banks = fail('skipped: never secured');
  885 |         }
  886 | 
  887 |         if (row.banks.ok) {
  888 |           try {
  889 |             for (let card = 0; card < 2; card += 1) {
  890 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  891 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  892 |                 await page.waitForTimeout(250);
  893 |               }
  894 |             }
  895 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  896 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  897 |             row.board = pass('the Book is on screen straight off the run ledger');
  898 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  899 |           } catch (error) {
  900 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  901 |           }
  902 |         } else {
  903 |           row.board = fail('skipped: never banked');
  904 |         }
  905 | 
  906 |         if (row.banks.ok) {
  907 |           try {
  908 |             const before = await rawScores(page);
  909 |             await page.goto('/');
  910 |             await page.waitForLoadState('domcontentloaded');
  911 |             const after = await rawScores(page);
  912 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  913 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  914 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  915 |             const reachedTavern = await walkToTavern(page, row);
  916 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  917 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  918 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  919 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  920 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  921 |           } catch (error) {
  922 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  923 |           }
  924 |         } else {
  925 |           row.reload = fail('skipped: never banked');
  926 |         }
  927 | 
  928 |         row.clean =
  929 |           consoleErrors.length === 0 && pageErrors.length === 0
  930 |             ? pass('0 console, 0 page')
  931 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  932 |       } finally {
  933 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  934 |         if (row.finalSnapshot) {
  935 |           row.objective = row.finalSnapshot.objective;
  936 |           if (!row.banks.ok) {
  937 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  938 |             row.simAtEnd = row.finalSnapshot.sim;
  939 |             row.hpAtEnd = row.finalSnapshot.hp;
  940 |             row.goldAtEnd = row.finalSnapshot.gold;
  941 |             row.runStateAtEnd = row.finalSnapshot.runState;
  942 |           }
  943 |         }
  944 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  945 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  946 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  947 |       }
  948 | 
> 949 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: Fair Wheel stopped irreversibly: {"active":true,"spinning":false,"hp":230.4,"maxHp":240,"outputWatts":0,"configuredWatts":24,"viewRadius":18,"x":0,"z":8}; flocks={"enabled":true,"count":3,"escortRadius":7,"speed":3.6,"home":{"x":0,"z":-30},"night":1,"attempts":6,"completions":1,"frights":4,"allCrossed":false,"flocks":[{"id":"flock-1","x":-20,"z":-30,"phase":"home","destination":"copper-pavilion","attempts":2,"crossings":1,"frights":1,"crossed":true},{"id":"flock-2","x":0,"z":-30,"phase":"home","destination":"ferris-wheel","attempts":2,"crossings":0,"frights":2,"crossed":false},{"id":"flock-3","x":20,"z":7.920000000000027,"phase":"outbound","destination":"silver-pavilion","attempts":2,"crossings":0,"frights":1,"crossed":false}]}; wheel and all three flock crossings not proved
  950 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  951 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  952 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  953 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  954 |     });
  955 | }
  956 | 
  957 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  958 | 
  959 | async function rawScores(page: Page): Promise<string | null> {
  960 |   return page.evaluate(
  961 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  962 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  963 |   );
  964 | }
  965 | 
  966 | async function readScores(page: Page): Promise<Score[]> {
  967 |   const raw = await rawScores(page);
  968 |   try {
  969 |     const parsed = JSON.parse(raw ?? '[]');
  970 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  971 |   } catch {
  972 |     return [];
  973 |   }
  974 | }
  975 | 
  976 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  977 |   for (let step = 0; step < 70; step += 1) {
  978 |     const town = await page
  979 |       .evaluate(() => {
  980 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  981 |         if (!d) return null;
  982 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  983 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  984 |       })
  985 |       .catch(() => null);
  986 |     if (!town) return false;
  987 |     if (town.prompt === 'tavern') return true;
  988 |     if (!town.approach) return false;
  989 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  990 |   }
  991 |   row.notes.push('could not reach the tavern in 70 steps');
  992 |   return false;
  993 | }
  994 | 
```
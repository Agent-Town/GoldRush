# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e3-fairground.spec.ts >> e3-fairground plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:573:5

# Error details

```
Error: secures: Fair Wheel stopped irreversibly: {"active":false,"spinning":false,"hp":0,"maxHp":240,"outputWatts":0,"configuredWatts":24,"viewRadius":18,"x":0,"z":8}; flocks={"enabled":true,"count":3,"escortRadius":7,"speed":3.6,"home":{"x":0,"z":-30},"night":3,"attempts":12,"completions":0,"frights":10,"allCrossed":false,"flocks":[{"id":"flock-1","x":-20,"z":-17.03999999999999,"phase":"outbound","destination":"copper-pavilion","attempts":4,"crossings":0,"frights":3,"crossed":false},{"id":"flock-2","x":0,"z":-30,"phase":"home","destination":"ferris-wheel","attempts":4,"crossings":0,"frights":4,"crossed":false},{"id":"flock-3","x":20,"z":-17.03999999999999,"phase":"outbound","destination":"silver-pavilion","attempts":4,"crossings":0,"frights":3,"crossed":false}]}; wheel and all three flock crossings not proved

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
        - generic: Beacon coils hum eastward!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 52 / 100
      - generic:
        - generic: Time
        - strong: 01:29
      - generic:
        - generic: Wave
        - strong: "2"
    - region "Gold pouch":
      - generic: Gold
      - strong: "7"
    - 'region "Power ledger: 0 of 12 watts, 0 lit, 0 brown, 2 dark"':
      - generic: Grid
      - strong: 0/12W · 0L 0B 2D
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 01:10 - Gathered 28 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "4"
        - strong: 28 / 36 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: P - catch your breath
  - region
```

# Test source

```ts
  847 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  848 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  849 |         }
  850 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  851 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  852 |         }
  853 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  854 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  855 |         }
  856 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  857 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  858 |         }
  859 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  860 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  861 |         }
  862 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  863 | 
  864 |         if (sawOverlay) {
  865 |           try {
  866 | 
  867 |             const before = initialScores;
  868 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  869 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  870 |             const scores = await readScores(page);
  871 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  872 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  873 |             row.banks = banked
  874 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  875 |               : fail(
  876 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  877 |                 );
  878 |           } catch (error) {
  879 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  880 |           }
  881 |         } else {
  882 |           row.banks = fail('skipped: never secured');
  883 |         }
  884 | 
  885 |         if (row.banks.ok) {
  886 |           try {
  887 |             for (let card = 0; card < 2; card += 1) {
  888 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  889 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  890 |                 await page.waitForTimeout(250);
  891 |               }
  892 |             }
  893 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  894 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  895 |             row.board = pass('the Book is on screen straight off the run ledger');
  896 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  897 |           } catch (error) {
  898 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  899 |           }
  900 |         } else {
  901 |           row.board = fail('skipped: never banked');
  902 |         }
  903 | 
  904 |         if (row.banks.ok) {
  905 |           try {
  906 |             const before = await rawScores(page);
  907 |             await page.goto('/');
  908 |             await page.waitForLoadState('domcontentloaded');
  909 |             const after = await rawScores(page);
  910 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  911 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  912 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  913 |             const reachedTavern = await walkToTavern(page, row);
  914 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  915 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  916 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  917 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  918 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  919 |           } catch (error) {
  920 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  921 |           }
  922 |         } else {
  923 |           row.reload = fail('skipped: never banked');
  924 |         }
  925 | 
  926 |         row.clean =
  927 |           consoleErrors.length === 0 && pageErrors.length === 0
  928 |             ? pass('0 console, 0 page')
  929 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  930 |       } finally {
  931 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  932 |         if (row.finalSnapshot) {
  933 |           row.objective = row.finalSnapshot.objective;
  934 |           if (!row.banks.ok) {
  935 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  936 |             row.simAtEnd = row.finalSnapshot.sim;
  937 |             row.hpAtEnd = row.finalSnapshot.hp;
  938 |             row.goldAtEnd = row.finalSnapshot.gold;
  939 |             row.runStateAtEnd = row.finalSnapshot.runState;
  940 |           }
  941 |         }
  942 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  943 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  944 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  945 |       }
  946 | 
> 947 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: Fair Wheel stopped irreversibly: {"active":false,"spinning":false,"hp":0,"maxHp":240,"outputWatts":0,"configuredWatts":24,"viewRadius":18,"x":0,"z":8}; flocks={"enabled":true,"count":3,"escortRadius":7,"speed":3.6,"home":{"x":0,"z":-30},"night":3,"attempts":12,"completions":0,"frights":10,"allCrossed":false,"flocks":[{"id":"flock-1","x":-20,"z":-17.03999999999999,"phase":"outbound","destination":"copper-pavilion","attempts":4,"crossings":0,"frights":3,"crossed":false},{"id":"flock-2","x":0,"z":-30,"phase":"home","destination":"ferris-wheel","attempts":4,"crossings":0,"frights":4,"crossed":false},{"id":"flock-3","x":20,"z":-17.03999999999999,"phase":"outbound","destination":"silver-pavilion","attempts":4,"crossings":0,"frights":3,"crossed":false}]}; wheel and all three flock crossings not proved
  948 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  949 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  950 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  951 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  952 |     });
  953 | }
  954 | 
  955 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  956 | 
  957 | async function rawScores(page: Page): Promise<string | null> {
  958 |   return page.evaluate(
  959 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  960 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  961 |   );
  962 | }
  963 | 
  964 | async function readScores(page: Page): Promise<Score[]> {
  965 |   const raw = await rawScores(page);
  966 |   try {
  967 |     const parsed = JSON.parse(raw ?? '[]');
  968 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  969 |   } catch {
  970 |     return [];
  971 |   }
  972 | }
  973 | 
  974 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  975 |   for (let step = 0; step < 70; step += 1) {
  976 |     const town = await page
  977 |       .evaluate(() => {
  978 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  979 |         if (!d) return null;
  980 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  981 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  982 |       })
  983 |       .catch(() => null);
  984 |     if (!town) return false;
  985 |     if (town.prompt === 'tavern') return true;
  986 |     if (!town.approach) return false;
  987 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  988 |   }
  989 |   row.notes.push('could not reach the tavern in 70 steps');
  990 |   return false;
  991 | }
  992 | 
```
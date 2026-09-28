# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e8-far-side.spec.ts >> e8-far-side plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:725:5

# Error details

```
Error: secures: runState=dead at wave 17 / 519.1s sim, 722 kills, 0 gold; four air-supported crossings, one probe playback and builds at both grounds not proved

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
        - generic: Wrecking crew sighted - west ridge.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 08:39
      - generic:
        - generic: Wave
        - strong: "17"
    - region "Gold pouch":
      - strong: "0"
    - region "Suit air 30 of 60 seconds, draining":
      - generic: Air
      - strong: 30s
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 08:32 - Gathered 4 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "25"
        - strong: 136 / 204 XP
    - region "Build":
      - button "Build" [ref=e12]
    - button "Pause the claim" [ref=e13]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e16]: Rotate
    - button [ref=e17]: Weapon
    - button [ref=e18]: OK
  - region "Run ledger" [ref=e19]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e22]
      - paragraph [ref=e23]: The claim was overrun. The gold remembers.
      - generic [ref=e24]:
        - generic [ref=e25]:
          - term [ref=e26]: Time Held
          - definition [ref=e27]: 08:39
        - generic [ref=e28]:
          - term [ref=e29]: Claim Jumpers Turned Back
          - definition [ref=e30]: "722"
        - generic [ref=e31]:
          - term [ref=e32]: Waves Survived
          - definition [ref=e33]: "17"
        - generic [ref=e34]:
          - term [ref=e35]: Gold Panned
          - definition [ref=e36]: "240"
        - generic [ref=e37]:
          - term [ref=e38]: Gold Sluiced
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Stolen / Reclaimed
          - definition [ref=e42]: 0 / 0
        - generic [ref=e43]:
          - term [ref=e44]: Spent
          - definition [ref=e45]: "240"
        - generic [ref=e46]:
          - term [ref=e47]: Beacons Built
          - definition [ref=e48]: "1"
        - generic [ref=e49]:
          - term [ref=e50]: Buildings Built / Lost / Repaired
          - definition [ref=e51]: 4 / 0 / 0
        - generic [ref=e52]:
          - term [ref=e53]: Spark / Blast Damage
          - definition [ref=e54]: 40722 / 0
        - generic [ref=e55]:
          - term [ref=e56]: Blast Toggles
          - definition [ref=e57]: "0"
        - generic [ref=e58]:
          - term [ref=e59]: Blast Charge Time
          - definition [ref=e60]: 00:00
        - generic [ref=e61]:
          - term [ref=e62]: Upgrades Taken
          - definition [ref=e63]: blast 4 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
      - paragraph [ref=e64]: "Epoch science complete: the Red Fields awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +979 toward the Red Fields"
      - paragraph [ref=e65]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e66]:
        - paragraph [ref=e67]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e68]
        - generic [ref=e69]:
          - 'button "1 Advances crafting-agent Vacuum Lenses Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage. EVERY RUN" [active] [ref=e70]':
            - generic [ref=e71]: "1"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: Vacuum Lenses
            - generic [ref=e74]: "Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage."
            - generic [ref=e76]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e77]':
            - generic [ref=e78]: "2"
            - generic [ref=e79]: Advances crafting-agent
            - strong [ref=e80]: "Continued Study: Seam Yield"
            - generic [ref=e81]: "Effect: +1% seam panning yield."
            - generic [ref=e83]: EVERY RUN
        - paragraph [ref=e84]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e85]:
        - heading "Best Claims" [level=2] [ref=e86]
        - list [ref=e87]:
          - listitem [ref=e88]:
            - generic [ref=e89]: wave 30 · baseless
            - strong [ref=e90]: SECURED
            - generic [ref=e91]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e92]:
            - generic [ref=e93]: wave 30 · baseless
            - strong [ref=e94]: SECURED
            - generic [ref=e95]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e96]:
            - generic [ref=e97]: wave 30 · baseless
            - strong [ref=e98]: SECURED
            - generic [ref=e99]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e100]:
            - generic [ref=e101]: wave 30 · baseless
            - strong [ref=e102]: SECURED
            - generic [ref=e103]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e104]:
            - generic [ref=e105]: wave 30 · baseless
            - strong [ref=e106]: SECURED
            - generic [ref=e107]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e108]:
        - button "Keep this tape" [ref=e109]
        - button "Return to Town" [ref=e110]
        - button "Try Again" [ref=e111]
```

# Test source

```ts
  1022 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1023 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1024 |         }
  1025 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1026 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1027 |         }
  1028 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1029 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1030 |         }
  1031 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1032 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1033 |         }
  1034 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1035 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1036 |         }
  1037 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1038 | 
  1039 |         if (sawOverlay) {
  1040 |           try {
  1041 | 
  1042 |             const before = initialScores;
  1043 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1044 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1045 |             const scores = await readScores(page);
  1046 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1047 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1048 |             row.banks = banked
  1049 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1050 |               : fail(
  1051 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1052 |                 );
  1053 |           } catch (error) {
  1054 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1055 |           }
  1056 |         } else {
  1057 |           row.banks = fail('skipped: never secured');
  1058 |         }
  1059 | 
  1060 |         if (row.banks.ok) {
  1061 |           try {
  1062 |             for (let card = 0; card < 2; card += 1) {
  1063 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1064 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1065 |                 await page.waitForTimeout(250);
  1066 |               }
  1067 |             }
  1068 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1069 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1070 |             row.board = pass('the Book is on screen straight off the run ledger');
  1071 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1072 |           } catch (error) {
  1073 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1074 |           }
  1075 |         } else {
  1076 |           row.board = fail('skipped: never banked');
  1077 |         }
  1078 | 
  1079 |         if (row.banks.ok) {
  1080 |           try {
  1081 |             const before = await rawScores(page);
  1082 |             await page.goto('/');
  1083 |             await page.waitForLoadState('domcontentloaded');
  1084 |             const after = await rawScores(page);
  1085 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1086 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1087 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1088 |             const reachedTavern = await walkToTavern(page, row);
  1089 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1090 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1091 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1092 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1093 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1094 |           } catch (error) {
  1095 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1096 |           }
  1097 |         } else {
  1098 |           row.reload = fail('skipped: never banked');
  1099 |         }
  1100 | 
  1101 |         row.clean =
  1102 |           consoleErrors.length === 0 && pageErrors.length === 0
  1103 |             ? pass('0 console, 0 page')
  1104 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1105 |       } finally {
  1106 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1107 |         if (row.finalSnapshot) {
  1108 |           row.objective = row.finalSnapshot.objective;
  1109 |           if (!row.banks.ok) {
  1110 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1111 |             row.simAtEnd = row.finalSnapshot.sim;
  1112 |             row.hpAtEnd = row.finalSnapshot.hp;
  1113 |             row.goldAtEnd = row.finalSnapshot.gold;
  1114 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1115 |           }
  1116 |         }
  1117 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1118 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1119 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1120 |       }
  1121 | 
> 1122 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 17 / 519.1s sim, 722 kills, 0 gold; four air-supported crossings, one probe playback and builds at both grounds not proved
  1123 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1124 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1125 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1126 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1127 |     });
  1128 | }
  1129 | 
  1130 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1131 | 
  1132 | async function rawScores(page: Page): Promise<string | null> {
  1133 |   return page.evaluate(
  1134 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1135 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1136 |   );
  1137 | }
  1138 | 
  1139 | async function readScores(page: Page): Promise<Score[]> {
  1140 |   const raw = await rawScores(page);
  1141 |   try {
  1142 |     const parsed = JSON.parse(raw ?? '[]');
  1143 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1144 |   } catch {
  1145 |     return [];
  1146 |   }
  1147 | }
  1148 | 
  1149 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1150 |   for (let step = 0; step < 70; step += 1) {
  1151 |     const town = await page
  1152 |       .evaluate(() => {
  1153 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1154 |         if (!d) return null;
  1155 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1156 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1157 |       })
  1158 |       .catch(() => null);
  1159 |     if (!town) return false;
  1160 |     if (town.prompt === 'tavern') return true;
  1161 |     if (!town.approach) return false;
  1162 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1163 |   }
  1164 |   row.notes.push('could not reach the tavern in 70 steps');
  1165 |   return false;
  1166 | }
  1167 | 
```
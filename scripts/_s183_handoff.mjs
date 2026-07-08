import fs from 'node:fs';
import { execSync } from 'node:child_process';

const p = 'STATUS.md';
const s = fs.readFileSync(p, 'utf8');
const nl = s.indexOf('\n');
const activeLine = s.slice(0, nl);          // current line-1 = s183 ACTIVE lock
const rest = s.slice(nl + 1);               // existing bullets (s182 lock, s181 handoff, ...)

// exact s182 handoff line-1, pulled from git so it is preserved verbatim
const s182handoff = execSync('git show fa9e289:STATUS.md', { encoding: 'utf8' }).split('\n')[0];

const handoff = 'Last updated: 2026-07-08T01:25:00Z s183 handoff, lock CLEARED — **NO DRAIN (attended HOT on main + uncommitted src).** Verified live: HEAD `fa9e289`@01:14Z (=fix-025 wet-powder, landed by attended) + since-s182 attended commits `197123f`(057 rocket-cart)/`7e09ce2`(healthbars queued). Uncommitted attended **src** on main — `Game.ts`,`BuildSystem.ts`,`BuildButton.ts`,`UiBridge.ts`,`InputController.ts`,`buildables.ts`,`styles.css` + `e2e/lane-c-activations`+`e2e/m2-01-build-menu` — matches NO done-move ⇒ attended hand-work ⇒ **two-writer STOP for drains** (drain needs clean main). HEAD stable 9min but src still dirty. **DRAINABLE next quiet cycle:** `lane/polish` is **2-ahead** — `5642537` contract-briefings (00:16Z, OLDEST) then `66bb9f4` world-info-notes (00:55Z); serial oldest-first. (world-info-notes overwrites the `ui.announcement` field = the old F-181-1 wet-powder cause, but fix-025/`fa9e289` already landed the durable-DOM poll ⇒ gating is safe now.) **BOARD:** lane-b LIVE `054-baron-epic` pid39243 w/ `055`/`057`/`town-t4` queued (all attended-authored — leave them); lane-d LIVE `stamp-site-read` pid53072; lane-a idle+EMPTY (**PIPELINE-DRY: E2 science-socket still owner-blocked**); lane-c idle+EMPTY. 3 lane-runners. main queue EMPTY (attended ran fix-025+056 directly → 82dd7b4). Assayer pending EMPTY. `tasks/CODEX-WALL` present but **STALE** (its line-1 = "WALL LIFTED" s142; live codex confirms — ignore, do not honor as a wall). **LANE-SAFETY:** do NOT refill lane-c — it maps to `lane/polish` which holds the 2 UNDRAINED commits; a refill `reset --hard` = Reset Massacre. Drain lane/polish FIRST, then lane-c refillable + the `rc1 ss-02-beat-table` re-queue becomes safe. **NEXT FIRE (priority):** A. The moment main is quiet (attended idle >30min: HEAD stable AND no uncommitted attended src) → **DRAIN contract-briefings `5642537`** (oldest committed lane content, gate at repo-root, full battery, review file). B. Then **DRAIN world-info-notes `66bb9f4`**. C. Drain lanes b/d as each done-moves AND its codex EXITS (serial, oldest-first, gate-contamination law). D. After lane/polish drains → lane-c refillable; read `rc1 ss-02-beat-table`(lane-c) + `rc1 gt-04-sightlines`(lane-d) logs, re-queue per §2C. E. Robin owes (nag, do not block): **e2-science-socket design fork** (lane-a E2 ③ unblocker, s178); turret-feel + water-feel playtests; Mac full-regression; favicon 16px. NOTE: attended\'s uncommitted src + `artifacts/*.png` + 2 e2-rail JSONs + `scripts/_s*` scratch + `playwright.s*.config.ts` are attended\'s — leave them all.';

const b183lock = '- **s183 lock (line-1 archive):** ' + activeLine;
const b182hand = '- **s182 handoff (line-1 archive):** ' + s182handoff;

fs.writeFileSync(p, handoff + '\n' + b183lock + '\n' + b182hand + '\n' + rest);
console.log('handoff written; s182 handoff preserved, len=' + s182handoff.length);

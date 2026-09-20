// s1468: BACKLOG row for the authored master — the event and its row in ONE commit.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
let txt = readFileSync(P, 'utf8');

// anchor: append directly after the F-1467-1 row (its gate discharge is the reason this exists)
const ANCHOR = '**1,073 of 1,075 suspects are grid cells**.';
if (!txt.includes(ANCHOR)) { console.error('anchor not found'); process.exit(1); }
if (txt.includes('F-1468-1')) { console.error('row already present'); process.exit(1); }

const ROW = ANCHOR + '\n' +
"- ✍️ **F-1468-1 (s1468, AUTHORED) — E3 ERA-SOCKET #2 OF 3 REMAINING: MOTH SEASON. The census's \"decoy-versus-radius trade\" is ONE EXPRESSION, and half this contract's socket already shipped.** `tasks/lane-e3-moth-socket.md` → lane-a (leaf `e3-moth-socket`), cures **F-ER01-E3-2**. **Why this one and not Canyon Works or Fairground:** `e3-moth-season`'s twist is `secureWave, dayNightCycle, mothSeason, enemyRoster` — and `dayNightCycle` was **already socketed** by the Voltage slice (`3ac90dd8`), so only the `mothSeason` half is missing. It carries **no `powerGrid`**, which is exactly what firewalls `PowerGraphSystem` out cleanly; Canyon Works needs crawler+tram+baron+`lightRamp`+`powerGrid` composed, and Fairground still needs its crowd-flock objective authored on its own governed surface first (F-1467-3 sequencing). 🔍 **AUTHORING MEASURED THREE THINGS SO THE RUNNER NEED NOT RE-DERIVE THEM, all read from main:** (1) the trade the census names in prose is a single line of code — `src/systems/MothSwarm.ts:83` `targetScore = coverageAt(x,z) * source.radius * config.radiusWeight * (source.targetWeight ?? 1)`, highest wins at `:84` with a **deterministic** `id.localeCompare` tie-break, and the winner takes `attachDamagePerSecond` at `:115`. **`radius` is the cost side, `targetWeight` the decoy side** — so the vocabulary can be derived from the expression rather than from a paraphrase of it. (2) **More light means more moths, so lighting up is not free:** `src/game/Game.ts:5461` filters the swarm's inputs to `kind === 'lantern' || 'powered-lamp'` and `:4996` sets the per-wave count to `max(2, floor(max(1, mothLightSources.length) * mothsPerLightPerWave))` — that consequence belongs in the derived RULES. (3) ⚠️ **A DECOY SEAM THE RUNNER WOULD OTHERWISE HAVE CHASED:** `motesPerSwarm` at `MothSwarm.ts:29` reads `globalThis.matchMedia`, which looks **exactly** like the `crypto.randomUUID()` determinism seam the E2 socket had to fix in `PressureSystem:186` — but its only consumer is `syncVisuals()` at `:167`, writing instance matrices. It is **render-only and cannot reach the event log**, and the master tells the runner in as many words *not* to \"fix\" it. A master that stays silent here spends real budget on a false determinism hunt. 📮 Dispatch ran the full F-1424-3 order (evidence+master+leaf committed → lane refreshed → citation key proved **1 on main AND 1 in the lane** → block-check → `cp`); the key is deliberately **apostrophe-free and single-line**, per F-1425-2. **GATE: closes when the lane-a run drains and the census headline reads AGENT-READY 2 of 4.**";

txt = txt.replace(ANCHOR, ROW);
writeFileSync(P, txt);
console.log('F-1468-1 row added.');

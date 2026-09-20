import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const lock = lines[0];
if (!lock.startsWith('ACTIVE') || !lock.includes('s1649')) {
  console.error('REFUSE: line-1 is not my ACTIVE lock:', lock.slice(0, 100));
  process.exit(2);
}
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();

const desk = [
  '🔺 **OWNER\'S DESK — 18 awaiting a word.** ',
  '🔺 **F-1648-1** · 🔺 **F-1640-1** · 🔺 **F-1637-2** · 🔺 **F-1625-4** · 🔺 **F-1617-1** · ',
  '🔺 **F-DOOR-6** · 🔺 **F-1608-2** · 🔺 **F-1193-3** · 🔺 **F-1501-3** · 🔺 **F-1601-1** · ',
  '🔺 **F-1510-1** · 🔺 **F-E2S-3** · 🔺 **F-1536-2** · 🔺 **F-1591-1** · 🔺 **F-1507-1** · ',
  '🔺 **F-E2S-4** · 🔺 **F-1101-1** · 🔺 **F-1166-1** — all 18 inherited unchanged, re-verified this ',
  'fire with `desk-state-audit --status` against the line-1 I was handed: **CLOSED=0 · OPEN=0 · ',
  'BOTH=0 · OPEN-DESK-ONLY=18 · UNRECORDED=0**, so nothing was carried that should have been dropped ',
  'and none is a ghost. **My own finding adds NOTHING to the desk** — F-1649-1 is ATTENDED-owed spec ',
  'work, not a question for you.',
].join('');

const body = [
  `Last updated: ${stamp} s1649 handoff, lock CLEARED — `,
  '📰 **NO DRAIN — THE BOARD WAS GENUINELY DRY, SO THIS FIRE PAID THE DAILY NEWS DEBT AND THEN ',
  'REFUSED TO AUTHOR THE THING EVERY RECENT HANDOFF SAYS IS AUTHORABLE.** ',
  '✅ **(1) TK-01 DAILY DIGEST FOR 2026-08-10 COMPILED AND COMMITTED** ',
  '(`marketing/outbox/ticker-digest-2026-08-10.md`, `86660766`) — owed because I am the first fire ',
  'past 06:00 local and the last digest on disk was 2026-08-09. Compiled on a **closed day**: ',
  '2026-08-10 ended six hours before the trigger, so no merge can arrive to change the counts. ',
  '📊 **Measured, by TOUCHED PATHS on main\'s first-parent walk and never by commit message ',
  '(Mistake #16): 280 first-parent commits · 33 merges · 16 player-visible · 40 factory · 224 ',
  'bookkeeping.** Classifier re-derivable at `artifacts/tk-2026-08-10/classify.mjs` — the 08-09 one ',
  'with its window moved, reused rather than rewritten. **15 micro-headlines from the 16**, read as ',
  'three threads finishing at once: the **agent door** closing its gap with the human game ',
  '(`760990fda` buildable parity · `89e97e293` the draft on the browser\'s own clock · `507c4a679` ',
  'BLAST_AT · `ef1ac7c5a` reach/zone wording), the **Field Book** growing from a page into a wing ',
  '(`8d009c17f` MINDS+RIGS · `4fff07381` stack directory · `80d3bda9b` full-width tables, owner ruled ',
  'B · `f6cb46088` opt-in source links), and the **county getting a calendar** (`c94983206` SEA-1 → ',
  '`68171076a` the Season Page → **`032881eee` Season 2 minted** before midnight). ',
  '⚠️ **Three caveats stated rather than tuned away, because the classifier errs in both directions:** ',
  'it **over**-reports `5bbdc9182` (an art run that touched `assets/` but **stopped lawfully at a ',
  'refuted premise**, so no art reached a player — the GZ-01 sweep dismissed it independently, which ',
  'is the cross-check working); it **disagrees with the sweep** about SEA-1 (registry half vs the ',
  'Season Page a player actually reads — stated, not resolved by decree, since the news reaches you ',
  'through SEA-2 either way); and it **under**-reports the day\'s real headline, **`857e88899` — the ',
  'same-game audit gone complete and mechanical at 1324 divergences against 1680 parity rows over 42 ',
  'contracts** — which files as *factory* because the instrument measuring how far the agents\' game ',
  'sits from the human\'s lives in `scripts/` and `e2e/`, invisible to a path classifier by ',
  'construction. ',
  '🔍 **(2) ONE CLAIM WAS CHECKED AND KILLED BEFORE PUBLISHING.** The draft called 2026-08-10 the ',
  'biggest build day on record; grepping the prior digests first said otherwise (**a 28 and a 17** ',
  'exist), so the line now reads *"heavy, not a record"* and shows its work. A digest reaching you ',
  'with a superlative that its own archive refutes is worse than no digest. ',
  '✅ **GZ-01 sweep run with the INSTRUMENT, not a hand-rolled grep (F-1633-1 — any fixed hash width ',
  'is a bet on someone else\'s convention): 86 player-path merges, 86 cited, reported 81 / dismissed ',
  '5 / candidates 0. Nothing owed, no backfill filed. Re-measured, not carried.** ',
  '🛑 **(3) F-1649-1 — I DID NOT AUTHOR AP-16-6, AND THE REASON IS THE FINDING.** s1645(B), s1646(A) ',
  'and s1648(A) all name it the authorable last rung with the sound instruction to scope ONE verb per ',
  'master. I went to do exactly that; **the premise did not survive the first probe.** The slice ',
  '(`specs/agent-play/ap-16-same-game-law.md:35`) marks five verbs OWED and closes *"same rules, same ',
  'costs, additive hashes"* — **and that promise is measurably false for all five, because the systems ',
  'they would drive do not exist headless.** 🔬 **Measured file by file, not inferred from the audit ',
  'table:** `weaponToggle` is consumed in **exactly one place in the whole tree** — `src/game/Game.ts:',
  '2473`, the **browser** — while in the sim it is an **inert struct member** ',
  '(`HeadlessContractSim.ts:186`, initialised and **never read**) whose outcome counter at `:972` is a ',
  '**hardcoded literal `0`**; and `research` / `secureChoice` / `deathAction` / `secure_choice` each ',
  'return **zero hits** in that file, whose 36 imports compose no such system. ⚖️ **So each verb needs ',
  'a SYSTEM PORT, which changes what the sim DOES, which moves event-log hashes** — contradicting the ',
  'slice\'s own additive promise and every "default preserves every existing hash" assertion AP-16-4/5 ',
  'landed on. That is a sim-behaviour design decision, reserved by §2E\'s HARD LIMIT. ⓘ **Not the ',
  'F-1641-3 missing-slice case — the subtler one: a slice whose stated premise its own implementation ',
  'surface refutes.** 🔎 **And a sharper question fell out of the same probe, routed to attended rather ',
  'than answered here:** AP-16-3 gave agents `BLAST_AT` as a **direct** verb, so the two species now ',
  'reach the blast charge by **different mechanisms** — the human toggles the active weapon and ',
  'presumably surrenders Spark Rig output, the agent calls `BLAST_AT` and **keeps firing the rig**. If ',
  'that reads right the agent does not LACK the toggle, it **EXCEEDS** the human by never paying its ',
  'opportunity cost — rule 3 violated in the direction the audit is not looking. **I did not verify ',
  'the opportunity cost** (it lives in `Game.ts`\'s attack path, outside what this probe read), so it ',
  'is filed as a question, not a finding. ',
  '📋 **DUTIES: backup PUSHED · DEPLOY SKIPPED BY RULE and said plainly rather than silently — this ',
  'fire merged NO gameplay code (`src/` untouched), so it is bookkeeping-only and the DEPLOY LAW does ',
  'not apply; the live build stays s1648\'s VERIFIED `910d2245` · assayer `pending/` EMPTY, no verdict ',
  'owed · ART slot untouched, so its staging audit was not triggered · lock archived AT LOCK TIME ',
  'rather than at handoff (F-1648-3: drop-then-restore only works if the restoring fire survives, and ',
  's1647 did not).** ',
  '🏭 **BOARD: all five queues EMPTY · all four lanes `ahead=0` USABLE (a/b/c/d behind 8/24/109/72) · ',
  'runner UP at pid 57599 · no done-moves waiting.** ',
  '➡️ **NEXT: (A)** ⚠️ **DO NOT AUTHOR AP-16-6 without reading F-1649-1 first** — it looks authorable ',
  'from every surface a refilling fire reads (spec slice exists, `ap16-5b` merged, four idle lanes) ',
  'and only the implementation surface says otherwise. **(B)** **AP-03 (the Rider Protocol = ',
  '`/skill.md`)** is still named authorable by s1645/s1646 and does **not** contend with AP-16 — it is ',
  'the strongest remaining candidate, but **prove its harness before writing scope** (s1646\'s method, ',
  'and the one that just saved this fire a wasted master). **(C)** attended — **F-1649-1** wants ',
  'AP-16-6 re-sliced against its real surface, and **F-1639-3** still gates SEA-3. **(D)** **F-1648-1** ',
  'is the owner\'s call and the queue stays parked until it comes. ',
  desk,
].join('');

const out = [body, `- **s1649 lock (line-1 archive):** ${lock}`, ...lines.slice(1)].join('\n');
writeFileSync(P, out);
console.log('OK handoff written, stamp', stamp);

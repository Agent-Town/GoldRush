import fs from 'node:fs';
const p = 'docs/bench/e5-readiness-census.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const head = lines.slice(3, 34);
const br = lines.slice(35, 56);

const mainBanner = head.slice(0, 21);
const mainIntro = head[22];
// branch pieces
const brIntro = br[0];
const brWhatChanged = br.slice(2, 12);

const bridge = [
  '',
  '> ## 🔌 RE-MEASURED AGAIN 2026-08-06 — `milk/twin-sockets`. **THE DEEPWATER SOCKET IS BUILT.**',
  '>',
  '> Merged s1498 on top of the `milk/deepwater-surgery` banner above. **Both passes are 2026-08-06 and both are',
  '> retained**: the surgery pass cured two CONTENT defects, this pass built the SIM SOCKET. They are disjoint in',
  '> substance and they agree on every number they share — **with one exception, resolved in favour of the surgery**',
  '> **pass because it is strictly newer.** `milk/twin-sockets` was authored against a base where the Regatta',
  '> briefing still promised six beacon gates, so its own rows below read **BROKEN: 1 of 4**. That defect was cured',
  '> at `45f54b88` before this branch merged. ➡️ **BROKEN IS 0 of 4.** Every twin-sockets sentence asserting',
  '> otherwise is struck in place below, never deleted — F-1497-1: a review’s claims about a shared document are',
  '> perishable, and draining a pile in order is what perishes them.',
];

const mergedBullets = [
  '- **AGENT-READY: 0 of 4.** Unmoved by both passes — admission needs a *terminating* contract, not just a socket.',
  '- **DATA-GAP: 3 of 4** — Regatta, Stillwater and Flotilla, each declaring a consumer that exists nowhere in the codebase. **Down from 4 of 4** because the Deepwater Claim’s consumers are no longer *missing*, they are *unreachable* (next bullet). ✅ The surgery pass’s declaration cure STANDS and is unaffected: all four contracts now declare `engineDependencies`, the Claim naming `deepwater-claim-consumer`. Re-measured across both passes, the derived manifests still expose **0 buildables · 0 interactables · 0 operations** for the three variants, so that declaration added no vocabulary — it only stopped the contract lying by omission.',
  '- **BLOCKED-ON-BROWSER-ONLY-CONSTRUCTION: 1 of 4** — the Deepwater Claim. `DredgeQueenBossSystem` cannot be constructed outside a browser at all, and it owns the contract’s only secure condition. This verdict is NEW in this pass and replaces the Claim’s former DATA-GAP row.',
  '- ~~**BROKEN: 1 of 4 (Regatta, also DATA-GAP)** — unchanged: the briefing promises six beacon gates while `raceCourse.beacons` and the terrain contract define five.~~ ⛔ **STRUCK — STALE ON ARRIVAL.** ✅ **BROKEN: 0 of 4.** The briefing now reads *"Five beacon gates mark the out-and-back course."* Five was load-bearing on four independent surfaces (`contracts.json` `raceCourse.beacons`, `mask-tables/e5-regatta.json`, `regatta-terrain-contract.json`, and that file’s `maskAgreement.beacons`) against one prose string, and canon is silent on the count. Pinned by ADMISSION GATE 2. **Regatta’s verdict is DATA-GAP only.**',
  '- The Claim’s derived manifest now carries six consumer-derived rules covering boat pads and anchors, water depth classes and the dive zone, the storm track and its corsair cadence, the arsenal and its shared munition, and — explicitly — the two levers an agent cannot reach. The three variants remain silent by design; their defining data must not become vocabulary while their consumers do not exist (reject-don’t-stretch).',
  '- Both boat levers were exercised and are real: `reanchor` moved `lagoon → open-water` and rejected a repeat of the current anchor; `placeBoatBuilding` placed on `bow` and rejected a second placement on the occupied pad.',
  '- All four derived manifests expose zero interactable **agent** operations. The seven standing-order grammar forms cannot express the defining mechanics of the three variants; generic verb acceptance would not be coverage.',
  '- Both diagnostic seeds were forced through the generic path and repeated byte-identically. They remain outside the production bench registry because no E5 contract was admitted. The focused spec passed 8/8 across desktop and mobile projects, including both-seed support rejection and zero captured `console.error`/`console.warn` output.',
  '- **The forced diagnostic is a temporary, reverted probe, not a code path.** `SUPPORTED_CONTRACTS` was patched in a scratch copy to let `gr-sim` construct these contracts, then `src/sim/HeadlessContractSim.ts` was restored and **verified byte-identical by sha256** (`a455db64…1098` both sides). Nothing about the support gate shipped.',
];

const out = [...mainBanner, ...bridge, '', mainIntro, '', brIntro, '', ...brWhatChanged, '', '## EXECUTIVE SUMMARY', '', ...mergedBullets];
const merged = [...lines.slice(0, 2), ...out, ...lines.slice(57)];
fs.writeFileSync(p, merged.join('\n'));
const txt = merged.join('\n');
console.log('markers left:', (txt.match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length);
console.log('brWhatChanged[0]:', JSON.stringify(brWhatChanged[0]));
console.log('brWhatChanged[last]:', JSON.stringify(brWhatChanged[brWhatChanged.length - 1].slice(0, 60)));
console.log('mainBanner[last]:', JSON.stringify(mainBanner[mainBanner.length - 1].slice(0, 60)));

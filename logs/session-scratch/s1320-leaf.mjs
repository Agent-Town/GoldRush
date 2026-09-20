import fs from 'node:fs';
const p = 'tasks/goals.json';
const raw = fs.readFileSync(p, 'utf8');
const g = JSON.parse(raw);
const leaf = {
  id: 'f1319-3-terrain-seed-per-sample-url-parse',
  title: "F-1319-3 root cause (s1320): terrainSeed() re-parses window.location.search into a NEW URLSearchParams and re-runs normalizeSeed on EVERY call (Terrain.ts:1619-1622); terrainHash calls it per hash, valueNoise calls terrainHash 4x, sample()/terrainFeatures call valueNoise ~9x — so ONE terrain sample costs ~36 URL parses. A --cpu-prof of one e1-night-shift episode attributes 67% of 19.85s to URL parsing (parseParams 41.4%, normalizeSeed 14.1%, URLSearchParams ctor 9.0%, get search 2.6%). Both of F-1319-3's hypotheses are REFUTED by measurement: construction/placeFree cost is indistinguishable between arms (nonTickMs 801-949ms vs 482-1178ms), and 7 working lanterns cost only +970ms while flipping the SAME seven to wrecked costs +16,730ms — wrecked instances alone fall through updateRepairs' cheap continue (BuildSystem.ts:2117) into terrainMaxForFootprint every tick, which is why they made it visible. NOT headless-only: window is always defined in a browser, so the shipped game pays the same cost per terrain sample, per frame. Cure measured both ways, both bit-for-bit determinism-preserving (eventLogHash fnv1a32:c086ef19 unchanged): search-keyed cache 19,048->3,704ms (5.1x, drop-in, recommended), naive memo 19,048->2,174ms (8.8x, needs explicit invalidation at 4 replaceState/pushState sites).",
  taskFile: 'lane-d-f1319-3-terrain-seed-per-sample-url-parse.md',
  status: 'queued',
  reason: 'Authored s1320 from a --cpu-prof attribution + 5 measured arms; queued to lane-d (lane/perf), verified USABLE immediately before the copy.',
};
let placed = false;
const walk = (n) => {
  if (n.id === 'agent-play') {
    (n.tasks ??= []).push(leaf);
    placed = true;
    return;
  }
  [...(n.subgoals || []), ...(n.tasks || [])].forEach(walk);
};
(g.goals || [g]).forEach(walk);
if (!placed) throw new Error('agent-play parent not found');
const trailing = raw.endsWith('\n') ? '\n' : '';
fs.writeFileSync(p, `${JSON.stringify(g, null, 2)}${trailing}`);
console.log('leaf added under agent-play');

import fs from 'node:fs';

const p = 'tasks/goals.json';
const L = fs.readFileSync(p, 'utf8').split('\n');

// Anchor: the closing brace of the f1591-1 leaf (line 4644, 1-indexed) -> index 4643.
const anchor = L.findIndex((l) => l.includes('"id": "f1591-1-frame-supply-cliff"'));
if (anchor < 0) { console.error('f1591-1 leaf not found'); process.exit(1); }
// Walk forward to that leaf's closing "            }," line.
let close = -1;
for (let i = anchor; i < anchor + 20; i += 1) {
  if (L[i] === '            },') { close = i; break; }
}
if (close < 0) { console.error('closing brace not found'); process.exit(1); }

const gate = "none - fire-authorable. Discharges F-1590-2's Arm B (batch position), which has been carried unmeasured across three fires and which f1591-1 correctly stopped before reaching. Lawful as a fifth attempt at F-1587-2 under the changed-premise rule because the PREMISE changed on a measurement, not a hunch: s1592 PROVED the lever (artifacts/f1592-1-cdp-throttle-lever/) - CDP Emulation.setCPUThrottlingRate drove the town to 4.94 and 4.05 fps with Delta-elapsed/Delta-frame pinned at exactly 0.050000 on every frame, the first direct observation of the 0.05 clamp engaging in four attempts. What remains unproven is whether the factory's REAL arrangement ever depresses frame supply that far. The methodological upgrade is a POSITIVE CONTROL (Arm P at rate 60), which converts a null result from uninterpretable noise into a finding: without it, a null is ambiguous between 'the load does not starve frame supply' and 'my harness cannot see starvation', and f1591-1 spent a full lane run in exactly that trap. MEASUREMENT ONLY - ships no cure by construction, and a DOES-NOT-ARM-IN-PRACTICE verdict is an accepted deliverable.";

const leaf = [
  '            {',
  '              "id": "f1592-3-battery-frame-supply",',
  '              "title": "F-1590-2 Arm B: does the REAL gate battery starve frame supply? - measured against a proven positive control",',
  '              "status": "queued",',
  '              "taskFile": "lane-b-f1592-3-battery-frame-supply.md",',
  `              "gate": ${JSON.stringify(gate)}`,
  '            },',
];

L.splice(close + 1, 0, ...leaf);
fs.writeFileSync(p, L.join('\n'));

const g = JSON.parse(fs.readFileSync(p, 'utf8'));
let found = null;
const walk = (n) => {
  if (n && typeof n === 'object') {
    if (n.id === 'f1592-3-battery-frame-supply') found = n;
    for (const k in n) walk(n[k]);
  }
};
walk(g);
console.log(found ? `leaf registered: ${found.id} status=${found.status}` : 'LEAF NOT FOUND');

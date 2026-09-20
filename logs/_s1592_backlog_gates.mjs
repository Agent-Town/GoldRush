import fs from 'node:fs';
const p = 'tasks/BACKLOG.md';
const L = fs.readFileSync(p, 'utf8').split('\n');
if (!L[0].includes('F-1592-1 (s1592')) { console.error('row 1 moved'); process.exit(1); }
if (!L[1].includes('F-1592-2 (s1592')) { console.error('row 2 moved'); process.exit(1); }

L[0] += " ✅ **GATE MET IN THE SAME FIRE — THE LEVER IS PROVEN, AND IT CONFIRMED THE DERIVATION IT WAS BUILT TO TEST** (`artifacts/f1592-1-cdp-throttle-lever/`, control + 4 rates, all `errors=0`). CDP `Emulation.setCPUThrottlingRate` arms what 16 external hogs could not: **rate 20 → 13.15 fps / 76.0 ms interval / max ratio exactly `0.050000`; rate 60 → 4.94 fps and rate 80 → 4.05 fps, both with mean AND max ratio pinned at `0.050000` on EVERY frame.** ⭐ **That is the FIRST direct observation of the 0.05 clamp ENGAGING across four attempts at F-1587-2** — every prior sample, `f1591-1`'s Arm 0 included, was taken above the knee where the ratio provably cannot move. 📐 **The magnitudes name the real lesson:** external hogs at N=16 moved the frame interval **0.5%**; a CDP throttle at rate 20 moved it **809%**. **The lever CLASS was the defect, not the lever's size.** ✓ **Lever liveness is evidenced in-artifact, not in prose** (F-1592-2 cured on itself): an in-page busy loop runs 2.3 ms unthrottled vs 41.1 ms at rate 20 = **17.9× against a requested 20×**. ✓ **The control reproduces the merged `f1591-1` artifacts** (119.56 fps / 0.008370 vs their 119.42–119.97 / 0.008351–0.008388), which is what licenses the harness as an instrument. ⚠️ **STILL NOT SHOWN, AND THE NEXT AUTHOR MUST NOT SKIP IT: nothing here proves the factory's REAL arrangement ever reaches 2.7 fps.** A synthetic throttle proving the mechanism CAN fire is not evidence that the gate battery DOES fire it — that is still F-1590-2's untested Arm B, and no run here timed out. Report: `artifacts/f1592-1-cdp-throttle-lever/REPORT.md`.";

L[1] += " ✅ **CURED ON THE VERY NEXT PROBE, s1592** — `artifacts/f1592-1-cdp-throttle-lever/probe.mjs` records the lever's kind, rate, applied-flag, error and busy-loop timing in every artifact, so one file evidences subject and lever together. The busy-loop measurement is what turned *\"the throttle was applied\"* from an assertion into a number (2.3 ms → 41.1 ms → 310.4 ms across rates). **GATE MET.**";

fs.writeFileSync(p, L.join('\n'));
console.log('gates updated');

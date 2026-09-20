// Is the jitter COMMON-MODE within a run? If the same run that reads baseline.calls=87 also
// reads combatDeath.calls=58, the offset is shared and cancels in any phase-to-phase delta.
// That is the difference between "absolutes are unusable" and "absolutes are unusable but
// deltas are exact" — and it decides the shape of the F-1476-1 cure.
import fs from 'node:fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/artifacts/s1477-noise/samples-wire-railcar-3d-desktop-chrome.json';
const samples = JSON.parse(fs.readFileSync(p, 'utf8'));

console.log('run | base.calls base.tri base.geo | combat.calls combat.tri combat.geo | (combat-base) calls tri geo');
const deltas = new Set();
for (const s of samples) {
  const b = s.counts.baseline, c = s.counts.combatDeath;
  const d = [c.calls - b.calls, c.triangles - b.triangles, c.geometries - b.geometries];
  deltas.add(d.join(','));
  console.log(`${String(s.run).padStart(3)} | ${b.calls} ${b.triangles} ${b.geometries} | ${c.calls} ${c.triangles} ${c.geometries} | ${d.join(' ')}`);
}
console.log(`\ndistinct (combatDeath - baseline) triples across ${samples.length} runs: ${deltas.size}`);
console.log([...deltas].map((d) => '  ' + d).join('\n'));

// Every phase-pair delta, to see how general the cancellation is.
const phases = Object.keys(samples[0].counts).filter((k) => k !== 'despawnDelta');
console.log('\n=== every phase-pair delta, distinct values across runs ===');
for (let i = 0; i < phases.length; i++) {
  for (let j = i + 1; j < phases.length; j++) {
    for (const m of ['calls', 'triangles', 'geometries', 'textures']) {
      const vals = new Set(samples.map((s) => s.counts[phases[j]][m] - s.counts[phases[i]][m]));
      const tag = vals.size === 1 ? 'STABLE' : `NOISY(${vals.size})`;
      console.log(`${phases[j]}-${phases[i]}.${m}: ${tag} ${[...vals].join('/')}`);
    }
  }
}

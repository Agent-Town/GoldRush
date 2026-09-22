"""Record only measured map results after its gates and store commit."""
from pathlib import Path
import json,sys,subprocess,os
cid,title=sys.argv[1:3];root=Path('artifacts/sol/map-art-campaign-2');folder=root/'run-7'/cid
read=lambda name:json.loads((folder/name).read_text())
config=read('capture-config.json');solids=read('selected-solids.json');walk=read('walk-proof.json');perf=read('performance-summary.json');plain=read('plain-paired.json');build=read('build-gates.json');budgets=read('asset-budgets.json')
assert all(x['exit']==0 for x in build);assert all(not x['errors'] for x in plain);assert len(plain)==4
assert all(x['within15Percent'] for x in perf['rows']);assert all(x['navigation']['spawnWalkable'] and all(t['reachable'] for t in x['navigation']['targets']) for x in walk)
gates=sorted(folder.glob('e2e-*.json'));receipts=[(p.name,json.loads(p.read_text())) for p in gates]
final=[(n,rs) for n,rs in receipts if 'own-stable' in n or 'collision' in n or n=='e2e-own-gates.json']
# An initial invalidated own batch is superseded by own-stable; preserve its raw receipt.
if any('own-stable' in n for n,_ in final):final=[(n,rs) for n,rs in final if n!='e2e-own-gates.json']
assert final
if any(any(r['exit']!=0 for r in rs) for _,rs in final):assert (folder/'failure-attribution.md').exists()
assert read('probes-gates.json')[0]['exit']==0 and read('probes-gates.json')[1]['exit']==0
assert (folder/'invariants.json').exists()
named_pass = 'guards: 3/3 passed' in (folder/'named-guards.log').read_text()
if not named_pass: assert (root/'run-7/gate-caller-attribution.md').exists()
named_verdict = '**3/3** pass' if named_pass else '**2/3** pass; gate-callers rejects the newly tracked union test because its package roster entry is outside the task firewall; see [attribution](../gate-caller-attribution.md)'
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
after=subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs';console.log(await computeEngineHash(process.cwd()))"],env=env,text=True).strip()
before=(folder/'engine-before.txt').read_text().strip();store=subprocess.check_output(['git','-C','/Users/robin/Claude/Projects/GoldRush-assets','rev-parse','HEAD'],text=True).strip()
(folder/'engine-hashes.json').write_text(json.dumps({'before':before,'after':after,'storeCommit':store},indent=2)+'\n')
tri=sum(b['actualTriangles'] for b in budgets if b.get('id') in [s['id'] for s in solids]);payload=build[-1]['payload']['bytes'];base=json.loads((root/'run-7/baseline-payload.json').read_text())['bytes']
summary='; '.join(f"{r['width']}px p95 {r['before']['median']:.2f}→{r['after']['median']:.2f} ms ({r['pooledMedianChangePercent']:+.2f}%), draws {r['before']['calls']}→{r['after']['calls']}" for r in perf['rows'])
body='\n'.join(f"| `{s['id']}` | {s['position']} | {s['rotation']} | {s['scale']} |" for s in solids)
floor='Both Picnic seeds moved: 97967→97367 ms, kills 35→24, fnv1a32:6dc50c46→fnv1a32:a887b86b; 98533→100200 ms, kills 32→25, fnv1a32:774ca441→fnv1a32:547712da. The shade at (0,40) is the sole added blocker and the likely routing cause. Drain owns re-pinning.' if cid=='e6-picnic' else 'This map’s pinned null floors match. The complete fleet check is 81/83; only the two Picnic seeds moved. Pins remain untouched.'
text=f'''# {title} — run 7 variant footprints

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All {len(solids)} registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **{config['baselineMounts']}→10 bodies**, **+{tri} authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

| New solid | X/Z | Y rotation (rad) | X/Z scale |
| --- | --- | --- | --- |
{body}

[Desktop before/after beside concept](board-1280.png) · [Phone before/after beside concept](board-390.png). Ordinary boots at 1280×800 and 390×844, seed `map-art-campaign-2`, no debug/test hook, ordinary HUD, approximately ten seconds: **zero console/page errors** in both arms. These remote authored solids need not appear in the entry camera; per-body diagnostic approach screenshots are the `walk-*.png` files. Existing concept/composition limitations remain as recorded in [run 6](../../run-6/{cid}/review.md); this slice closes solidity only.

Movement: **{len(solids)} bodies × four outer faces × two viewports** stop the hero within 0.12 m of the composed blocker boundary; overlapping parent footprints are probed as one connected solid group. Every embedded-body probe depenetrates. Both natural spawns are walkable. All **{len(walk[0]['navigation']['targets'])} published stakes, harvest points, inspection stations and sites** are reachable through the real Terrain.sample walkability on a 0.5 m cardinal grid; rectangular sites may be approached at any reachable point inside the published area, with coordinates recorded. No patrol route points are declared in these four contracts. This is a static reachability proof plus actual keyboard/sim face and escape probes, not a claim of a full objective playthrough. [Complete movement and mount proof](walk-proof.json).

Six fresh mount/dispose cycles retain exactly ten bodies, no skipped loads and zero scene children after disposal. All registered X/Z positions, rotations and scales match the rendered models exactly. All parent and registry bytes, source geometry and unrelated map blocker outputs match the base. [Invariant proof](invariants.json) · [Asset budgets](asset-budgets.json). Generic loading **8/8**, repeat **2/2** pass; map-specific load/dispose evidence is in the movement proof because those generic scripts target E5/Mare rather than accepting a map argument.

TypeScript, default/full/E1 builds pass. E1 first-town payload **{payload:,} B**, baseline **{base:,} B**, delta **{payload-base:+} B**, under 52,000,000 B; there are no new E1 art bytes, only the shared resolver’s compiled code delta. Scoped guards **40/40**, named guards {named_verdict}. Browser suite receipts: {', '.join('['+n+']('+n+')' for n,_ in final)}. Any reproduced baseline failures are named in failure-attribution.md; no test assertion was changed.

Performance: four fresh boots per arm/viewport, 180 rAF intervals each, alternating arms: **{summary}**. Both pass the 15% limits. [All samples and modes](performance-summary.json).

Null-floor check: {floor} [Fleet output](../null-floor-check.log).

Same-game audit: **32 equal / 10 agent-lacks**, byte-identical map rows on the exact base and candidate. The requested all-EQUAL verdict is not met on the base: restart/debug/research/pause/agent-permission tape actions are the ten static deficits. This slice changes none of their owners. [Exact-base comparison](../same-game-comparison.json).

Engine `{before}` → `{after}`. Store `{store}` on `astra/f-corr4-2`. Engine-era and null-floor pins remain drain-owned.
'''
(folder/'review.md').write_text(text)
status=Path('reviews/sol-map-art-current-status-20260909.md');lines=status.read_text().splitlines();matches=0
for i,line in enumerate(lines):
 if line.startswith('| '+title+' ('+cid+') |'):
  cells=line.split(' | ');cells[-1]=f"2026-09-22 run 7: FIXED variant solidity: {len(solids)} registered bodies selected, {config['baselineMounts']}→10 total, +{tri} triangles. Parent blockers retained; all {len(walk[0]['navigation']['targets'])} published destinations reachable; face/escape and six mount/dispose cycles pass both viewports. Prior run-6 art gains retained; composition/UI limitations and baseline parity debt remain HELD. {'Picnic null floors moved; drain owns pins. ' if cid=='e6-picnic' else ''}[Boards, numbers and gates](../artifacts/sol/map-art-campaign-2/run-7/{cid}/review.md). |";lines[i]=' | '.join(cells);matches+=1
assert matches==1;status.write_text('\n'.join(lines)+'\n')
report=root/'report.md';s=report.read_text();order=['e6-picnic','e7-dead-band','e7-relay-rush','e8-far-side'];remaining=order[order.index(cid)+1:];s=s.replace(next(line for line in s.splitlines() if line.startswith('Remaining in order:')), 'Remaining in order: '+('; '.join(remaining) if remaining else 'none')+'.');s+=f'\n### Run 7 — {title}\n\n'+text.split('\n\n',2)[1]+f'\n\n{summary}. Engine `{before}` → `{after}`; store `{store}`. [Boards, probes, bounds and gates](run-7/{cid}/review.md).\n';report.write_text(s)
print(cid,tri,'triangles',summary,after)

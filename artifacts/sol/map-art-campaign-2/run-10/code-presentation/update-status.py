from pathlib import Path
import sys
id=sys.argv[1]
updates={
'e1-twin-banks':('Twin Banks (e1-twin-banks)', '**2026-09-24 run 10: code — scatter clause IMPLEMENTED; full acceptance HELD.** “Sparse prop cards lack riparian density” / “generic scatter cards remain scatter-owner scope”: 248 desktop / 102 phone cards now use existing-atlas reeds, willow and driftwood, at the same 6 draws; roots embed 0.025 m in delivered terrain, with 1 m build-zone/ford exclusion. All 41 other maps\' scatter captures are byte-identical. Frame p95 9.95→9.65 ms desktop / 9.95→9.70 ms phone. E1 first-town 34,341,349 B (+0 B); whole-slice lazy release output +316,650 B. Six original Twin Banks failures reproduce on saved source; camera/HUD/objective holds remain. [Clause, boards and hashes](../artifacts/sol/map-art-campaign-2/run-10/code-presentation/e1-twin-banks/review.md).'),
'e2-trestle':('The Trestle (e2-trestle)', '**2026-09-24 run 10: code — shared rail clause IMPLEMENTED; full acceptance HELD.** “Intersecting/abruptly ending rails dominate” / “HELD for shared route joins/ends” / “shared rail joins/ends belong to the rail-presentation owner”: 1 five-sleeper junction, 4 frogs with 0.17 m flangeways and 4 buffer stops, at 2 unchanged draws. Routes/stations unchanged; Hill Mine, Incline and Canyon Works improve under the same rule; Eclipse/Mare Claim/Dome Basin mesh bytes are identical. Frame p95 9.90→10.00 ms desktop / 9.90→10.05 ms phone. E1 first-town 34,341,349 B (+0 B). Own cases pass both projects; inherited entry/HUD/full-route holds remain. [Each rail map, boards and hashes](../artifacts/sol/map-art-campaign-2/run-10/code-presentation/e2-trestle/review.md).'),
'e7-relay-rush':('Relay Rush (e7-relay-rush)', '**2026-09-24 run 10: code — active-signal clause IMPLEMENTED; full acceptance HELD.** “static frames do not claim a relay is active” / “Relay Rush\'s active signal”: 4 existing frame materials follow lit/muted/suppressed state; only an active lamp pulses at 0.75 Hz (amplitude 0.75–1.35), inactive/muted/suppressed lamps are dark. Zero added objects/lights/draws/view fields; no owner on maps without relays. All 38 supported headless view captures are byte-identical. Frame p95 9.95→9.95 ms desktop / 9.85→10.00 ms phone; E1 first-town delta +0 B. Own/front/suppression cases pass both projects. Whole-route/layout/HUD and native objective holds remain. [States, boards, lifetime proof and hashes](../artifacts/sol/map-art-campaign-2/run-10/code-presentation/e7-relay-rush/review.md).')}
label,text=updates[id]
p=Path('reviews/sol-map-art-current-status-20260909.md');lines=p.read_text().splitlines(keepends=True);found=0
for i,line in enumerate(lines):
 if line.startswith('| '+label+' |'):
  assert 'run 10: code' not in line
  parts=line.split(' | ',2);assert len(parts)==3
  lines[i]=' | '.join([parts[0],parts[1],text+' Prior record: '+parts[2]]);found+=1
assert found==1
p.write_text(''.join(lines))

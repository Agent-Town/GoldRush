from pathlib import Path
import json,re,subprocess

root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing')
def read(path):return json.loads((root/path).read_text())
def totals(path):
    text=(root/path).read_text()
    return {key:int((re.findall(r'(?m)^\s*(\d+) '+key+r'\b',text) or ['0'])[-1]) for key in ['passed','failed']}
plans=read('map-plan.json');maps=[];previous=read('baseline-payload.json')['bytes']
for id,mount,why in plans:
    build=read(f'{id}/build-gates.json');assert all(row['exit']==0 for row in build)
    payload=next(row['payload']['bytes'] for row in build if 'payload' in row)
    assert payload<52_000_000
    invariants=read(f'{id}/invariants.json');declarations=invariants['declarations']
    commits=subprocess.check_output(['git','log','--format=%H','--fixed-strings','--grep',f'feat: frame {id} entry landmarks'],text=True).splitlines()
    maps.append({'map':id,'why':why,'declarations':declarations['entryLandmarks'] or [declarations['entryLandmark']],
      'metrics':read(f'{id}/metrics.json'),'decision':read(f'{id}/decision.json'),'ownTests':totals(f'{id}/e2e-own.log'),
      'e1Bytes':payload,'deltaBytes':payload-previous,'engineBefore':(root/id/'engine-before.txt').read_text().strip(),
      'engineAfter':(root/id/'engine-after.txt').read_text().strip(),'laneCommit':commits[0] if commits else 'this commit',
      'storeCommit':read(f'{id}/store-commit.json')['commit']})
    previous=payload
plain=read('all-plain-boots.json');assert len(plain)==12 and all(not row['errors'] for row in plain)
assert all(row['exit']==0 for row in read('e7-relay-rush/guards-gates.json'))
assert totals('e7-relay-rush/e2e-parity.log')=={'passed':12,'failed':2}
assert totals('e7-relay-rush/e2e-release.log')=={'passed':26,'failed':4}
release=read('release-baseline.json');assert release['matchesCandidateFailure']
assert totals('release-baseline-browser.log')=={'passed':0,'failed':2}
assert (root/'release-baseline-browser.log').read_text().count('release-build.spec.ts:330:103')==2
summary={'status':'READY-FOR-GATES; full browser/release acceptance HELD','remainingMaps':[],
 'maps':maps,'plainBoots':12,'plainConsolePageErrors':0,'replayTests':{'passed':2,'failed':0},
 'agentViewTests':{'passed':10,'failed':2},'releaseTests':{'passed':26,'failed':4},
 'strictReleaseBuildExit':read('release-build.json')['exit'],'proof':read('final-proof.json')}
(root/'final-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
lines=['# Entry framing pass two — 2026-09-24','','**READY-FOR-GATES. All six map slices are implemented and measured; full browser/release acceptance remains HELD.**',
 '', '**REMAINING LIST IN ORDER: EMPTY.** The holds below require work outside this task firewall; they are not silently waived.',
 '', '## Scope and behavior', '',
 'The four E1/E2 maps use the existing zero-body-pixel entry trigger. Glow Mesa and Relay Rush accept an ordered list of at most two landmarks, retaining the singular as its first element. Only zero-body landmarks enter the tour. A two-stop tour keeps the original 2.5 s window and 0.7 s entry/return eases, replacing the old 1.1 s hold with 0.2 s hold / 0.7 s transit / 0.2 s hold. Single-stop poses remain exact. The shorter phone dwell is measured below; HUD clearance and full landscape fidelity are not claimed.',
 '', 'Source changes are limited to CameraRig and MechanicsManifest. The Game hook, sim, View, Balance, every heroStart, tests/assertions/fixtures, pins, GLBs and atlases are untouched. The store has exactly 12 changed contract files, with paired entry metadata equal and all other JSON values unchanged. See [final proof](final-proof.json).',
 '', '## Landmarks, reasons and holds','']
for m in maps:
    lines += [f'### {m["map"]}', '', ', '.join(f'`{d["mountId"]}`' for d in m['declarations'])+'. '+m['why'], '',
              '**'+m['decision']['verdict']+'** '+m['decision']['reason'], '',f'[Boards, raw measurements and map-specific gates]({m["map"]}/review.md).','']
lines += ['## Measured body visibility','',
 'Depth-tested unique-magenta counts use a fixed DPR-1 viewport render target: 1280×800 or 390×844. Counts exclude the HUD; the companion screenshots keep it. Durations sum visible intervals in recorded live camera poses against a frozen final scene, with sampling bounds. An asterisk means visibility reaches an observation edge. For a skipped body, “peak” is the other landmark’s stop, not a claimed glance at that body.', '',
 '| Map / landmark | Width | Rest → peak → return pixels | Seconds observed visible | Targeted |',
 '| --- | ---: | ---: | --- | --- |']
for m in maps:
    for v in m['metrics']:
        lines.append(f'| {m["map"]} / `{v["mountId"]}` | {v["width"]} | {v["restPixels"]:,} → {v["peakPixels"]:,} → {v["returnPixels"]:,} | {v["observedVisibleSecondsLower"]:.3f}–{v["observedVisibleSecondsUpper"]:.3f}'+(' *' if v['durationCensored'] else '')+f' | {v.get("landmarkTargeted",v["triggered"])} |')
lines += ['', 'Superseded `native-buffer` and `difference-census` measurements are retained only as audit history. Adaptive drawing-buffer resolution changes the pixel denominator; two-render RGB differences can count animated water. Final tables use the corrected evidence-only census. The production trigger census remains byte-identical to the first pass.', '',
 '## Validation and gate holds','',
 '- TypeScript, default, full and E1 builds: PASS after each map. All requested scoped node guards and named task/citation/gate-caller guards: PASS, including a final rerun after Relay Rush.',
 '- All 12 final uninjected plain boots: PASS, zero console/page errors, no test hook or injected entry handle. [Receipt](all-plain-boots.json); each map folder has `plain-window-*` and `plain-return-*` screenshots.',
 '- Exact boat replay test `e2e/e5-regatta-boat.spec.ts:196`: PASS 2/2, desktop/mobile. [Combined parity receipt](e7-relay-rush/e2e-parity.json).',
 '- Camera baseline: 1,200 ordinary/replay/multiplayer/moving/zoom/impulse poses and 540 single-entry poses match exactly; 600 long-pan frames retain orientation. Two-stop timing and all four visibility combinations PASS. [Rig proof](rig-proof.json), [list proof](list-proof.json).',
 '- 50 deterministic headless `now` snapshots: byte-identical. Across 42 manifests, everything except the required landmark prose is byte-identical. The complete same-game audit is byte-identical: 1,763 rows, 1,252 equal and 511 existing agent-lacks rows. This is unchanged audit output, not a claim that those existing gaps are closed. [Proof](final-proof.json), [audit](audit-proof.json).',
 '- **Introduced fixture mismatch:** agent-view passes 10/12. The two `:439` failures are exactly the three required E1 landmark sentences absent from the protected fixture. Pre-task source matches that fixture; removing only those sentences makes the candidate match byte-for-byte. [Attribution](manifest-fixture-attribution.json). The fixture remains untouched under the firewall.',
 '- **Release acceptance HELD:** strict `GR_RELEASE=e1 npm run build:release` exits 1 because `motor-hauler-DGEx9v27-diet-c2bea0ac.glb` is emitted. A build with both pre-task TS modules reproduces the identical leak. The unchanged static asset URL is at `src/entities/Vehicle.ts:10`. [Build receipt](release-build.json), [control receipt](release-baseline.json).',
 '- The unchanged release suite passes 26/30. Its two dist assertions fail on that leak; both first-player tests also fail at Dry Gulch harvest channeling (`release-build.spec.ts:330`). An isolated pre-task-source build, with the same asset-diet step, reproduces both harvest failures at the identical assertion. [Candidate](e7-relay-rush/e2e-release.log), [control](release-baseline-browser.log). All 12 E1 release-door boots pass. The artifact-only release config uses port 5303 and leaves the existing suite/assertions unchanged.',
 '', '| Map own suite | Passed | Failed |', '| --- | ---: | ---: |']
for m in maps:lines.append(f'| {m["map"]} | {m["ownTests"]["passed"]} | {m["ownTests"]["failed"]} |')
lines += ['']
for m in maps:
    if m['ownTests']['failed']:lines += [f'- **{m["map"]}:** '+m['decision']['tests']]
lines += ['', 'The initial Night Shift `base-control` attempt was INVALID because an evidence-server loader error prevented boot. Attribution uses only the corrected `base-verified` controls. The first release-baseline attempt also failed to load Vite configuration and supplies no attribution; the corrected control uses Vite’s config loader. No protected assertion or fixture was edited to make a gate green.', '',
 '## Payload and engine receipts','',
 '| Map | Standard E1 build bytes | Delta from prior map/build |', '| --- | ---: | ---: |']
for m in maps:lines.append(f'| {m["map"]} | {m["e1Bytes"]:,} | {m["deltaBytes"]:+,} |')
lines += ['', 'Baseline first-town payload: 34,318,546 B. Every build stays below 52,000,000 B. Deltas are measured before the separate strict release asset-diet step.', '',
 '| Map | Engine before | Engine after |', '| --- | --- | --- |']
for m in maps:lines.append(f'| {m["map"]} | `{m["engineBefore"]}` | `{m["engineAfter"]}` |')
lines += ['', 'The engine pin remains drain-owned.', '', '## Commits and handoff', '',
 'Lane branch: `sol/map-art-campaign-2`. Store branch: `astra/entry-framing-2`, pushed after each map. The specific firewall takes precedence over the copied first-pass store branch name. No mid-run reset/rebase or main/pin mutation was performed.', '',
 '| Map | Lane commit | Pushed store commit |', '| --- | --- | --- |']
for m in maps:lines.append(f'| {m["map"]} | `{m["laneCommit"]}` | `{m["storeCommit"]}` |')
lines += ['', 'The Relay Rush lane commit carries this closing note and the common proofs. Preflight had only expected `logs/guard-stats.jsonl` churn. Regenerated unrelated test screenshots were retained inside this evidence tree and their prior tracked files restored. All task servers are stopped after validation.', '',
 'Drain follow-ups: decide the three E1 fixture additions; handle the existing release asset leak and Dry Gulch harvest failure; retain the Night Shift/Twin Banks/Baron test holds and visual holds stated above. This branch does not widen the firewall to repair them.', '']
(root/'run-note.md').write_text('\n'.join(lines))
for m in maps:
    review=root/m['map']/'review.md';text=review.read_text()
    text=text.replace('Shared replay, parity and scoped guards are recorded in the run note.', 'Shared replay, parity, release checks and all gate holds are recorded in the [closing run note](../run-note.md).')
    review.write_text(text)
print('Final handoff written; all six maps recorded, remaining list empty, gate holds explicit.')

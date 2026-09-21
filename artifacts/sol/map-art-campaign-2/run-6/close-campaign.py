"""Compile the sixteen per-map evidence boundaries; no source, assets or history edits."""
from pathlib import Path
import json,subprocess

root=Path(__file__).resolve().parent
items=[
 ('e4-boneyard','Boneyard','Sleeper 1,842/3,000 triangles; ground RMS −53.93%/−48.91%.','Boiler 5 m 0%; sleeper 8 m 0.80%; entry offscreen.','Buried scale, yard depth, vehicle body and entry framing.'),
 ('e6-glow-mesa','Glow Mesa','Ground RMS −41.49%/−39.21%; emission 3→0.45.','Pylon 5 m 0%; entry rack offscreen.','Raised mesa, facility grouping and entry composition.'),
 ('e6-half-life-hollow','Half-Life Hollow','Ground RMS −40.00%/−40.30%; median +48.17%/+73.04%.','Gate 5 m 0.17%; entry offscreen.','Ravine, suspended crossings and full gate architecture.'),
 ('e6-picnic','Picnic','Three blankets and gate, +1,452 triangles; ground RMS −45.92%/−43.46%.','Pylon 5 m 0%; entry pylon 21.42%, blankets offscreen.','Solid shade variant, gathering, picnic vista and entry context.'),
 ('e7-dead-band','Dead Band','Two silent frames, +336 triangles; ground RMS −45.64%/−40.92%.','Radio 2 m 0.523%; warning 3 m 0.026%; north frame 3.513% plus crop. Entry chart/warning 4.015%/23.843%.','Terrace hierarchy, solid variants and entry UI.'),
 ('e7-relay-rush','Relay Rush','Four frames, +1,264 triangles; ground RMS −51.24%/−49.40%.','Dish 3 m 6.60%; chart 2 m 0.60%; entry R2 2.914%.','Ascending layout, horn variant, entry bounds and actor overlap.'),
 ('e8-far-side','Far Side','Landing frame +600 triangles; broad stripe share 36.09%→1.56%; fine-grain RMS +81.75%/+89.02%.','Landing 3 m 5.768%; array 3 m 10.75%; entry landing 10.385%.','Crater, suit/pressure equipment, isolated dish composition.'),
 ('e8-low-orbit','Low Orbit','Rig 2,972/3,000 triangles; body dark share ~81%→~8%.','Rig 3 m 0.998%; entry 47.291%.','Suspended station/debris depth, detailed contact and entry composition.'),
 ('e9-dome-basin','Dome Basin','Wheel 452→1,580/3,000 triangles; ground RMS −49.33%/−39.41%; five dry segments.','Wheel 5 m 0%; entry offscreen.','Wet C3 canal, basin rails/terraces and ordinary entry.'),
 ('e9-seed-run','Seed Run','Vault 800→2,148/3,000; ground RMS −59.39%/−62.50%; four route segments/three green zones.','Vault 3 m 0%; entry 23.326% (increased).','Convoy body, continuous irrigation, distant settlement and entry UI.'),
 ('e9-devils-alley','Devil’s Alley','Three coil rigs 1,848/2,192/2,536 under 3,000; RMS −40.50%/−20.91%.','Center 3 m 0.004%; entry 5.880% (increased).','Storm corridor, functional rings, mast detail and entry composition.'),
 ('e9-old-canal','Old Canal','Dry masonry 552 triangles/band; winches 1,444/1,456/1,468; RMS −69.99%/−25.61%.','Winch 5 m 0.111%; entry 15.861%.','Continuous wet vista, full architecture, contact and entry UI.'),
 ('e10-last-claim','Last Claim','Missing pack FIXED: terrain 32,768/60,000, panorama 1,024/4,000, five monuments 528–1,328/3,000.','Lantern 5 m 0.058%; entry 0.134%, body median 0.460.','Circular boundary/rim, legacy Ark deck, heart/grayscale and full preserve view.'),
 ('e10-ember-shore','Ember Shore','Titan 908→2,356/3,000; body median 0.123→0.231; ground median 0.053→0.337 / 0.061→0.321.','Five 5 m inspections ≤0.199%; entry altar 0.791%.','Giant buried titan, branching fissures, rectangular tone join and contact/light pools.'),
 ('e10-archive-world','Archive World','Gate 1,128→888/3,000, desktop entry area −31.83%; ground RMS −55.44%/−50.11%; earned pool 0.247→0.395.','Gate 10 m 68.719% (held regression); entry 15.794%. Other inspections 8.122/7.349/13.604/0.007%.','Full vista, state-zone borders, facade/contact and camera/UI conflict.'),
 ('e10-river','River','Bank RMS −21.09%/−9.12%; short broken water highlights; zero new triangles.','Not applicable: zero mounted raw-route landmarks. Normal panels/dialogue still overlap.','128 m raw versus 64 m finale charter, shoreline/ford, pan composition and quiet HUD.'),
]
bases=[json.loads((root/id/'base.json').read_text()) for id,*_ in items]
last=json.loads((root/'e10-river/engine-boundary.json').read_text())
records=[]
for i,(id,name,measure,hud,held) in enumerate(items):
    folder=root/id
    for filename in ['review.md','board-1280.png','board-390.png','base.json','visual-metrics.json','build-gates.json','node-gates.json','performance-paired.json','performance-summary.json']:
        assert (folder/filename).exists(),(id,filename)
    assert all(x['exit']==0 for x in json.loads((folder/'build-gates.json').read_text()))
    node=json.loads((folder/'node-gates.json').read_text());assert node['renderGuards']['exit']==node['namedGuards']['exit']==0
    plain=json.loads((folder/'plain-paired.json').read_text());assert len(plain)==4 and all(not r['errors'] and r['state']['testHook']=='undefined' for r in plain)
    perf=json.loads((folder/'performance-paired.json').read_text());assert len(perf)==16 and all(not r['errors'] for r in perf)
    after=bases[i+1] if i+1<len(items) else {'engine':last['after'],'store':bases[i]['store'],'code':'the commit containing this closeout'}
    if i+1<len(items):assert 'READY-FOR-GATES' in subprocess.check_output(['git','show','-s','--format=%B',after['code']],text=True)
    records.append({'order':i+1,'id':id,'name':name,'verdict':'IMPROVED / HELD; full concept unaccepted','measurement':measure,'phoneHudHandoff':hud,'held':held,'before':bases[i],'after':after,'review':f'{id}/review.md'})
(root/'campaign-boundaries.json').write_text(json.dumps({'maps':records,'remaining':[],'fullConceptAcceptance':False,'fullNodeBattery':'drain-owned','enginePin':'untouched; drain-owned','currentCodeCommit':'See the commit containing this manifest; self-referential commit hashes are not embedded.'},indent=2)+'\n')
lines=['# Corrections run 4 / campaign run 6 — completed handoff','',
'**READY-FOR-GATES. All 16 requested maps completed in order; remaining list: none.** Each is an IMPROVED / HELD correction within the task firewall. No full concept is declared accepted. Individual reviews answer every original clause and name the owners of remaining work.','',
'Last Claim, in Astra’s words: the missing sculpt pack is fixed. A dedicated memorial deck, panorama and five monuments now mount, and the lantern is visible at ordinary phone entry (0.134% persistent HUD coverage). The circular plate boundary, ornate rim, legacy Ark deck integration, heart/grayscale and full preserve composition remain unresolved. Those are explicit holds, not acceptance.','',
'Desktop/phone numbers below are ordered 1280/390. HUD percentages are phone landmark-body coverage; offscreen means absent, never 0%. Inspection success does not establish entry visibility.','',
'| Order / map | FIXED or IMPROVED evidence | Phone HUD handoff | HELD scope |','| --- | --- | --- | --- |']
for r in records:lines.append(f"| {r['order']}. [{r['name']}]({r['review']}) | {r['measurement']} | {r['phoneHudHandoff']} | {r['held']} |")
lines += ['', '## Immutable boundaries', '', 'Full values are also in [campaign-boundaries.json](campaign-boundaries.json). Code commits stay on `sol/map-art-campaign-2`; fifteen asset commits were pushed on `astra/corrections-4`. River changes no store bytes. The final code hash is the commit containing this handoff.', '', '| Map | Code after | Store after | Engine before → after |','| --- | --- | --- | --- |']
for r in records:lines.append(f"| {r['name']} | `{r['after']['code']}` | `{r['after']['store']}` | `{r['before']['engine']}` → `{r['after']['engine']}` |")
lines += ['', '## Verification and limits', '',
'All sixteen boundaries contain passing TypeScript/default/full builds, the five scoped render guards and three named guards, four error-free ordinary captures, and four performance runs per arm/viewport. Applicable asset/station changes include budgets, brightness/collision checks, loading/repeat, mirror invariants and source proof. Raw captures and rejected trials remain under `_raw/` and are not staged. No raw plate, gameplay/camera/HUD source, engine pin, existing e2e assertion or task/spec was changed.', '',
'Known failures are attributed against each exact map base in the per-map reviews. These include Motor malformed-tape replay, Mare/arsenal or roster expectations, E10 secured-claim/census drift, and The Claim’s stale 32,768-triangle registry assertion. The Last Claim broad census still expects painted despite the new pack. River’s broad census is an unavailable-contract exemption, so its dedicated raw boot and actual finale lever provide the real route evidence. The full node battery and engine pin remain drain-owned.', '',
'Last Claim’s paired timings cross host modes; its review retains two batches and the conservative eight-run envelope rather than claiming a causal speedup. River’s matched fast/slow modes are interpreted in its performance review. Archive’s initial full distance-trial receipt was overwritten before backup; complete derived metrics and PNGs remain, the partial receipt is retained in raw, and final station receipts are complete.', '',
'Ember and Archive’s new visual status was briefly written into the objective column. This closeout restores their exact prior objective text and places the correction in the visual column; it does not re-award or revoke objective completion.', '',
'Remaining task list: **none**. The named full-fidelity and UI/camera/contract holds remain in the linked rows for orchestration.', '']
(root/'handoff.md').write_text('\n'.join(lines))
print('SIXTEEN COMPLETE EVIDENCE BOUNDARIES VERIFIED')

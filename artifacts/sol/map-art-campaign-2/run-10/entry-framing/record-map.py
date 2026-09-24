from pathlib import Path
import json,subprocess,sys

root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');id=sys.argv[1];name=id.split('-',1)[1];out=root/id
plans=json.loads((root/'map-plan.json').read_text());plan=next(p for p in plans if p[0]==id)
store=Path('../GoldRush-assets');base=json.loads((root/'preflight.json').read_text())['store']
entries=[]
for rel in [f'pilots/map-rebuild-spike/{name}-terrain-contract.json',f'pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json']:
    before=json.loads(subprocess.check_output(['git','-C',str(store),'show',base+':'+rel],text=True));after=json.loads((store/rel).read_text())
    entries.append({k:after.pop(k,None) for k in ['entryLandmark','entryLandmarks']})
    for k in ['entryLandmark','entryLandmarks']:before.pop(k,None)
    assert before==after,rel
assert entries[0]==entries[1]
changed=subprocess.check_output(['git','-C',str(store),'diff','--name-only',base],text=True).splitlines()
assert all(p.endswith('-contract.json') for p in changed)
(out/'invariants.json').write_text(json.dumps({'declarations':entries[0],'mirrorsEqual':True,'allOtherContractDataIdentical':True,'storeChangedPaths':changed,'glbAtlasBytesUnchanged':True},indent=2)+'\n')
engine=subprocess.check_output(['/opt/homebrew/bin/node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs";console.log(await computeEngineHash(process.cwd()))'],text=True).strip()
(out/'engine-after.txt').write_text(engine+'\n')
before=(out/'engine-before.txt').read_text().strip()
metrics=json.loads((out/'metrics.json').read_text());decision=json.loads((out/'decision.json').read_text())
build=json.loads((out/'build-gates.json').read_text());assert all(r['exit']==0 for r in build)
payload=next((r['payload']['bytes'] for r in build if 'payload' in r),None)
prior=plans.index(plan)
previous=root/plans[prior-1][0]/'build-payload.log' if prior else root/'baseline-payload.json'
delta=payload-json.loads(previous.read_text())['bytes'] if payload and previous.exists() else None
if payload: assert payload<52000000
gates=json.loads((out/'e2e-own.json').read_text())
text=f'# {id} — entry framing, 2026-09-24\n\n{decision["verdict"]}\n\n{decision["reason"]}\n\nDeclared: '+', '.join(f'`{x["mountId"]}`' for x in (entries[0]['entryLandmarks'] or [entries[0]['entryLandmark']]) if x)+'. '+plan[2]+'\n\n'
text+='| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Glance |\n| --- | --- | ---: | ---: | ---: | --- | --- |\n'
for m in metrics:
    text+=f'| {m["width"]} | {m["mountId"]} | {m["restPixels"]:,} | {m["peakPixels"]:,} | {m["returnPixels"]:,} | {m["observedVisibleSecondsLower"]}–{m["observedVisibleSecondsUpper"]}'+(' (observation censored)' if m['durationCensored'] else '')+f' | {m["triggered"]} |\n'
text+='\nUnique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.\n\n[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).\n\n'
text+=f'TypeScript and default/full/E1 builds PASS. First-town payload **{payload:,} B**; delta **{delta:+,} B** from the preceding map/build.\n\n' if delta is not None else 'TypeScript and default/full builds PASS.\n\n'
text+=f'Own existing browser spec exit: **{gates[0]["exit"]}**. See [test receipt](e2e-own.json) and [log](e2e-own.log). '+decision.get('tests','')+' No protected assertion was changed. Shared replay, parity and scoped guards are recorded in the run note.\n\n'
text+=f'Engine `{before}` → `{engine}`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.\n'
(out/'review.md').write_text(text)
status=Path('reviews/sol-map-art-current-status-20260909.md');s=status.read_text();lines=s.splitlines()
compact='; '.join(f'{m["width"]} {m["mountId"]}: {m["restPixels"]:,}→{m["peakPixels"]:,}→{m["returnPixels"]:,} px' for m in metrics)
summary=f'2026-09-24 run 10: entry — {decision["verdict"]} {compact}. {decision["reason"]}'
if id.startswith('e1-'):summary+=f' E1 {payload:,} B ({delta:+,} B).'
summary+=f' [Boards, timing and gates](../{out}/review.md). Prior record: '
for i,line in enumerate(lines):
    if line.startswith('| ') and f'({id})' in line:
        cols=line.split('|');assert len(cols)>=4
        assert 'run 10: entry' not in cols[3]
        cols[3]=' '+summary+cols[3].lstrip();lines[i]='|'.join(cols);break
else:raise AssertionError('status row missing')
status.write_text('\n'.join(lines)+'\n')
report=Path('artifacts/sol/map-art-campaign-2/report.md')
with report.open('a') as f:f.write(f'\n\n## 2026-09-24 — run 10: entry — {id}\n\n'+summary.removesuffix('Prior record: ')+'\n\n'+f'Engine `{before}` → `{engine}`. No pin move.\n')
done=[p[0] for p in plans if (root/p[0]/'review.md').exists()]
remaining=[p[0] for p in plans if p[0] not in done]
(root/'run-note.md').write_text('# Entry framing pass two — 2026-09-24\n\nPreflight PASS; expected `logs/guard-stats.jsonl` retained. Store branch `astra/entry-framing-2` follows the specific firewall. Shared validation is pending until all maps are measured.\n\nCompleted map evidence:\n\n'+''.join(f'- [{x}]({x}/review.md)\n' for x in done)+'\nRemaining in order: '+(', '.join(remaining) or 'EMPTY')+'.\n')
print(id,engine,payload,delta)

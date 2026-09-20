"""Record an inspected verdict-only map; does not claim source changes or commit automatically."""
from pathlib import Path
import json,statistics,sys,subprocess
from datetime import date
review_date=date.today().isoformat()
id,title=sys.argv[1:3];root=Path('artifacts/sol/map-art-campaign-2');folder=root/'run-2'/id
review=(folder/'assessment.md').read_text().strip();rows=json.loads((folder/'verdict-captures.json').read_text());summary=[]
for r in rows:
 assert r['errors']==[]
 for p in r['plain']:assert p['diagnostics']['contract']['activeId']==id and p['testHook']=='undefined'
 arms={a:[x['p95'] for x in r['runs'] if x['arm']==a] for a in ['before','after']};med={k:statistics.median(v) for k,v in arms.items()}
 calls={a:sorted(set(x['renderer']['calls'] for x in r['runs'] if x['arm']==a)) for a in arms}
 summary.append({'width':r['width'],'p95Runs':arms,'mediansMs':med,'medianDeltaPercent':100*(med['after']/med['before']-1),'drawCalls':calls,'triangles':sorted(set(x['renderer']['triangles'] for x in r['runs'])),'plainPilotStates':[p['dataset'].get('terrain3dPilotState','absent') for p in r['plain']],'errors':r['errors']})
(folder/'performance-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
engine=subprocess.check_output(['/opt/homebrew/bin/node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash(process.cwd()))'],text=True).strip()
lines=['| View | Draw calls A / B | p95 median A / B | A/B delta |','| --- | --- | --- | --- |']
for r in summary:lines.append(f"| {r['width']} | {r['drawCalls']['before']} / {r['drawCalls']['after']} | {r['mediansMs']['before']:.2f} / {r['mediansMs']['after']:.2f} ms | {r['medianDeltaPercent']:+.2f}% |")
validation=(folder/'validation.md').read_text().strip() if (folder/'validation.md').exists() else 'No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.'
text=f'''# {title} — visual verdict, {review_date}

{review}

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

{chr(10).join(lines)}

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

{validation}

Engine before = after `{engine}`; pin untouched. No objective/persistence status is changed by this visual verdict.
'''
(folder/'review.md').write_text(text)
status=Path('reviews/sol-map-art-current-status-20260909.md');lines=status.read_text().splitlines();found=0
one_line=(folder/'status.txt').read_text().strip()
for i,line in enumerate(lines):
 if f'({id})' in line and line.startswith('|'):
  parts=line.split('|');assert len(parts)==5;parts[3]=f' {review_date} run 2: {one_line} [Boards and numbers](../artifacts/sol/map-art-campaign-2/run-2/{id}/review.md). ';lines[i]='|'.join(parts);found+=1
assert found==1;status.write_text('\n'.join(lines)+'\n')
with (root/'report.md').open('a') as f:f.write(f'\n### {title} — {review_date}\n\n{one_line} [Inspected boards, defect rationale, four-run numbers and validation](run-2/{id}/review.md). Verdict-only; no source or asset change. Engine before = after `{engine}`.\n')
print(json.dumps(summary,indent=2))

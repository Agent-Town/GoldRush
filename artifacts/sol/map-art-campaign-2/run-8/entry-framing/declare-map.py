from pathlib import Path
import json,sys
root=Path('assets/pilots/map-rebuild-spike')
plans=json.loads(Path('artifacts/sol/map-art-campaign-2/run-8/entry-framing/map-plan.json').read_text())
id,mount,reason=next(p for p in plans if p[0]==sys.argv[1]);name=id.split('-',1)[1]
for p in [root/f'{name}-terrain-contract.json',root/f'landmarks/{name}/{name}-landmark-pack-contract.json']:
 text=p.read_text();assert 'entryLandmark' not in json.loads(text);assert text.endswith('\n}\n')
 p.write_text(text[:-3]+',\n  "entryLandmark": '+json.dumps({'mountId':mount,'reason':reason},indent=2).replace('\n','\n  ')+'\n}\n')

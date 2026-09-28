from pathlib import Path
import json,subprocess,sys
root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');id=sys.argv[1];name=id.split('-',1)[1];out=root/id;out.mkdir(exist_ok=True)
assert id in ['e6-glow-mesa','e7-relay-rush']
engine=subprocess.check_output(['/opt/homebrew/bin/node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs";console.log(await computeEngineHash(process.cwd()))'],text=True).strip();(out/'engine-before.txt').write_text(engine+'\n')
for p in [Path(f'assets/pilots/map-rebuild-spike/{name}-terrain-contract.json'),Path(f'assets/pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json')]:
    text=p.read_text();data=json.loads(text);assert 'entryLandmarks' not in data
    (out/('baseline-'+p.name)).write_text(text)
    first=data.get('entryLandmark') or {'mountId':'dead-gap-charting-station','reason':'The charting station is the route-reading landmark beyond the already-visible R2 frame; its ordinary phone entry is offscreen.'}
    second={'mountId':'isotope-cooling-rack','reason':'The plate groups its facilities around the mesa; the cooling rack is the offscreen body the first derrick glance did not reach.'} if id=='e6-glow-mesa' else {'mountId':'west-ridge-dish-cluster','reason':'The offscreen west dishes give the relay route its listening silhouette beyond the charting station.'}
    extra=({'entryLandmark':first} if 'entryLandmark' not in data else {})|{'entryLandmarks':[first,second]}
    addition=json.dumps(extra,indent=2,ensure_ascii=False)[2:-2]
    assert text.endswith('\n}\n');p.write_text(text[:-3]+',\n'+addition+'\n}\n')

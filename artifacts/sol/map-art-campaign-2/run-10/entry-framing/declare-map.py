from pathlib import Path
import json, subprocess, sys

root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing')
id,mount,reason=next(p for p in json.loads((root/'map-plan.json').read_text()) if p[0]==sys.argv[1])
name=id.split('-',1)[1]; symbol=name.replace('-','_')+'EntryPack'
out=root/id;out.mkdir(exist_ok=True)
engine=subprocess.check_output(['/opt/homebrew/bin/node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash(process.cwd()))'],text=True).strip()
(out/'engine-before.txt').write_text(engine+'\n')
for file in [Path(f'assets/pilots/map-rebuild-spike/{name}-terrain-contract.json'),Path(f'assets/pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json')]:
    text=file.read_text();data=json.loads(text);assert 'entryLandmark' not in data
    (out/('baseline-'+file.name)).write_text(text)
    assert text.endswith('\n}\n')
    file.write_text(text[:-3]+',\n  "entryLandmark": '+json.dumps({'mountId':mount,'reason':reason},indent=2).replace('\n','\n  ')+'\n}\n')
for file in [Path('src/systems/CameraRig.ts'),Path('src/agent/MechanicsManifest.ts')]:
    text=file.read_text()
    importline=f"import {symbol} from '../../assets/pilots/map-rebuild-spike/{name}-terrain-contract.json' with {{ type: 'json' }};\n"
    marker='const entryPacks:';at=text.index(marker)
    text=text[:at]+importline+text[at:]
    marker="  'e6-glow-mesa':";at=text.index(marker)
    text=text[:at]+f"  '{id}': {symbol},\n"+text[at:]
    if file.name=='MechanicsManifest.ts':
        rule={'e1-night-shift':'darkness_cycle','e1-twin-banks':'water_crossings','e1-baron':'baron','e2-trestle':'river'}[id]
        text=text.replace('const entryRuleIds: Readonly<Record<string, string>> = {',f"const entryRuleIds: Readonly<Record<string, string>> = {{\n  '{id}': '{rule}',")
    file.write_text(text)

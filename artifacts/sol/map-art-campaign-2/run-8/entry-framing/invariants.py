from pathlib import Path
import json,subprocess,sys
id=sys.argv[1];name=id.split('-',1)[1]
store='/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets'
paths=[f'pilots/map-rebuild-spike/{name}-terrain-contract.json',f'pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json']
entries=[]
for rel in paths:
 before=json.loads(subprocess.check_output(['git','-C',store,'show','adf6bd1a22582459e64c2ddc1a37b1bd707ffa14:'+rel],text=True))
 after=json.loads((Path(store)/rel).read_text());entries.append(after.pop('entryLandmark'));assert before==after,rel
assert entries[0]==entries[1]
changed=subprocess.check_output(['git','-C',store,'diff','--name-only','adf6bd1a22582459e64c2ddc1a37b1bd707ffa14'],text=True).splitlines()
assert all(p.endswith('-contract.json') for p in changed)
out=Path('artifacts/sol/map-art-campaign-2/run-8/entry-framing')/id
(out/'invariants.json').write_text(json.dumps({'entryLandmark':entries[0],'mirrorsEqual':True,'allOtherContractDataIdentical':True,'changedStorePaths':changed,'glbAtlasBlendBytesUnchanged':True},indent=2)+'\n')

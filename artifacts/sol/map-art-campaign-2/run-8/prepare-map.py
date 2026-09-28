"""Freeze exact before-source modules and assets for an ordinary A/B capture."""
from pathlib import Path
import sys,json,subprocess,urllib.request,shutil,os
name,pack,epoch=sys.argv[1:4]
fallback='--fallback' in sys.argv[4:];extras=[s for s in sys.argv[4:] if s!='--fallback']
root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-8'/name;out.mkdir(exist_ok=True);raw=root/'_raw/run-8'/(name+'-before');raw.mkdir(parents=True,exist_ok=True)
pilot=Path('assets/pilots/map-rebuild-spike');store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets')
head=lambda p:subprocess.check_output(['git','-C',str(p),'rev-parse','HEAD'],text=True).strip()
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
engine=subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash(process.cwd()))"],env=env,text=True).strip()
(out/'base.json').write_text(json.dumps({'code':head(Path.cwd()),'store':head(store),'engine':engine},indent=2)+'\n')
for source in ['Terrain3dClaimPilot','Water']:
 (raw/(source+'.js')).write_bytes(urllib.request.urlopen('http://127.0.0.1:5303/src/world/'+source+'.ts').read());shutil.copy2('src/world/'+source+'.ts',raw/(source+'.ts'))
d={} if fallback else json.loads((pilot/(pack+'-terrain-contract.json')).read_text());assets=[]
for p in ([] if fallback else [pilot/d['asset'],pilot/d['panoramaMount']['asset'],*[pilot/m['asset'] for m in d['landmarkMounts']]]):
 shutil.copy2(p,raw/p.name);assets.append({'name':p.name,'type':'model/gltf-binary'})
for source in extras:
 base=source.split('/')[-1];(raw/(base+'.js')).write_bytes(urllib.request.urlopen('http://127.0.0.1:5303/src/'+source+'.ts').read());shutil.copy2('src/'+source+'.ts',raw/(base+'.ts'))
config={'allowFallbackBefore':fallback,'extraSources':extras,'epoch':epoch,'assets':assets,'stations':[],'regions':[[1280,[440,300,850,380]],[390,[20,285,145,390]]]}
(out/'capture-config.json').write_text(json.dumps(config,indent=2)+'\n')
print(json.dumps({'name':name,'engine':engine,'mounts':[(m['id'],m['position']) for m in d.get('landmarkMounts',[])]}))

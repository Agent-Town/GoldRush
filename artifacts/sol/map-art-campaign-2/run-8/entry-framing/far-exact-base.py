from pathlib import Path
import json, os, subprocess
root=Path('artifacts/sol/map-art-campaign-2/run-8/entry-framing');out=root/'e8-far-side'
store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets')
env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
files=[(Path('src/systems/CameraRig.ts'),None,'src/systems/CameraRig.ts'),*( (store/p,store,p) for p in ['pilots/map-rebuild-spike/far-side-terrain-contract.json','pilots/map-rebuild-spike/landmarks/far-side/far-side-landmark-pack-contract.json'])]
kept=[(p,p.read_bytes()) for p,_,_ in files]
def engine():return subprocess.check_output(['node','--input-type=module','-e','import {computeEngineHash} from "./scripts/assay-replay-agent.mjs"; console.log(await computeEngineHash())'],env=env,text=True).strip()
candidate=engine(); receipt={'candidateEngine':candidate,'baseCode':'e680325d5','baseStore':'4e9720b0788ebd6bccb6f2bd1f3945dbd855a50c'}
try:
 for p,worktree,rel in files:
  cmd=['git']+(['-C',str(worktree)] if worktree else [])+['show',('4e9720b' if worktree else 'e680325d5')+':'+rel]
  p.write_bytes(subprocess.check_output(cmd))
 receipt['baseEngine']=engine();assert receipt['baseEngine']=='084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37'
 receipt['testExit']=subprocess.run(['python3',str(root/'gates.py'),'e8-far-side','e2e','exact-base','e2e/e8-roster.spec.ts:172'],env=env).returncode
finally:
 for p,b in kept:p.write_bytes(b)
 receipt['restoredEngine']=engine();assert receipt['restoredEngine']==candidate
 (out/'exact-base-attribution.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))

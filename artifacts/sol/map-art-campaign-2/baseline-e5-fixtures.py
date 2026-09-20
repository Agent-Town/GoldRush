"""Recheck failing sim fixtures with only our two render edits temporarily removed."""
from pathlib import Path
import subprocess, json, hashlib, os
base='821bff7e915bef5c774193e2611b4726317b45ca'
root=Path('artifacts/sol/map-art-campaign-2')
paths=['src/world/Water.ts','src/world/Terrain3dClaimPilot.ts']
candidate={p:Path(p).read_bytes() for p in paths}
def engine_hash():
 return subprocess.check_output(['node','--input-type=module','-e',"import {computeEngineHash} from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash(process.cwd()));"],text=True).strip()
result={'base':base,'candidateBefore':engine_hash()}
assert result['candidateBefore']==json.loads((root/'e5-source-identity.json').read_text())['after'], 'Candidate source changed; inspect before running.'
patch=subprocess.check_output(['git','diff','--binary','--',*paths])
patch_path=root/'_raw'/'e5-candidate.patch'
if patch_path.exists(): assert patch_path.read_bytes()==patch, 'Preserved patch differs; do not overwrite it.'
else: patch_path.write_bytes(patch)
try:
 for p in paths: Path(p).write_bytes(subprocess.check_output(['git','show',f'{base}:{p}']))
 result['baselineDuring']=engine_hash()
 assert result['baselineDuring']==json.loads((root/'baseline.json').read_text())['engineHash']
 command=['npx','playwright','test','e2e/e5-regatta-race.spec.ts','e2e/e5-flotilla-hulls.spec.ts','e2e/e5-stillwater-noise.spec.ts','--grep','bench seeds|idle Flotilla|idle Regatta|idle Stillwater|in-process door','--project=desktop-chrome','--workers=1','--reporter=line','--trace=off']
 with (root/'_raw'/'baseline-e5-fixtures.log').open('w') as log:
  result['exitCode']=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT).returncode
 result['command']=command
finally:
 for p,data in candidate.items(): Path(p).write_bytes(data)
 result['candidateRestored']=engine_hash()
 result['restoredExactly']=result['candidateRestored']==result['candidateBefore']
 (root/'baseline-e5-fixtures.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result),flush=True)

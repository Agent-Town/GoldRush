"""Run one authorized ride, recording its command and exit status without a pipe."""
import json, os, subprocess, sys
from pathlib import Path
contract, project, strategy = sys.argv[1:]
root = Path('artifacts/sol/play-proofs/run-11') / contract / strategy
root.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, GR_NATIVE_PROOF='1', GR_NATIVE_RUN='11/'+contract+'/'+strategy+'/driver', GR_CAPTURE_EXTERNAL_SERVER='1', GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
env.pop('GR_NATIVE_STRATEGY', None)
env.pop('GR_NATIVE_DIAG', None)
# nativeProof appends the contract id; keep each ride's evidence separate.
if strategy != 'default': env['GR_NATIVE_STRATEGY'] = strategy
command = ['npx','playwright','test',f'e2e/native-proofs/{contract}.spec.ts',f'--project={project}','--workers=1','--reporter=line',f'--output={root}/results-{project}']
(root / f'command-{project}.json').write_text(json.dumps({'command':command,'env':{k:v for k,v in env.items() if k.startswith('GR_')}},indent=2)+'\n')
with (root / f'{project}.log').open('w') as log:
 result = subprocess.run(command, env=env, stdout=log, stderr=subprocess.STDOUT)
(root / f'{project}.exit').write_text(str(result.returncode)+'\n')
print(contract, project, strategy, 'exit', result.returncode, flush=True)
sys.exit(result.returncode)

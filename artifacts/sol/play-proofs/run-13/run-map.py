"""Run a single authorized ride pair, preserving direct exits outside the tree."""
import os, pathlib, subprocess, sys, json
contract = sys.argv[1]
strategy = sys.argv[2] if len(sys.argv) > 2 else 'default'
projects = sys.argv[3:] or ['desktop-chrome', 'mobile-chrome']
root = pathlib.Path.home() / '.goldrush/play-proofs/run-13' / strategy / contract
root.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, GR_NATIVE_PROOF='1', GR_NATIVE_RUN=f'13/{strategy}', GR_CAPTURE_EXTERNAL_SERVER='1', GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
env.pop('GR_NATIVE_STRATEGY', None)
if strategy != 'default': env['GR_NATIVE_STRATEGY'] = strategy
cmd = ['npx', 'playwright', 'test', f'e2e/native-proofs/{contract}.spec.ts', *[f'--project={p}' for p in projects], '--workers=1', '--reporter=line', f'--output={root}/results']
(root / 'command.json').write_text(json.dumps({'argv':cmd,'env':{k:v for k,v in env.items() if k.startswith('GR_NATIVE') or k.startswith('GR_CAPTURE')}},indent=2)+'\n')
with (root / 'command.log').open('w') as log:
    result = subprocess.run(cmd, env=env, stdout=log, stderr=subprocess.STDOUT)
(root / 'command.exit').write_text(str(result.returncode)+'\n')
evidence = pathlib.Path(f'artifacts/sol/play-proofs/run-13/{strategy}/{contract}')
evidence.mkdir(parents=True, exist_ok=True)
(evidence / 'command.json').write_text((root / 'command.json').read_text())
(evidence / 'command.exit').write_text(str(result.returncode)+'\n')
# Keep the full recorder and failure dump external; cite the short command tail.
lines = (root / 'command.log').read_text().splitlines()
(evidence / 'command-tail.log').write_text('\n'.join(lines[-35:])+'\n')
final = pathlib.Path(f'artifacts/sol/play-proofs/run-13/{contract}/{strategy}')
final.mkdir(parents=True, exist_ok=True)
for file in evidence.iterdir():
    if file.is_file(): file.rename(final / file.name)
print(json.dumps({'contract':contract,'strategy':strategy,'projects':projects,'exit':result.returncode,'log':str(root/'command.log')}))
sys.exit(result.returncode)

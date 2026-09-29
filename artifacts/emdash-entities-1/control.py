from pathlib import Path
import os, subprocess, json
root = Path(__file__).resolve().parents[2]
paths = ['src/ui/ProspectorPanel.ts', 'src/encyclopedia/reader.ts', 'scripts/no-emdash-guard.test.mjs']
repaired = {name: (root/name).read_bytes() for name in paths}
base = '4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0'
env = dict(os.environ, GR_CAPTURE_BASE_URL='http://127.0.0.1:5198', GR_CAPTURE_EXTERNAL_SERVER='1')
try:
 for name in paths:
  (root/name).write_bytes(subprocess.check_output(['git','show',f'{base}:{name}'],cwd=root))
 diff = subprocess.check_output(['git','diff',base,'--',*paths],cwd=root)
 assert diff == b'', diff
 with (root/'artifacts/emdash-entities-1/control.log').open('w') as log:
  log.write(f'Control source restored to {base}; git diff of all three implementation files is empty.\n'); log.flush()
  result = subprocess.run(['npx','playwright','test','e2e/field-book.spec.ts','e2e/m4-07-prospector-panel.spec.ts','--grep','minds and rigs aggregate|auto-collect consent','--project=desktop-chrome','--project=mobile-chrome','--workers=1','--trace=off','--output=artifacts/emdash-entities-1/control-results','--reporter=line'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
  log.write(f'\nexit_code={result.returncode}\n')
 print('control exit',result.returncode)
finally:
 for name, content in repaired.items(): (root/name).write_bytes(content)
 print('All repaired bytes restored')

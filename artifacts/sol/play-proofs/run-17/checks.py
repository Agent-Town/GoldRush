"""Final checks with direct subprocess exits; full logs stay outside the tree."""
import pathlib, subprocess, json
root=pathlib.Path('artifacts/sol/play-proofs/run-17')
external=pathlib.Path.home()/'.goldrush/play-proofs/run-17'
checks=[('tsc-final',['npx','tsc','--noEmit']),('build-final',['npm','run','build']),('task-guards',['npm','run','test:task-guards']),('diff-check',['git','diff','--check'])]
results=[]
for name,cmd in checks:
 with (external/f'{name}.log').open('w') as log:
  result=subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT)
 (root/f'{name}.exit').write_text(str(result.returncode)+'\n')
 lines=(external/f'{name}.log').read_text().splitlines()
 (root/f'{name}.log').write_text('\n'.join(lines[-25:])+'\n')
 results.append({'check':name,'argv':cmd,'exit':result.returncode,'fullLog':str(external/f'{name}.log')})
 print(json.dumps(results[-1]),flush=True)
with (external/'task-guards-main.log').open('w') as log:
 result=subprocess.run(['npm','run','test:task-guards'],cwd='/Users/robin/Claude/Projects/Gold Rush',stdout=log,stderr=subprocess.STDOUT)
(root/'task-guards-main.log').write_text((external/'task-guards-main.log').read_text())
(root/'task-guards-main.exit').write_text(str(result.returncode)+'\n')
results.append({'check':'task-guards-main','exit':result.returncode,'cwd':'/Users/robin/Claude/Projects/Gold Rush'})
(root/'checks.json').write_text(json.dumps(results,indent=2)+'\n')

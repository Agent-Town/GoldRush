"""Run unchanged equivalence specs once and compare the established campaign cells."""
import os,pathlib,subprocess,json
root=pathlib.Path('artifacts/sol/play-proofs/run-17')
ext=pathlib.Path.home()/'.goldrush/play-proofs/run-17/equivalence'
ext.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,GR_NATIVE_PROOF='1',GR_NATIVE_RUN='17/equivalence',GR_NATIVE_STRATEGY='equivalence-run17',GR_CAPTURE_EXTERNAL_SERVER='1',GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
cmd=['npx','playwright','test','e2e/native-proofs/e5-flotilla.spec.ts','e2e/native-proofs/e5-regatta.spec.ts','--project=desktop-chrome','--workers=1','--reporter=line',f'--output={ext}/results']
(root/'equivalence-command.json').write_text(json.dumps({'argv':cmd,'env':{k:v for k,v in env.items() if k.startswith(('GR_NATIVE','GR_CAPTURE'))}},indent=2)+'\n')
with (ext/'command.log').open('w') as log: result=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
(root/'equivalence-command.exit').write_text(str(result.returncode)+'\n')
(root/'equivalence-command-tail.log').write_text('\n'.join((ext/'command.log').read_text().splitlines()[-30:])+'\n')
comparisons=[]
for cid in ['e5-flotilla','e5-regatta']:
 old=json.loads(pathlib.Path(f'artifacts/sol/play-proofs/run-12/{cid}/row-desktop-chrome.json').read_text())
 new=json.loads((root/f'equivalence/{cid}/row-desktop-chrome.json').read_text())
 # Unchanged run-12 adapter writes raw files to its original external root. Preserve this run's own copy.
 raw=pathlib.Path(new['rawEvidence']).read_text(); target=ext/cid/'row-desktop-chrome.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(raw)
 new['rawEvidence']=str(target)
 (root/f'equivalence/{cid}/row-desktop-chrome.json').write_text(json.dumps(new,indent=2)+'\n')
 def cells(r): return {'peakWave':r['peakWave'],**{k:r[k]['ok'] for k in ['secures','banks','board','reload','clean']}}
 comparisons.append({'contract':cid,'run12':cells(old),'run17':cells(new),'pass':cells(old)==cells(new) and all(new[k]['ok'] for k in ['secures','banks','board','reload','clean'])})
output={'commandExit':result.returncode,'pass':result.returncode==0 and all(c['pass'] for c in comparisons),'protocol':'Same terminal wave, fresh bank, Book return, byte-identical plain score reload, zero console/page errors; unchanged specs and default gameplay strategy.','comparisons':comparisons}
(root/'driver-equivalence.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps(output))

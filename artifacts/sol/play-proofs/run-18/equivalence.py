"""Run unchanged equivalence specs once and compare the established campaign cells."""
import os,pathlib,subprocess,json,sys,hashlib
root=pathlib.Path('artifacts/sol/play-proofs/run-18')
ext=pathlib.Path.home()/'.goldrush/play-proofs/run-18/equivalence'
ext.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,GR_NATIVE_PROOF='1',GR_NATIVE_RUN='18/equivalence',GR_NATIVE_STRATEGY='equivalence-run18',GR_CAPTURE_EXTERNAL_SERVER='1',GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
cmd=['npx','playwright','test','e2e/native-proofs/e5-flotilla.spec.ts','e2e/native-proofs/e5-regatta.spec.ts','--project=desktop-chrome','--workers=1','--reporter=line',f'--output={ext}/results']
(root/'equivalence-command.json').write_text(json.dumps({'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'driverSha256':hashlib.sha256(pathlib.Path('e2e/native-proofs/driver.ts').read_bytes()).hexdigest(),'argv':cmd,'env':{k:v for k,v in env.items() if k.startswith(('GR_NATIVE','GR_CAPTURE'))}},indent=2)+'\n')
if '--compare-only' not in sys.argv:
 with (ext/'command.log').open('w') as log: result=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
 (root/'equivalence-command.exit').write_text(str(result.returncode)+'\n')
 (root/'equivalence-command-tail.log').write_text('\n'.join((ext/'command.log').read_text().splitlines()[-30:])+'\n')
command_exit=int((root/'equivalence-command.exit').read_text())
comparisons=[]
for cid in ['e5-flotilla','e5-regatta']:
 old=json.loads(pathlib.Path(f'artifacts/sol/play-proofs/run-12/{cid}/default/row-desktop-chrome.json').read_text())
 new=json.loads((root/f'equivalence/{cid}/row-desktop-chrome.json').read_text())
 # Unchanged run-12 adapter writes raw files to its original external root. Preserve this run's own copy.
 raw=pathlib.Path(new['rawEvidence']).read_text(); target=ext/cid/'row-desktop-chrome.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(raw)
 new['rawEvidence']=str(target)
 (root/f'equivalence/{cid}/row-desktop-chrome.json').write_text(json.dumps(new,indent=2)+'\n')
 def cells(r): return {'peakWave':r['peakWave'],**{k:r[k]['ok'] for k in ['secures','banks','board','reload','clean']}}
 comparisons.append({'contract':cid,'run12':cells(old),'run18':cells(new),'pass':cells(old)==cells(new) and all(new[k]['ok'] for k in ['secures','banks','board','reload','clean'])})
output={'commandExit':command_exit,'pass':command_exit==0 and all(c['pass'] for c in comparisons),'protocol':'Same terminal wave, fresh bank, Book return, byte-identical plain score reload, zero console/page errors; unchanged specs and default gameplay strategy.','comparisons':comparisons}
(root/'driver-equivalence.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps(output))

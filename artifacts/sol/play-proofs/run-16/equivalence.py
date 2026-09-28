"""Re-run the unchanged Flotilla/Regatta specs on desktop; compare the run-12 terminal contract."""
import os, pathlib, subprocess, json, shutil
root = pathlib.Path('artifacts/sol/play-proofs/run-16')
external = pathlib.Path.home() / '.goldrush/play-proofs/run-16/equivalence'
external.mkdir(parents=True, exist_ok=True)
# The unchanged specs import run-12's hook. A distinct strategy label keeps that
# hook from overwriting its historical raw rows; only restore-ground/hold-ground
# alter driver behaviour, so this is the default strategy.
env = dict(os.environ, GR_NATIVE_PROOF='1', GR_NATIVE_RUN='16/equivalence', GR_NATIVE_STRATEGY='equivalence', GR_CAPTURE_EXTERNAL_SERVER='1', GR_CAPTURE_BASE_URL='http://127.0.0.1:5303')
ids = ['e5-flotilla', 'e5-regatta']
cmd = ['npx','playwright','test',*[f'e2e/native-proofs/{id}.spec.ts' for id in ids],'--project=desktop-chrome','--workers=1','--reporter=line',f'--output={external}/results']
(external/'command.json').write_text(json.dumps({'argv':cmd,'env':{k:v for k,v in env.items() if k.startswith(('GR_NATIVE','GR_CAPTURE'))}},indent=2)+'\n')
with (external/'command.log').open('w') as log:
    result = subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
(external/'command.exit').write_text(str(result.returncode)+'\n')
comparisons=[]
for id in ids:
    dest=root/id/'equivalence'; dest.mkdir(parents=True,exist_ok=True)
    for file in (root/'equivalence'/id).iterdir():
        if file.is_file(): file.rename(dest/file.name)
    rowfile=dest/'row-desktop-chrome.json'
    current=json.loads(rowfile.read_text())
    raw=pathlib.Path(current['rawEvidence'])
    newraw=external/id/raw.name; newraw.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(raw,newraw)
    current['rawEvidence']=str(newraw)
    rowfile.write_text(json.dumps(current,indent=2)+'\n')
    prior=json.loads(pathlib.Path(f'artifacts/sol/play-proofs/run-12/{id}/default/row-desktop-chrome.json').read_text())
    fields=['peakWave','secures','banks','board','reload','clean']
    brief=lambda r:{k:r[k]['ok'] if isinstance(r[k],dict) else r[k] for k in fields}
    comparisons.append({'contract':id,'run12':brief(prior),'run16':brief(current),'pass':brief(prior)==brief(current) and all(current[k]['ok'] for k in fields[1:])})
receipt={'commandExit':result.returncode,'pass':result.returncode==0 and all(c['pass'] for c in comparisons),'protocol':'Same terminal wave, fresh bank, Book return and byte-identical plain reload; zero console/page errors. Same unchanged specs, default gameplay strategy. Driver isolation is independently byte-checked.','comparisons':comparisons}
(root/'driver-equivalence.json').write_text(json.dumps(receipt,indent=2)+'\n')
for name in ['command.json','command.exit']:
    shutil.copy2(external/name,root/f'equivalence-{name}')
(root/'equivalence-command-tail.log').write_text('\n'.join((external/'command.log').read_text().splitlines()[-18:])+'\n')
print(json.dumps(receipt))
raise SystemExit(result.returncode or (0 if receipt['pass'] else 1))

import glob,json,pathlib,subprocess,hashlib,os,sys
from concurrent.futures import ThreadPoolExecutor, as_completed
out=pathlib.Path('artifacts/assay-node-26-12-1')
fresh='--fresh' in sys.argv
paths=sorted(glob.glob('artifacts/gauntlet-heat14-*/rides/*/watch-reel.json'))+sorted(glob.glob('artifacts/gauntlet-heat13-*/rides/*/watch-reel.json'))
selected=[]
for p in paths:
 s=pathlib.Path(p).with_name('verdict-slip.json')
 if not s.exists():continue
 slip=json.loads(s.read_text()); t=json.load(open(p))['reel']
 if slip.get('assay')=='verified' and slip.get('tapeId')==t['id'] and slip.get('assayHash')==t['eventLogHash']:
  selected.append({'file':p,'slip':str(s),'era':t['meta']['era'],'contract':t['contract'],'sha256':hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()})
selected=selected[:24]
for pattern in ['artifacts/gauntlet-heat14-*/probe/watch-reel.json', 'artifacts/gauntlet-heat15-*/rides/*/watch-reel.json', 'artifacts/gauntlet-heat13-*/probe/watch-reel.json', 'artifacts/gauntlet-heat15-*/probe/watch-reel.json']:
 for p in sorted(glob.glob(pattern)):
  slip=pathlib.Path(p).with_name('verdict-slip.json'); t=json.load(open(p))['reel']; v=json.loads(slip.read_text())
  if v.get('assay')=='verified' and v.get('tapeId')==t['id'] and v.get('assayHash')==t['eventLogHash']:
   selected.append({'file':p,'slip':str(slip),'era':t['meta']['era'],'contract':t['contract'],'sha256':hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()})
assert len(selected)>=20
(out/'corpus.json').write_text(json.dumps(selected,indent=2)+'\n')
results=json.loads((out/"comparison.json").read_text()) if not fresh and (out/"comparison.json").exists() else []
completed={r["file"] for r in results}
def compare(indexed):
 i,item=indexed
 t=json.load(open(item['file']))['reel']; pair=[]
 for version in ['26.4.0','26.12.1']:
  node=os.path.expanduser(f'~/.nvm/versions/node/v{version}/bin/node')
  stem=out/f'{i+1:02d}-{version}'
  if not fresh and stem.with_suffix('.stdout').exists():
   stdout=stem.with_suffix('.stdout').read_text(); stderr=stem.with_suffix('.stderr').read_text()
   r=subprocess.CompletedProcess([],0 if stdout.strip() else 1,stdout,stderr)
  else:
   r=subprocess.run([node,'scripts/assay-replay.mjs',item['file']],capture_output=True,text=True,timeout=240)
  stem.with_suffix('.stdout').write_text(r.stdout);stem.with_suffix('.stderr').write_text(r.stderr)
  if r.returncode:
   pair.append({'version':version,'verdict':'unassayable','error':next((line for line in r.stderr.splitlines() if line.startswith('assay replay failed:')),r.stderr),'exit':r.returncode})
   continue
  replay=json.loads(r.stdout);replay.pop('wallMs',None)
  matches=replay['eventLogHash']==t['eventLogHash'] and all((abs(replay['outcome'][k]-t['outcome'][k])<=1e-6 if k=='timeAlive' else replay['outcome'][k]==t['outcome'][k]) for k in ['secured','waves','gold','timeAlive'])
  pair.append({'version':version,'verdict':'verified' if matches else 'rejected','replay':replay})
 same=json.dumps({k:v for k,v in pair[0].items() if k!='version'},sort_keys=True)==json.dumps({k:v for k,v in pair[1].items() if k!='version'},sort_keys=True)
 result={**item,'runtimes':pair,'identical':same}
 (out/f'{i+1:02d}-comparison.json').write_text(json.dumps(result,indent=2)+'\n')
 print(i+1,item['contract'],pair[0]['verdict'],pair[0].get('replay',{}).get('eventLogHash',pair[0].get('error')),'IDENTICAL' if same else 'DISAGREEMENT',flush=True)
 if not same:raise RuntimeError('STOP: runtime disagreement; do not move pin')

 return result
with ThreadPoolExecutor(max_workers=4) as pool:
 futures=[pool.submit(compare,(i,item)) for i,item in enumerate(selected) if item['file'] not in completed]
 for future in as_completed(futures):
  results.append(future.result())
  results.sort(key=lambda r: next(i for i,item in enumerate(selected) if item['file']==r['file']))
  (out/'comparison.json').write_text(json.dumps(results,indent=2)+'\n')

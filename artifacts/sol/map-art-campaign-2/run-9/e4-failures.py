"""Extract browser assertion fingerprints without copying screenshots or noisy logs."""
from pathlib import Path
import re,json,sys
name,label=sys.argv[1:3];p=Path('artifacts/sol/map-art-campaign-2/run-9')/name
raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')
path=Path(sys.argv[3]) if len(sys.argv)>3 else raw/(name+'-'+label+'.log')
text=re.sub(r'\x1b\[[0-9;]*m','',path.read_text());rows=[]
for block in re.split(r'(?m)^\s+\d+\) \[',text)[1:]:
 h=re.match(r'([^]]+)\] › (e2e/[^:]+):(\d+):(\d+) › ([^\n]+)',block)
 if not h:continue
 section=block.split('Error Context:')[0]
 errors=re.findall(r'(?m)^\s+(?:Error:|Matcher error:|Received has value:|Expected:|Received:|assay replay failed:|Test timeout of)[^\n]*',section)
 locations=re.findall(r'(?m)^\s+at .*?/(e2e/[^\n]+)',section)
 rows.append({'project':h[1],'spec':h[2],'testLine':int(h[3]),'title':h[5].strip(),'fingerprint':[s.strip() for s in errors],'assertionLocations':locations})
counts={k:int(re.findall(r'(?m)^\s+(\d+) '+k+r'\b',text)[-1]) if re.findall(r'(?m)^\s+(\d+) '+k+r'\b',text) else 0 for k in ['passed','skipped','failed']}
target=p/(label+'-failures.json')
if target.exists():
 assert 'failures' in json.loads(target.read_text()), 'Refusing to overwrite a restoration receipt; use label baseline'
result={'log':str(path),'counts':counts,'failures':rows};target.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))

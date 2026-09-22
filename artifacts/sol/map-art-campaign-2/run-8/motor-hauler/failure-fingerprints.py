"""Compare final-candidate failures to exact-base failures without rewriting tests."""
from pathlib import Path
import json,re

root=Path('artifacts/sol/map-art-campaign-2')
out=root/'run-8/motor-hauler'
def parse(path,multiple=False):
    text=path.read_text()
    matches=list(re.finditer(r'^  \d+\) \[(desktop-chrome|mobile-chrome)\] › (e2e/\S+) › ([^\n]+)',text,re.M))
    rows={}
    for i,m in enumerate(matches):
        block=text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)]
        block=block.split('    attachment #1:')[0]
        lines=[s.strip() for s in block.splitlines()]
        details=[s for s in lines if s.startswith(('Error:','Matcher error:','Expected:','Received:','Received has value:','assay replay failed:'))]
        # The first stack location in the existing assertion is stable across retries.
        locations=re.findall(r'/e2e/([^\s:)]+):(\d+):(\d+)',block)
        key=f'{m[1]} {m[2]} {m[3].strip()}'
        fingerprint={'details':list(dict.fromkeys(details)),'assertion':locations[0] if locations else None}
        if multiple: rows.setdefault(key,[]).append(fingerprint)
        else: rows[key]=fingerprint
    return rows
candidate=parse(root/'_raw/run-8/motor-hauler-final-selected.log')
base={}
pair=json.loads((out/'engine-pair.json').read_text())
for path in sorted(out.glob('base-*.json')):
    record=json.loads(path.read_text())
    if not isinstance(record,dict) or 'baseEngine' not in record: continue
    assert record['baseEngine']==pair['before'] and record['candidateRestoredExactly']
    for key,values in parse(Path(record['log']),multiple=True).items():
        for value in values:
            base.setdefault(key,[]).append({'receipt':path.name,'fingerprint':value})
rows=[{'test':key,'candidate':value,'baseAttempts':base.get(key,[]),'fingerprintMatches':any(value==r['fingerprint'] for r in base.get(key,[]))} for key,value in candidate.items()]
receipt={'candidateFailures':len(candidate),'distinctBaseFailures':len(base),'allFinalFailuresMatchExactBase':all(r['fingerprintMatches'] for r in rows),'rows':rows}
(out/'failure-fingerprints.json').write_text(json.dumps(receipt,indent=2)+'\n')
assert receipt['allFinalFailuresMatchExactBase'],[r for r in rows if not r['fingerprintMatches']]
print('EXACT BASE FINGERPRINTS MATCH',len(rows))

"""Compare unchanged assertion fingerprints on final candidate and exact map base."""
from pathlib import Path
import json,re
p=Path(__file__).parent
# raw is relative to the campaign root, outside committed evidence.
raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')
def failures(path):
    text=re.sub(r'\x1b\[[0-9;]*m','',path.read_text()); rows=[]
    for block in re.split(r'(?m)^\s+\d+\) \[',text)[1:]:
        h=re.match(r'([^]]+)\] › (e2e/[^:]+):(\d+):(\d+) › ([^\n]+)',block)
        assert h,block[:120]
        expected=re.search(r'(?m)^\s+Expected: (.+)$',block)
        received=re.search(r'(?m)^\s+Received: (.+)$',block)
        assert expected and received,block[:200]
        rows.append({'project':h[1],'spec':h[2],'testLine':int(h[3]),'title':h[5].strip(),'expected':expected[1].strip(),'received':received[1].strip()})
    return rows
candidate=failures(raw/'e2-incline-own-and-pack.log')
base=failures(raw/'e2-incline-base-registry/tests.log')
assert len(candidate)==len(base)==6
assert candidate==base
receipt=json.loads((p/'base-registry.json').read_text()); frozen=json.loads((p/'base.json').read_text())
assert receipt['baseEngine']==frozen['engine']
assert receipt['candidateRestoredExactly'] and receipt['candidateEngine']==json.loads((p/'engine.json').read_text())['after']
result={'candidate':{'passed':62,'skipped':6,'failed':6,'receipt':'e2e-own-and-pack-gates.json'},'exactBase':receipt['base'],'exactStoreBase':receipt['storeBase'],'exactBaseEngine':receipt['baseEngine'],'restoredCandidateEngine':receipt['restoredEngine'],'allFingerprintsMatch':True,'failures':candidate}
(p/'browser-failure-attribution.json').write_text(json.dumps(result,indent=2)+'\n')
print('All six final candidate failures match exact-base project/assertion fingerprints.')

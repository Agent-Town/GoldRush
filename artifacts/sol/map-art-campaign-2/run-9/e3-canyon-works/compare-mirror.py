"""Attribute the lane mirror failure without changing its assertion or filters."""
from pathlib import Path
import json,re
p=Path(__file__).parent;raw=p.parent.parent/'_raw/run-9'
def missing(path):
    text=path.read_text()
    return sorted(set(re.findall(r"'((?:assets/pilots/)[^']+)'",text)))
candidate=missing(raw/'e3-canyon-works-mirror-final.log')
base=missing(raw/'e3-canyon-works-base-mirror/tests.log')
receipt=json.loads((p/'base-mirror.json').read_text())
prerequisite=json.loads((p/'mirror-prerequisite-proof.json').read_text())
added=sorted(receipt['newAssetsAbsentDuringBase'])
assert set(candidate)==set(base)|set(added)
assert len(base)==15 and len(candidate)==18
assert receipt['candidateRestoredExactly']
assert prerequisite['currentMainFilterTestExit']==0
(p/'mirror-failure-attribution.json').write_text(json.dumps({
    'command':['node','--test','scripts/deploy-mirror-allowlist.test.mjs'],
    'candidateExit':1,'baseExit':receipt['exit'],
    'candidateMissing':candidate,'baseMissing':base,'addedSourceMetadata':added,
    'baseEngine':receipt['baseEngine'],'restoredEngine':receipt['restoredEngine'],
    'verdict':'Original lane filters fail on base and candidate; three added source JSONs join the same missing include class. Exact canonical main filters pass the unchanged test. Integration must retain both already-landed mirror fixes.',
    'requiredMainCommits':prerequisite['requiredMainCommits'],
    'currentMainFilterTestExit':0
},indent=2)+'\n')
print('MIRROR ATTRIBUTED: base 15, candidate 18; current-main filters pass')

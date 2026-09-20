"""Capture exact base Vite responses for paired runtime measurements, restoring all bytes."""
from pathlib import Path
import hashlib, json, subprocess, time, urllib.request

base = '43a73b54a'
raw = Path('artifacts/sol/map-art-campaign-2/_raw/run-3/twin-baseline-transport')
raw.mkdir(parents=True, exist_ok=False)
paths = subprocess.check_output(['git','diff','--name-only',base,'--','src','assets/pilots/map-rebuild-spike'],text=True).splitlines()
saved = {p:Path(p).read_bytes() for p in paths}
sha = lambda b:hashlib.sha256(b).hexdigest()
receipt = {'base':base,'paths':{},'responses':{}}
try:
    for p, data in saved.items():
        backup=raw/p;backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(data)
        before=subprocess.check_output(['git','show',f'{base}:{p}'])
        receipt['paths'][p]={'beforeSha256':sha(before),'candidateSha256':sha(data)}
        Path(p).write_bytes(before)
    for attempt in range(10):
        response=urllib.request.urlopen('http://127.0.0.1:5303/src/world/Terrain3dClaimPilot.ts',timeout=60).read()
        if b'calmTwinBanksGround' not in response:break
        time.sleep(.5)
    assert b'calmTwinBanksGround' not in response
    (raw/'Terrain3dClaimPilot.js').write_bytes(response)
    receipt['responses']['Terrain3dClaimPilot.js']={'sha256':sha(response),'bytes':len(response)}
    url='http://127.0.0.1:5303/assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.glb'
    response=urllib.request.urlopen(url,timeout=60).read()
    assert response[:4]==b'glTF'
    (raw/'floodplain_dressing_pack.glb').write_bytes(response)
    receipt['responses']['floodplain_dressing_pack.glb']={'sha256':sha(response),'bytes':len(response),'url':url}
finally:
    for p,data in saved.items():
        Path(p).write_bytes(data)
        assert Path(p).read_bytes()==data
    receipt['restoredExactly']=True
    Path('artifacts/sol/map-art-campaign-2/run-3/e1-twin-banks/baseline-routing.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt['responses'],indent=2))

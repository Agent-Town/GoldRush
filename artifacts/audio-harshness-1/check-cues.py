"""Verify decoded target, audible hits and four cue cuts through the new gain chain."""
import json, math, re, subprocess
from pathlib import Path
from measure import ebur128, decode, SR
import numpy as np
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
manifest=(ROOT/'src/audio/manifest.ts').read_text()
before=json.loads((HERE/'measurements-before.json').read_text())
old={'victory-sting':.42,'defeat-sting':.42,'palisade-collapse':.5,'chirp-refuse':.3,'spark-bolt-hit':.24,'palisade-hit':.38}
results={}
for name, old_volume in old.items():
    line=next(line for line in manifest.splitlines() if f"file: '{name}.mp3'" in line)
    volume=float(re.search(r'volume: ([0-9.]+)',line).group(1))
    path=HERE/'scratch'/f'cue-{name}.wav'
    pcm=decode(str(ROOT/'assets/audio/raw'/f'{name}.mp3'))
    pcm=pcm*(volume*.8)*(1-np.exp(-np.arange(len(pcm))/SR/.005))[:,None]
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-',
        '-af','treble=g=-3:f=4000:t=s:w=1',str(path)],input=pcm.astype(np.float32).tobytes(),check=True)
    measured=ebur128(str(path))
    was=before[name]['max_momentary_lufs']+20*math.log10(old_volume*.8)
    results[name]={'manifest_volume':volume,'before_max_momentary_lufs':was,
        'after_integrated_lufs':measured['integrated_lufs'],'after_max_momentary_lufs':measured['max_momentary_lufs'],
        'max_momentary_delta_lu':measured['max_momentary_lufs']-was}
    if name.endswith('-hit'): assert abs(measured['integrated_lufs']-(-30.2))<=6, name
    else: assert -8 <= measured['max_momentary_lufs']-was <= -5, name
(HERE/'cue-levels.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))

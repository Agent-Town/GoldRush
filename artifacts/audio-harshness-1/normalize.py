#!/usr/bin/env python3
"""Replay the verified per-file two-pass loudnorm recipes, without overwriting assets.
Input: scratch/before/*.mp3 (extract from the base commit recorded in report.md).
Output: scratch/reproduced/*.mp3. normalization.json records both pass measurements,
codec settings, offline crest reduction where needed, and lossy peak compensation.
Short cues repeat for loudnorm's analysis window; only the original duration remains.
"""
import hashlib, json, re, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BEFORE, OUT = HERE/'scratch/before', HERE/'scratch/reproduced'
OUT.mkdir(parents=True, exist_ok=True)
recipes = json.loads((HERE/'normalization.json').read_text())
def call(args):
    return subprocess.run(args, capture_output=True, check=True).stderr.decode()
def measure(path, filters):
    log = call(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af',filters+',loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'])
    return json.loads(re.search(r'\{[^{}]+\}',log).group())
verified = {}
for name, recipe in recipes.items():
    path = BEFORE/(name+'.mp3')
    codec = recipe['codec']
    samples = round(recipe['duration']*int(codec['sample_rate']))
    pre = recipe.get('preprocess', '') + f'aloop=loop=9:size={samples}'
    measured = measure(path, pre)  # pass one, remeasured from the original cue
    assert measured == recipe['input'], f'{name}: input or ffmpeg version differs'
    filt = pre + (f",loudnorm=I={recipe['target']}:TP={recipe['ceiling']}:LRA=11:"
        f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}:linear=false,atrim=duration={recipe['duration']}")
    dest = OUT/path.name
    call(['ffmpeg','-hide_banner','-nostats','-y','-i',str(path),'-af',filt,
        '-ar',codec['sample_rate'],'-ac',str(codec['channels']),'-c:a','libmp3lame','-b:a',codec['bit_rate'],str(dest)])
    checked = measure(dest,'anull')
    assert abs(float(checked['input_i'])+14)<=.25 and float(checked['input_tp'])<=-1, name
    same = dest.read_bytes() == (ROOT/'assets/audio/raw'/dest.name).read_bytes()
    assert same, f'{name}: replay differs from shipped MP3'
    verified[name] = {'lufs':float(checked['input_i']),'true_peak_dbtp':float(checked['input_tp']),
        'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'byte_identical':same}
    print(name, checked['input_i'], checked['input_tp'], flush=True)
(HERE/'normalization-replay.json').write_text(json.dumps(verified,indent=2)+'\n')

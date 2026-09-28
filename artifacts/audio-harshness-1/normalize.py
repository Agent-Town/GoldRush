#!/usr/bin/env python3
"""Two-pass loudnorm; repeat short cues for the filter's 3-second analysis window.
Only the first original-duration cue is retained. Codec/rate/channels/bitrate preserved.
Decoded MP3 verification drives headroom and loudness compensation (lossy overshoot).
"""
import json, subprocess, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
RAW = ROOT / 'assets/audio/raw'
BEFORE = HERE / 'scratch/before'
def call(args):
    return subprocess.run(args, capture_output=True, check=True).stderr.decode()
def measure(path, filt):
    log = call(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af',filt+',loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'])
    return json.loads(re.search(r'\{[^{}]+\}',log).group())
results = json.loads((HERE/"normalization.json").read_text()) if (HERE/"normalization.json").exists() else {}
for path in sorted(BEFORE.glob('*.mp3')):
    if path.stem.endswith('-loop') or path.stem == 'title-theme': continue
    prior = results.get(path.stem)
    if prior and abs(float(prior['output']['input_i'])+14)<=.25 and float(prior['output']['input_tp'])<=-1: continue
    info = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=sample_rate,channels,bit_rate','-of','json',str(path)]))['streams'][0]
    pcm = subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-'])
    samples = len(pcm)//(4*info['channels'])
    duration = samples/int(info['sample_rate'])
    repeat = f'aloop=loop=9:size={samples}'
    original = measure(path, 'anull')
    # Sharp subsecond cues exceed the target's 13 dB crest allowance. Reduce
    # crest offline, then run both loudnorm passes over the identical input.
    pre = ''
    if float(original['input_tp'])-float(original['input_i']) > 12:
        lift = 10-float(original['input_tp'])
        pre = f'volume={lift}dB,alimiter=limit=0.0625:attack=1:release=5:level=false:latency=true,'
        if path.stem == 'spark-bolt-hit': pre = f'highpass=f=80,volume={lift}dB,asoftclip=type=tanh:threshold=0.0625:oversample=4,'
    repeat = pre + repeat
    m = measure(path, repeat)
    target, ceiling = -14., -1.3
    for attempt in range(8):
        filt = repeat + f',loudnorm=I={target}:TP={ceiling}:LRA=11:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=false,atrim=duration={duration}'
        dest = RAW/path.name
        call(['ffmpeg','-hide_banner','-nostats','-y','-i',str(path),'-af',filt,'-ar',info['sample_rate'],'-ac',str(info['channels']),'-c:a','libmp3lame','-b:a',info['bit_rate'],str(dest)])
        checked = measure(dest,'anull')
        loud, peak = float(checked['input_i']),float(checked['input_tp'])
        if abs(loud+14) <= .25 and peak <= -1: break
        target = max(-24,min(-5,target + (-14-loud)))
        if peak > -1: ceiling -= peak+1.1
    results[path.stem] = dict(input=m, output=checked, preprocess=pre, attempts=attempt+1, target=target, ceiling=ceiling, duration=duration, codec=info)
    print(path.stem, loud, peak, attempt+1, flush=True)
(HERE/'normalization.json').write_text(json.dumps(results,indent=2)+'\n')
assert all(abs(float(r['output']['input_i'])+14)<=.25 and float(r['output']['input_tp'])<=-1 for r in results.values()), 'Normalization verification failed'

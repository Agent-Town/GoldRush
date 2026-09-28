#!/usr/bin/env python3
"""Offline re-creation of src/audio/SoundSystem.ts mixing for two combat scenarios.
Governor constants and gains are copied from the code (cited in the review); event rates from
src/game/Balance.ts. Renders WAVs into the scratchpad only."""
import json, subprocess, sys, os, re
import numpy as np

RAW = os.environ.get("GR_RAW", str(__import__("pathlib").Path(__file__).resolve().parents[2] / "assets/audio/raw"))
HERE = os.environ.get("GR_RENDER_DIR", os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TICK = 1/60
rng = np.random.default_rng(20260928)

# manifest.ts:64-108 (volume, group, minIntervalMs, pitchVariance)
MAN = {
 'spark-bolt-fire': (0.13,'sfx',80,0.05),
 'spark-bolt-hit': (0.24,'sfx',50,0.04),
 'turret-fire': (0.24,'sfx',70,0.04),
 'gold-chime': (0.3,'sfx',0,0),
 'blast-charge-arm': (0.34,'sfx',0,0),
 'blast-charge-boom': (0.48,'sfx',0,0),
 'palisade-hit': (0.38,'sfx',0,0),
 'palisade-crack': (0.44,'sfx',0,0),
 'palisade-collapse': (0.5,'sfx',0,0),
 'wave-start-horn': (0.4,'sfx',0,0),
 'victory-sting': (0.42,'ui',0,0),
 'river-ambience-loop': (0.18,'ambience',0,0),
 'era-e1-frontier-loop': (0.42,'music',0,0),
}
AFTER = os.environ.get('GR_AFTER') == '1'
if AFTER:
    manifest = ( __import__('pathlib').Path(__file__).resolve().parents[2] / 'src/audio/manifest.ts').read_text()
    for name in MAN:
        line = next(line for line in manifest.splitlines() if f"file: '{name}.mp3'" in line)
        volume = float(re.search(r'volume: ([0-9.]+)', line).group(1))
        pitch = re.search(r'pitchVariance: ([0-9.]+)', line)
        MAN[name] = (volume, MAN[name][1], MAN[name][2], float(pitch.group(1)) if pitch else 0)

FAMILY = {'gold-chime':'gold','stockpile-deposit':'gold','spark-bolt-hit':'hit','palisade-hit':'hit','palisade-crack':'hit','palisade-collapse':'hit'}
FAM_MS = {'gold':120,'hit':60}
MAX_PER_SOUND, CAP, HR_AFTER, HR_FLOOR = 4, 12, 6, 0.45
MASTER = float(os.environ.get('GR_MASTER', '0.8')); MUSIC_VOL = float(os.environ.get('GR_MUSIC', '0.35'))   # settings.ts:63, :79 defaults

def prio(name):
    grp = MAN[name][1]
    if grp in ('ui','voice') or name == 'wave-start-horn': return 3
    if name in ('gold-chime','stockpile-deposit','pan-swish'): return 1
    if grp == 'ambience' or name.endswith('-loop'): return 0
    return 2

def decode(name):
    r = subprocess.run(["ffmpeg","-hide_banner","-v","error","-i",f"{RAW}/{name}.mp3","-f","f32le","-acodec","pcm_f32le","-ac","2","-ar",str(SR),"-"],capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.float32).reshape(-1,2).astype(np.float64)

BUF = {n: decode(n) for n in MAN}

def resample(buf, rate):
    if abs(rate-1) < 1e-9: return buf
    n_out = int(len(buf)/rate)
    x = np.arange(n_out)*rate
    return np.stack([np.interp(x, np.arange(len(buf)), buf[:,c]) for c in range(2)], axis=1)

def headroom(v):
    return 1.0 if v <= HR_AFTER else max(HR_FLOOR, (HR_AFTER/v)**0.5)

def scenario(kind, hero, seconds):
    ev = []  # (time, name, volume)
    def periodic(name, period, vol=1.0, jitter=0.0):
        t = rng.uniform(0, period)
        while t < seconds:
            ev.append((t, name, vol)); t += period + rng.uniform(-jitter, jitter)
    if kind == 'late':
        shooters = [('spark-bolt-fire', 1/2.0)] if hero == 'rig' else []   # hero sparkRig.fireRate 2.0
        shooters += [('spark-bolt-fire', 1/1.2)]*6              # 6 beacons, fireRate 1.2
        shooters += [('turret-fire', 1/(1.1*1.35))]*4           # 4 turrets, fireRate 1.1 x tier 1.35
        kill_every = 3; pal_rate = 1.5
    else:
        shooters = [('spark-bolt-fire', 1/2.0)] if hero == 'rig' else []  # hero only
        shooters += [('turret-fire', 1/1.1)]*1                  # one turret
        kill_every = 3; pal_rate = 0.2
    shots = []
    for shooter_index, (name, period) in enumerate(shooters):
        # Fixed placement assumption: early turret 25m, late buildings 15..60m.
        # The hero is always full volume; no RNG draws or event-rate changes.
        building_index = shooter_index - (1 if hero == 'rig' else 0)
        distance = 25 if kind == 'early' else 15 + max(0, building_index)*5
        scale = 1 if not AFTER or building_index < 0 else max(.35, 1-.65*max(0,distance-10)/50)
        t = rng.uniform(0, period)
        while t < seconds:
            ev.append((t, name, scale)); shots.append(t); t += period
    nh = 0
    for t in shots:
        if rng.random() < 0.8:
            th = t + rng.uniform(0.25, 0.5)
            ev.append((th, 'spark-bolt-hit', 1.0)); nh += 1
            if nh % kill_every == 0: ev.append((th, 'gold-chime', 0.55))
    t = rng.uniform(0, 2.5)
    while hero == 'blast' and t < seconds:                        # hero blast cooldown 2.5, airTime 0.7
        ev.append((t, 'blast-charge-arm', 1.0)); ev.append((t+0.7, 'blast-charge-boom', 1.0)); t += 2.5
    t = rng.exponential(1/pal_rate)
    while t < seconds:
        ev.append((t, 'palisade-crack' if rng.random() < 0.25 else 'palisade-hit', 1.0)); t += rng.exponential(1/pal_rate)
    ev.append((5.0, 'wave-start-horn', 1.0))
    if os.environ.get('GR_VICTORY'): ev.append((30.0, 'victory-sting', 1.0))
    ev = [(round(t/TICK)*TICK, n, v) for t, n, v in ev if t < seconds]
    ev.sort(key=lambda e: e[0])
    return ev

def run(kind, hero, seconds=60):
    ev = scenario(kind, hero, seconds)
    N = int(seconds*SR)
    sfx_voices = []   # dict(start, end, name, gain, data)
    active = []       # currently active voices: dict with end time
    last_sound, last_fam = {}, {}
    drops = {}
    starts = {}
    river = {'start':0.0, 'end':1e9, 'name':'river-ambience-loop', 'prio':0, 'loop':True}
    active.append(river)
    gain_changes = [(0.0, headroom(1))]
    def purge(t):
        nonlocal active
        before = len(active)
        active = [v for v in active if v['end'] > t]
        if len(active) != before: gain_changes.append((t, headroom(len(active))))
    for t, name, vol in ev:
        purge(t)
        mi = MAN[name][2]
        if t*1000 - last_sound.get(name, -1e9) < mi:
            drops[name] = drops.get(name,0)+1; continue
        fam = FAMILY.get(name)
        if fam and t*1000 - last_fam.get(fam, -1e9) < FAM_MS[fam]:
            drops[name] = drops.get(name,0)+1; continue
        if mi > 0: last_sound[name] = t*1000
        if fam: last_fam[fam] = t*1000
        cnt = sum(1 for v in active if v['name'] == name)
        if cnt >= MAX_PER_SOUND:
            drops[name] = drops.get(name,0)+1; continue
        if len(active) >= CAP:
            p = prio(name)
            low = min(active, key=lambda v: v['prio'])
            if low['prio'] < p:
                low['end'] = t; drops[low['name']] = drops.get(low['name'],0)+1
                active.remove(low)
            else:
                drops[name] = drops.get(name,0)+1; continue
        rate = 1 + rng.uniform(-1,1)*MAN[name][3]
        data = resample(BUF[name], rate)
        v = {'start':t, 'end':t+len(data)/SR, 'name':name, 'prio':prio(name), 'gain':MAN[name][0]*vol, 'data':data, 'loop':False}
        active.append(v); sfx_voices.append(v)
        starts[name] = starts.get(name,0)+1
        gain_changes.append((t, headroom(len(active))))
    # render SFX bus (pre master) and per-sample master gain
    sfx = np.zeros((N,2))
    per = {}
    for v in sfx_voices:
        s = int(v['start']*SR); e = min(N, int(v['end']*SR)); n = e - s
        if n <= 0: continue
        seg = v['data'][:n]*v['gain']
        if AFTER: seg = seg * (1-np.exp(-np.arange(len(seg))/SR/.005))[:,None]
        sfx[s:s+len(seg)] += seg
        per[v['name']] = per.get(v['name'],0.0) + float(np.sum(np.square(seg)))
    # river loop (evictions ignored for rendering: it is quiet), gain 0.18*(0.35+0.65*0.5)
    rv = BUF['river-ambience-loop']; reps = int(np.ceil(N/len(rv)))+1
    river_sig = np.tile(rv, (reps,1))[:N]*0.18*(0.35+0.65*0.5)
    if AFTER: river_sig *= (1-np.exp(-np.arange(N)/SR/.03))[:,None]
    sfx += river_sig
    g = np.zeros(N)
    gain_changes.sort()
    for i,(t, h) in enumerate(gain_changes):
        s = int(t*SR); e = int(gain_changes[i+1][0]*SR) if i+1 < len(gain_changes) else N
        g[s:e] = MASTER*h
    if AFTER:
        # setTargetAtTime on the bus, 30ms time constant.
        current = 0.
        for i,(t,h) in enumerate(gain_changes):
            start = int(t*SR); end = int(gain_changes[i+1][0]*SR) if i+1<len(gain_changes) else N
            if end <= start: continue
            target = MASTER*h
            g[start:end] = target+(current-target)*np.exp(-np.arange(end-start)/SR/.03)
            current = target+(current-target)*np.exp(-(end-start)/SR/.03)
    sfx_out = sfx*g[:,None]
    if AFTER:
        # Web Audio high-shelf: -3dB, 4kHz, shelf slope 1.
        filtered = subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-',
            '-af','treble=g=-3:f=4000:t=s:w=1','-f','f32le','-'],input=sfx_out.astype(np.float32).tobytes(),capture_output=True,check=True)
        sfx_out = np.frombuffer(filtered.stdout,dtype=np.float32).reshape(-1,2).astype(np.float64)
    mu = BUF['era-e1-frontier-loop']
    reps = int(np.ceil(N/len(mu)))+1
    music = np.tile(mu, (reps,1))[:N]*(0.42*MUSIC_VOL)*MASTER
    if AFTER: music *= ((1-np.exp(-np.arange(N)/SR/.2))*(1-np.exp(-np.arange(N)/SR/.03))**2)[:,None]
    mix = sfx_out + music
    out = {
      'kind': kind + '-' + hero, 'seconds': seconds,
      'requests': len(ev), 'starts': starts, 'drops': drops,
      'mix_sample_peak_dbfs': round(20*np.log10(np.abs(mix).max()),2),
      'mix_samples_over_0dbfs': int(np.sum(np.abs(mix) > 1.0)),
      'sfx_bus_sample_peak_dbfs': round(20*np.log10(np.abs(sfx_out).max()),2),
      'music_bus_sample_peak_dbfs': round(20*np.log10(np.abs(music).max()),2),
      'master_gain_min': round(float(g.min()),3),
      'master_gain_steps_per_s': round(sum(1 for i in range(1,len(gain_changes)) if abs(gain_changes[i][1]-gain_changes[i-1][1])>1e-9)/seconds,2),
      'master_gain_max_step_db': round(max([abs(20*np.log10(gain_changes[i][1]/gain_changes[i-1][1])) for i in range(1,len(gain_changes))] or [0]),2),
      'master_gain_time_below_unity_pct': round(100*float(np.mean(g < MASTER-1e-9)),1),
      'energy_share_by_sound': {k: round(v/sum(per.values()),3) for k,v in sorted(per.items(), key=lambda kv:-kv[1])},
    }
    for label, sig in (('mix',mix),('sfx',sfx_out),('music',music)):
        path = os.path.join(HERE, f"sim-{os.environ.get('GR_TAG','def')}-{kind}-{hero}-{label}.wav")
        pcm = np.clip(sig, -4, 4).astype(np.float32)
        # write float WAV via ffmpeg
        p = subprocess.run(["ffmpeg","-hide_banner","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","2","-i","-",path], input=pcm.tobytes())
        r = subprocess.run(["ffmpeg","-hide_banner","-nostats","-i",path,"-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True)
        err = r.stderr; summ = err[err.rfind("Summary:"):]
        I = re.search(r"I:\s*(-?[\d.]+) LUFS", summ); TP = re.search(r"True peak:\s*\n\s*Peak:\s*(-?[\d.]+)", summ)
        S = [float(x) for x in re.findall(r"\bS:\s*(-?[\d.]+)", err[:err.rfind("Summary:")])]
        M = [float(x) for x in re.findall(r"\bM:\s*(-?[\d.]+)", err[:err.rfind("Summary:")])]
        out[f'{label}_integrated_lufs'] = float(I.group(1)) if I else None
        out[f'{label}_true_peak_dbtp'] = float(TP.group(1)) if TP else None
        out[f'{label}_max_shortterm_lufs'] = max(S) if S else None
        out[f'{label}_max_momentary_lufs'] = max(M) if M else None
    # spectral share 2-5 kHz for sfx and music buses
    for label, sig in (('sfx',sfx_out),('music',music)):
        mono = sig.mean(axis=1); n=4096; hop=2048; win=np.hanning(n)
        P = np.mean([np.abs(np.fft.rfft(mono[i:i+n]*win))**2 for i in range(0, len(mono)-n, hop)], axis=0)
        f = np.fft.rfftfreq(n, 1/SR); tot = P[f>=20].sum()
        out[f'{label}_share_2k_5k'] = round(float(P[(f>=2000)&(f<5000)].sum()/tot),3)
        out[f'{label}_share_5k_up'] = round(float(P[f>=5000].sum()/tot),3)
        out[f'{label}_centroid_hz'] = round(float((f[f>=20]*P[f>=20]).sum()/tot),0)
    return out

if __name__ == '__main__':
    res = [run('early','rig'), run('early','blast'), run('late','rig'), run('late','blast')]
    json.dump(res, open(os.path.join(HERE, os.environ.get('GR_OUT','simulation.json')),'w'), indent=1)
    for r in res: print(json.dumps(r, indent=1))

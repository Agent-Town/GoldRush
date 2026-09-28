#!/usr/bin/env python3
"""Read-only loudness/spectral measurement of Gold Rush audio assets.
Reads mp3 files, writes JSON to the scratchpad only."""
import json, os, re, subprocess, sys
import numpy as np

RAW = "/Users/robin/Claude/Projects/Gold Rush/assets/audio/raw"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "measurements.json")
SR = 48000  # decode everything to 48k stereo float for analysis

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def probe(path):
    r = run(["ffprobe", "-v", "error", "-show_entries",
             "format=duration,bit_rate:stream=sample_rate,channels,codec_name",
             "-of", "json", path])
    j = json.loads(r.stdout)
    st = j["streams"][0]
    return {
        "duration_s": float(j["format"]["duration"]),
        "bit_rate": int(j["format"].get("bit_rate", 0) or 0),
        "sample_rate": int(st["sample_rate"]),
        "channels": int(st["channels"]),
        "codec": st["codec_name"],
    }

def volumedetect(path):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "volumedetect", "-f", "null", "-"])
    mean = re.search(r"mean_volume:\s*(-?[\d.]+|-inf) dB", r.stderr)
    mx = re.search(r"max_volume:\s*(-?[\d.]+|-inf) dB", r.stderr)
    f = lambda m: (float(m.group(1)) if m and m.group(1) != "-inf" else None)
    return {"mean_volume_db": f(mean), "max_volume_db": f(mx)}

def ebur128(path):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    err = r.stderr
    summ = err[err.rfind("Summary:"):] if "Summary:" in err else ""
    I = re.search(r"I:\s*(-?[\d.]+) LUFS", summ)
    LRA = re.search(r"LRA:\s*(-?[\d.]+) LU", summ)
    TP = re.search(r"True peak:\s*\n\s*Peak:\s*(-?[\d.]+|-inf) dBFS", summ)
    Ms = [float(x) for x in re.findall(r"\bM:\s*(-?[\d.]+)", err[:err.rfind("Summary:")] if "Summary:" in err else err)]
    Ss = [float(x) for x in re.findall(r"\bS:\s*(-?[\d.]+)", err[:err.rfind("Summary:")] if "Summary:" in err else err)]
    g = lambda m: (float(m.group(1)) if m and m.group(1) != "-inf" else None)
    return {
        "integrated_lufs": g(I),
        "lra_lu": g(LRA),
        "true_peak_dbtp": g(TP),
        "max_momentary_lufs": (max(Ms) if Ms else None),
        "max_shortterm_lufs": (max(Ss) if Ss else None),
    }

def decode(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-i", path, "-f", "f32le", "-acodec", "pcm_f32le",
                        "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
    a = np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, 2)
    return a

def db(x):
    return float(20*np.log10(max(x, 1e-12)))

def spectral(a):
    mono = a.mean(axis=1).astype(np.float64)
    n = 4096
    hop = 2048
    if len(mono) < n:
        mono = np.pad(mono, (0, n - len(mono)))
    win = np.hanning(n)
    frames = []
    for i in range(0, len(mono) - n + 1, hop):
        seg = mono[i:i+n] * win
        spec = np.abs(np.fft.rfft(seg))**2
        frames.append(spec)
    P = np.mean(frames, axis=0)
    freqs = np.fft.rfftfreq(n, 1.0/SR)
    total = P[(freqs >= 20)].sum()
    def band(lo, hi):
        m = (freqs >= lo) & (freqs < hi)
        return float(P[m].sum() / total) if total > 0 else 0.0
    centroid = float((freqs[freqs >= 20] * P[freqs >= 20]).sum() / total) if total > 0 else 0.0
    return {
        "centroid_hz": round(centroid, 1),
        "share_20_250": round(band(20, 250), 4),
        "share_250_2k": round(band(250, 2000), 4),
        "share_2k_5k": round(band(2000, 5000), 4),
        "share_5k_10k": round(band(5000, 10000), 4),
        "share_10k_up": round(band(10000, SR/2), 4),
    }

def envelope(a, is_loop):
    mono_abs = np.abs(a).max(axis=1)
    peak = float(mono_abs.max()) if len(mono_abs) else 0.0
    thr = peak * 10**(-40/20)  # -40 dB below peak counts as "sound"
    idx = np.nonzero(mono_abs > thr)[0]
    lead = float(idx[0] / SR) if len(idx) else None
    trail = float((len(mono_abs) - 1 - idx[-1]) / SR) if len(idx) else None
    # attack: time from first audible sample to first sample within 3 dB of peak
    near = np.nonzero(mono_abs >= peak * 10**(-3/20))[0]
    attack = float((near[0] - idx[0]) / SR) if len(idx) and len(near) else None
    ms = lambda x: int(SR * x / 1000)
    first5 = float(mono_abs[:ms(5)].max()) if len(mono_abs) else 0.0
    rms = lambda seg: float(np.sqrt(np.mean(np.square(seg)))) if len(seg) else 0.0
    last20 = rms(a[-ms(20):])
    first20 = rms(a[:ms(20)])
    out = {
        "peak_linear": round(peak, 4),
        "lead_silence_ms": round(lead*1000, 1) if lead is not None else None,
        "trail_silence_ms": round(trail*1000, 1) if trail is not None else None,
        "attack_ms": round(attack*1000, 1) if attack is not None else None,
        "first5ms_peak_rel_db": round(db(first5) - db(peak), 1) if peak > 0 else None,
        "first20ms_rms_dbfs": round(db(first20), 1),
        "last20ms_rms_dbfs": round(db(last20), 1),
        "last20ms_rms_rel_peak_db": round(db(last20) - db(peak), 1) if peak > 0 else None,
    }
    if is_loop:
        jump = float(np.abs(a[-1] - a[0]).max())
        # typical sample-to-sample step inside the file, for comparison
        steps = np.abs(np.diff(a, axis=0)).max(axis=1)
        p99 = float(np.percentile(steps, 99))
        out.update({
            "seam_jump": round(jump, 5),
            "seam_jump_over_p99_step": round(jump / p99, 2) if p99 > 0 else None,
            "seam_rms_last50_vs_first50_db": round(db(rms(a[-ms(50):])) - db(rms(a[:ms(50)])), 1),
        })
    return out

def main():
    files = sorted(f for f in os.listdir(RAW) if f.endswith(".mp3"))
    res = {}
    for f in files:
        p = os.path.join(RAW, f)
        name = f[:-4]
        d = {"bytes": os.path.getsize(p)}
        d.update(probe(p))
        d.update(volumedetect(p))
        d.update(ebur128(p))
        a = decode(p)
        d["decoded_samples"] = int(a.shape[0])
        d["decoded_s"] = round(a.shape[0] / SR, 4)
        d.update(spectral(a))
        is_loop = name.endswith("-loop") or name == "title-theme"
        d.update(envelope(a, is_loop))
        res[name] = d
        print(name, json.dumps(d), flush=True)
    with open(OUT, "w") as fh:
        json.dump(res, fh, indent=1)

if __name__ == "__main__":
    main()

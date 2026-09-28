import subprocess, numpy as np
RAW = "/Users/robin/Claude/Projects/Gold Rush/assets/audio/raw"
SR = 22050
def decode(name):
    r = subprocess.run(["ffmpeg","-hide_banner","-v","error","-i",f"{RAW}/{name}.mp3","-f","f32le","-acodec","pcm_f32le","-ac","1","-ar",str(SR),"-"],capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.float32).astype(np.float64)
N = 8192; HOP = int(0.25*SR)
freqs = np.fft.rfftfreq(N, 1/SR)
valid = (freqs >= 60) & (freqs <= 5000)
pc = np.zeros_like(freqs, dtype=int)
pc[valid] = (np.round(12*np.log2(freqs[valid]/440.0)) % 12).astype(int)
win = np.hanning(N)
for name in ["title-theme","era-e1-frontier-loop","era-e2-steamworks-loop","era-e3-voltage-loop"]:
    x = decode(name)
    frames = []
    for i in range(0, len(x)-N, HOP):
        mag = np.abs(np.fft.rfft(x[i:i+N]*win))
        c = np.bincount(pc[valid], weights=mag[valid]**2, minlength=12)
        n = np.linalg.norm(c)
        frames.append(c/n if n > 0 else c)
    C = np.array(frames)
    # ignore near-silent frames
    S = C @ C.T
    T = len(C); fps = SR/HOP
    lags = range(int(4*fps), int(min(60, T/fps/1.5)*fps))
    diag = [(L/fps, float(np.mean([S[i,i+L] for i in range(T-L)]))) for L in lags]
    base = float(np.mean(S[np.triu_indices(T, int(4*fps))]))
    best = sorted(diag, key=lambda t: -t[1])[:5]
    # fraction of frames having a near-duplicate at >= 8 s distance
    far = int(8*fps)
    dup = 0
    for i in range(T):
        js = [j for j in range(T) if abs(i-j) >= far]
        if js and S[i, js].max() > 0.97: dup += 1
    print(f"{name}: {T} frames of 0.25 s; mean pairwise chroma sim (>=4 s apart) {base:.3f}; top lags {[(round(l,2), round(v,3)) for l,v in best]}; frames with a >0.97 match >=8 s away: {dup}/{T} = {100*dup/T:.0f}%")

import subprocess, numpy as np
RAW = "/Users/robin/Claude/Projects/Gold Rush/assets/audio/raw"
SR = 44100
def decode(name):
    r = subprocess.run(["ffmpeg","-hide_banner","-v","error","-i",f"{RAW}/{name}.mp3","-f","f32le","-acodec","pcm_f32le","-ac","2","-ar",str(SR),"-"],capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.float32).reshape(-1,2)
def db(x): return 20*np.log10(max(float(x),1e-9))
for name in ["title-theme","era-e1-frontier-loop","era-e2-steamworks-loop","era-e3-voltage-loop"]:
    a = decode(name)
    n = len(a)
    print(f"== {name}: {n} samples = {n/SR:.4f}s at {SR}")
    print("  first 8 samples L:", np.round(a[:8,0],4).tolist())
    print("  last 8 samples L:", np.round(a[-8:,0],4).tolist())
    # 10 ms RMS windows at the end (last 300 ms) and start (first 100 ms)
    w = int(0.010*SR)
    end = [round(db(np.sqrt(np.mean(np.square(a[n-(k+1)*w:n-k*w])))),1) for k in range(30)][::-1]
    start = [round(db(np.sqrt(np.mean(np.square(a[k*w:(k+1)*w])))),1) for k in range(10)]
    print("  last 300 ms, 10 ms RMS dBFS:", end)
    print("  first 100 ms, 10 ms RMS dBFS:", start)
    # 1 s RMS windows over the last 8 s and first 8 s
    W = SR
    endS = [round(db(np.sqrt(np.mean(np.square(a[n-(k+1)*W:n-k*W])))),1) for k in range(8)][::-1]
    startS = [round(db(np.sqrt(np.mean(np.square(a[k*W:(k+1)*W])))),1) for k in range(8)]
    body = round(db(np.sqrt(np.mean(np.square(a)))),1)
    print("  last 8 s, 1 s RMS dBFS:", endS)
    print("  first 8 s, 1 s RMS dBFS:", startS, " whole-file RMS:", body)

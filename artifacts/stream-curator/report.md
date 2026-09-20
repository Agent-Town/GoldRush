# Stream curator corrective — 2026-07-15

## Gate state

- PASS: `node --test scripts/stream-curate.test.mjs` (2/2)
- PASS: current-pool curation rejects all four 2026-07-10 headless WebMs and the explicit superseded reel
- PASS: regenerated manifest has 15 entries, 15 unique files, and no banned files
- PASS: isolated `scripts/stream-sync.sh` synced all 15 entries
- PASS: `npm run build`

## Honest length

`SHORT program: 2195.7s below target; approved unique pool exhausted`

| Class | Duration | Mix |
|---|---:|---:|
| Finished gameplay | 0.00 min | 0.0% |
| Era reels | 1.51 min | 44.2% |
| Era cards | 1.75 min | 51.4% |
| Ceremonies | 0.15 min | 4.4% |
| **Total** | **3.41 min** | **100%** |

The program is intentionally shorter than the 40-minute target because no approved real-speed gameplay footage is currently available and repetition is forbidden. The curator's UTC seed/`addedAt` date remains 2026-07-14 at this local 2026-07-15 run.

## Program

```text
001  era-art-card              15.0s  assets/raw/kit-era-10.png
002  era-art-reel               5.1s  marketing/raw/gen/s2-one-hill-ten-eras.mp4
003  ceremony-recording         9.0s  artifacts/stream-capture/ceremony-e3-voltage.mp4
004  era-art-card              15.0s  assets/raw/kit-era-8.png
005  era-art-reel              60.0s  marketing/raw/gen/the-ten-eras-reel.mp4
006  era-art-card              15.0s  assets/raw/kit-era-1.png
007  era-art-reel               5.1s  marketing/raw/gen/chain-e6-to-e7.mp4
008  era-art-card              15.0s  assets/raw/kit-era-5.png
009  era-art-reel               5.1s  marketing/raw/gen/chain-e3-to-e4.mp4
010  era-art-card              15.0s  assets/raw/kit-era-7.png
011  era-art-reel               5.1s  marketing/raw/gen/chain-e9-to-e10.mp4
012  era-art-card              15.0s  assets/raw/kit-era-9.png
013  era-art-reel               5.1s  marketing/raw/gen/chain-e8-to-e9.mp4
014  era-art-card              15.0s  assets/raw/kit-era-4.png
015  era-art-reel               5.1s  marketing/raw/gen/chain-e7-to-e8.mp4
```

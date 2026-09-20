# Town-transfer stability — f1623-1

Three consecutive `npm run test:asset-diet -- --workers=1` runs used the same built bundle with no rebuild between runs. Each run finished **2 passed / 4 failed**; all four failures were the unchanged 25,000,000-byte ceiling assertions. Wall times were **6.8 min**, **7.0 min**, and **6.7 min**.

## Verdict

**SUPERSEDED by F-1625-3 — the table below measures settled <=20 s bytes, not cue-window bytes.** Within the original shell every reading was within ±1% of its three-run project mean: desktop max deviation **0.39%** (mean 48,392,162) and mobile max deviation **0.61%** (mean 48,292,643). The full range divided by the mean was 0.59% desktop and 1.21% mobile.

The 20 s settle cap was hit for the cue test and every normal/decomposition arm in all three runs. Only the saveData arm reached 1500 ms of genuine network idle, in about 10.2 s. This establishes within-shell repeatability only; it does not establish a stable release quantity or show that advance-stream traffic naturally becomes idle within 20 s.

## F-1625-3 different-load check

The serial condition is the final green `npm run test:asset-diet` run (`--workers=1`, **6 passed in 6.7 min**). The concurrent condition ran the cue test for desktop and mobile together with `--workers=2` (**2 passed in 48.0 s**). Both conditions used the same built bundle.

| Condition | Project | settledTotalBytes | settleCapHit | Change from serial |
| --- | --- | ---: | --- | ---: |
| serial | desktop-chrome | 48582362 | true | baseline |
| serial | mobile-chrome | 47713206 | true | baseline |
| concurrent projects | desktop-chrome | 47783206 | true | -799156 (-1.64%) |
| concurrent projects | mobile-chrome | 47783206 | true | +70000 (+0.15%) |

**Verdict: load-dependent.** The desktop settled <=20 s result fell **1.64%** when the second project ran alongside it; mobile moved **0.15%**. Every measured arm hit the cap, so the quantity remains bytes transferred under the shell's available work within 20 seconds, not bytes to quiescence.

## Three-run stability table

`Spread / mean` is `(maximum - minimum) / mean` for the named project and quantity across all three runs.

| Run | Project | Quantity | Bytes | Spread / mean across 3 runs |
| ---: | --- | --- | ---: | ---: |
| 1 | desktop-chrome | settled <=20 s totalBytes | 48297062 | 0.59% |
| 1 | desktop-chrome | A/B normal totalBytes | 53553550 | 1.63% |
| 1 | desktop-chrome | A/B normal uniqueBytes | 50878888 | 1.15% |
| 1 | desktop-chrome | A/B normal duplicateBytes | 2674662 | 11.48% |
| 1 | desktop-chrome | decomposition false/false totalBytes | 48297062 | 1.22% |
| 1 | desktop-chrome | decomposition false/true totalBytes | 48297062 | 0.62% |
| 1 | desktop-chrome | decomposition true/false totalBytes | 53268250 | 0.53% |
| 1 | desktop-chrome | decomposition true/true totalBytes | 53268250 | 1.10% |
| 1 | mobile-chrome | settled <=20 s totalBytes | 48297062 | 1.21% |
| 1 | mobile-chrome | A/B normal totalBytes | 53268250 | 1.10% |
| 1 | mobile-chrome | A/B normal uniqueBytes | 50878888 | 1.15% |
| 1 | mobile-chrome | A/B normal duplicateBytes | 2389362 | 0.00% |
| 1 | mobile-chrome | decomposition false/false totalBytes | 48297062 | 0.59% |
| 1 | mobile-chrome | decomposition false/true totalBytes | 48297062 | 0.00% |
| 1 | mobile-chrome | decomposition true/false totalBytes | 53268250 | 0.00% |
| 1 | mobile-chrome | decomposition true/true totalBytes | 53268250 | 0.00% |
| 2 | desktop-chrome | settled <=20 s totalBytes | 48297062 | 0.59% |
| 2 | desktop-chrome | A/B normal totalBytes | 53268250 | 1.63% |
| 2 | desktop-chrome | A/B normal uniqueBytes | 50878888 | 1.15% |
| 2 | desktop-chrome | A/B normal duplicateBytes | 2389362 | 11.48% |
| 2 | desktop-chrome | decomposition false/false totalBytes | 47713206 | 1.22% |
| 2 | desktop-chrome | decomposition false/true totalBytes | 47998506 | 0.62% |
| 2 | desktop-chrome | decomposition true/false totalBytes | 53268250 | 0.53% |
| 2 | desktop-chrome | decomposition true/true totalBytes | 52684394 | 1.10% |
| 2 | mobile-chrome | settled <=20 s totalBytes | 47998506 | 1.21% |
| 2 | mobile-chrome | A/B normal totalBytes | 52684394 | 1.10% |
| 2 | mobile-chrome | A/B normal uniqueBytes | 50295032 | 1.15% |
| 2 | mobile-chrome | A/B normal duplicateBytes | 2389362 | 0.00% |
| 2 | mobile-chrome | decomposition false/false totalBytes | 48297062 | 0.59% |
| 2 | mobile-chrome | decomposition false/true totalBytes | 48297062 | 0.00% |
| 2 | mobile-chrome | decomposition true/false totalBytes | 53268250 | 0.00% |
| 2 | mobile-chrome | decomposition true/true totalBytes | 53268250 | 0.00% |
| 3 | desktop-chrome | settled <=20 s totalBytes | 48582362 | 0.59% |
| 3 | desktop-chrome | A/B normal totalBytes | 52684394 | 1.63% |
| 3 | desktop-chrome | A/B normal uniqueBytes | 50295032 | 1.15% |
| 3 | desktop-chrome | A/B normal duplicateBytes | 2389362 | 11.48% |
| 3 | desktop-chrome | decomposition false/false totalBytes | 47998506 | 1.22% |
| 3 | desktop-chrome | decomposition false/true totalBytes | 48297062 | 0.62% |
| 3 | desktop-chrome | decomposition true/false totalBytes | 53553550 | 0.53% |
| 3 | desktop-chrome | decomposition true/true totalBytes | 53268250 | 1.10% |
| 3 | mobile-chrome | settled <=20 s totalBytes | 48582362 | 1.21% |
| 3 | mobile-chrome | A/B normal totalBytes | 53268250 | 1.10% |
| 3 | mobile-chrome | A/B normal uniqueBytes | 50878888 | 1.15% |
| 3 | mobile-chrome | A/B normal duplicateBytes | 2389362 | 0.00% |
| 3 | mobile-chrome | decomposition false/false totalBytes | 48582362 | 0.59% |
| 3 | mobile-chrome | decomposition false/true totalBytes | 48297062 | 0.00% |
| 3 | mobile-chrome | decomposition true/false totalBytes | 53268250 | 0.00% |
| 3 | mobile-chrome | decomposition true/true totalBytes | 53268250 | 0.00% |

## Duplicate attribution

Duplicate bytes are a small residual, not the cause of the former 3.08× swing. In the settled cue-test capture they ranged from 2,970 to 288,270 bytes; in normal arms they ranged from 2,389,362 to 2,674,662 bytes. Normal-arm unique bytes still moved by 583,856 bytes while mobile duplicate bytes were exactly constant, so the remaining variation includes a moving asset set/timing boundary rather than duplicate fetches alone.

## Controls

Every arm in the original three-run artifact retained the content-length control at **27 absent / 0 unparseable**. F-1625-1 restores the release-gated `townResponses:` line to the separately sampled cue-window quantity and records settled <=20 s bytes without applying the 25,000,000-byte ceiling to them.

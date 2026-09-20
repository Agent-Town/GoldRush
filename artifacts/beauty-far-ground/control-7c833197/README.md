# Control run — every red on `beauty2/far-ground`, re-proved on the untouched base commit

Detached worktree at **`7c833197`** (this branch's base, `origin/main` at pre-flight), its own vite
on scratch port **5352**, `--workers=1`, `GR_CAPTURE_EXTERNAL_SERVER=1` so the control never shares
the branch's dev server.

```
git worktree add --detach /tmp/gr-fg-control 7c833197
cd /tmp/gr-fg-control && npx vite --host 127.0.0.1 --port 5352 --strictPort
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5352 \
  npx playwright test <spec>:<line> --project=desktop-chrome --project=mobile-chrome --workers=1
```

| Test | control at `7c833197` | branch | verdict |
|---|---|---|---|
| `e1-night-shift:271` x2 projects | ✘ ✘ | ✘ ✘ | pre-existing |
| `e1-night-shift:372` x2 | ✘ ✘ | ✘ ✘ | pre-existing |
| `e1-night-shift:435` x2 | ✘ ✘ | ✘ ✘ | pre-existing (F-10 / F-5b, the flicker-phase coin flip) |
| `night3d-perf:67` x2 | ✘ ✘ | ✘ ✘ | pre-existing |
| `e1-twin-banks:103` x2 | ✘ ✘ | ✘ ✘ | pre-existing — **NOT previously on any known-red list** |

**10 of 10. No red on this branch survives a control run at the base commit.**

`e1-twin-banks:103` is the one that mattered: twin-banks is a map this shift added an apron profile
to, so "it is not mine" had to be proved rather than argued. It fails identically (`expect(received)
.toBe(expected)`, `Timeout 5000ms exceeded while waiting on the predicate`, inside
`placeBuildableAt`) on a tree that has never seen this branch, running alone rather than in a
104-test battery. The other eight were already documented as pre-existing in
`reviews/beauty-night-shift-r2.md`; they are re-proved here rather than inherited (Mistake #4).

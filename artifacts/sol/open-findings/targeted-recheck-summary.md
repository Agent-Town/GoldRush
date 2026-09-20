# targeted-recheck complete browser result

Start: `2026-09-19T14:43:01.234Z`. Duration: 1.12 minutes.
Expected: **2**; unexpected: **2**; skipped: **0**; flaky: **0**.

| File | Project | Passed | Failed | Timed out | Skipped |
|---|---|---:|---:|---:|---:|
| town-cast-wiring.spec.ts | desktop-chrome | 1 | 0 | 0 | 0 |
| town-cast-wiring.spec.ts | mobile-chrome | 1 | 0 | 0 | 0 |
| town-fresh-boot-textures.spec.ts | desktop-chrome | 0 | 1 | 0 | 0 |
| town-fresh-boot-textures.spec.ts | mobile-chrome | 0 | 1 | 0 | 0 |

## Complete failing assertions

### desktop-chrome · town-fresh-boot-textures.spec.ts:28

delayed town textures converge without a reload and bark portrait falls back

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: "fallback"
Received: "loaded"

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

### mobile-chrome · town-fresh-boot-textures.spec.ts:28

delayed town textures converge without a reload and bark portrait falls back

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: "fallback"
Received: "loaded"

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

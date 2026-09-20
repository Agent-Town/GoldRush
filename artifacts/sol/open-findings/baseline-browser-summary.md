# baseline-browser complete browser result

Start: `2026-09-19T14:39:37.289Z`. Duration: 2.54 minutes.
Expected: **3**; unexpected: **9**; skipped: **0**; flaky: **0**.

| File | Project | Passed | Failed | Timed out | Skipped |
|---|---|---:|---:|---:|---:|
| e1-twin-banks.spec.ts | desktop-chrome | 0 | 3 | 0 | 0 |
| e1-twin-banks.spec.ts | mobile-chrome | 0 | 3 | 0 | 0 |
| town-cast-wiring.spec.ts | desktop-chrome | 1 | 0 | 0 | 0 |
| town-cast-wiring.spec.ts | mobile-chrome | 1 | 0 | 0 | 0 |
| town-fresh-boot-textures.spec.ts | desktop-chrome | 1 | 0 | 0 | 0 |
| town-fresh-boot-textures.spec.ts | mobile-chrome | 0 | 1 | 0 | 0 |
| town-t1-square.spec.ts | desktop-chrome | 0 | 1 | 0 | 0 |
| town-t1-square.spec.ts | mobile-chrome | 0 | 1 | 0 | 0 |

## Complete failing assertions

### desktop-chrome · e1-twin-banks.spec.ts:88

loads Twin Banks contract with two fords, two build zones, and one loss stake

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: "river"
Received: "bank"
```

### desktop-chrome · e1-twin-banks.spec.ts:127

builds sluices and stockpiles on both banks against one gold pool

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

### desktop-chrome · e1-twin-banks.spec.ts:146

routes enemies through both west and east fords

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

### mobile-chrome · e1-twin-banks.spec.ts:88

loads Twin Banks contract with two fords, two build zones, and one loss stake

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: "river"
Received: "bank"
```

### mobile-chrome · e1-twin-banks.spec.ts:127

builds sluices and stockpiles on both banks against one gold pool

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

### mobile-chrome · e1-twin-banks.spec.ts:146

routes enemies through both west and east fords

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

### mobile-chrome · town-fresh-boot-textures.spec.ts:52

delayed town textures converge without a reload and bark portrait falls back

```text
Error: expect(received).toBe(expected) // Object.is equality

Expected: "fallback"
Received: "loaded"

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

### desktop-chrome · town-t1-square.spec.ts:98

menu enters town square, prompts at four shells, exits, then starts normal run

```text
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('town-approach-prompt')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 4

- opens soon
+
+         Tavern ... the board is warm
+         Board
+

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('town-approach-prompt')
    14 × locator resolved to <div role="status" aria-live="polite" class="town-ui__prompt" data-testid="town-approach-prompt">…</div>
       - unexpected value "
        Tavern ... the board is warm
        Board
      "

```

### mobile-chrome · town-t1-square.spec.ts:98

menu enters town square, prompts at four shells, exits, then starts normal run

```text
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('town-approach-prompt')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 4

- opens soon
+
+         Tavern ... the board is warm
+         Board
+

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('town-approach-prompt')
    9 × locator resolved to <div hidden="" role="status" aria-live="polite" class="town-ui__prompt" data-testid="town-approach-prompt">…</div>
      - unexpected value "
        Tavern ... the board is warm
        Board
      "
    5 × locator resolved to <div role="status" aria-live="polite" class="town-ui__prompt" data-testid="town-approach-prompt">…</div>
      - unexpected value "
        Tavern ... the board is warm
        Board
      "

```

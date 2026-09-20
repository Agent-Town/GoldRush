# GG-03b panel-weight stop report

Status: `PREMISE-NOT-REPRODUCED`

The archived GG-03 treatment did not reproduce F-1208-1 at the required canonical configuration, so scope 1 cancels scopes 2–6.

Command shape: `npx playwright test e2e/gazette-art-wiring.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=2 --reporter=list`, using this worktree's external Vite server on scratch port 5262 because lane-d owned the shared runner port 5188.

| Run | Arm | Whole spec | `:103` cells |
|---|---|---:|---:|
| 1 | archived treatment | 4/4 passed | 2/2 passed |
| 2 | base-source control | 4/4 passed | 2/2 passed |
| 3 | archived treatment | 4/4 passed | 2/2 passed |
| 4 | base-source control | 4/4 passed | 2/2 passed |

Totals:

- Treatment: 0/4 `:103` failures; 4/4 green.
- Control: 0/4 `:103` failures; 4/4 green.

The proceed condition required treatment red in at least 2/4 `:103` cells with control green in 4/4. Treatment was green, so no source, CSS, guard, test, raw, or derivative change was retained.

The first attempted invocation on the default port exited before test collection because port 5188 was occupied by lane-d. It is not counted above.

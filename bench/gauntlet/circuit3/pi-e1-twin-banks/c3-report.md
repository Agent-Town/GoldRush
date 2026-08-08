# C3 Report — e1-twin-banks

## Approach

**Strategy:** Bulk-harvest gold with multiple sequential HARVEST orders (each pans 5g).
Build sentry beacons (25g) first for slow + vision, then turrets (50g+) for kills.
Defend the south claim stake at (0,-12). Two fords need watching.

**Key insight:** Each HARVEST order pans exactly once (tickGold=5). By sending 20+ sequential
HARVEST orders to the same seam, we accumulate gold rapidly in a single submission cycle.
BUILD orders with goldGte conditions fire automatically once enough gold is harvested.

## Run

| Outcome | Waves | Gold | Kills | Calls |
|---------|-------|------|-------|-------|
| unknown | ? | ? | ? | 15 |

**Views processed:** 15
**Total calls (view→order cycles):** 15

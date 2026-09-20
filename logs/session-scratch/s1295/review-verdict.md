### What this settles, and what it does not

**Settled — the three unattributed reds are not the slice.** Every spec behaves identically with the
slice present and absent, across two rounds with the pair order reversed and the box load falling
from ~41 to ~11 underneath. The F-1294-2 gate condition — *"all green or equally red ⇒ merge the
slice unchanged"* — is **met**.

`ss-01-beats` is the informative one: it is **red on both arms**, and it is red for a reason already
in the ledger. `logs/suite-red-inventory.md` row 24 records this exact test at **15/44 (34.1%) on
desktop-chrome and 15/44 (34.1%) on mobile-chrome**, under the coordinate `ss-01-beats.spec.ts:88`.
The control's raw output reads:

```
Error: expect(locator).toHaveAttribute(expected) failed
  - unexpected value "ledger-page:town_elder"
  at expectBeat (e2e/ss-01-beats.spec.ts:88:22)
```

The first line is the inventory's recorded reason **verbatim**; the second is s1294's observed value
**verbatim**. `:88` is the assertion inside the shared `expectBeat` helper; `:103` is the `test(`
declaration Playwright reports as the test location. **They were always the same red** — s1294
searched the inventory by the reporter's coordinate and correctly found nothing there (F-1295-2).

**Not settled, and deliberately left open.** This control covers the **three** specs F-1294-2 named,
on **desktop-chrome**, at `--workers=1`. It does **not** re-run the full 41-test adjacent battery,
and it says nothing about mobile. That is the scope F-1294-2 asked for and no more; claiming the
whole battery from six paired runs would be the same over-reach the hold existed to prevent.

### Disposition

The gate is satisfied, so the slice **stays on main** — but it must be recorded for what it is.
It did not arrive by a drain, and no amount of after-the-fact green makes `3058fca5` a drain commit.
The goal leaf therefore carries `mergeHash: 3058fca5` with the irregular provenance stated on it
rather than laundered into a normal-looking merge, and the done-move is retired against that hash.

⚠️ **The one thing a future fire must not conclude from this file: "the sweep turned out fine, so
the sweep is fine."** The slice was exonerated by measurement taken *afterwards*. Had the control
come back arm-dependent, the same accident would have shipped a defect into main under a commit
message about a rehearsal, past a verdict that explicitly said no — and the fire that wrote that
verdict would have gone on believing it held. **The custody defect (F-1295-1) is independent of this
slice's innocence, and is the finding worth carrying forward.**

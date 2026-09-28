# Test-truth before/after

Base engine commit: `6fbe66df00519100cf5088b969b82a97c3d142d9`

The shared asset store moved during the run. Its final observed commit was
`d8938178a7464c637a79bca81d5f788bc8ad954d`; the base control saw the Claim
publish 51,200 triangles, while the final mounted contract and runtime published
32,768. The assertion now reads the registered pack contract rather than freezing
either transient number.

| Truth | Before expected | Before received | After expected | After received | Cause |
| --- | --- | --- | --- | --- | --- |
| Invalid terrain bytes, both projects | `failed` | `lite` | `failed` | `failed` | `7c2744e5a`: pin `tier=full` so the invalid-byte loader branch runs. |
| Claim triangle count, both projects | `32,768` | `51,200` | registered terrain-only contract count (`32,768` at final store head) | `32,768`; assertion cleared before the later water probe | `7c2744e5a`: the pilot publishes the inspected terrain GLB count; continuation is constructed separately and is not included. |
| Claim skirt blend, both projects | `painted-underlay-alpha-rim` | `opaque-sculpt-edge` | mode derived from mounted render source: `opaque-sculpt-edge` for GLB, painted alpha rim otherwise | `opaque-sculpt-edge`; assertion cleared before the later horizon probe | `7c2744e5a`: sculpt-edge packs use the opaque edge mode. |
| Archive World seeds, both projects | `undefined` | `e10-archive-world-01`, `e10-archive-world-02` | the two authored seeds | the two authored seeds | `7c2744e5a`: authored Archive World seeds landed. |
| Archive World dependency status, both projects | `missing` | `landed` | `landed` | `landed` | `7c2744e5a`: Archive World consumers landed. |
| Archive World rules, both projects | `build_zones`, `hero_orders` | plus `archive_restoration`, `static_squall` | all four exact rule ids | all four exact rule ids | `6351690fb0` + `7c2744e5a`: squall and restoration consumers landed. |
| Archive World loss stakes, both projects | length `0` | length `1` (`archive-entry`) | length `1` | length `1` | `7c2744e5a`: archive-entry is the authored loss stake. |
| Archive World AP-07 admission, both projects | constructor throws | constructor succeeds | constructor succeeds at wave `0` | constructor succeeds at wave `0` | `7c2744e5a`: authored harvest anchors opened the derived AP-07 door. |
| Last Claim census render | painted | GLB | GLB | GLB (`PASS`) | `19bdb6bce`: dedicated memorial pack is mounted. |

## Mutation proof

Removing only `tier=full` made the invalid-bytes assertion fail on desktop and
mobile with expected `failed`, received `lite` (`mutation-without-tier-full.log`).
Restoring the pin made that assertion pass on both projects
(`mutation-restored-green.log`; the two failures in that combined run were the
then-still-masked Archive World rule expectations, not the invalid-byte test).

## Held observations

These were not assigned replacement truths and no cited commit/spec supports a
new expectation, so their exact assertions were not changed:

- Claim water probe: expected zone `river`, received `bank` on desktop and mobile.
- Panorama horizon standard deviation: expected `> 8`; received
  `2.33657527073362` desktop and `1.7419837815172157` mobile.
- Citation-title guard: two citations in the read-only task master lack a
  recoverable quoted title (`er01-e10-census.spec.ts:138` and
  `terrain3d-registry.spec.ts:281`). The guard cannot be made green inside the
  task firewall.


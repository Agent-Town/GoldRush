# E1 release asset manifest diff

Generated with:

```sh
node scripts/diff-release-assets.mjs \
  /tmp/gold-rush-release-fixes.XsV8tJ/full \
  /tmp/gold-rush-release-fixes.XsV8tJ/release-before \
  dist
```

| Scope | Full | Release before fix | Release after fix |
| --- | ---: | ---: | ---: |
| All emitted assets | 3,031 / 1,081,594,019 B | 1,468 / 180,790,851 B | 1,689 / 187,785,911 B |
| Character/townsfolk emitted assets | 2,096 / 58,662,199 B | 1,209 / 28,170,947 B | 1,430 / 35,126,938 B |
| Canonical character/townsfolk artifacts | 2,024 | 1,209 | 1,430 |

The attended `2,096 -> 1,209` count is exact. Its 887-file raw delta resolves to 815
missing canonical artifacts plus 72 duplicate full-build glob emissions.

| Missing canonical group | Artifacts before | Artifacts restored | Verdict |
| --- | ---: | ---: | --- |
| Runtime town actor sheets | 383 | 383 | Defect |
| Later-era contracted actors | 240 | 0 | Intended exclusion |
| Non-frontier hero aging sheets | 192 | 0 | Intended exclusion |
| Total | 815 | 383 | Only reachable E1 sheets restored |

The contract/registry allowlist also keeps 70 active hero pan/attack artifacts
that the original wildcard happened to include, while dropping 162 dormant
wildcard-only artifacts. The release therefore grows by 221 canonical
character artifacts net.

## Runtime town sheets

| Runtime registry sheet | Full | Release before fix | Release after fix |
| --- | ---: | ---: | ---: |
| `char-tavernkeeper-sheet-walk8` | 32 | 0 | 32 |
| `char-storekeeper-sheet-walk8` | 32 | 0 | 32 |
| `char-elder-sheet-walk8` | 32 | 0 | 32 |
| `char-preacher-sheet-walk8-a` | 32 | 32 | 32 |
| `char-schoolteacher-sheet-walk8-a` | 32 | 32 | 32 |
| `char-assay-clerk-sheet-walk8-a` | 32 | 32 | 32 |
| `char-youngster-m-sheet-walk8` | 32 | 0 | 32 |
| `char-youngster-f-sheet-walk8` | 32 | 0 | 32 |
| `char-newsie-mei-sheet-walk8` | 32 | 1 | 32 |
| `char-prospector-sheet-hover8` | 32 | 32 | 32 |

The exclusion swept six live sheets: tavernkeeper, storekeeper, elder, both
youngsters, and Mei. Mei retained one directly referenced frame, explaining her
`1` rather than `0`. The fixed keep-set comes from `characters.v2.json` plus the
runtime town sheet registry, then expands only those contracted grids to their
processed cells.

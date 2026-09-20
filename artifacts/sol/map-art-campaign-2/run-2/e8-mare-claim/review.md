# Mare Claim — bounded inhabited-drum detail, 2026-09-19

IMPROVED; full concept remains UNACCEPTED. [Desktop board](board-1280.png), [phone board](board-390.png). Plain captures preserve the HUD and run naturally; elapsed animation differs. The fixed 9 m south diagnostic isolates the geometry.

| Original defect | Verdict |
| --- | --- |
| Inhabited drum detail | IMPROVED: five framed teal ports and six bronze service panels replace sections of the blank lower band, using 32 new triangles and the existing atlas. Detail is most readable on the side domes; the normal phone HUD still obscures much of the central dome. This is not a furnished interior. |
| Glass richness | HELD: existing alpha 0.22 glass and materials remain identical. Clearer panes, layered reflections and lit interiors require a separate material/interior pass; adding wall ports does not resolve this. |
| Player contrast | HELD: hero and brass still share the brown field. Character and HUD owners are excluded; no hero lighting claim is made. |
| Map dressing / full concept | HELD: sparse flat ground around three repeated domes lacks the plate's inhabited compound, terraces and connected service spaces. Fitting that architecture into a full pack requires a deliberate rebudget, not more triangles beyond the cap. |

The GLB reaches exactly **3,000 / 3,000 triangles** (2,968 before), retains two primitives/materials, the same embedded atlas, bounds, node transforms and mount table. All old triangles remain within 0.000001 m position and 0.0001 normal-component tolerances; UVs are exact. Re-export is not byte-identical: measured maxima are 9.54e-7 m and 9.71e-5 respectively. [Decoded geometry proof](geometry-proof.json). Ground remains 32,768/60,000 and panorama 3,072/4,000; the reused terrain's other pack bodies remain 600–1,164/3,000 ([budgets](asset-budgets.json)).

Four paired 180-frame runs per arm, normal HUD, fixed simulation/camera: median p95 **9.40→9.35 ms desktop / 9.85→9.75 ms phone**, calls unchanged **85/60**, visible triangles +96/+32. All samples occupy the same 8.4–10.0 ms band; no slower plateau is discarded. [Summary](performance-summary.json), [all frames and fixture disclosure](dome-paired.json). Geometry pairs are held throughout the diagnostic; fresh plain boots verify the actual production asset separately.

Before GLB SHA256 f694d1d1818328498c9b7d9982989b9ee7d567c7a6c37d032c670fe3450e8a04; after b8c42ee7985ff5932b8e927970f7cf9501f0597cfebfbf97088fa284fe528d87. Builder and blend are updated together; original pack and strict byte-comparison failure are preserved in `_raw/run-2`.

Engine 65225d736a53b97ca7b9793c810f3afee0c0da677aecba18944dfba28fefb484 → 32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb. The engine hash includes the changed asset; no pin or simulation source is edited.

Gates PASS: tsc, default/full builds; all four Mare/Eclipse final plain boots with zero errors and no test hook; repeated-mount isolation 2/2; landmark-loading probe 8/8 (that legacy probe covers E5/Claim, so the new plain captures and paired fixture establish E8 identity); own physics + collision 14/14; named task/citation/gate-caller guards. Global GLB audit: 423 assets, six grandfathered violations, zero live violations or stale baseline entries. No full node battery. [Gate receipt](gates.json). Generated collision/loading screenshots were preserved and restored by exact names.

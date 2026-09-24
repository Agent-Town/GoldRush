# e1-twin-banks — entry framing, 2026-09-24

IMPROVED: phone homestead revealed; desktop already visible.

The phone-only 2.5-second glance reveals south_bank_homestead and returns to the unchanged rider. Desktop correctly skips the already-visible house. Both braids, both banks, the other rig and HUD clearance remain separate holds; the single homestead does not establish full plate fidelity.

Declared: `south_bank_homestead`. The plate pairs worked homesteads across the braids; the southern homestead supplies one bounded landmark without pretending the fixed camera can frame both banks.

| View | Landmark | Rest pixels | Peak pixels | Return pixels | Seconds visible | Glance |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1280 | south_bank_homestead | 44,748 | 44,746 | 44,746 | 3.996–3.996 (observation censored) | False |
| 390 | south_bank_homestead | 0 | 49,902 | 0 | 1.9–2.015 | True |

Unique-magenta depth-tested body counts use a fixed DPR-1 viewport render target, excluding the HUD. Counting the unique colour prevents animated water from contaminating a two-render difference. The normal-HUD screenshots remain ordinary live boots. These numbers measure body visibility, not total landscape fidelity or HUD clearance. Duration follows recorded live camera poses against a frozen final scene; no teleport or sim order is used. Zero console/page errors in all capture arms.

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Raw captures](captures.json) · [Metrics](metrics.json) · [Contract invariants](invariants.json).

TypeScript and default/full/E1 builds PASS. First-town payload **34,329,072 B**; delta **+6,256 B** from the preceding map/build.

Own existing browser spec exit: **1**. See [test receipt](e2e-own.json) and [log](e2e-own.log). Own suite 4 passed / 6 failed. All six exact test/project failures reproduce under the pre-task CameraRig/manifest control: center bank-versus-river classification at line 96, invalid build ghost at line 48, ford-route timeout at line 228. See e2e-base-verified.log. Full existing-suite acceptance remains HELD; no assertion was changed. No protected assertion was changed. Shared replay, parity, release checks and all gate holds are recorded in the [closing run note](../run-note.md).

Engine `9c2ee0ea822710505d86a59da361d42c2362729ef5feeded0ce7bff33100e47b` → `97855ed9d083ec03a2057dfc9f33b0618f6c8cb28fcfac99952fa1e2e6000a97`. Engine pin remains drain-owned. Camera offset, FOV, zoom, every hero start, Game entry/replay hook, view schema, sim and asset geometry are unchanged.

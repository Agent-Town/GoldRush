# Task lane-b-tour-era-seed: the tour door learns eras — debug-gated &era=N seeding (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/meta/ContractFamilies.ts activeContractSelection (~:1076) + activateEpoch (the ONE legal era-arming seam) + the epoch manifest list · the research-state read/write module (how scienceSteps/research nodes persist per profile+epoch, gr.profile.v2 scoping) · src/game/Game.ts arsenal gating (`this.activeEpoch.order >= N && ... hasResearchNode(...)`) · e2e/ceremony-framework.spec.ts seed() helper (how specs stage era state via storage — your feature is the URL-shaped cousin).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (owner playtest F-TOUR-3, 2026-07-18: booted e9-dome-basin via the tour door and got E1 weapons — "The weapons are also the same"; era arsenals/systems are epoch+research-gated, and the tour door provides neither)
The test plan's doors must show each era's REAL content. The specs seed storage; the owner needs a URL.

## Scope
1. Under `?debug` ONLY: an `&era=N` param (1-10) that, before the run boots, (a) arms epoch N via the LEGAL seam (activateEpoch / the reconcile path — never a parallel writer), (b) grants the SESSION profile research to era N's ceiling (whatever unlocks that era's arsenal + systems), (c) leaves a diagnostics breadcrumb (canvas dataset or console-free marker) stating the seeded era.
2. Without `?debug`, `&era` is INERT (assert it).
3. Scope the writes to the ACTIVE (debug/tour) profile exactly like the specs' seed() does — never leak into another profile's storage.
4. Spec e2e/tour-era-seed.spec.ts (both projects): `?contract=e9-dome-basin&debug&era=9` boots with epoch-9 active + an E9 arsenal item present (probe the gating diagnostics or Balance-driven entity); same URL WITHOUT debug boots the fallback (Claim, era untouched); zero console.
## Firewall: TOUCH-ONLY the boot/param plumbing (main.ts/ContractFamilies param surface), the seeding helper, your spec. NO new arming pathways (route through activateEpoch), NO changes to the debug-gate default, NO Balance changes.
## Self-check: tsc+build · your spec + cp04's seeded-boot cases + 072/era-activation adjacents green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the exact door recipe for the test plan.

# m0/04-hud-shell-state

**Contract:** run-state machine + themed HUD shell exist; every M1 slice fills these instead of inventing DOM or states.

**Seam:** `src/game/GameState.ts` — `'boot'|'playing'|'levelup'|'dead'` with transition guards; only `Game.ts` transitions it; sim systems gate on it; sim time accrues only in `playing`. `src/systems/UiBridge.ts` — builds `UiSnapshot = { hp,maxHp,gold,xp,xpNeed,level,wave,waveState,enemiesAlive,timeAlive,state,canAffordBeacon }` once per frame (plain data). `src/ui/Hud.ts` + `src/ui/theme.css` — DOM overlay; brief §4.1 tokens as CSS custom props (`--at-sand-100` etc.); parchment panels, wood/brass framing feel; serif placeholder stack (Wellfleet/Rye arrive via asset batch; slots `ui.font.display`, `ui.font.body`); tabular numerals (zero layout shift). Layout: vitals top-left (HP rust), gold top-right (ochre, with a tiny coin-tick animation on change — charm pillar), XP bar bottom (teal), wave banner slot top-center, pause hint. `UiIntent = { type: 'restart'|'toggle_build'|'pause' }` via callback. `P` pauses. Voice per brief §5, allowed to wink ("Stake your claim.").

**Playable checkpoint:** HUD frames the game with live-but-boring values (HP 100/100, gold 0); pause freezes the sim.

**Verification:** GATE-STD; screenshot-critique vs §4.1/§4.3 ("frontier ledger, not SaaS dashboard; one composition; readable over terrain"); HUD covers no central gameplay area at 1280×800 and 390×844; interaction e2e: `P` toggles `state` in diagnostics; zero layout shift when numbers change.

**Deps:** 01 only (DOM overlay + Game.ts registration lines listed here: state field, UiBridge sync call). Parallel with 02/03.

**Firewalls:** `ui/` never imports three.js and never reads game objects — UiSnapshot only. No game rules. No upgrade/death overlays yet (M1). No pixel fonts.

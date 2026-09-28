/** Read the actual profile tile store; never seed or mutate the wreck. */
import type { Page } from '@playwright/test';
import { tileStateKey } from '../../../../src/game/ProfileStorage';
export async function readWreck(page: Page) {
  return page.evaluate(key => {
    const raw = localStorage.getItem(key);
    const store = raw ? JSON.parse(raw) : null;
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    const claim = d?.deepwaterClaim as (NonNullable<ThreeGameDiagnostics['deepwaterClaim']> & {
      dredgeQueenBoss: import('../../../../src/systems/DredgeQueenBossSystem').DredgeQueenBossDiagnostics;
    }) | null;
    return { url: location.href, at: new Date().toISOString(), sim: d?.timeAlive, wave: d?.wave,
      key, raw, wreck: store?.entries?.find((entry: {id: string;kind: string}) => entry.id === 'dredge-queen-wreck' && entry.kind === 'render') ?? null,
      boss: claim?.dredgeQueenBoss ?? null };
  }, tileStateKey('robin', 'e5-deepwater-claim'));
}

// s1192 DRAIN-SIDE GUARD (added by the drain, not by the runner; one revert removes it).
//
// PURPOSE: refute s1191's claim that the m3-05d predicate
//   (A) `paidRunId === runId && lastPayout`      <- SHIPPED
//   (B) `reason !== 'death' && lastPayout`       <- the recommended proxy
// are "indistinguishable by any test the current three-value RunEndReason permits".
//
// They are distinguishable, with no new RunEndReason and no fake test, because
// applySuspendRunState assigns stayedForRushRunId (RunManager.ts:160) and
// lastPayout (:166) from state.rush / state.payout INDEPENDENTLY of state.secured,
// while paidRunId (:161) comes from state.secured alone. So the suspend shape
// {secured:false, rush:true, payout:{...}} is representable and yields:
//   reason='rush' (RunManager.ts:92), lastPayout!=null, paidRunId=0 != runId
// => (A) correctly withholds metaEarned; (B) leaks a payout that was never banked.
//
// MEASURED s1192: shipped (A) -> PASS; mutate the subject to (B) -> FAIL at the
// metaEarned assertion. The slice's own 14-test suite is 14/14 GREEN under BOTH,
// which is why this case is needed. See reviews/m3-05d.md, finding F-1192-1.
//
// Run: npx playwright test e2e/m3-05d-unpaid-rush-guard.spec.ts --workers=1
import { expect, test } from '@playwright/test';
import { EventBus } from '../src/core/EventBus';
import { Economy } from '../src/game/Economy';
import { RUN_HISTORY_KEY } from '../src/game/ProfileStorage';
import { install } from '../src/game/RunManager';
import { readRunHistory } from '../src/ui/RunLedger';

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
  };
}

test('an unpaid rush must not report meta it never banked', () => {
  const storage = memoryStorage();
  const events = new EventBus();
  const economy = new Economy(16);
  const manager = install(
    {
      events,
      economy,
      activeContract: { id: 'e1-dry-gulch', name: 'Dry Gulch' },
      waveSystem: { diagnostics: { wave: 22 } },
    } as never,
    { storage } as never,
  );

  // The discriminating shape: the run claims a rush and carries a payout blob,
  // but was never secured -> never paid.
  manager.restoreSuspend({
    secured: false,
    rush: true,
    securedAtWave: 0,
    resultAt: null,
    meta: manager.metaProgress,
    payout: { territory: 2, science: 3, hero: 4, agent: 5 },
  } as never);

  events.emit({
    type: 'hero_died',
    at: 155,
    timeAlive: 155,
    kills: 0,
    goldPanned: 0,
    spent: 0,
    beaconsBuilt: 0,
    wavesSurvived: 22,
    weaponToggles: 0,
    blastTime: 0,
  } as never);

  const entry = readRunHistory(storage as never)[0];
  // eslint-disable-next-line no-console
  console.log('[s1192] outcome=', entry?.outcome, ' metaEarned=', JSON.stringify(entry?.metaEarned));
  expect(entry?.outcome).toBe('rush');
  // (A) passes this; (B) fails it by emitting the unbanked payout.
  expect(entry?.metaEarned).toBeUndefined();
  expect(String(storage.getItem(RUN_HISTORY_KEY))).not.toContain('territory');
});

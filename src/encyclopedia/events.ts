import { ledgerEntryIdForDiscoveryId, type LedgerDiscoveryId, type LedgerEntryId } from './registry';

type LedgerOpenHandler = (entryId?: LedgerEntryId) => void;

let handler: LedgerOpenHandler | null = null;
let beatClickInstalled = false;

export function installClaimLedgerRequestHandler(next: LedgerOpenHandler): () => void {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

export function requestOpenClaimLedger(entryId?: LedgerEntryId): void {
  if (handler) {
    handler(entryId);
    return;
  }
  void import('./reader').then(({ openClaimLedger }) => openClaimLedger({ entryId }));
}

export function installLedgerBeatClick(): void {
  if (beatClickInstalled || typeof document === 'undefined') return;
  beatClickInstalled = true;
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>('[data-beat-id^="ledger-page:"]');
      const discoveryId = card?.dataset.beatId?.slice('ledger-page:'.length) as LedgerDiscoveryId | undefined;
      const entryId = discoveryId ? ledgerEntryIdForDiscoveryId(discoveryId) : undefined;
      if (entryId) requestOpenClaimLedger(entryId);
    },
    { capture: true },
  );
}

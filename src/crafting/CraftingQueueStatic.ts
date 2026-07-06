import {
  normalizeQueueProfile,
  parseApprovedQueueEntry,
  parseRejectedQueueEntry,
  sanitizePendingQueueRequest,
} from './CraftingQueueContract';
import { snapshotFromQueueEntries, type CraftingQueueSnapshot } from './CraftingQueue';

const approvedFiles = import.meta.glob('../../assets/crafting-queue/approved/*.json', {
  eager: true,
  import: 'default',
});
const rejectedFiles = import.meta.glob('../../assets/crafting-queue/rejected/*.json', {
  eager: true,
  import: 'default',
});
const pendingFiles = import.meta.glob('../../assets/crafting-queue/pending/*.json', {
  eager: true,
  import: 'default',
});

export function loadStaticCraftingQueue(profile: string): CraftingQueueSnapshot {
  return snapshotFromQueueEntries(
    parseMany(Object.values(pendingFiles), sanitizePendingQueueRequest),
    parseMany(Object.values(approvedFiles), parseApprovedQueueEntry),
    parseMany(Object.values(rejectedFiles), parseRejectedQueueEntry),
    normalizeQueueProfile(profile),
  );
}

function parseMany<T>(values: unknown[], parse: (value: unknown) => T | null): T[] {
  return values.map(parse).filter((entry): entry is T => Boolean(entry));
}

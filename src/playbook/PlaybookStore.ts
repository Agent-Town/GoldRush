import { parsePlaybookText, playbookHash, type PlaybookRecording } from './PlaybookFormat';

// Profile-scoped playbook shelf (PB-01 law: profile-scoped store). The key is
// registered in ProfileStorage's PROFILE_DATA_KEYS, so the Storage prototype
// scope patch namespaces it per profile transparently — this module reads and
// writes the logical key only.
export const PLAYBOOKS_KEY = 'gr.playbooks.v1';

type PlaybookShelf = {
  version: 1;
  playbooks: Record<string, string>;
};

export type PlaybookStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type PlaybookShelfEntry = {
  name: string;
  hash: string;
  durationTicks: number;
  entries: number;
  truncated: PlaybookRecording['truncated'];
};

export type PlaybookSaveResult = { ok: true; name: string } | { ok: false; reason: string };

function loadShelf(storage: PlaybookStorage): PlaybookShelf {
  try {
    const raw = storage.getItem(PLAYBOOKS_KEY);
    if (!raw) return { version: 1, playbooks: {} };
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as PlaybookShelf).version !== 1 ||
      typeof (parsed as PlaybookShelf).playbooks !== 'object' ||
      (parsed as PlaybookShelf).playbooks === null
    ) {
      return { version: 1, playbooks: {} };
    }
    return parsed as PlaybookShelf;
  } catch {
    return { version: 1, playbooks: {} };
  }
}

function persistShelf(storage: PlaybookStorage, shelf: PlaybookShelf): boolean {
  try {
    const ordered: PlaybookShelf = { version: 1, playbooks: {} };
    for (const name of Object.keys(shelf.playbooks).sort()) ordered.playbooks[name] = shelf.playbooks[name];
    storage.setItem(PLAYBOOKS_KEY, JSON.stringify(ordered));
    return true;
  } catch {
    return false;
  }
}

export function savePlaybookText(storage: PlaybookStorage, name: string, text: string): PlaybookSaveResult {
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, reason: 'empty-name' };
  const parsed = parsePlaybookText(text);
  if (!parsed.ok) return { ok: false, reason: parsed.reason };
  const shelf = loadShelf(storage);
  shelf.playbooks = { ...shelf.playbooks, [cleanName]: text };
  if (!persistShelf(storage, shelf)) return { ok: false, reason: 'storage-write-failed' };
  return { ok: true, name: cleanName };
}

export function getPlaybookText(storage: PlaybookStorage, name: string): string | null {
  return loadShelf(storage).playbooks[name.trim()] ?? null;
}

export function listPlaybooks(storage: PlaybookStorage): PlaybookShelfEntry[] {
  const shelf = loadShelf(storage);
  const listed: PlaybookShelfEntry[] = [];
  for (const name of Object.keys(shelf.playbooks).sort()) {
    const parsed = parsePlaybookText(shelf.playbooks[name]);
    if (!parsed.ok) continue;
    listed.push({
      name,
      hash: playbookHash(parsed.playbook),
      durationTicks: parsed.playbook.durationTicks,
      entries: parsed.playbook.entries.length,
      truncated: parsed.playbook.truncated,
    });
  }
  return listed;
}

export function removePlaybook(storage: PlaybookStorage, name: string): boolean {
  const shelf = loadShelf(storage);
  const cleanName = name.trim();
  if (!(cleanName in shelf.playbooks)) return false;
  const next = { ...shelf.playbooks };
  delete next[cleanName];
  shelf.playbooks = next;
  return persistShelf(storage, shelf);
}

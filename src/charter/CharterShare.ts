import type { ContractDescriptorReason } from '../meta/ContractFamilies';
import { charterJson, parseCharter, type Charter, type CharterClock } from './CharterSchema';
import { stampCharter } from './CharterStamp';

export const CHARTER_FILE_SUFFIX = '.charter.json';
export const CHARTER_SHARE_MAX_CHARS = 262_144;

export type CharterShareResult =
  | { ok: true; charter: Charter; text: string }
  | { ok: false; reasons: ContractDescriptorReason[] };

export function exportCharterText(charter: Charter): CharterShareResult {
  const stamped = stampCharter(charter);
  if (!stamped.ok) return stamped;
  const shared = { envelope: structuredClone(charter.envelope), contract: stamped.contract };
  return { ok: true, charter: shared, text: charterJson(shared) };
}

export function importCharterText(text: string): CharterShareResult {
  if (text.length > CHARTER_SHARE_MAX_CHARS) return refused('charter_too_large', 'This charter is too large for the Press to read.');
  const parsed = parseCharter(text);
  if (!parsed.ok) return parsed;
  return exportCharterText(parsed.charter);
}

export function charterCode(charter: Charter): CharterShareResult & { code?: string } {
  const shared = exportCharterText(charter);
  if (!shared.ok) return shared;
  const bytes = new TextEncoder().encode(shared.text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { ...shared, code: btoa(binary) };
}

export function importCharterCode(code: string): CharterShareResult {
  const compact = code.trim();
  if (compact.length > Math.ceil(CHARTER_SHARE_MAX_CHARS * 4 / 3) + 4) {
    return refused('charter_code_too_large', 'This charter code is too large for the Press to read.');
  }
  try {
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return importCharterText(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return refused('charter_code_unreadable', 'The charter code is damaged or incomplete.');
  }
}

export function repressCharter(charter: Charter, author: string, clock: CharterClock): Charter {
  const next = structuredClone(charter);
  next.envelope.provenance = {
    ...next.envelope.provenance,
    lineage: [...next.envelope.provenance.lineage, `${author} · ${clock()}`],
  };
  return next;
}

export function charterFileName(charter: Charter): string {
  return `${charter.contract.id}${CHARTER_FILE_SUFFIX}`;
}

function refused(code: string, message: string): CharterShareResult {
  return { ok: false, reasons: [{ code, message }] };
}

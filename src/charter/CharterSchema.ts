import {
  contractDescriptorJson,
  listBoardContracts,
  parseContractDescriptor,
  type ContractDescriptorReason,
  type ContractManifest,
} from '../meta/ContractFamilies';

// CHARTERS ARE CONTRACTS (charter-press law 1): the envelope wraps the shipped
// contract schema verbatim; compile strips the envelope and nothing else. No
// editor format may ever exist.
export const CHARTER_VERSION = 1;
export const CHARTER_PALETTE_V1 = 'epoch-1-frontier';
export const CHARTER_AUTHOR_MAX_CHARS = 96;
export const CHARTER_LINEAGE_MAX_STEPS = 24;

export type CharterSeedPolicy = { mode: 'inherit' } | { mode: 'fixed'; seed: string };
export type CharterRunPolicy = { waves: 'none' };
export type CharterProvenance = {
  author: string;
  createdAt: string;
  lineage: readonly string[];
  note?: string;
};
export type CharterEnvelope = {
  version: typeof CHARTER_VERSION;
  provenance: CharterProvenance;
  seedPolicy: CharterSeedPolicy;
  paletteId: string;
  runPolicy?: CharterRunPolicy;
};
export type Charter = {
  envelope: CharterEnvelope;
  contract: ContractManifest;
};

// createdAt always comes through an injected clock so nothing sim-adjacent
// ever reaches for Date.now() (determinism law; see the E7 audit boundary).
export type CharterClock = () => string;

export type CharterParseResult =
  | { ok: true; charter: Charter }
  | { ok: false; reasons: ContractDescriptorReason[] };

export function importContract(
  contract: ContractManifest,
  options: { author: string; clock: CharterClock; lineage?: readonly string[] },
): Charter {
  return {
    envelope: {
      version: CHARTER_VERSION,
      provenance: {
        author: options.author,
        createdAt: options.clock(),
        lineage: [...(options.lineage ?? []), contract.id],
      },
      seedPolicy: { mode: 'inherit' },
      paletteId: CHARTER_PALETTE_V1,
    },
    contract: structuredClone(contract),
  };
}

export function compileCharter(charter: Charter): ContractManifest {
  return structuredClone(charter.contract);
}

export function compiledCharterJson(charter: Charter): string {
  return contractDescriptorJson(compileCharter(charter));
}

export function charterJson(charter: Charter): string {
  return `${JSON.stringify({ envelope: charter.envelope, contract: charter.contract }, null, 2)}\n`;
}

export function charterLineageRootId(charter: Charter): string {
  return charter.envelope.provenance.lineage[0] ?? '';
}

export function charterTemplate(charter: Charter): ContractManifest | null {
  const rootId = charterLineageRootId(charter);
  return listBoardContracts().find((entry) => entry.id === rootId) ?? null;
}

export function parseCharter(text: string): CharterParseResult {
  let candidate: unknown;
  try {
    candidate = JSON.parse(text);
  } catch {
    return failure([envelopeReason('charter_unreadable', 'The marks on this charter could not be read.')]);
  }
  if (!isRecord(candidate) || Array.isArray(candidate)) {
    return failure([envelopeReason('charter_shape', 'A charter must be one complete pressed record.')]);
  }
  const keys = Object.keys(candidate);
  if (keys.length !== 2 || !Object.hasOwn(candidate, 'envelope') || !Object.hasOwn(candidate, 'contract')) {
    return failure([envelopeReason('charter_shape', 'A charter carries exactly one envelope and one contract.')]);
  }
  const reasons = validateCharterEnvelope(candidate.envelope);
  if (reasons.length > 0) return failure(reasons);
  const envelope = candidate.envelope as CharterEnvelope;
  const template = listBoardContracts().find((entry) => entry.id === envelope.provenance.lineage[0]) ?? null;
  if (!template) {
    return failure([
      envelopeReason('charter_lineage_unknown', 'This charter descends from no contract the board has ever shipped.'),
    ]);
  }
  const parsed = parseContractDescriptor(`${JSON.stringify(candidate.contract, null, 2)}\n`, template);
  if (!parsed.ok) return { ok: false, reasons: parsed.reasons };
  return { ok: true, charter: { envelope: structuredClone(envelope), contract: parsed.contract } };
}

export function validateCharterEnvelope(value: unknown): ContractDescriptorReason[] {
  const reasons: ContractDescriptorReason[] = [];
  if (!isRecord(value) || Array.isArray(value)) {
    return [envelopeReason('envelope_shape', 'The charter envelope has the wrong shape.', 'envelope')];
  }
  const keys = ['version', 'provenance', 'seedPolicy', 'paletteId'];
  if (
    keys.some((key) => !Object.hasOwn(value, key)) ||
    Object.keys(value).some((key) => ![...keys, 'runPolicy'].includes(key))
  ) {
    return [envelopeReason('envelope_shape', 'The charter envelope carries version, provenance, seed policy, palette, and at most one run policy.', 'envelope')];
  }
  if (value.version !== CHARTER_VERSION) {
    reasons.push(envelopeReason('envelope_version', 'This press only understands version-one charters.', 'envelope.version'));
  }
  const provenance = value.provenance;
  if (!isRecord(provenance) || Array.isArray(provenance)) {
    reasons.push(envelopeReason('envelope_provenance', 'The provenance block has the wrong shape.', 'envelope.provenance'));
  } else {
    const provenanceKeys = Object.keys(provenance);
    if (
      ['author', 'createdAt', 'lineage'].some((key) => !Object.hasOwn(provenance, key)) ||
      provenanceKeys.some((key) => !['author', 'createdAt', 'lineage', 'note'].includes(key))
    ) {
      reasons.push(envelopeReason('envelope_provenance', 'Provenance carries an author, a date, a lineage, and at most one note.', 'envelope.provenance'));
    }
    if (typeof provenance.author !== 'string' || provenance.author.trim().length === 0 || provenance.author.length > CHARTER_AUTHOR_MAX_CHARS) {
      reasons.push(envelopeReason('envelope_author', 'Every charter needs a named author.', 'envelope.provenance.author'));
    }
    if (typeof provenance.createdAt !== 'string' || !Number.isFinite(Date.parse(provenance.createdAt))) {
      reasons.push(envelopeReason('envelope_created', 'Every charter needs the date it was pressed.', 'envelope.provenance.createdAt'));
    }
    if (
      !Array.isArray(provenance.lineage) ||
      provenance.lineage.length === 0 ||
      provenance.lineage.length > CHARTER_LINEAGE_MAX_STEPS ||
      provenance.lineage.some((entry) => typeof entry !== 'string' || entry.trim().length === 0)
    ) {
      reasons.push(envelopeReason('envelope_lineage', 'Every charter names the line of contracts it descends from.', 'envelope.provenance.lineage'));
    }
    if (Object.hasOwn(provenance, 'note') && (typeof provenance.note !== 'string' || provenance.note.trim().length === 0 || provenance.note.length > 1_024)) {
      reasons.push(envelopeReason('envelope_note', 'A provenance note must be a short, legible line.', 'envelope.provenance.note'));
    }
  }
  const seedPolicy = value.seedPolicy;
  if (
    !isRecord(seedPolicy) ||
    Array.isArray(seedPolicy) ||
    !(
      (seedPolicy.mode === 'inherit' && Object.keys(seedPolicy).length === 1) ||
      (seedPolicy.mode === 'fixed' &&
        Object.keys(seedPolicy).length === 2 &&
        typeof seedPolicy.seed === 'string' &&
        seedPolicy.seed.trim().length > 0 &&
        seedPolicy.seed.length <= CHARTER_AUTHOR_MAX_CHARS)
    )
  ) {
    reasons.push(envelopeReason('envelope_seed', 'A charter either inherits its seed or fixes one by name.', 'envelope.seedPolicy'));
  }
  if (typeof value.paletteId !== 'string' || value.paletteId.trim().length === 0) {
    reasons.push(envelopeReason('envelope_palette', 'Every charter names its palette.', 'envelope.paletteId'));
  }
  if (
    value.runPolicy !== undefined &&
    (!isRecord(value.runPolicy) || Object.keys(value.runPolicy).length !== 1 || value.runPolicy.waves !== 'none')
  ) {
    reasons.push(envelopeReason('envelope_run_policy', 'A quiet charter may only close its incoming trails.', 'envelope.runPolicy'));
  }
  return reasons;
}

function envelopeReason(code: string, message: string, path?: string): ContractDescriptorReason {
  return path === undefined ? { code, message } : { code, message, path };
}

function failure(reasons: ContractDescriptorReason[]): CharterParseResult {
  return { ok: false, reasons };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

import {
  contractDescriptorJson,
  parseContractDescriptor,
  type ContractDescriptorReason,
  type ContractManifest,
} from '../meta/ContractFamilies';
import {
  CHARTER_PALETTE_V1,
  charterTemplate,
  validateCharterEnvelope,
  type Charter,
} from './CharterSchema';

export type CharterStampResult =
  | { ok: true; contract: ContractManifest; document: string }
  | { ok: false; reasons: ContractDescriptorReason[] };

// THE VALIDATOR IS THE GATE (charter-press law 2): nothing stamps unless the
// same descriptor gate the loader trusts accepts it — shape and enum masks,
// spawn edges, briefing objectives, claim bounds, and number budgets. The
// envelope preflight runs first so a torn envelope never reaches the gate.
export function stampCharter(charter: Charter): CharterStampResult {
  const reasons = validateCharterEnvelope(charter.envelope);
  if (reasons.length === 0 && charter.envelope.paletteId !== CHARTER_PALETTE_V1) {
    reasons.push({
      code: 'palette_unopened',
      message: 'This press speaks only the frontier palette for now.',
      path: 'envelope.paletteId',
    });
  }
  const template = reasons.length === 0 ? charterTemplate(charter) : null;
  if (reasons.length === 0 && !template) {
    reasons.push({
      code: 'charter_lineage_unknown',
      message: 'This charter descends from no contract the board has ever shipped.',
      path: 'envelope.provenance.lineage',
    });
  }
  if (reasons.length > 0 || !template) return { ok: false, reasons };
  const parsed = parseContractDescriptor(contractDescriptorJson(charter.contract), template);
  if (!parsed.ok) return { ok: false, reasons: parsed.reasons };
  return { ok: true, contract: parsed.contract, document: contractDescriptorJson(parsed.contract) };
}

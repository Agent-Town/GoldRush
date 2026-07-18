import theRiverAsset from '../../assets/charters/the-river.json' with { type: 'json' };
import { parseCharter, type Charter } from './CharterSchema';

const parsed = parseCharter(JSON.stringify(theRiverAsset));
if (!parsed.ok) throw new Error(`THE RIVER charter is invalid: ${parsed.reasons.map((reason) => reason.message).join(' ')}`);

export const THE_RIVER_CHARTER: Charter = parsed.charter;

// Staged only: the E10 story push owns when this hook is called.
export function getPostCreditsCharter(): Charter {
  return structuredClone(THE_RIVER_CHARTER);
}

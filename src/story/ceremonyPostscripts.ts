import dispatchSource from '../../lore/world-dispatches.md?raw';
import { CEREMONY_SCRIPTS } from '../ceremony/scripts';
import { activeEpochId, epochIsActive, listEpochs } from '../meta/ContractFamilies';
import type { RuntimeStoryBeat } from './beats';

export type CeremonyPostscript = {
  id: string;
  era: number;
  line: string;
  milestone:
    | { type: 'epoch-activated'; epochId: string; afterCeremony: boolean }
    | { type: 'science-complete'; epochId: string; afterPress: true };
};

const epochs = listEpochs();
const frameworkCeremonies = new Set(CEREMONY_SCRIPTS.map((script) => script.epochId));
const rows = [...dispatchSource.matchAll(/^### Ceremony postscript — T(\d+),[^\n]*\n\*([^\n]+)\*$/gm)];

export const CEREMONY_POSTSCRIPTS: readonly CeremonyPostscript[] = rows.map((match) => {
  const era = Number(match[1]);
  const closingEpoch = epochs[era - 1];
  const reachedEpoch = epochs[Math.min(era, epochs.length - 1)];
  if (!closingEpoch || !reachedEpoch) throw new Error(`No epoch registered for WD-04 T${era}.`);
  return {
    id: `wd04-postscript-t${era}`,
    era,
    line: match[2]!,
    milestone:
      era === epochs.length
        ? { type: 'science-complete', epochId: closingEpoch.id, afterPress: true }
        : { type: 'epoch-activated', epochId: reachedEpoch.id, afterCeremony: frameworkCeremonies.has(closingEpoch.id) },
  };
});

if (CEREMONY_POSTSCRIPTS.length !== epochs.length) {
  throw new Error(`Expected ${epochs.length} ceremony postscripts, found ${CEREMONY_POSTSCRIPTS.length}.`);
}

export const CEREMONY_POSTSCRIPT_BEATS: readonly RuntimeStoryBeat[] = CEREMONY_POSTSCRIPTS.map((postscript) => ({
  id: postscript.id,
  trigger: postscript.milestone.type,
  speaker: 'clerk',
  oncePerProfile: true,
  presentation: 'epoch-ceremony',
  durationMs: Math.max(12_000, postscript.line.trim().split(/\s+/).length * 400),
  when: (signal) =>
    postscript.milestone.type === 'epoch-activated'
      ? signal.type === 'epoch-activated' &&
        signal.epochId === postscript.milestone.epochId &&
        Boolean(signal.postscriptOnly) === postscript.milestone.afterCeremony &&
        epochIsActive(postscript.milestone.epochId)
      : signal.type === 'science-complete' && signal.postscriptOnly === true && activeEpochId() === postscript.milestone.epochId,
  lines: [postscript.line],
}));

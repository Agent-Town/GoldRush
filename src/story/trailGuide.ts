import { activeProfile, markHintSeen, type ProfileStorage } from '../game/ProfileStorage';

export type TrailGuideTrigger =
  | 'first-run'
  | 'first-nugget'
  | 'first-gold'
  | 'first-wave'
  | 'first-hurt'
  | 'first-level'
  | 'first-secured'
  | 'first-return';

export type TrailGuideBark = { id: string; trigger: TrailGuideTrigger; line: string };

export const TRAIL_GUIDE_BARKS: readonly TrailGuideBark[] = [
  { id: 'trail-guide-first-run', trigger: 'first-run', line: 'Take the claim at your own pace. Move with the trail; stand by a river glint and your pan will find the seam.' },
  { id: 'trail-guide-first-nugget', trigger: 'first-nugget', line: 'There is your first color. Raise a sluice beside water and it will keep washing while your boots are elsewhere.' },
  { id: 'trail-guide-first-gold', trigger: 'first-gold', line: 'Gold in the pouch can raise the claim. Open Build and set timber where it will do honest work.' },
  { id: 'trail-guide-first-wave', trigger: 'first-wave', line: 'That horn marks their road in. Walls turn the rush; a turret watches the gap you leave.' },
  { id: 'trail-guide-first-hurt', trigger: 'first-hurt', line: 'You took a hard knock. Catch your breath when you need it; the claim will hold still.' },
  { id: 'trail-guide-first-level', trigger: 'first-level', line: 'The trail has taught you something. Pick the card that suits the claim you mean to keep.' },
  { id: 'trail-guide-first-secured', trigger: 'first-secured', line: 'The claim is secured; that win is banked. Ride home now, or stay for the Rush and wager the trail ahead.' },
  { id: 'trail-guide-first-return', trigger: 'first-return', line: 'Welcome back. The board keeps every open trail; choose the next card when your outfit is ready.' },
];

export function takeTrailGuideBark(trigger: TrailGuideTrigger, storage = browserStorage()): TrailGuideBark | undefined {
  if (!storage) return undefined;
  try {
    const profile = activeProfile(storage);
    const bark = TRAIL_GUIDE_BARKS.find((entry) => entry.trigger === trigger);
    if (!bark || profile.trailGuide !== true || profile.hintsSeen.includes(seenKey(bark.id))) return undefined;
    markHintSeen(storage, seenKey(bark.id));
    return bark;
  } catch {
    return undefined;
  }
}

function seenKey(id: string): string {
  return `story:${id}`;
}

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

import { activeProfile, markHintSeen, type ProfileStorage } from '../game/ProfileStorage';

const STORY_HINT_PREFIX = 'story:';

export function hasStoryBeatSeen(beatKey: string, storage = browserStorage()): boolean {
  if (!storage) return false;
  try {
    return activeProfile(storage).hintsSeen.includes(storyHintKey(beatKey));
  } catch {
    return false;
  }
}

export function markStoryBeatSeen(beatKey: string, storage = browserStorage()): boolean {
  if (!storage) return false;
  return markHintSeen(storage, storyHintKey(beatKey));
}

function storyHintKey(beatKey: string): string {
  return `${STORY_HINT_PREFIX}${beatKey}`;
}

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

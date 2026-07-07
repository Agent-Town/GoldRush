export type StorySpeakerId = 'elder' | 'tavernkeeper' | 'clerk' | 'prospector';

export type StorySpeaker = {
  id: StorySpeakerId;
  name: string;
  portraitUrl: string;
  objectPosition: string;
};

const elderPortraitUrl = new URL('../../assets/processed/townsfolk-elder.png', import.meta.url).href;
const tavernkeeperPortraitUrl = new URL('../../assets/processed/townsfolk-tavernkeeper.png', import.meta.url).href;
const clerkPortraitUrl = new URL('../../assets/processed/townsfolk-assay-clerk.png', import.meta.url).href;
const prospectorPortraitUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;

export const STORY_SPEAKERS: Record<StorySpeakerId, StorySpeaker> = {
  elder: {
    id: 'elder',
    name: 'Elder',
    portraitUrl: elderPortraitUrl,
    objectPosition: '50% 44%',
  },
  tavernkeeper: {
    id: 'tavernkeeper',
    name: 'Tavernkeeper',
    portraitUrl: tavernkeeperPortraitUrl,
    objectPosition: '52% 42%',
  },
  clerk: {
    id: 'clerk',
    name: 'Assay Clerk',
    portraitUrl: clerkPortraitUrl,
    objectPosition: '50% 43%',
  },
  prospector: {
    id: 'prospector',
    name: 'Prospector',
    portraitUrl: prospectorPortraitUrl,
    objectPosition: '50% 44%',
  },
};

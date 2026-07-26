export const GAME_API_ORIGIN = 'https://gold-rush-3in.pages.dev';

export function gameApiUrl(path: `/api/${string}`): string {
  return `${GAME_API_ORIGIN}${path}`;
}

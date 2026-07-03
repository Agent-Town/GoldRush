export const palette = {
  sand: '#f5e6c8',
  sandDeep: '#e8d5a8',
  ochre: '#c4883a',
  rust: '#a0522d',
  teal: '#5b8a8a',
  wood: '#6b4a2f',
  sun: '#ffe4a0',
  sky: '#c2e6ff',
} as const;

export type PaletteColor = keyof typeof palette;

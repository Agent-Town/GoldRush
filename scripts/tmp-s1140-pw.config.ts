// s1140 scratch gate config — external dev server on 5251.
// 5188 belongs to the lane runners (Mistake #12: never gate on their port).
// 5243 was s1139's; a fresh port keeps concurrent fires from colliding.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import base from '../playwright.config';

const here = path.dirname(fileURLToPath(import.meta.url));

export default {
  ...base,
  testDir: path.resolve(here, '../e2e'),
  use: { ...base.use, baseURL: 'http://127.0.0.1:5251' },
  webServer: undefined,
};

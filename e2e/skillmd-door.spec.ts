import { expect, test } from '@playwright/test';

test('served skill.md exposes the source-locked grammar and replace warning', async ({ request }) => {
  const response = await request.get('./skill.md');
  expect(response.status()).toBe(200);
  const skill = await response.text();
  expect(skill).toContain('## THE GRAMMAR');
  expect(skill).toContain('REPLACES THE ENTIRE ORDER SET');
});

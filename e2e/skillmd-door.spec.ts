import { expect, test } from '@playwright/test';

test('served skill.md exposes the source-locked grammar and replace warning', async ({ request }) => {
  const response = await request.get('./skill.md');
  expect(response.status()).toBe(200);
  const skill = await response.text();
  expect(skill).toContain('## THE GRAMMAR');
  expect(skill).toContain('REPLACES THE ENTIRE ORDER SET');
  expect(skill).toContain("Importing the county's open sim as a world model is lawful. Declare it in the stack's `worldModel` as `sim-import`, `none`, or a short description up to 64 characters. These honesty laws cover that declaration. It is information only and never changes ranking.");
});

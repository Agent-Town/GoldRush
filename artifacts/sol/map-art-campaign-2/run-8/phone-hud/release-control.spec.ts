import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import './release-import';

// Reuse the owning test unchanged; remove only this task's compiled media query.
test.beforeEach(async ({ page }, info) => {
  await page.route('**/*.css', async route => {
    const response = await route.fetch();
    const original = await response.text();
    const start = original.indexOf('@media (width>=390px) and (width<=430px) and (height>=701px)');
    if (start < 0) return route.fulfill({ response });
    let end = original.indexOf('{', start), depth = 1;
    for (end++; depth && end < original.length; end++) {
      if (original[end] === '{') depth++;
      if (original[end] === '}') depth--;
    }
    expect(depth).toBe(0);
    const removed = original.slice(start, end);
    expect(removed).toContain('96px 44px');
    const body = original.slice(0, start) + original.slice(end);
    writeFileSync(`${import.meta.dirname}/release-control-${info.project.name}.json`, JSON.stringify({
      url: route.request().url(), removedBytes: Buffer.byteLength(removed),
      originalSha256: createHash('sha256').update(original).digest('hex'),
      controlSha256: createHash('sha256').update(body).digest('hex'),
      method: 'Same final E1 build and unchanged owning assertions; only the compiled cure media query removed from the served CSS.',
    }, null, 2) + '\n');
    await route.fulfill({ response, body });
  });
});

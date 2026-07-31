import { expect, type Page } from '@playwright/test';

export interface ErrorWatch {
  errors: string[];
  suppressed: string[];
}

export function watchErrors(page: Page): ErrorWatch {
  const errors: string[] = [];
  const suppressed: string[] = [];
  const record = (text: string) => {
    // F-1304-1 / F-1180-2: tolerate only this measured load-sensitive texture-blob transient.
    if (text.startsWith("THREE.GLTFLoader: Couldn't load texture blob:")) suppressed.push(text);
    else errors.push(text);
  };
  page.on('console', (message) => {
    if (message.type() === 'error') record(message.text());
  });
  page.on('pageerror', (error) => record(error.message));
  return { errors, suppressed };
}

export function expectNoConsoleErrors(watch: ErrorWatch, label?: string): void {
  console.log(`${label ? `${label} ` : ''}watchErrors suppressed ${watch.suppressed.length} known GLTFLoader blob error(s)`);
  expect(watch.errors).toEqual([]);
}

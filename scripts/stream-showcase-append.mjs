#!/usr/bin/env node
import { appendShowcase } from './stream-showcase-queue.mjs';

const [slice, hash, spec] = process.argv.slice(2);
try {
  const appended = await appendShowcase({ slice, hash, spec });
  console.log(appended ? `queued ${hash}` : `already queued ${hash}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

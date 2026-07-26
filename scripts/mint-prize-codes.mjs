#!/usr/bin/env node

import { randomBytes } from 'node:crypto';

const token = process.env.BUG_OFFICE_TOKEN;
if (!token) throw new Error('Set BUG_OFFICE_TOKEN before minting prize codes.');

const origin = process.argv[2] ?? process.env.BUG_OFFICE_URL ?? 'https://gold-rush-3in.pages.dev';
const count = Number(process.argv[3] ?? 3);
if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error('Code count must be an integer from 1 to 20.');

const codes = Array.from({ length: count }, () => `GR-${randomBytes(12).toString('hex').toUpperCase().match(/.{6}/g).join('-')}`);
const response = await fetch(new URL('/api/redeem', origin), {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ codes }),
});
if (!response.ok) throw new Error(`Prize office returned ${response.status}.`);

console.log(codes.join('\n'));

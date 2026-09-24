// SEC-9 (outside review 2026-09-24): four doors compare an operator secret against something a
// caller supplied. Two of them used `===` / `!==`, which returns at the first differing byte and so
// answers faster the longer a wrong prefix matches: a timing oracle that can be walked one byte at a
// time. The constant-time compare already existed in `standings.ts`; it lives here now so every door
// imports the same one instead of keeping a private copy that can drift, and so a new door has an
// obvious thing to import.
//
// Known and unchanged from the original: the LENGTH of the secret still leaks (the loop runs over the
// longer of the two). That is deliberate here - it matches what `standings.ts` shipped, and a secret's
// length is not the secret. Nothing else about either string is observable from the timing.
export function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return mismatch === 0;
}

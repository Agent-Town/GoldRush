#!/usr/bin/env node
// s1393: compare merged-tree reds vs clean-main control reds by PROJECT + TEST TITLE
// (line numbers shift because the slice adds lines, so they cannot be the key).
const MERGED = `
desktop-chrome|e2e/072-era-activation.spec.ts|fresh E1 profile stays unchanged and the pre-flip determinism hash is identical
desktop-chrome|e2e/agent-view.spec.ts|all five E1 mechanics manifests match their byte-stable fixture
desktop-chrome|e2e/e2-hill-mine.spec.ts|Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone
desktop-chrome|e2e/gt-05-water-depth.spec.ts|classic claim keeps deep water impassable while carrying equivalent depth data
desktop-chrome|e2e/tile-identity-pass.spec.ts|E1 contracts load place descriptors, render identity shots, and stay deterministic
mobile-chrome|e2e/agent-view.spec.ts|all five E1 mechanics manifests match their byte-stable fixture
mobile-chrome|e2e/e2-hill-mine.spec.ts|Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone
mobile-chrome|e2e/gt-05-water-depth.spec.ts|classic claim keeps deep water impassable while carrying equivalent depth data
mobile-chrome|e2e/tile-identity-pass.spec.ts|The Claim keeps the default tile params and seeded flat-claim fingerprint
mobile-chrome|e2e/tile-identity-pass.spec.ts|E1 contracts load place descriptors, render identity shots, and stay deterministic
`.trim().split('\n');

const CONTROL = `
desktop-chrome|e2e/072-era-activation.spec.ts|fresh E1 profile stays unchanged and the pre-flip determinism hash is identical
desktop-chrome|e2e/agent-view.spec.ts|all five E1 mechanics manifests match their byte-stable fixture
desktop-chrome|e2e/e2-hill-mine.spec.ts|Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone
desktop-chrome|e2e/tile-identity-pass.spec.ts|E1 contracts load place descriptors, render identity shots, and stay deterministic
mobile-chrome|e2e/agent-view.spec.ts|all five E1 mechanics manifests match their byte-stable fixture
mobile-chrome|e2e/e2-hill-mine.spec.ts|Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone
mobile-chrome|e2e/tile-identity-pass.spec.ts|E1 contracts load place descriptors, render identity shots, and stay deterministic
`.trim().split('\n');

const c = new Set(CONTROL);
const m = new Set(MERGED);
console.log(`merged reds: ${MERGED.length}   control reds: ${CONTROL.length}\n`);
console.log('🔴 CAUSED BY THE MERGE (red on merged tree, GREEN on clean main):');
const newReds = MERGED.filter(x => !c.has(x));
newReds.forEach(x => console.log('   ' + x.replace(/\|/g, '  ')));
console.log(`   => ${newReds.length} new red(s)\n`);
console.log('⚪ PRE-EXISTING (red on BOTH — not this slice\'s):');
MERGED.filter(x => c.has(x)).forEach(x => console.log('   ' + x.replace(/\|/g, '  ')));
console.log('\n🟢 FIXED BY THE MERGE (red on main, green on merged):');
const fixed = CONTROL.filter(x => !m.has(x));
console.log(fixed.length ? fixed.map(x => '   ' + x).join('\n') : '   (none)');

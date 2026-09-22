// harnessDigest per public/skill.md: lowercase hex SHA-256(UTF-8(JSON.stringify([charterText, notebookGenerationHeader, controllerVersion])))
// usage: node harness-digest.mjs <charter file> <notebook-header file> <controllerVersion>
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const [charterFile, headerFile, version] = process.argv.slice(2);
if (!version) throw new Error('usage: harness-digest.mjs <charter> <header> <version>');
const charter = readFileSync(charterFile, 'utf8');
const header = readFileSync(headerFile, 'utf8');
process.stdout.write(`${createHash('sha256').update(Buffer.from(JSON.stringify([charter, header, version]), 'utf8')).digest('hex')}\n`);

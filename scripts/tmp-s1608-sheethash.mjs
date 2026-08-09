// s1608 — pre-flight facts for the f1608-1 art master: hash + PNG dimensions of the two
// target sheets, so the master can pin the CURRENT state rather than "the shipped originals"
// (Steam Wrecker's sheet was already touched by the s1193 partial repair, f61843c07).
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

for (const f of [
  'assets/raw/char-coalthief-sheet-walkdiag4-a.png',
  'assets/raw/char-steamwrecker-sheet-walkdiag4-a.png',
  'assets/raw/char-railtough-sheet-walkdiag4-a.png',
]) {
  const buf = readFileSync(f)
  const sha = createHash('sha256').update(buf).digest('hex')
  // PNG IHDR: width/height are big-endian uint32 at byte 16 and 20
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  console.log(`${sha}  ${w}x${h}  ${f}`)
}

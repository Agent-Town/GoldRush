export function residueFor({ diff, mainText } = {}) {
  if (typeof diff !== 'string' || typeof mainText !== 'string') {
    return { status: 'UNDECIDABLE', added: [], missing: [] }
  }
  if (/^Binary files/m.test(diff) || /^GIT binary patch/m.test(diff)) {
    return { status: 'BINARY', added: [], missing: [] }
  }

  const added = diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .filter((l) => l.trim() !== '')
  const mainLines = new Set(mainText.split('\n').map((l) => l.trim()))
  const wholeLineMissing = added.filter((l) => !mainLines.has(l.trim()))
  if (wholeLineMissing.length === 0) return { status: 'ABSORBED', added, missing: [] }

  const tokens = (line) => line.split(/[\s,"'`;(){}[\]]+/).filter((t) => t.length > 2)
  const mainTokens = mainText.split('\n').map((l) => new Set(tokens(l)))
  const missing = []
  const RICH = 8
  for (const l of wholeLineMissing) {
    const want = tokens(l)
    const covered = want.length >= RICH && mainTokens.some((have) => want.every((t) => have.has(t)))
    if (!covered) missing.push(l)
  }

  return missing.length === 0
    ? { status: 'ABSORBED_TOKEN', added, missing, wholeLineMissing }
    : { status: 'NOT_ABSORBED', added, missing, wholeLineMissing }
}

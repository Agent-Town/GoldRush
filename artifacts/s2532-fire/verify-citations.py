"""F-AGE2-2's nine live pointers; historical rebase narratives are not current pointers."""
import json
import re
import sys
from pathlib import Path

lines = Path('src/story/beats.ts').read_text().splitlines()
subjects = [(1145, 'E5'), (1146, 'E6'), (1148, 'e5-tavern-locomotive-argument'),
            (1150, 'e6-gazette-the-printing'), (1329, 'E6'),
            (1332, 'e6-tavern-wrangler-drinks-free'), (1840, 'E8'),
            (1843, 'e8-tavern-river-question'), (2130, 'e8-riverward-launch')]
rows = []
for line, symbol in subjects:
    if re.fullmatch(r'E\d+', symbol):
        starts = [i for i, text in enumerate(lines)
                  if text.startswith(f'export const {symbol}_STORY_BEATS:')]
        assert len(starts) == 1, (symbol, starts)
        start = starts[0]
        end = next(i for i in range(start + 1, len(lines)) if lines[i] == '];')
    else:
        ids = [i for i, text in enumerate(lines) if f"id: '{symbol}'," in text]
        assert len(ids) == 1, (symbol, ids)
        start = max(i for i in range(ids[0]) if lines[i] == '  {')
        end = next(i for i in range(ids[0] + 1, len(lines)) if lines[i] == '  },')
    assert lines[line - 1].lstrip().startswith('//'), line
    context = '\n'.join(lines[max(0, line - 3):line])
    assert symbol in context, (line, symbol)
    actual = f'{start + 1}-{end + 1}'
    rows.append(dict(line=line, symbol=symbol, actual=actual,
                     exact=actual in lines[line - 1], text=lines[line - 1]))
assert len(rows) == 9
print(json.dumps(dict(file='src/story/beats.ts', sourceLines=len(lines), rows=rows,
                     staleLiveOccurrences=sum(not r['exact'] for r in rows)), indent=2))
if '--assert-fixed' in sys.argv:
    assert all(row['exact'] for row in rows), 'Live citations remain stale'

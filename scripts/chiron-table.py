"""Generates the Chiron table used by src/astro/chironData.ts.

Usage (offline tool, not part of the app build):
  pip install --target ./pylib pyswisseph
  download seas_18.se1, sepl_18.se1 and semo_18.se1 from github.com/aloistr/swisseph (ephe/) into ./ephe
  python3 scripts/chiron-table.py ./pylib ./ephe ./chiron.json
Then paste chiron.json's fields into src/astro/chironData.ts; chiron-refs.json holds validation points.
"""
import sys, json, base64, struct
sys.path.insert(0, sys.argv[1])
import swisseph as swe
swe.set_ephe_path(sys.argv[2])
out = sys.argv[3]
# Heliocentric J2000 equatorial XYZ (AU), every STEP days from START (JD TT) to END
START = swe.julday(1800, 1, 2, 0.0)
END = swe.julday(2101, 2, 1, 0.0)
STEP = 30
flags = swe.FLG_SWIEPH | swe.FLG_HELCTR | swe.FLG_J2000 | swe.FLG_EQUATORIAL | swe.FLG_XYZ | swe.FLG_TRUEPOS | swe.FLG_NONUT
vals = []
jd = START
n = 0
while jd <= END + 1e-9:
    xx, rf = swe.calc(jd, swe.CHIRON, flags)
    if rf & swe.FLG_SWIEPH == 0:
        raise SystemExit(f'not swieph at {jd}: {rf}')
    for c in xx[:3]:
        vals.append(int(round(c * 1e7)))
    jd += STEP; n += 1
data = struct.pack('<%di' % len(vals), *vals)
json.dump({'start': START, 'step': STEP, 'count': n, 'b64': base64.b64encode(data).decode()}, open(out, 'w'))
print(n, len(data), max(abs(v) for v in vals))
# reference geocentric apparent longitudes for validation (random dates, UT)
import random
random.seed(7)
refs = []
for _ in range(60):
    jd = random.uniform(swe.julday(1800, 2, 1, 0), swe.julday(2100, 12, 1, 0))
    xx, _ = swe.calc_ut(jd, swe.CHIRON, swe.FLG_SWIEPH | swe.FLG_SPEED)
    y, m, d, h = swe.revjul(jd)
    refs.append({'jd_ut': jd, 'lon': xx[0], 'speed': xx[3]})
json.dump(refs, open(out.replace('.json', '-refs.json'), 'w'), indent=1)

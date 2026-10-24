// Generates src/lib/worldPath.ts. Usage: npm i --prefix /tmp/w world-atlas@2 topojson-client@3 && node scripts/world-path.mjs /tmp/w/node_modules/world-atlas /tmp/w/node_modules/topojson-client src/lib/worldPath.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const [atlasDir, clientDir, out] = process.argv.slice(2)
const require = createRequire(import.meta.url)
const topo = JSON.parse(readFileSync(`${atlasDir}/land-110m.json`, 'utf8'))
const { feature } = require(clientDir)
const land = feature(topo, topo.objects.land)
const r = (v) => Math.round(v * 10) / 10
let d = ''
for (const f of land.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys) for (const ring of poly) {
    // equirectangular: x = lon + 180 (0..360), y = 90 - lat (0..180)
    let prev = null
    ring.forEach(([lon, lat], i) => {
      const x = r(lon + 180), y = r(90 - lat)
      if (prev && prev[0] === x && prev[1] === y) return
      d += (i === 0 ? 'M' : 'L') + x + ' ' + y
      prev = [x, y]
    })
    d += 'Z'
  }
}
writeFileSync(out, `// World land outline (Natural Earth 1:110m via world-atlas), equirectangular: x = lon + 180, y = 90 − lat.\nexport const WORLD_LAND_PATH =\n  '${d}'\n`)
console.log(d.length)

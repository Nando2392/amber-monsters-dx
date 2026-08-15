// Verifica que todas las filas de cada mapa tengan el ancho correcto.
const src = require('fs').readFileSync('src/world/tilemap.js', 'utf8');
const defs = { village: 20, route: 30, town: 22, cave: 24 };
let bad = 0;
for (const [id, w] of Object.entries(defs)) {
  const re = new RegExp(`${id}: \\{[\\s\\S]*?data: \\[([\\s\\S]*?)\\],\\n  \\},`);
  const m = src.match(re);
  if (!m) { console.log(id, 'NO MATCH'); bad++; continue; }
  const rows = [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
  rows.forEach((r, i) => {
    if (r.length !== w) { console.log(id, i, r.length, JSON.stringify(r)); bad++; }
  });
}
console.log(bad === 0 ? 'all rows OK' : `${bad} bad rows`);

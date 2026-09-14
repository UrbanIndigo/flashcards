/**
 * Builds js/subjects/shapes-data.js and js/subjects/borders-data.js.
 *
 *   npm --prefix /tmp install world-atlas topojson-client d3-geo i18n-iso-countries
 *   node tools/build-atlas.mjs [module-dir]
 *
 * Both come from Natural Earth by way of `world-atlas` (ISC; Natural Earth
 * itself is public domain), which is the only place either could come from:
 * an outline has to be drawn from real geometry, and a list of neighbours is
 * only trustworthy if it is derived from that same geometry rather than
 * typed out by hand.
 *
 * Borders fall out of the topology for free — two countries are neighbours
 * when they share an arc — which is why this reads TopoJSON rather than
 * GeoJSON.
 *
 * Outlines are pre-projected here rather than in the browser, so the app
 * ships 170KB of path data instead of a megabyte of coordinates and a
 * projection library.
 */

import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { COUNTRIES } from '../js/subjects/geography-data.js';

const MODULES = process.argv[2] ?? '/tmp/node_modules';
const load = (name) => import(pathToFileURL(`${MODULES}/${name}`).href);

const topojson = await load('topojson-client/dist/topojson-client.js');
const d3 = await load('d3-geo/src/index.js');
const { default: iso } = await load('i18n-iso-countries/index.js');
const { default: world } = await load('world-atlas/countries-10m.json', { with: { type: 'json' } })
  .catch(async () => ({ default: JSON.parse(await import('node:fs')
    .then((fs) => fs.readFileSync(`${MODULES}/world-atlas/countries-10m.json`, 'utf8'))) }));

const EARTH = 6371;                 // km
const SIZE = 400;                   // the outline's square, in path units
const TOLERANCE = 1.2;              // path units: below this a wiggle is not a shape
const MIN_RING = 3;                 // path units squared: smaller is a speck
const REACH = 300;                  // km: an island this close reads as part of the country
const SHARE = 0.25;                 // a piece this large is the country, however far away
const MIN_AREA = 1000;              // km2: below this there is no outline worth guessing
const IMPOSSIBLE = 5e7;             // km2: bigger than any continent, so the ring is broken

const CODES = new Set(COUNTRIES.map((c) => c.code));
const NAME = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));
const alpha2 = (id) => iso.numericToAlpha2(String(id).padStart(3, '0'));

/**
 * Borders that exist only through an overseas territory. They are true —
 * the French Republic really does border Brazil — but nobody listing the
 * countries around France means Brazil, so they are accepted and never
 * required.
 */
const OVERSEAS = [
  ['FR', 'BR', 'French Guiana'],
  ['FR', 'SR', 'French Guiana'],
];

// ---------------------------------------------------------------- borders

const geometries = world.objects.countries.geometries;
const adjacency = topojson.neighbors(geometries);

const neighbours = new Map();
geometries.forEach((geometry, i) => {
  const code = alpha2(geometry.id);
  if (!code || !CODES.has(code)) return;
  // A country can arrive as several geometries, so its neighbours accumulate;
  // and a country is not its own neighbour.
  const found = adjacency[i].map((j) => alpha2(geometries[j].id))
    .filter((other) => other && CODES.has(other) && other !== code);
  neighbours.set(code, new Set([...(neighbours.get(code) ?? []), ...found]));
});

const overseas = new Map();
for (const [a, b, through] of OVERSEAS) {
  for (const [from, to] of [[a, b], [b, a]]) {
    if (!neighbours.get(from)?.has(to)) {
      process.stderr.write(`NOT A DERIVED BORDER: ${from}-${to}\n`);
      process.exit(1);
    }
    neighbours.get(from).delete(to);
    const entry = overseas.get(from) ?? { also: [], through: new Set() };
    entry.also.push(to);
    entry.through.add(through);
    overseas.set(from, entry);
  }
}

const borders = {};
for (const country of COUNTRIES) {
  const list = [...(neighbours.get(country.code) ?? [])].sort();
  if (list.length) borders[country.code] = list;
}

const overseasOut = {};
for (const [code, { also, through }] of [...overseas].sort()) {
  const names = also.map((c) => NAME[c]);
  const last = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  overseasOut[code] = {
    also: also.sort(),
    note: `${NAME[code]} also borders ${last}, through ${[...through].join(' and ')}.`,
  };
}

// ----------------------------------------------------------------- shapes

const polygonsOf = (feature) => (feature.geometry.type === 'Polygon'
  ? [feature.geometry.coordinates] : feature.geometry.coordinates);

const byCode = new Map();
for (const feature of topojson.feature(world, world.objects.countries).features) {
  const code = alpha2(feature.id);
  if (!code || !CODES.has(code)) continue;
  byCode.set(code, [...(byCode.get(code) ?? []), ...polygonsOf(feature)]);
}

const areaKm2 = (polygon) => d3.geoArea({ type: 'Polygon', coordinates: polygon }) * EARTH * EARTH;

/** Plain min and max, not d3.geoBounds: bounds that wrap the antimeridian break the arithmetic. */
function box(polygon) {
  let x0 = 180; let y0 = 90; let x1 = -180; let y1 = -90;
  for (const [x, y] of polygon[0]) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

/** Roughly how far apart two boxes are, in km; zero when they overlap. */
function gapKm(a, b) {
  const lat = Math.max(Math.min(a[3], b[3]), Math.min(a[1], b[1]));
  const lon = Math.max(0, a[0] - b[2], b[0] - a[2]) * 111 * Math.cos((lat * Math.PI) / 180);
  return Math.hypot(lon, Math.max(0, a[1] - b[3], b[1] - a[3]) * 111);
}

/**
 * The pieces that make up the outline anyone would recognise.
 *
 * Natural Earth gives a country everything it governs, which for France
 * means a hexagon and five specks scattered over three oceans. Fitting all
 * of that in one frame leaves the hexagon too small to read. So: start from
 * the largest piece, take anything close enough to belong to the same
 * picture — Corsica, Sicily, Tasmania — and anything big enough to be the
 * country whatever the distance, which is what keeps peninsular Malaysia
 * attached to Borneo. French Guiana qualifies on neither count.
 */
function mainland(polygons) {
  const parts = polygons.map((p) => ({ p, a: areaKm2(p), b: box(p) }))
    .filter((part) => part.a < IMPOSSIBLE)
    .sort((x, y) => y.a - x.a);
  if (!parts.length) return [];

  const [main] = parts;
  const kept = [main];
  const pool = parts.slice(1).filter((part) => {
    if (part.a < main.a * SHARE) return true;
    kept.push(part);
    return false;
  });
  for (let grew = true; grew;) {
    grew = false;
    for (let i = pool.length - 1; i >= 0; i -= 1) {
      if (!kept.some((k) => gapKm(k.b, pool[i].b) <= REACH)) continue;
      kept.push(...pool.splice(i, 1));
      grew = true;
    }
  }
  // Islets too small to see only widen the frame and shrink everything else.
  const floor = Math.max(20, kept.reduce((sum, k) => sum + k.a, 0) * 0.0005);
  return kept.filter((part) => part === main || part.a >= floor);
}

/** Collects the projected outline instead of drawing it. */
function collector() {
  const rings = [];
  let ring = null;
  return {
    rings,
    moveTo(x, y) { ring = [[x, y]]; },
    lineTo(x, y) { ring.push([x, y]); },
    closePath() { if (ring && ring.length > 2) rings.push(ring); ring = null; },
    beginPath() {},
    arc() {},
  };
}

/** Douglas-Peucker, run on the projected points where the tolerance means something. */
function simplify(points, tolerance) {
  if (points.length < 4) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const [ax, ay] = points[i];
    const [bx, by] = points[j];
    const dx = bx - ax; const dy = by - ay;
    const length = Math.hypot(dx, dy);
    let far = -1;
    let worst = tolerance;
    for (let k = i + 1; k < j; k += 1) {
      const [px, py] = points[k];
      const distance = length === 0
        ? Math.hypot(px - ax, py - ay)
        : Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
      if (distance > worst) { worst = distance; far = k; }
    }
    if (far > 0) { keep[far] = 1; stack.push([i, far], [far, j]); }
  }
  return points.filter((_, i) => keep[i]);
}

const ringArea = (ring) => Math.abs(ring.reduce((sum, [x, y], i) => {
  const [nx, ny] = ring[(i + 1) % ring.length];
  return sum + (x * ny - nx * y);
}, 0)) / 2;

/**
 * One SVG path, in a SIZE-by-SIZE square.
 *
 * The projection is equal-area and centred on the country itself, so a
 * shape is not stretched by where it happens to sit on a world map —
 * Norway on Mercator is not the Norway you would recognise from an atlas.
 * Every outline is then scaled to fill the frame: at a common scale
 * Luxembourg would be a full stop next to Russia.
 */
function pathFor(parts) {
  const geometry = { type: 'MultiPolygon', coordinates: parts.map((part) => part.p) };
  const [lon, lat] = d3.geoCentroid(geometry);
  const projection = d3.geoAzimuthalEqualArea().rotate([-lon, -lat])
    .fitExtent([[1, 1], [SIZE - 1, SIZE - 1]], geometry);

  const context = collector();
  d3.geoPath(projection, context)(geometry);

  const rings = context.rings
    .map((ring) => simplify(ring, TOLERANCE).map(([x, y]) => [Math.round(x), Math.round(y)]))
    .map((ring) => ring.filter(([x, y], i) => i === 0 || x !== ring[i - 1][0] || y !== ring[i - 1][1]))
    .filter((ring) => ring.length > 2 && ringArea(ring) >= MIN_RING);

  // Relative steps, because "l3-2" is a third of the size of "L241 178" and
  // this file is 170KB of them.
  return rings.map((ring) => {
    let [px, py] = ring[0];
    const steps = [];
    for (const [x, y] of ring.slice(1)) {
      if (x === px && y === py) continue;
      steps.push(`${x - px}${y < py ? '' : ' '}${y - py}`);
      px = x; py = y;
    }
    return steps.length ? `M${ring[0][0]} ${ring[0][1]}l${steps.join(' ').replace(/ -/g, '-')}Z` : '';
  }).filter(Boolean).join('');
}

const shapes = {};
const skipped = [];
for (const country of COUNTRIES) {
  const parts = mainland(byCode.get(country.code) ?? []);
  const area = parts.reduce((sum, part) => sum + part.a, 0);
  if (area < MIN_AREA) { skipped.push(country.code); continue; }
  const path = pathFor(parts);
  if (path) shapes[country.code] = path;
  else skipped.push(country.code);
}

// ------------------------------------------------------------------ write

const header = (what) => `/**
 * ${what}
 *
 * Generated by tools/build-atlas.mjs — do not edit by hand.
 *
 * Derived from Natural Earth (public domain) via \`world-atlas\` (ISC,
 * (c) Mike Bostock).
 */
`;

const entries = (object, quote = JSON.stringify) => Object.entries(object)
  .map(([code, value]) => `  ${code}: ${quote(value)},`).join('\n');

writeFileSync(new URL('../js/subjects/borders-data.js', import.meta.url), `${header(
  'Which countries share a land border, derived from the shared edges of the map.',
)}
/** Neighbours, as ISO codes. A country with no land border is absent. */
export const BORDERS = {
${entries(borders, (list) => `[${list.map((c) => `'${c}'`).join(', ')}]`)}
};

/**
 * Borders through an overseas territory: accepted, never required, and
 * worth a word of explanation when the answer comes up.
 */
export const OVERSEAS = {
${entries(overseasOut, (entry) => `{ also: [${entry.also.map((c) => `'${c}'`).join(', ')}], note: ${JSON.stringify(entry.note)} }`)}
};
`);

writeFileSync(new URL('../js/subjects/shapes-data.js', import.meta.url), `${header(
  'Country outlines, as SVG paths.',
)}
/** The square each path is drawn in. */
export const SHAPE_BOX = ${SIZE};

/**
 * One path per country, centred and scaled to fill the box, with the
 * far-flung territories left off. Countries too small to have a
 * recognisable outline are absent.
 */
export const SHAPES = {
${entries(shapes)}
};
`);

const withBorders = Object.keys(borders).length;
process.stderr.write(`${withBorders} countries with land borders, ${COUNTRIES.length - withBorders} without\n`);
process.stderr.write(`${Object.keys(shapes).length} outlines, ${skipped.length} too small: ${skipped.join(' ')}\n`);

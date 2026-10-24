// Project Bangladesh district GeoJSON onto a flat SVG plane.
//
// We deliberately avoid any tile server, map SDK or API key: the district
// boundaries already shipped in /public/geo are converted to SVG paths once,
// client-side, on the Web Mercator projection. The result is a real,
// geographically accurate map of all 64 districts that makes zero external
// network requests — so there is nothing that can fail, warn or watermark.

const TILE = 256;
const MAX_LAT = 85.05112878;

function project([lon, lat]) {
  const x = (lon + 180) / 360;
  const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  const s = Math.sin((clamped * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  return [x * TILE, y * TILE];
}

// Round to 1 decimal to keep the generated path strings small (the source
// geometry is already generalised, so sub-pixel precision is not visible).
const round = (n) => Math.round(n * 10) / 10;

function ringToPath(ring, t) {
  if (!ring || ring.length < 3) return "";
  let d = "";
  for (let i = 0; i < ring.length; i += 1) {
    const [sx, sy] = project(ring[i]);
    d += `${i === 0 ? "M" : "L"}${round(t.x(sx))} ${round(t.y(sy))}`;
  }
  return `${d}Z`;
}

function geometryToPath(geometry, t) {
  if (!geometry) return "";
  const polys =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : geometry.type === "Polygon"
        ? [geometry.coordinates]
        : [];
  let d = "";
  for (const poly of polys) {
    for (const ring of poly) d += ringToPath(ring, t);
  }
  return d;
}

// Build an SVG-space transform that fits every coordinate of the collection
// inside a viewBox of `width` × `height` with `pad` pixels of breathing room.
export function buildProjector(featureCollection, width, height, pad = 6) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const eachCoord = (coords, depth) => {
    if (typeof coords[0] === "number") {
      const [x, y] = project(coords);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const c of coords) eachCoord(c, depth + 1);
  };

  for (const f of featureCollection.features) {
    if (f.geometry) eachCoord(f.geometry.coordinates, 0);
  }

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;

  const t = {
    x: (x) => (x - minX) * scale + offsetX,
    y: (y) => (y - minY) * scale + offsetY,
    point: (lon, lat) => {
      const [x, y] = project([lon, lat]);
      return [t.x(x), t.y(y)];
    },
  };
  return t;
}

// Convert a GeoJSON FeatureCollection of districts into an array of
// { id, name, nameBn, divisionId, d } entries with SVG path data.
export function districtsToSvg(featureCollection, width, height, pad) {
  const t = buildProjector(featureCollection, width, height, pad);
  return featureCollection.features.map((f) => ({
    id: f.properties.id,
    name: f.properties.name,
    nameBn: f.properties.nameBn,
    divisionId: f.properties.divisionId,
    d: geometryToPath(f.geometry, t),
  }));
}

// Project a single lon/lat point with the same transform used for the paths.
export function projectorFor(featureCollection, width, height, pad) {
  return buildProjector(featureCollection, width, height, pad);
}

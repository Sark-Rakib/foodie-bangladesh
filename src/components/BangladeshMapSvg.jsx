"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Renders Bangladesh's 64 districts as an inline SVG.
 * Used for the shareable food-map card: it is resolution-independent and
 * exports cleanly through html-to-image (no external tiles, no CORS issues).
 */

const VIEW_W = 1000;

// lon/lat -> normalized [x, y] using an equirectangular projection with
// cosine-latitude correction so Bangladesh is not horizontally stretched.
function makeProjection(coords) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat);
  const spanX = (maxLon - minLon) * kx;
  const spanY = maxLat - minLat;
  const scale = MARKER_SCALE;
  return {
    project: (lon, lat) => [
      ((lon - minLon) * kx - spanX / 2) * scale,
      (-(lat - minLat) + spanY / 2) * scale,
    ],
    size: [spanX * scale, spanY * scale],
  };
}

const MARKER_SCALE = 100;

function ringsToPath(geometry, project) {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let d = "";
  for (const polygon of polygons) {
    for (const ring of polygon) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      });
      d += "Z";
    }
  }
  return d;
}

export default function BangladeshMapSvg({
  exploredIds = [],
  className = "",
  ariaLabel = "Bangladesh district map",
  highlightColor = "#c65d3a",
  baseColor = "#e6e2da",
  waterColor = "#eef4f0",
  strokeColor = "#faf7f0",
  selectedId = null,
  selectedLabel = "",
}) {
  const [geo, setGeo] = useState(null);
  const explored = useMemo(() => new Set(exploredIds), [exploredIds]);

  useEffect(() => {
    let alive = true;
    fetch("/geo/districts.json")
      .then((r) => r.json())
      .then((data) => alive && setGeo(data))
      .catch(() => alive && setGeo({ features: [] }));
    return () => {
      alive = false;
    };
  }, []);

  const { paths, viewBox, labelPoint } = useMemo(() => {
    if (!geo?.features?.length)
      return { paths: [], viewBox: `0 0 ${VIEW_W} ${VIEW_W}`, labelPoint: null };
    const all = [];
    for (const f of geo.features) {
      const g = f.geometry;
      const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
      for (const poly of polys) for (const ring of poly) for (const c of ring) all.push(c);
    }
    const { project, size } = makeProjection(all);
    const [w, h] = size;
    const paths = geo.features.map((f) => ({
      id: f.properties.id,
      d: ringsToPath(f.geometry, project),
    }));

    // Centroid (mean of outer-ring vertices) of the selected district, so the
    // label sits over its actual geographic area.
    let labelPoint = null;
    if (selectedId) {
      const feature = geo.features.find((f) => f.properties.id === selectedId);
      if (feature) {
        const g = feature.geometry;
        const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
        let sx = 0;
        let sy = 0;
        let n = 0;
        for (const poly of polys) {
          for (const [lon, lat] of poly[0]) {
            const [x, y] = project(lon, lat);
            sx += x;
            sy += y;
            n += 1;
          }
        }
        if (n > 0) labelPoint = [sx / n, sy / n];
      }
    }

    const pad = 12;
    return {
      paths,
      viewBox: `${-w / 2 - pad} ${-h / 2 - pad} ${w + pad * 2} ${h + pad * 2}`,
      labelPoint,
    };
  }, [geo, selectedId]);

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="-5000" y="-5000" width="10000" height="10000" fill={waterColor} />
      {paths.map((p) => {
        const isExplored = explored.has(p.id);
        const isSelected = selectedId != null && p.id === selectedId;
        return (
          <path
            key={p.id}
            d={p.d}
            fill={isExplored || isSelected ? highlightColor : baseColor}
            stroke={strokeColor}
            strokeWidth={isExplored || isSelected ? 1.6 : 1}
            strokeLinejoin="round"
          />
        );
      })}
      {labelPoint && selectedLabel && (
        <g pointerEvents="none">
          <rect
            x={labelPoint[0] - 46}
            y={labelPoint[1] - 15}
            width={92}
            height={30}
            rx={15}
            fill="#0e2a23"
            opacity={0.92}
          />
          <text
            x={labelPoint[0]}
            y={labelPoint[1] + 5}
            textAnchor="middle"
            fill="#faf7f0"
            fontSize={17}
            fontWeight={600}
            style={{ fontFamily: 'var(--font-bn), "Hind Siliguri", system-ui, sans-serif' }}
          >
            {selectedLabel}
          </text>
        </g>
      )}
    </svg>
  );
}

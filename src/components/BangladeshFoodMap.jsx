"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { CATALOG_BY_ID, DISTRICT_INDEX, districtsInDivision, foodsByDistrict } from "@/data/catalog";
import { DISTRICTS_GEO, districtById } from "@/data/geo/districtMeta";
import { useDistrictFoods } from "@/hooks/useDistrictFoods";
import { resolveImageUrl, revokeUrl } from "@/utils/idbImageStore";
import { districtsToSvg, projectorFor } from "@/utils/geoProject";
import DivisionSelector from "@/components/DivisionSelector";
import DistrictPanel from "@/components/DistrictPanel";

// The map is drawn entirely from the local district GeoJSON as SVG on a fixed
// Web-Mercator plane. There is no tile server, no map SDK and no API key, so
// there are no attribution watermarks, key warnings or broken-tile messages.
// The viewBox is fixed and the projection is fit to it, which frames all of
// Bangladesh exactly once and leaves nothing to zoom or pan — matching the
// clean, map-first experience of the reference site.
const VIEW_W = 600;
const VIEW_H = 872;
const VIEW_PAD = 8;

// Division boundary is drawn by lightly stroking the shared edges; district
// edges use a soft cream seam. Colours follow the Foodie Bangladesh palette.
const UNVISITED_FILL = "#e6e2da";
const RING_COLOR = "#f6f2ea";
const RING_WIDTH = 1.4;
const SELECTED_STROKE = "#0e2a23";

function countFill(count, hasFoods) {
  if (hasFoods) {
    if (count === 0) return "#e3dcc9";
    if (count <= 2) return "#e8cf97";
    if (count <= 5) return "#d09a52";
    return "#b05a34";
  }
  return UNVISITED_FILL;
}

export default function BangladeshFoodMap({
  triedIds = [],
  selectedId = null,
  onSelect,
  heightClass = "h-[68vh] min-h-[440px]",
  showControls = true,
  displayName = "",
}) {
  const { t, lang } = useI18n();
  const { foods: userFoods } = useDistrictFoods();

  const [geo, setGeo] = useState(null);
  const [failed, setFailed] = useState(false);
  const [divisionFilter, setDivisionFilter] = useState("");
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/geo/districts.json")
      .then((r) => r.json())
      .then((d) => alive && setGeo(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const triedByDistrict = useMemo(() => {
    const counts = {};
    for (const id of triedIds) {
      const food = CATALOG_BY_ID[id];
      if (food?.districtId) counts[food.districtId] = (counts[food.districtId] ?? 0) + 1;
    }
    return counts;
  }, [triedIds]);

  const userByDistrict = useMemo(() => {
    const map = {};
    for (const entry of userFoods) {
      if (!map[entry.districtId]) map[entry.districtId] = [];
      map[entry.districtId].push(entry);
    }
    return map;
  }, [userFoods]);

  // Geometry → SVG paths, computed once per loaded GeoJSON.
  const { shapes, projector } = useMemo(() => {
    if (!geo) return { shapes: [], projector: null };
    return {
      shapes: districtsToSvg(geo, VIEW_W, VIEW_H, VIEW_PAD),
      projector: projectorFor(geo, VIEW_W, VIEW_H, VIEW_PAD),
    };
  }, [geo]);

  const selectedDistrict = selectedId ? DISTRICT_INDEX[selectedId] : null;
  const filteredCount = divisionFilter ? districtsInDivision(divisionFilter).length : 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DISTRICTS_GEO.filter(
      (d) => d.name.toLowerCase().includes(q) || d.nameBn.includes(query.trim()),
    ).slice(0, 6);
  }, [query]);

  if (failed) {
    return (
      <div className={`grid place-items-center rounded-2xl border border-line bg-paper/50 ${heightClass}`}>
        <p className="text-sm text-muted">{t("common.errorBody")}</p>
      </div>
    );
  }

  return (
    <div className={`relative isolate overflow-hidden rounded-2xl border border-line bg-paper ${heightClass}`}>
      {/* Fixed-scale country map: the SVG keeps Bangladesh framed on every
          screen. No zoom controls, gestures or panning exist by design. */}
      <div className="absolute inset-0 grid place-items-center bg-[#eef4f0]">
        {geo && projector && (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-label={t("map.title")}
            preserveAspectRatio="xMidYMid meet"
            className="fb-bdmap h-full w-full select-none"
            style={{ touchAction: "manipulation" }}
          >
            <g>
              {shapes.map((s) => {
                const id = s.id;
                const selected = id === selectedId;
                const hovered = id === hoverId;
                const count = (triedByDistrict[id] ?? 0) + (userByDistrict[id]?.length ?? 0);
                const hasFoods =
                  (DISTRICT_INDEX[id]?.foodCount ?? 0) > 0 ||
                  (userByDistrict[id]?.length ?? 0) > 0;
                const dimmed = divisionFilter && s.divisionId !== divisionFilter;
                const fill = countFill(count, hasFoods);
                return (
                  <path
                    key={id}
                    d={s.d}
                    fill={fill}
                    stroke={selected ? SELECTED_STROKE : hovered ? "#c65d3a" : RING_COLOR}
                    strokeWidth={selected ? 2.6 : hovered ? 2 : RING_WIDTH}
                    strokeLinejoin="round"
                    opacity={dimmed ? 0.16 : 1}
                    style={{ cursor: "pointer", transition: "opacity .2s" }}
                    onMouseEnter={() => setHoverId(id)}
                    onMouseLeave={() => setHoverId((v) => (v === id ? null : v))}
                    onClick={() => onSelect?.(id)}
                  />
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* District food markers + name labels, positioned as percentages over
          the SVG so they stay crisp and interactive. */}
      {projector && (
<MapOverlay
          projector={projector}
          shapes={shapes}
          selectedId={selectedId}
          onSelect={onSelect}
          userByDistrict={userByDistrict}
          divisionFilter={divisionFilter}
          lang={lang}
          displayName={displayName}
/>
      )}

      {!geo && (
        <div className="absolute inset-0 z-[600] grid place-items-center bg-paper/70 text-sm text-muted">
          {t("common.loading")}
        </div>
      )}

      {showControls && (
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-[501] flex flex-col gap-2 sm:right-auto sm:w-[320px]">
          <div className="pointer-events-auto rounded-2xl border border-line bg-cream/96 p-3 shadow-lg backdrop-blur">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("map.search")}
                className="w-full rounded-xl border border-line bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-terracotta"
              />
              {query.trim() && (
                <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-line bg-cream shadow-lg">
                  {results.length > 0 ? (
                    results.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect?.(d.id);
                            setQuery("");
                          }}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-paper"
                        >
                          {lang === "en" ? d.name : d.nameBn}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-xs text-muted">{t("map.searchNoResults")}</li>
                  )}
                </ul>
              )}
            </div>
            <DivisionSelector
              value={divisionFilter}
              onChange={(id) => {
                setDivisionFilter(id);
                if (id) {
                  const first = districtsInDivision(id)[0];
                  if (first) onSelect?.(first.id);
                }
              }}
              className="mt-2"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {divisionFilter
                  ? `${filteredCount} ${t("common.districts")}`
                  : `${DISTRICTS_GEO.length} ${t("common.districts")}`}
              </span>
              <span className="text-[11px] text-muted">{t("map.fixedZoom")}</span>
            </div>
          </div>
        </div>
      )}

      <Legend
        labels={{
          noFoodYet: t("map.noFoodYet"),
          notVisited: t("map.legendNotVisited"),
          visitedAny: t("map.legendVisitedAny"),
          visitedMid: t("map.legendVisitedMid"),
          visitedMany: t("map.legendVisitedMany"),
          legend: t("map.legend"),
        }}
      />

      {selectedDistrict && (
        <DistrictPanel
          district={selectedDistrict}
          curatedFoods={foodsByDistrict(selectedDistrict.id)}
          onClose={() => onSelect?.(null)}
        />
      )}
    </div>
  );
}

// Labels + food markers rendered in the same coordinate space as the SVG,
// converted to container-relative percentages so they reflow with the map.
function MapOverlay({
  projector,
  shapes,
  selectedId,
  onSelect,
  userByDistrict,
  divisionFilter,
  lang,
  displayName,
}) {
  const toPct = (lon, lat) => {
    const [x, y] = projector.point(lon, lat);
    return [(x / VIEW_W) * 100, (y / VIEW_H) * 100];
  };

  const markerIds = Object.keys(userByDistrict);

  // Only the currently selected district gets a name label on the map. Every
  // other district name stays hidden so the map shows pure geography + food
  // markers; the full name list lives in the external district panel.
  const selectedShape = selectedId ? shapes.find((s) => s.id === selectedId) : null;
  const selectedMeta = selectedId ? districtById(selectedId) : null;
  const selectedPoint = selectedMeta ? toPct(selectedMeta.center[0], selectedMeta.center[1]) : null;
  const selectedDimmed =
    divisionFilter && selectedShape && selectedShape.divisionId !== divisionFilter;

  // User's name at the top‑left corner of the map
  const userName = displayName && displayName.trim()
    ? (
      <span
        className="absolute top-2 left-2 z-20 text-[10px] font-bold text-forest bg-cream/80 rounded px-2 py-1 whitespace-nowrap"
      >
        {displayName}
      </span>
    ) : null

  return (
    <div className="pointer-events-none absolute inset-0">
      {userName}

      {/* Food name inside selected district */}
      {selectedId && selectedShape && userByDistrict[selectedId] && userByDistrict[selectedId].length > 0 && (
        <span
          className="absolute z-30 text-[10px] font-medium text-terracotta whitespace-nowrap"
          style={{
            left: `${selectedPoint[0]}%`,
            top: `${selectedPoint[1]}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {userByDistrict[selectedId][0].name}
        </span>
      )}

      {/* Selected district name — positioned at its geographic centre */}
      {selectedShape && selectedMeta && selectedPoint && (
        <span
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-forest/15 bg-cream/95 px-2 py-0.5 text-[11px] font-bold text-forest shadow-sm"
          style={{
            left: `${selectedPoint[0]}%`,
            top: `${selectedPoint[1]}%`,
            opacity: selectedDimmed ? 0.5 : 1,
            pointerEvents: "none",
          }}
        >
          {lang === "en" ? selectedShape.name : selectedShape.nameBn}
        </span>
      )}

      {/* Food markers */}
      {markerIds.map((id) => {
        const meta = districtById(id);
        if (!meta) return null;
        const list = userByDistrict[id];
        const [left, top] = toPct(meta.center[0], meta.center[1]);
        return (
          <FoodMarker
            key={`m-${id}`}
            left={left}
            top={top}
            list={list}
            selected={id === selectedId}
            onSelect={() => onSelect?.(id)}
          />
        );
      })}
    </div>
  );
}

const imageCache = new Map();

function FoodMarker({ left, top, list, selected, onSelect }) {
  const first = list[0];
  const cacheKey = `${first?.imageId ?? ""}:${list.length}:${selected ? 1 : 0}`;
  const [url, setUrl] = useState(imageCache.get(first?.imageId) ?? null);

  useLayoutEffect(() => {
    let alive = true;
    let created = null;
    const cached = imageCache.has(first?.imageId);
    resolveImageUrl(first?.imageId).then((u) => {
      if (!alive) {
        if (u) revokeUrl(u);
        return;
      }
      if (u && !cached) {
        created = u;
        imageCache.set(first?.imageId, u);
      }
      setUrl(u ?? null);
    });
    return () => {
      alive = false;
      if (created) revokeUrl(created);
    };
  }, [first?.imageId]);

  const size = selected ? 34 : 30;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={first?.name}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, zIndex: selected ? 40 : 20 }}
    >
      <span
        className="block h-full w-full rounded-full border-[3px] border-cream shadow-md"
        style={{
          backgroundColor: url ? "#e9e1d0" : "#c65d3a",
          backgroundImage: url ? `url('${url}')` : "linear-gradient(135deg,#c65d3a,#d8a947)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxSizing: "border-box",
        }}
      />
      <span className="absolute -bottom-1 -right-1 grid min-w-[16px] place-items-center rounded-full border-2 border-cream bg-forest px-1 text-[9px] font-bold leading-4 text-cream">
        {list.length}
      </span>
    </button>
  );
}

function Legend({ labels }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-[501] rounded-2xl border border-line bg-cream/96 p-3 text-[11px] shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted"
        aria-expanded={open}
      >
        {labels.legend}
        <span className="sm:hidden">{open ? "−" : "+"}</span>
      </button>
      <ul className={`mt-2 flex-col gap-1.5 ${open ? "flex" : "hidden sm:flex"}`}>
        <LegendItem color={UNVISITED_FILL} label={labels.noFoodYet} />
        <LegendItem color="#e3dcc9" label={labels.notVisited} />
        <LegendItem color="#e8cf97" label={labels.visitedAny} />
        <LegendItem color="#d09a52" label={labels.visitedMid} />
        <LegendItem color="#b05a34" label={labels.visitedMany} />
      </ul>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <li className="flex items-center gap-2 text-ink/70">
      <span className="h-3 w-3 rounded-sm border border-ink/15" style={{ backgroundColor: color }} />
      {label}
    </li>
  );
}

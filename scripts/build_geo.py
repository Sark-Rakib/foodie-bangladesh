#!/usr/bin/env python3
"""Build bilingual Bangladesh geo metadata (divisions + districts) from geoBoundaries data.

Sources:
  ADM1: geoBoundaries gbOpen (CC0 1.0)   — 8 divisions
  ADM2: geoBoundaries gbOpen (CC BY 3.0 IGO) — 64 districts

Outputs:
  src/data/geo/divisions.json   (FeatureCollection, simplified props)
  src/data/geo/districts.json   (FeatureCollection, simplified props)
  src/data/geo/districtMeta.js  (centroids + bilingual names + division link)
"""

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path("/tmp/opencode/geo")
OUT = ROOT / "src" / "data" / "geo"

CANON = {
    "Bagerhat": ("Bagerhat", "বাগেরহাট"),
    "Bandarban": ("Bandarban", "বান্দরবান"),
    "Barguna": ("Barguna", "বরগুনা"),
    "Barisal": ("Barishal", "বরিশাল"),
    "Bhola": ("Bhola", "ভোলা"),
    "Bogra": ("Bogura", "বগুড়া"),
    "Brahamanbaria": ("Brahmanbaria", "ব্রাহ্মণবাড়িয়া"),
    "Chandpur": ("Chandpur", "চাঁদপুর"),
    "Chittagong": ("Chattogram", "চট্টগ্রাম"),
    "Chuadanga": ("Chuadanga", "চুয়াডাঙ্গা"),
    "Comilla": ("Cumilla", "কুমিল্লা"),
    "Cox's Bazar": ("Cox's Bazar", "কক্সবাজার"),
    "Dhaka": ("Dhaka", "ঢাকা"),
    "Dinajpur": ("Dinajpur", "দিনাজপুর"),
    "Faridpur": ("Faridpur", "ফরিদপুর"),
    "Feni": ("Feni", "ফেনী"),
    "Gaibandha": ("Gaibandha", "গাইবান্ধা"),
    "Gazipur": ("Gazipur", "গাজীপুর"),
    "Gopalganj": ("Gopalganj", "গোপালগঞ্জ"),
    "Habiganj": ("Habiganj", "হবিগঞ্জ"),
    "Jamalpur": ("Jamalpur", "জামালপুর"),
    "Jessore": ("Jashore", "যশোর"),
    "Jhalokati": ("Jhalokathi", "ঝালকাঠি"),
    "Jhenaidah": ("Jhenaidah", "ঝিনাইদহ"),
    "Joypurhat": ("Joypurhat", "জয়পুরহাট"),
    "Khagrachhari": ("Khagrachhari", "খাগড়াছড়ি"),
    "Khulna": ("Khulna", "খুলনা"),
    "Kishoreganj": ("Kishoreganj", "কিশোরগঞ্জ"),
    "Kurigram": ("Kurigram", "কুড়িগ্রাম"),
    "Kushtia": ("Kushtia", "কুষ্টিয়া"),
    "Lakshmipur": ("Lakshmipur", "লক্ষ্মীপুর"),
    "Lalmonirhat": ("Lalmonirhat", "লালমনিরহাট"),
    "Madaripur": ("Madaripur", "মাদারীপুর"),
    "Magura": ("Magura", "মাগুরা"),
    "Manikganj": ("Manikganj", "মানিকগঞ্জ"),
    "Maulvibazar": ("Moulvibazar", "মৌলভীবাজার"),
    "Meherpur": ("Meherpur", "মেহেরপুর"),
    "Munshiganj": ("Munshiganj", "মুন্সিগঞ্জ"),
    "Mymensingh": ("Mymensingh", "ময়মনসিংহ"),
    "Naogaon": ("Naogaon", "নওগাঁ"),
    "Narail": ("Narail", "নড়াইল"),
    "Narayanganj": ("Narayanganj", "নারায়ণগঞ্জ"),
    "Narsingdi": ("Narsingdi", "নরসিংদী"),
    "Natore": ("Natore", "নাটোর"),
    "Nawabganj": ("Chapainawabganj", "চাঁপাইনবাবগঞ্জ"),
    "Netrakona": ("Netrokona", "নেত্রকোণা"),
    "Nilphamari": ("Nilphamari", "নীলফামারী"),
    "Noakhali": ("Noakhali", "নোয়াখালী"),
    "Pabna": ("Pabna", "পাবনা"),
    "Panchagarh": ("Panchagarh", "পঞ্চগড়"),
    "Patuakhali": ("Patuakhali", "পটুয়াখালী"),
    "Pirojpur": ("Pirojpur", "পিরোজপুর"),
    "Rajbari": ("Rajbari", "রাজবাড়ী"),
    "Rajshahi": ("Rajshahi", "রাজশাহী"),
    "Rangamati": ("Rangamati", "রাঙ্গামাটি"),
    "Rangpur": ("Rangpur", "রংপুর"),
    "Satkhira": ("Satkhira", "সাতক্ষীরা"),
    "Shariatpur": ("Shariatpur", "শরীয়তপুর"),
    "Sherpur": ("Sherpur", "শেরপুর"),
    "Sirajganj": ("Sirajganj", "সিরাজগঞ্জ"),
    "Sunamganj": ("Sunamganj", "সুনামগঞ্জ"),
    "Sylhet": ("Sylhet", "সিলেট"),
    "Tangail": ("Tangail", "টাঙ্গাইল"),
    "Thakurgaon": ("Thakurgaon", "ঠাকুরগাঁও"),
}

DIV_CANON = {
    "Chittagong": ("chattogram", "Chattogram", "চট্টগ্রাম"),
    "Dhaka": ("dhaka", "Dhaka", "ঢাকা"),
    "Mymensingh": ("mymensingh", "Mymensingh", "ময়মনসিংহ"),
    "Rajshani": ("rajshahi", "Rajshahi", "রাজশাহী"),
    "Rangpur": ("rangpur", "Rangpur", "রংপুর"),
    "Sylhet": ("sylhet", "Sylhet", "সিলেট"),
    "Khulna": ("khulna", "Khulna", "খুলনা"),
    "Barisal": ("barishal", "Barishal", "বরিশাল"),
}


def slugify(name):
    return (
        name.lower()
        .replace("'", "")
        .replace(" ", "-")
        .replace("_", "-")
    )


def rings(geometry):
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"][0]]
    if geometry["type"] == "MultiPolygon":
        return [poly[0] for poly in geometry["coordinates"]]
    raise ValueError(geometry["type"])


def centroid(geometry):
    """Area-weighted centroid of the largest ring; falls back to ring average."""
    best_ring, best_area = None, -1
    for ring in rings(geometry):
        area = 0.0
        for i in range(len(ring) - 1):
            x1, y1 = ring[i][0], ring[i][1]
            x2, y2 = ring[i + 1][0], ring[i + 1][1]
            area += x1 * y2 - x2 * y1
        area = abs(area) / 2
        if area > best_area:
            best_area, best_ring = area, ring
    cx = cy = 0.0
    a = 0.0
    for i in range(len(best_ring) - 1):
        x1, y1 = best_ring[i][0], best_ring[i][1]
        x2, y2 = best_ring[i + 1][0], best_ring[i + 1][1]
        cross = x1 * y2 - x2 * y1
        a += cross
        cx += (x1 + x2) * cross
        cy += (y1 + y2) * cross
    a *= 0.5
    if abs(a) < 1e-12:
        xs = [p[0] for p in best_ring]
        ys = [p[1] for p in best_ring]
        return [sum(xs) / len(xs), sum(ys) / len(ys)]
    return [cx / (6 * a), cy / (6 * a)]


def point_in_ring(x, y, ring):
    inside = False
    n = len(ring)
    for i in range(n - 1):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[i + 1][0], ring[i + 1][1]
        if (y1 > y) != (y2 > y):
            xin = (x2 - x1) * (y - y1) / (y2 - y1) + x1
            if x < xin:
                inside = not inside
    return inside


def point_in_geometry(x, y, geometry):
    for ring in rings(geometry):
        if point_in_ring(x, y, ring):
            # ignore holes for this purpose
            return True
    return False


def round_coords(obj, nd=4):
    if isinstance(obj, float):
        return round(obj, nd)
    if isinstance(obj, list):
        return [round_coords(v, nd) for v in obj]
    if isinstance(obj, dict):
        return {k: round_coords(v, nd) for k, v in obj.items()}
    return obj


def main():
    adm1 = json.load(open(SRC / "adm1.geojson"))
    adm2 = json.load(open(SRC / "adm2.geojson"))
    OUT.mkdir(parents=True, exist_ok=True)

    divisions = []
    for feat in adm1["features"]:
        raw = feat["properties"]["shapeName"]
        did, den, dbn = DIV_CANON[raw]
        divisions.append({"id": did, "name": den, "nameBn": dbn, "geometry": feat["geometry"]})

    div_geoms = [(d["id"], d["geometry"]) for d in divisions]

    district_meta = []
    for feat in adm2["features"]:
        raw = feat["properties"]["shapeName"]
        en, bn = CANON[raw]
        c = centroid(feat["geometry"])
        parent = None
        for did, geom in div_geoms:
            if point_in_geometry(c[0], c[1], geom):
                parent = did
                break
        if parent is None:
            raise SystemExit(f"no division found for district {en} at {c}")
        district_meta.append({
            "id": slugify(en),
            "name": en,
            "nameBn": bn,
            "divisionId": parent,
            "center": [round(c[0], 4), round(c[1], 4)],
            "geometry": feat["geometry"],
        })

    div_lookup = {d["id"]: d for d in divisions}
    div_bbox = {}
    for d in divisions:
        pts = [p for r in rings(d["geometry"]) for p in r]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        div_bbox[d["id"]] = (min(xs), min(ys), max(xs), max(ys))

    def div_feature_collection():
        feats = []
        for d in divisions:
            feats.append({
                "type": "Feature",
                "properties": {"id": d["id"], "name": d["name"], "nameBn": d["nameBn"]},
                "geometry": round_coords(d["geometry"]),
            })
        return {"type": "FeatureCollection", "features": feats}

    def dist_feature_collection():
        feats = []
        for dm in district_meta:
            feats.append({
                "type": "Feature",
                "properties": {
                    "id": dm["id"],
                    "name": dm["name"],
                    "nameBn": dm["nameBn"],
                    "divisionId": dm["divisionId"],
                },
                "geometry": round_coords(dm["geometry"]),
            })
        return {"type": "FeatureCollection", "features": feats}

    (OUT / "divisions.json").write_text(
        json.dumps(div_feature_collection(), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    (OUT / "districts.json").write_text(
        json.dumps(dist_feature_collection(), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    lines = [
        "// AUTO-GENERATED by scripts/build_geo.py — geoBoundaries gbOpen (CC0 / CC BY 3.0 IGO)",
        "",
        "export const DIVISIONS_GEO = [",
    ]
    for d in divisions:
        lines.append(
            f'  {{ id: "{d["id"]}", name: "{d["name"]}", nameBn: "{d["nameBn"]}" }},'
        )
    lines.append("];")
    lines.append("")
    lines.append("export const DISTRICTS_GEO = [")
    for dm in sorted(district_meta, key=lambda x: (x["divisionId"], x["id"])):
        lines.append(
            '  { id: "%s", name: "%s", nameBn: "%s", divisionId: "%s", center: [%s, %s] },'
            % (dm["id"], dm["name"], dm["nameBn"], dm["divisionId"], dm["center"][0], dm["center"][1])
        )
    lines.append("];")
    lines.append("")
    lines.append("const byId = Object.fromEntries(DISTRICTS_GEO.map((d) => [d.id, d]));")
    lines.append("export function districtById(id) { return byId[id] ?? null; }")
    lines.append("")
    lines.append("export const DIVISION_LABEL = Object.fromEntries(DIVISIONS_GEO.map((d) => [d.id, d]));")
    lines.append("")
    (OUT / "districtMeta.js").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"divisions: {len(divisions)}  districts: {len(district_meta)}")
    for d in divisions:
        n = sum(1 for x in district_meta if x["divisionId"] == d["id"])
        print(f"  {d['name']:12s} {d['nameBn']:10s} districts: {n}")


if __name__ == "__main__":
    main()

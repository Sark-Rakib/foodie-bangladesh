#!/usr/bin/env python3
"""Download food images from Wikimedia Commons (Openverse fallback) into public/images/foods/.

Writes src/data/foodImages.js (id -> existing path map) and public/images/CREDITS.md.
Foods without a usable image are omitted from the registry (UI falls back to icons).
"""

import json
import re
import sys
import time
import unicodedata
from pathlib import Path

import requests
from PIL import Image
from io import BytesIO

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "images" / "foods"
REGISTRY = ROOT / "src" / "data" / "foodImages.js"
CREDITS = ROOT / "public" / "images" / "CREDITS.md"
FOODS_JS = ROOT / "src" / "data" / "foods.js"

UA = "FoodieBangladesh/1.0 (static site food-image fetcher; respectful, low-rate)"
HEADERS = {"User-Agent": UA}
MAX_SIDE = 1400
JPEG_QUALITY = 82
SLEEP = 1.2

# Extra queries when the plain English name is too generic or missing on Commons.
QUERY_OVERRIDES = {
    "kacchi-biryani": ["Kacchi Biryani", "Biryani Dhaka", "Biryani Bangladesh"],
    "tehari": ["Tehari Bangladesh", "Beef biryani Bangladesh"],
    "bakarkhani": ["Bakarkhani", "Bakarkhani Bangladesh"],
    "kala-bhuna": ["Kala Bhuna", "Beef curry Bangladesh"],
    "kazi-dewani": ["Chicken curry Bangladesh", "Mughlai cuisine Bangladesh"],
    "kathi-roll": ["Kathi roll", "Roll paratha Bangladesh"],
    "bhapa-pitha": ["Bhapa pitha", "Steamed rice cake Bangladesh", "Pitha Bangladesh"],
    "kachki-mach": ["Kachki fish", "Small fish curry Bengal"],
    "ilish-bhapa": ["Hilsa curry", "Ilish", "Hilsa Bangladesh"],
    "mejbani-beef": ["Mejbani", "Beef curry Chittagong"],
    "mejbani-chicken": ["Chicken kosha", "Kosha mangsho", "Chicken curry Bengali style"],
    "bhuna-khichuri": ["Khichuri", "Khichdi Bangladesh"],
    "roshmalai": ["Rasmalai", "Roshmalai"],
    "dhai-cumilla": ["Sweet yoghurt clay pot", "Mishti doi", "Curd Bangladesh"],
    "bash-kada": ["Bamboo shoot cuisine", "Bamboo shoot curry"],
    "chingri-fry-cox": ["Prawn fry", "Fried prawns Bangladesh", "Shrimp Bangladesh"],
    "momo-ctg": ["Momo dumpling", "Steamed dumplings Bangladesh"],
    "bogura-doi": ["Mishti doi", "Sweet curd Bengal"],
    "aamitta": ["Mango dessert Bengal", "Aam"],
    "aam-er-achar": ["Mango pickle", "Achar Bangladesh"],
    "chui-jhal": ["Piper chaba", "Meat curry Bangladesh"],
    "kholaisha-mach": ["Fish curry Bangladesh", "Bagerhat fish"],
    "magur-mach": ["Catfish curry", "Magur mach"],
    "gath-kushtia": ["Freshwater fish Bangladesh", "Fish curry Kushtia"],
    "kachu-bhat": ["Kachu bhat", "Taro cuisine Bengal"],
    "meghna-chingri": ["Prawn Bangladesh", "Shrimp Meghna"],
    "shatkora-ranna": ["Shatkora", "Citrus medica Bengal", "Meat with lemon"],
    "borhani": ["Borhani", "Sweet lassi", "Yogurt drink Bangladesh"],
    "hansher-mangsho": ["Duck curry", "Duck meat Bangladesh"],
    "khai": ["Khai pitha", "Bengali sweets frying"],
    "kharizar-achar": ["Tamarind pickle", "Achar Bangladesh"],
    "chita-pitha": ["Chita pitha", "Pitha Bangladesh"],
    "folsa": ["Phalsa fruit", "Grewia asiatica", "Falsa juice", "Falsa drink"],
    "kul-rangpur": ["Ziziphus mauritiana", "Ber fruit", "Kul fruit"],
    "pakon": ["Batasha sweet", "Sugar drop sweets", "Fried sweet dumpling Bengal"],
    "khasir-dam": ["Goat curry", "Mutton curry Bangladesh"],
    "horer-mach": ["Haor fish", "Freshwater fish Bangladesh", "Fish market Bangladesh"],
    "fuchka": ["Fuchka", "Panipuri", "Pani puri"],
    "chotpoti": ["Chotpoti", "Chaat Bangladesh"],
    "jhalmuri": ["Jhalmuri", "Muri mixture", "Bhelpuri"],
    "alur-dom": ["Dum aloo", "Aloo dum", "Potato curry bowl"],
    "chowmin": ["Chowmein", "Chow mein Bangladesh"],
    "singara": ["Samosa", "Shingara"],
    "chop": ["Vegetable chop", "Cutlet Bangladesh"],
    "porota": ["Paratha", "Porota"],
    "beguni": ["Beguni", "Brinjal fritter", "Baingan bhaja"],
    "luchi": ["Luchi", "Puri bread Bengal"],
    "chingri-pakora": ["Prawn fritter", "Shrimp pakora"],
    "daler-bora": ["Dal vada", "Daler bora"],
    "shami-kebab": ["Shami kebab", "Shami kabab"],
    "alu-bhaja": ["Aloo bhaja", "Fried potato slice"],
    "alu-bhorta": ["Aloo bhorta", "Mashed potato Bengal"],
    "begun-bhorta": ["Begun bhorta", "Mashed aubergine"],
    "korola-bhaja": ["Karela fry", "Bitter gourd fry"],
    "narkel-achar": ["Coconut pickle"],
    "aam-er-chatni": ["Mango chutney"],
    "papad": ["Papad", "Papadum"],
    "dim-pakora": ["Egg pakora", "Egg fritter"],
    "khichuri": ["Khichuri", "Khichdi"],
    "murgi-polao": ["Chicken polao", "Pulao Bangladesh", "Chicken biryani plate"],
    "daler-bhat": ["Dal bhat", "Rice and dal"],
    "rezala": ["Rezala", "Mughlai chicken curry"],
    "roast": ["Chicken roast Bangladesh", "Roast chicken curry"],
    "murgir-dam": ["Chicken curry", "Chicken dam"],
    "murgir-bhuna": ["Chicken bhuna", "Chicken masala Bangladesh"],
    "chingri-bhuna": ["Prawn masala", "Prawn curry Bengal"],
    "mangsho-bhuna": ["Mutton bhuna", "Beef bhuna", "Meat curry Bengal"],
    "halim": ["Haleem", "Halim Bangladesh"],
    "ilish-bhaja": ["Fried hilsa", "Ilish fry"],
    "chingri-malaikari": ["Chingri malaikari", "Prawn malai curry", "Shrimp coconut curry"],
    "telapia-bhaja": ["Tilapia fry", "Fried tilapia"],
    "katla-torkari": ["Katla fish", "Fish curry Bengal", "Rohu fish curry"],
    "payesh": ["Payesh", "Bengali kheer", "Firni payesh"],
    "roshgolla": ["Rasgulla"],
    "jilapi": ["Jilapi", "Jalebi"],
    "firni": ["Firni", "Phirni"],
    "shemai": ["Sheema", "Vermicelli kheer", "Seviyan"],
    "kheer": ["Kheer", "Rice pudding Bengal"],
    "malapua": ["Malpua", "Malapua Bengali"],
    "batasha": ["Batasha", "Sugar drops Bengal"],
    "naru": ["Naru sweets", "Coconut laddu Bengal"],
    "borfi": ["Barfi sweets", "Milk barfi"],
    "sandesh": ["Sandesh sweet", "Sondesh Bengali"],
    "laddu": ["Laddu", "Ladoo sweets"],
    "suji-halwa": ["Suji halwa", "Semolina halwa"],
    "gajar-halwa": ["Gajar halwa", "Carrot halwa"],
    "faluda": ["Falooda", "Faluda Bangladesh"],
    "chitoi-pitha": ["Chitoi pitha", "Bengali rice cake"],
    "dudh-pitha": ["Dudh pitha", "Pitha milk"],
    "patishapta": ["Patishapta", "Bengali crepe"],
    "puli-pitha": ["Puli pitha", "Bengali pitha stuffed"],
    "kolai-shak": ["Kolai shak", "Kachu shak", "Taro leaves curry"],
    "palong-shak": ["Spinach curry", "Palong shak"],
    "aam-er-dal": ["Mango dal", "Dal with raw mango"],
    "shukuti-dal": ["Shutki", "Dried fish Bangladesh"],
    "dhedesh": ["Amaranthus tricolor", "Amaranth leaves", "Dhedesh shak"],
    "alu-bhuna": ["Bombay potato", "Dry potato curry", "Aloo sabzi"],
    "cha": ["Tea Bangladesh", "Cha stall Bangladesh", "Tea stall Bengal"],
    "mishti-doi": ["Mishti doi", "Sweet yogurt Bengal"],
    "tetul-shorbot": ["Tamarind drink", "Tetul sherbet", "Tamarind juice"],
}

COMMONS = "https://commons.wikimedia.org/w/api.php"
OPENVERSE = "https://api.openverse.org/v1/images/"


def parse_foods():
    text = FOODS_JS.read_text(encoding="utf-8")
    pairs = re.findall(
        r'id:\s*"([^"]+)",\s*\n\s*name:\s*"[^"]+",\s*\n\s*nameEn:\s*"([^"]+)"',
        text,
    )
    return pairs


def commons_search(query):
    params = {
        "action": "query",
        "format": "json",
        "formatversion": "2",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": "8",
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata",
        "iiurlwidth": "800",
    }
    try:
        last_err = None
        for attempt in range(4):
            r = requests.get(COMMONS, params=params, headers=HEADERS, timeout=30)
            if r.status_code == 429:
                wait = 25 * (attempt + 1)
                print(f"    api 429, backing off {wait}s")
                time.sleep(wait)
                last_err = Exception("429")
                continue
            r.raise_for_status()
            data = r.json()
            break
        else:
            print(f"    commons search gave up: {last_err}")
            return None
    except Exception as e:
        print(f"    commons search error: {e}")
        return None
    pages = (data.get("query") or {}).get("pages") or []
    candidates = []
    for p in pages:
        infos = p.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        mime = info.get("mime", "")
        if mime not in ("image/jpeg", "image/png"):
            continue
        w, h = info.get("width", 0), info.get("height", 0)
        if w < 500 or h < 400:
            continue
        # skip SVG-converted icons, maps, and obviously non-food diagrams
        title = p.get("title", "")
        lower = title.lower()
        if any(x in lower for x in (".svg", "map", "logo", "icon", "diagram", "poster")):
            continue
        url = info.get("thumburl") or info.get("url")
        # Wikimedia throttles unscaled originals; require a real thumbnail URL.
        if not url or "/thumb/" not in url:
            continue
        meta = info.get("extmetadata") or {}
        candidates.append(
            {
                "title": title,
                "page": info.get("descriptionurl", ""),
                "url": url,
                "artist": re.sub("<[^>]+>", "", (meta.get("Artist") or {}).get("value", "") or "").strip(),
                "license": (meta.get("LicenseShortName") or {}).get("value", ""),
            }
        )
        if len(candidates) >= 3:
            break
    return candidates or None


def openverse_search(query):
    try:
        r = requests.get(
            OPENVERSE,
            params={"q": query, "page_size": 5, "license_type": "all", "extension": "jpg"},
            headers=HEADERS,
            timeout=30,
        )
        r.raise_for_status()
        results = r.json().get("results", [])
    except Exception as e:
        print(f"    openverse error: {e}")
        return None
    out = []
    for item in results:
        w, h = item.get("width") or 0, item.get("height") or 0
        if w and w < 500:
            continue
        out.append(
            {
                "title": item.get("title", ""),
                "page": item.get("foreign_landing_url", ""),
                "url": item.get("url"),
                "artist": item.get("creator", "") or "",
                "license": f"{item.get('license', '')} {item.get('license_version', '')}".strip(),
                "source": item.get("source", "openverse"),
            }
        )
        if len(out) >= 2:
            break
    return out or None


def download_and_process(url, dest, seen_hashes):
    last_err = None
    for attempt in range(4):
        try:
            r = requests.get(url, headers=HEADERS, timeout=60)
            if r.status_code == 429:
                wait = 8 * (attempt + 1)
                print(f"    429, backing off {wait}s")
                time.sleep(wait)
                last_err = Exception("429")
                continue
            r.raise_for_status()
            break
        except Exception as e:
            last_err = e
            time.sleep(5 * (attempt + 1))
    else:
        raise last_err
    import hashlib

    digest = hashlib.sha1(r.content).hexdigest()
    if digest in seen_hashes:
        return None, seen_hashes[digest]
    seen_hashes[digest] = dest.stem
    img = Image.open(BytesIO(r.content))
    img = img.convert("RGB")
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    return img.size, None


def queries_for(food_id, name_en):
    qs = []
    qs.extend(QUERY_OVERRIDES.get(food_id, []))
    qs.append(f"{name_en} Bangladesh")
    qs.append(name_en)
    # de-dupe preserving order
    seen, out = set(), []
    for q in qs:
        k = unicodedata.normalize("NFC", q).lower()
        if k not in seen:
            seen.add(k)
            out.append(q)
    return out


def main():
    pairs = parse_foods()
    print(f"foods found: {len(pairs)}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    registry = {}
    credits = []
    failures = []
    seen_hashes = {}
    import hashlib

    for existing in sorted(OUT_DIR.glob("*.jpg")):
        try:
            digest = hashlib.sha1(existing.read_bytes()).hexdigest()
            seen_hashes.setdefault(digest, existing.stem)
        except OSError:
            pass
    for i, (food_id, name_en) in enumerate(pairs, 1):
        dest = OUT_DIR / f"{food_id}.jpg"
        if dest.exists() and dest.stat().st_size > 10_000:
            print(f"[{i}/{len(pairs)}] {food_id}: cached")
            registry[food_id] = f"/images/foods/{food_id}.jpg"
            continue
        print(f"[{i}/{len(pairs)}] {food_id} ({name_en})")
        found = None
        for q in queries_for(food_id, name_en):
            time.sleep(SLEEP)
            cands = commons_search(q)
            if cands:
                found = cands[0]
                print(f"    commons hit: {found['title']} (q={q})")
                break
        if not found:
            for q in queries_for(food_id, name_en)[:2]:
                time.sleep(SLEEP * 2)
                cands = openverse_search(q)
                if cands:
                    found = cands[0]
                    print(f"    openverse hit: {found.get('title')} (q={q})")
                    break
        if not found or not found.get("url"):
            print("    no image")
            failures.append(food_id)
            continue
        try:
            result, dup_of = download_and_process(found["url"], dest, seen_hashes)
            if result is None:
                print(f"    duplicate of '{dup_of}', skipping")
                failures.append(food_id)
                continue
            size = result
            print(f"    saved {size[0]}x{size[1]} -> {dest.name}")
            registry[food_id] = f"/images/foods/{food_id}.jpg"
            credits.append(
                {
                    "id": food_id,
                    "title": found.get("title", ""),
                    "page": found.get("page", ""),
                    "artist": found.get("artist", ""),
                    "license": found.get("license", ""),
                    "source": found.get("source", "Wikimedia Commons"),
                }
            )
        except Exception as e:
            print(f"    download failed: {e}")
            failures.append(food_id)

    # remove duplicate files saved by earlier runs (same bytes, different ids)
    by_hash = {}
    for f in sorted(OUT_DIR.glob("*.jpg")):
        digest = hashlib.sha1(f.read_bytes()).hexdigest()
        if digest in by_hash:
            print(f"removing duplicate file {f.name} (same bytes as {by_hash[digest].name})")
            registry.pop(f.stem, None)
            failures.append(f.stem)
            f.unlink()
        else:
            by_hash[digest] = f

    lines = [
        "// AUTO-GENERATED by scripts/download_food_images.py — do not edit by hand.",
        "// Only ids with an actually downloaded file are listed; UI falls back to icons otherwise.",
        "",
        "export const FOOD_IMAGES = {",
    ]
    for food_id in sorted(registry):
        lines.append(f'  "{food_id}": "{registry[food_id]}",')
    lines.append("};")
    lines.append("")
    lines.append("export function foodImage(id) {")
    lines.append("  return FOOD_IMAGES[id] ?? null;")
    lines.append("}")
    lines.append("")
    REGISTRY.write_text("\n".join(lines), encoding="utf-8")

    cl = ["# Food image credits", "", "Images fetched from Wikimedia Commons and Openverse.", ""]
    for c in credits:
        cl.append(f"- **{c['id']}** — [{c['title']}]({c['page']}) — {c['artist']} ({c['license']}) via {c['source']}")
    cl.append("")
    CREDITS.write_text("\n".join(cl), encoding="utf-8")

    print(f"\nDONE registry={len(registry)} failures={len(failures)}")
    if failures:
        print("failed ids:", ", ".join(failures))
    return 0


if __name__ == "__main__":
    sys.exit(main())

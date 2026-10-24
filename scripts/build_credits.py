#!/usr/bin/env python3
"""Rebuild public/images/CREDITS.md (and credits.json) from download logs + registry.

Download logs record the source file title for every image; this script batches the
title -> (artist, license, page) lookup against the Wikimedia Commons API.
"""

import glob
import json
import re
import sys
import time
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

import download_food_images as dfi  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FOODS_DIR = ROOT / "public" / "images" / "foods"
CREDITS_MD = ROOT / "public" / "images" / "CREDITS.md"
CREDITS_JSON = ROOT / "public" / "images" / "credits.json"
LOG_GLOBS = ["/tmp/opencode/images.log", "/tmp/opencode/images2.log", "/tmp/opencode/images3.log",
             "/tmp/opencode/images4.log", "/tmp/opencode/images5.log"]
COMMONS = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "FoodieBangladesh/1.0 (credits builder)"}

ID_LINE = re.compile(r"^\[\d+/\d+\]\s+(\S+)\s")
HIT_LINE = re.compile(r"^\s+(commons|openverse) hit:\s+(.*?)(?:\s+\(q=.*\))?\s*$")


def parse_logs():
    found = {}
    for path in LOG_GLOBS:
        p = Path(path)
        if not p.exists():
            continue
        current = None
        for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
            m = ID_LINE.match(line)
            if m:
                current = m.group(1)
                continue
            h = HIT_LINE.match(line)
            if h and current and current not in found:
                source = h.group(1)
                title = h.group(2).strip()
                if source == "commons" and not title.startswith("File:"):
                    title = f"File:{title}"
                found[current] = {"source": source, "title": title}
    return found


def commons_metadata(titles):
    meta = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i : i + 40]
        params = {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "titles": "|".join(chunk),
            "prop": "imageinfo",
            "iiprop": "url|extmetadata",
        }
        for attempt in range(3):
            r = requests.get(COMMONS, params=params, headers=HEADERS, timeout=30)
            if r.status_code == 429:
                time.sleep(20 * (attempt + 1))
                continue
            r.raise_for_status()
            break
        else:
            continue
        for page in (r.json().get("query") or {}).get("pages", []):
            title = page.get("title")
            info = (page.get("imageinfo") or [{}])[0]
            em = info.get("extmetadata") or {}

            def val(key):
                raw = (em.get(key) or {}).get("value", "") or ""
                return re.sub("<[^>]+>", "", raw).strip()

            meta[title] = {
                "page": info.get("descriptionurl", ""),
                "artist": val("Artist"),
                "license": val("LicenseShortName"),
            }
        time.sleep(2)
    return meta


def process_bytes(content):
    img = Image.open(BytesIO(content)).convert("RGB")
    img.thumbnail((dfi.MAX_SIDE, dfi.MAX_SIDE), Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, "JPEG", quality=dfi.JPEG_QUALITY, optimize=True, progressive=True)
    return buf.getvalue()


def fingerprint(content):
    img = Image.open(BytesIO(content)).convert("L").resize((16, 16), Image.LANCZOS)
    return list(img.getdata())


def fingerprint_diff(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def fetch_retry(url, attempts=3):
    for attempt in range(attempts):
        r = requests.get(url, headers=dfi.HEADERS, timeout=60)
        if r.status_code == 429:
            time.sleep(10 * (attempt + 1))
            continue
        if r.status_code == 200:
            return r.content
        time.sleep(4)
    return None


def resolve_missing(entries):
    """For entries without a source title, find the matching source by perceptual match."""
    names = dict(dfi.parse_foods())
    used_titles = {e["title"] for e in entries if e["title"]}
    todo = [e for e in entries if not e["license"]]
    # cheap path first: entries that already know their Commons file title
    for entry in list(todo):
        title = entry.get("title") or ""
        if title.startswith("File:"):
            m = commons_metadata([title]).get(title, {})
            if m.get("license"):
                entry.update(
                    page=m.get("page", ""),
                    artist=m.get("artist", ""),
                    license=m["license"],
                    source="Wikimedia Commons",
                )
                print(f"  {entry['id']}: resolved by title {title}")
                todo.remove(entry)
    print(f"resolving {len(todo)} unmatched credits")
    print(f"searching for {len(todo)} remaining")
    for entry in todo:
        food_id = entry["id"]
        local = FOODS_DIR / f"{food_id}.jpg"
        if not local.exists():
            continue
        target = fingerprint(local.read_bytes())
        name_en = names.get(food_id, food_id)
        best = None
        for query in dfi.queries_for(food_id, name_en)[:3]:
            time.sleep(1.2)
            candidates = dfi.commons_search(query)
            if not candidates:
                continue
            for cand in candidates:
                if cand["title"] in used_titles:
                    continue
                content = fetch_retry(cand["url"])
                if not content:
                    continue
                diff = fingerprint_diff(target, fingerprint(content))
                if diff < 10 and (best is None or diff < best[0]):
                    best = (diff, cand)
            if best and best[0] < 4:
                break
        if best:
            cand = best[1]
            entry.update(
                title=cand["title"],
                page=cand["page"],
                artist=cand["artist"],
                license=cand["license"],
                source="Wikimedia Commons",
            )
            used_titles.add(cand["title"])
            print(f"  {food_id}: matched {cand['title']} (diff {best[0]:.1f})")
        else:
            print(f"  {food_id}: no match")
    return entries


def main():
    found = parse_logs()
    have = {p.stem for p in FOODS_DIR.glob("*.jpg")}
    plain_titles = [v["title"] for k, v in found.items() if v["source"] == "commons"]
    meta = commons_metadata(sorted(set(plain_titles)))

    entries = []
    for food_id in sorted(have):
        info = found.get(food_id)
        if not info:
            entries.append({"id": food_id, "title": "", "page": "", "artist": "", "license": "",
                            "source": "Wikimedia Commons"})
            continue
        if info["source"] == "commons":
            m = meta.get(info["title"], {})
            entries.append({
                "id": food_id,
                "title": info["title"],
                "page": m.get("page", ""),
                "artist": m.get("artist", ""),
                "license": m.get("license", ""),
                "source": "Wikimedia Commons",
            })
        else:
            entries.append({
                "id": food_id,
                "title": info["title"],
                "page": "",
                "artist": "",
                "license": "",
                "source": "Openverse",
            })

    entries = resolve_missing(entries)

    CREDITS_JSON.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Food image credits",
        "",
        "সব ছবি Wikimedia Commons ও Openverse থেকে সংগৃহীত, এবং দেখানোর জন্য ছোট (সর্বোচ্চ ১৪০০px) করে নেওয়া হয়েছে।",
        "নিচে প্রতিটি ফাইলের উৎস তালিকাভুক্ত করা হয়েছে (যেখানে লাইসেন্স পাওয়া গেছে)।",
        "",
        "| Food id | Source file | Author | License |",
        "| --- | --- | --- | --- |",
    ]
    for e in entries:
        title = f"[{e['title']}]({e['page']})" if e["page"] else (e["title"] or "—")
        artist = e["artist"] or "—"
        license_ = e["license"] or "—"
        lines.append(f"| `{e['id']}` | {title} | {artist} | {license_} |")
    lines.append("")
    lines.append(f"Total images: {len(entries)}")
    CREDITS_MD.write_text("\n".join(lines), encoding="utf-8")
    resolved = sum(1 for e in entries if e["license"])
    print(f"credits entries: {len(entries)}, licenses resolved: {resolved}")


if __name__ == "__main__":
    main()

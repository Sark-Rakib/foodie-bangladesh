#!/usr/bin/env python3
"""Generate the static Open Graph image (1200x630) for Foodie Bangladesh."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-image.png"
FOODS_DIR = ROOT / "public" / "images" / "foods"

CREAM = (250, 247, 240)
FOREST = (23, 63, 53)
FOREST_DEEP = (14, 42, 35)
TERRACOTTA = (198, 93, 58)
MUSTARD = (216, 169, 71)
INK = (36, 37, 32)
MUTED = (130, 127, 117)

SERIF_BN = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
SANS_BN = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
SANS_BN_SEMI = "/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf"
SERIF_EN = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"

W, H = 1200, 630
PRIORITY = ["kacchi-biryani", "ilish-bhapa", "bhapa-pitha", "fuchka", "chingri-malaikari", "bogura-doi"]


def font(path, size):
    return ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.RAQM)


def fill_crop(path, size):
    img = Image.open(path).convert("RGB")
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (img.width - tw) // 2
    top = (img.height - th) // 2
    return img.crop((left, top, left + tw, top + th))


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, img.width, img.height), radius=radius, fill=255)
    out = Image.new("RGB", img.size)
    out.paste(img, (0, 0), mask)
    return out, mask


def main():
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # subtle paper texture: soft dots
    for y in range(0, H, 26):
        for x in range(0, W, 26):
            if (x * 7 + y * 13) % 78 == 0:
                draw.ellipse((x, y, x + 2, y + 2), fill=(238, 232, 219))

    # right panel
    panel = (655, 40, W - 40, H - 40)
    draw.rounded_rectangle(panel, radius=34, fill=FOREST)
    draw.ellipse((W - 190, 8, W + 40, 238), fill=MUSTARD)
    draw.ellipse((-70, H - 150, 90, H + 10), fill=TERRACOTTA)

    picks = [FOODS_DIR / f"{fid}.jpg" for fid in PRIORITY]
    picks = [p for p in picks if p.exists()][:3]
    if picks:
        box_w, box_h = 190, 250
        positions = [(725, 92), (935, 92), (830, 372)]
        for path, (x, y) in zip(picks, positions):
            img = fill_crop(path, (box_w, box_h))
            img, mask = rounded(img, 22)
            canvas.paste(img, (x, y), mask)
            draw.rounded_rectangle((x, y, x + box_w, y + box_h), radius=22, outline=CREAM, width=4)

    # left content
    x = 72
    draw.rounded_rectangle((x, 68, x + 46, 74), radius=3, fill=TERRACOTTA)
    draw.text((x, 92), "বাংলাদেশের খাবারের গল্প", font=font(SANS_BN, 26), fill=FOREST)
    draw.text((x, 142), "এক দেশ,", font=font(SERIF_BN, 82), fill=FOREST)
    draw.text((x, 236), "এক বিশাল থালা", font=font(SERIF_BN, 82), fill=FOREST)

    draw.text(
        (x, 358),
        "১০০+ ঐতিহ্যবাহী খাবার · ৮ বিভাগ",
        font=font(SANS_BN, 29),
        fill=INK,
    )
    draw.text(
        (x, 402),
        "কাচ্চি থেকে ভাপা পিঠা, চুইঝাল থেকে বগুড়ার দই",
        font=font(SANS_BN, 24),
        fill=MUTED,
    )

    draw.text((x, 486), "খেয়েছেন কতগুলো?", font=font(SANS_BN_SEMI, 28), fill=TERRACOTTA)

    # brand row
    draw.ellipse((x, 545, x + 42, 587), fill=FOREST)
    draw.text((x + 21, 566), "ফ", font=font(SERIF_BN, 24), fill=MUSTARD, anchor="mm")
    draw.text((x + 56, 542), "ফুডি বাংলাদেশ", font=font(SERIF_BN, 27), fill=FOREST)
    draw.text((x + 56, 578), "FOODIE BANGLADESH", font=font(SERIF_EN, 15), fill=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)
    print(f"saved {OUT} ({canvas.size[0]}x{canvas.size[1]}) with {len(picks)} photos")


if __name__ == "__main__":
    main()

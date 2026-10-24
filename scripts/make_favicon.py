#!/usr/bin/env python3
"""Generate the Foodie Bangladesh favicon + app icons.

Design: a forest-green plate with a terracotta location pin. The pin's hole
holds a mustard "grain" dot, tying together the map-location idea with food.
Renders cleanly at 16px because it is only three shapes.

Outputs (Next.js App Router metadata files):
  src/app/favicon.ico     (16/32/48, multi-size ICO)
  src/app/icon.png        (512, general purpose)
  src/app/apple-icon.png  (180, Apple touch icon)
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src" / "app"

CREAM = (250, 247, 240, 255)
FOREST = (23, 63, 53, 255)
FOREST_DEEP = (14, 42, 35, 255)
TERRACOTTA = (198, 93, 58, 255)
MUSTARD = (216, 169, 71, 255)

SS = 8  # supersample factor for crisp edges


def draw_icon(size):
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    pad = s * 0.055
    # Forest plate / badge
    d.ellipse((pad, pad, s - pad, s - pad), fill=FOREST)
    # Inner ring accent
    ring = s * 0.135
    d.ellipse((pad + ring, pad + ring, s - pad - ring, s - pad - ring), fill=FOREST_DEEP)

    # Terracotta location pin (teardrop): circle head + tapered triangle tail
    cx = s * 0.5
    head_r = s * 0.235
    head_cy = s * 0.42
    d.ellipse((cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r), fill=TERRACOTTA)

    tail_half = head_r * 0.72
    tip_y = s * 0.79
    d.polygon(
        [
            (cx - tail_half, head_cy + head_r * 0.35),
            (cx + tail_half, head_cy + head_r * 0.35),
            (cx, tip_y),
        ],
        fill=TERRACOTTA,
    )

    # Mustard grain in the pin hole
    hole_r = head_r * 0.42
    d.ellipse(
        (cx - hole_r, head_cy - hole_r, cx + hole_r, head_cy + hole_r),
        fill=MUSTARD,
    )

    return img.resize((size, size), Image.LANCZOS)


def main():
    APP.mkdir(parents=True, exist_ok=True)

    icon512 = draw_icon(512)
    icon512.save(APP / "icon.png", "PNG", optimize=True)

    apple = draw_icon(180)
    apple.save(APP / "apple-icon.png", "PNG", optimize=True)

    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    base = draw_icon(64)
    base.save(APP / "favicon.ico", format="ICO", sizes=ico_sizes)

    print("wrote src/app/favicon.ico, src/app/icon.png, src/app/apple-icon.png")


if __name__ == "__main__":
    main()

"""Frames raw phone screenshots into Play Store and App Store images with a headline.

Usage: python3 scripts/store-screenshots.py
Reads app-screenshots/, writes assets/store/play-phone/ and assets/store/apple-6.9/.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "app-screenshots"
# Play caps phone shots at 2:1 (so 9:16); App Store wants the 6.9" iPhone size.
TARGETS = {"play-phone": (1080, 1920), "apple-6.9": (1320, 2868)}
BG, INK, GOLD = (247, 243, 234), (34, 64, 44), (176, 141, 72)
FONT_PATH = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

SHOTS = [
    ("IMG_4971.PNG", "16,546 hadith in\nArabic & English"),
    ("IMG_4972.PNG", "The complete\n66-book collection"),
    ("IMG_4973.PNG", "Search the\nwhole collection"),
    ("IMG_4974.PNG", "Read every hadith\nin Bangla"),
    ("IMG_4975.PNG", "Save the hadith\nthat matter"),
    ("IMG_4976.PNG", "Every book as\nPDF or Word"),
    ("IMG_4977.PNG", "Easy on the eyes,\nday or night"),
]


def frame(src, headline, W, H):
    k = W / 1080
    font = ImageFont.truetype(FONT_PATH, round(78 * k))
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    y = 110 * k * H / W / (1920 / 1080)
    for line in headline.split("\n"):  # ponytail: hand-broken lines, every headline is 2 lines
        draw.text((W / 2, y), line, font=font, fill=INK, anchor="mt")
        y += 96 * k
    draw.rounded_rectangle((W / 2 - 40 * k, y + 14 * k, W / 2 + 40 * k, y + 20 * k), 3, fill=GOLD)
    y = round(y)

    shot_h = H - (y + round(70 * k)) - round(60 * k)
    shot = Image.open(src).convert("RGB")
    shot = shot.resize((round(shot.width * shot_h / shot.height), shot_h), Image.LANCZOS)
    x, top = (W - shot.width) // 2, y + round(70 * k)

    mask = Image.new("L", shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *shot.size), 44, fill=255)
    shadow = Image.new("L", (W, H), 0)
    shadow.paste(mask, (x, top + 16))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28)).point(lambda v: v * 0.35)
    canvas.paste((60, 50, 30), (0, 0), shadow)
    canvas.paste(shot, (x, top), mask)
    draw.rounded_rectangle((x, top, x + shot.width, top + shot_h), 44, outline=(214, 205, 186), width=3)
    return canvas


if __name__ == "__main__":
    for folder, (W, H) in TARGETS.items():
        out_dir = ROOT / "assets/store" / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        for i, (name, headline) in enumerate(SHOTS, 1):
            out = out_dir / f"{i:02d}.png"
            frame(SRC / name, headline, W, H).save(out, optimize=True)
            assert Image.open(out).size == (W, H)
            print(out.relative_to(ROOT))

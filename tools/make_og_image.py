"""Generate og-cover.png — the 1200x630 card LinkedIn, Slack and X show when
someone shares the portfolio link.

    python tools/make_og_image.py

Writes og-cover.png to the repo root. Re-run after changing your headline or
stats. Requires Pillow only:  pip install pillow
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "og-cover.png"

W, H = 1200, 630

BG = (13, 11, 10)
PANEL = (21, 17, 16)
GRID = (32, 26, 23)
RULE = (58, 47, 42)
TEXT = (245, 245, 244)
MUTED = (168, 162, 158)
FAINT = (120, 113, 108)
ACCENT = (201, 114, 79)
ACCENT_BRIGHT = (224, 144, 108)
GREEN = (74, 222, 128)

# Windows font paths, with a Linux fallback so this still runs in CI.
FONT_CANDIDATES = {
    "bold": ["C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"],
    "regular": ["C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"],
    "mono": ["C:/Windows/Fonts/consola.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"],
    "mono_bold": ["C:/Windows/Fonts/consolab.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"],
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES[kind]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    print(f"warning: no font found for '{kind}', falling back to default", file=sys.stderr)
    return ImageFont.load_default()


def rounded(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def build() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Faint engineering grid, same motif as the site background.
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=GRID)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=GRID)

    # Accent bar down the left edge.
    d.rectangle([0, 0, 8, H], fill=ACCENT)

    pad = 72

    # Availability pill
    pill = [pad, 64, pad + 470, 106]
    rounded(d, pill, 21, fill=(28, 21, 18), outline=(90, 60, 45))
    d.ellipse([pad + 20, 79, pad + 32, 91], fill=GREEN)
    d.text((pad + 44, 76), "OPEN TO MASTER THESIS 2027 + FULL-TIME AI ROLES",
           font=font("mono", 15), fill=ACCENT_BRIGHT)

    # Name
    d.text((pad, 138), "HARSHIT PODDAR", font=font("bold", 82), fill=TEXT)

    # Role line
    d.text((pad, 236), "AI Engineer  ·  Agentic AI  ·  Machine Learning",
           font=font("regular", 34), fill=ACCENT_BRIGHT)

    d.line([(pad, 296), (W - pad, 296)], fill=RULE, width=1)

    # Positioning line
    d.text((pad, 322),
           "Agentic LLM orchestration, state-space models and computer vision.",
           font=font("regular", 25), fill=MUTED)
    d.text((pad, 358),
           "M.Sc. Machine Learning, KTH Royal Institute of Technology, Stockholm.",
           font=font("regular", 25), fill=MUTED)

    # Stat tiles
    stats = [
        ("91.05%", "mAP@0.5 · LungMate"),
        ("15+", "publications"),
        ("2", "patents"),
        ("6", "research roles"),
    ]
    tile_w, gap = 246, 16
    top, bottom = 424, 524
    for i, (value, label) in enumerate(stats):
        x = pad + i * (tile_w + gap)
        rounded(d, [x, top, x + tile_w, bottom], 10, fill=PANEL, outline=RULE)
        d.text((x + 20, top + 18), value, font=font("mono_bold", 34), fill=ACCENT_BRIGHT)
        d.text((x + 20, top + 64), label, font=font("mono", 15), fill=FAINT)

    # Footer
    d.text((pad, 560), "harshit-poddar90.github.io", font=font("mono", 21), fill=MUTED)

    handle = "github.com/Harshit-Poddar90"
    f = font("mono", 19)
    right = W - pad - d.textlength(handle, font=f)
    d.text((right, 562), handle, font=f, fill=FAINT)

    return img


if __name__ == "__main__":
    build().save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT}  ({OUT.stat().st_size / 1024:.0f} KB, {W}x{H})")

#!/usr/bin/env python3
"""Dominant colours of reference images, as a starting point for tokens.css.

    python3 tools/extract_palette.py ../templates/ref1.png ../templates/ref2.jpg [--n 8]

Prints hex colours with their share of pixels, plus light/dark hints. A starting point
only: pick token values by meaning (background, text, accent, state), not by frequency.
Needs Pillow.
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow missing: .venv/bin/pip install pillow")


def lum(rgb):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def main():
    files = [a for a in sys.argv[1:] if not a.startswith("--")]
    n = 8
    if "--n" in sys.argv:
        n = int(sys.argv[sys.argv.index("--n") + 1])
        files = [f for f in files if f != str(n)]
    if not files:
        sys.exit(__doc__)
    for f in files:
        img = Image.open(f).convert("RGB")
        img.thumbnail((400, 400))
        q = img.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette()[: n * 3]
        counts = sorted(q.getcolors(), reverse=True)
        total = sum(c for c, _ in counts)
        print(f"# {Path(f).name}")
        for c, idx in counts:
            rgb = tuple(pal[idx * 3: idx * 3 + 3])
            L = lum(rgb)
            tone = "light" if L > 0.6 else "dark" if L < 0.08 else "mid"
            print(f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}  {100 * c / total:5.1f}%  {tone}")
        print()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""PDF pages to PNG, to check an exported PDF or render template pages.

    python3 tools/pdf_to_png.py export/Deck.pdf out/check/p [--width 2400]
      -> out/check/p-1.png, p-2.png, ...

Uses PyMuPDF (pip install pymupdf) if present, else poppler's pdftoppm.
"""
import shutil
import subprocess
import sys
from pathlib import Path


def render(pdf, prefix, width=2400):
    pdf, prefix = Path(pdf), Path(prefix)
    prefix.parent.mkdir(parents=True, exist_ok=True)
    out = []
    try:
        try:
            import pymupdf as fitz
        except ImportError:
            import fitz  # PyMuPDF, older name

        doc = fitz.open(pdf)
        for i, page in enumerate(doc, 1):
            zoom = width / page.rect.width
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            f = Path(f"{prefix}-{i}.png")
            pix.save(f)
            out.append(f)
        return out
    except ImportError:
        pass
    if shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-png", "-scale-to-x", str(width), "-scale-to-y", "-1", str(pdf), str(prefix)], check=True)
        # pdftoppm pads page numbers (p-01.png); normalise to p-1.png
        for f in sorted(prefix.parent.glob(prefix.name + "-*.png")):
            n = int(f.stem.rsplit("-", 1)[1])
            g = Path(f"{prefix}-{n}.png")
            if f != g:
                f.replace(g)
            out.append(g)
        return sorted(out, key=lambda p: int(p.stem.rsplit("-", 1)[1]))
    sys.exit("need PyMuPDF (.venv/bin/pip install pymupdf) or poppler (pdftoppm)")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    width = 2400
    if "--width" in sys.argv:
        width = int(sys.argv[sys.argv.index("--width") + 1])
        args = [a for a in args if a != str(width)]
    if len(args) < 2:
        sys.exit(__doc__)
    for f in render(args[0], args[1], width):
        print(f)

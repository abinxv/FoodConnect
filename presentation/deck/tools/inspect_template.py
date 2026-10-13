#!/usr/bin/env python3
"""Describe a .pptx / .potx template so the deck can fill it without restyling it.

    .venv/bin/python tools/inspect_template.py ../templates/X.pptx [--canvas 1920] [--render]

Prints, per template page: every shape with its name, kind, placeholder idx, position
(inches and slide px at the canvas width) and first line of text, then a guess at the
header / footer chrome, the fillable fields, the instruction ("pointer") boxes, and a
suggested content zone and export band for deck.json. Guesses only: look at the pages.

--render also writes out/template/page-<n>.png so you can look at each page.
A .potx is converted to out/template/<name>.pptx first (python-pptx only opens .pptx);
point deck.json template.path at that copy.
"""
import json
import shutil
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DECK = HERE.parent
ROOT = DECK.parent

try:
    from pptx import Presentation
    from pptx.util import Emu
except ImportError:
    sys.exit("python-pptx missing: .venv/bin/pip install python-pptx")

EMU_IN = 914400


def potx_to_pptx(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(src) as zi, zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zo:
        for item in zi.infolist():
            data = zi.read(item.filename)
            if item.filename == "[Content_Types].xml":
                data = data.replace(b"presentationml.template.main+xml", b"presentationml.presentation.main+xml")
            zo.writestr(item, data)
    return dst


def kind(s):
    if s.is_placeholder:
        return f"placeholder:{s.placeholder_format.type}".replace("PP_PLACEHOLDER.", "").lower()
    try:
        return str(s.shape_type).split(".")[-1].split(" ")[0].lower()
    except Exception:
        return "shape"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    src = Path(args[0]).resolve()
    canvas = 1920
    if "--canvas" in sys.argv:
        canvas = int(sys.argv[sys.argv.index("--canvas") + 1])
    work = DECK / "out" / "template"
    work.mkdir(parents=True, exist_ok=True)
    path = src
    if src.suffix.lower() == ".potx":
        path = potx_to_pptx(src, work / (src.stem + ".pptx"))
        print(f"converted .potx -> {path.relative_to(ROOT)} (use this path in deck.json)\n")
    prs = Presentation(str(path))
    SW, SH = prs.slide_width, prs.slide_height
    px = canvas / SW
    canvas_h = round(SH * px)
    print(f"# Template {src.name}")
    print(f"size {SW / EMU_IN:.3f} x {SH / EMU_IN:.3f} in, {len(prs.slides)} pages; canvas {canvas} x {canvas_h} px "
          f"({canvas / (SW / EMU_IN):.0f} px per inch)\n")
    report = {"file": str(path), "width_in": SW / EMU_IN, "height_in": SH / EMU_IN, "canvas": [canvas, canvas_h], "pages": []}
    header_bottoms, footer_tops, lefts, rights = [], [], [], []
    for n, slide in enumerate(prs.slides, 1):
        page = {"page": n, "layout": slide.slide_layout.name, "shapes": []}
        print(f"## page {n}  (layout: {slide.slide_layout.name})")
        for s in slide.shapes:
            if s.left is None:
                continue
            x, y, w, h = s.left, s.top, s.width, s.height
            text = s.text_frame.text.strip().replace("\n", " / ") if s.has_text_frame else ""
            role = ""
            top_frac, bot_frac = y / SH, (y + h) / SH
            area = (w * h) / (SW * SH)
            if area > 0.6:
                role = "BACKGROUND-SIZED (would hide a picture placed behind it)"
            elif bot_frac <= 0.22:
                role = "header"
                header_bottoms.append(y + h)
            elif top_frac >= 0.85:
                role = "footer"
                footer_tops.append(y)
            elif s.has_text_frame and area > 0.08:
                role = "content box (instruction / pointer text?)"
            if role in ("header", "footer"):
                lefts.append(x)
                rights.append(x + w)
            rec = {
                "name": s.name, "kind": kind(s), "role": role,
                "ph_idx": s.placeholder_format.idx if s.is_placeholder else None,
                "in": [round(v / EMU_IN, 3) for v in (x, y, w, h)],
                "px": [round(v * px) for v in (x, y, w, h)],
                "text": text[:140],
            }
            page["shapes"].append(rec)
            ph = f" ph:{rec['ph_idx']}" if rec["ph_idx"] is not None else ""
            print(f"- '{s.name}' [{rec['kind']}{ph}] px {rec['px']} {role and '(' + role + ')'}"
                  + (f"\n    text: {text[:140]}" if text else ""))
        report["pages"].append(page)
        print()

    # suggestion
    hb = max(header_bottoms) if header_bottoms else int(SH * 0.12)
    ft = min(footer_tops) if footer_tops else int(SH * 0.93)
    gap = int(0.05 * EMU_IN)
    margin = int(0.3 * EMU_IN)
    zone = [round(margin * px), round((hb + gap) * px), round((SW - 2 * margin) * px), round((ft - hb - 2 * gap) * px)]
    band = [0, round((hb + gap) * px), canvas, round((ft - hb - gap) * px)]
    report["suggested"] = {"zone": zone, "band": band}
    print("## Suggested geometry (check against the rendered pages)")
    print(f"header ends ~{hb / EMU_IN:.2f} in, footer starts ~{ft / EMU_IN:.2f} in")
    print(f"zone (keep text inside): {','.join(map(str, zone))}")
    print(f"band (renders may bleed): {','.join(map(str, band))}")
    print("apply: node <skill>/scripts/scaffold.mjs --root .. --update-json "
          f"--canvas {canvas}x{canvas_h} --zone {','.join(map(str, zone))} --band {','.join(map(str, band))}")
    (work / "template.json").write_text(json.dumps(report, indent=2))
    print(f"\nfull JSON: {(work / 'template.json').relative_to(ROOT)}")

    if "--render" in sys.argv:
        sys.path.insert(0, str(HERE))
        from build_deck import to_pdf
        from pdf_to_png import render
        pdf = to_pdf(path, work)
        pngs = render(pdf, work / "page", width=canvas)
        print("rendered: " + ", ".join(str(p.relative_to(ROOT)) for p in pngs))


if __name__ == "__main__":
    main()

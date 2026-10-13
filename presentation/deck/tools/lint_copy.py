#!/usr/bin/env python3
"""Check slide copy and layout against the writing rules. Lives in deck/tools/.

    python3 tools/lint_copy.py            every slide that has a dump in out/text/
    python3 tools/lint_copy.py s2 s3      only these
    python3 tools/lint_copy.py --text "Fast. Reliable. Ready."    lint a string (planned copy)
    python3 <skill>/scripts/lint_copy.py --root <project> --text "..."   before deck/ exists

Reads out/text/<id>.json (written by export.mjs), deck.json, and the project's banned
phrases from ../agent_guide.md: a fenced block that starts with ```lint-banned, one phrase
per line (case-insensitive), or `re: <regex>` for a pattern. `#` lines are comments.

ERROR = breaks a rule. WARN = heuristic, look at it and decide. Exit code 1 if any ERROR.
Standard library only.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DECK = HERE.parent
ROOT = DECK.parent

# ---------- rule data ----------
BUZZ = [
    "leverage", "leverages", "leveraging", "cutting-edge", "cutting edge", "state-of-the-art", "state of the art",
    "world-class", "best-in-class", "next-gen", "next generation", "seamless", "seamlessly", "effortless",
    "effortlessly", "empower", "empowers", "empowering", "unlock", "unlocks", "unleash", "harness", "synergy",
    "synergies", "revolutionary", "revolutionize", "revolutionise", "game-changer", "game changer",
    "game-changing", "disruptive", "reimagine", "reimagined", "supercharge", "supercharged",
    "transformative", "holistic", "robust and scalable", "one-stop", "paradigm shift", "journey",
    "smart solution", "innovative solution", "powerful", "unparalleled", "unprecedented", "groundbreaking",
    "breakthrough", "futuristic",
]
DRAMA = [
    "blazing", "blazingly", "lightning", "lightning-fast", "rock-solid", "rock solid", "bulletproof",
    "stunning", "incredible", "incredibly", "amazing", "insane", "insanely", "massive", "massively",
    "huge", "mind-blowing", "jaw-dropping", "crushes", "dramatically", "radically", "super fast",
    "ultra", "never fails", "always works", "zero effort",
]
CLAIMS = [
    r"\b\d{1,3}\s?%\s?(done|complete|completed|finished|ready|built)\b",
    r"\b(fully|completely|100%)\s+(working|functional|built|done|operational|complete)\b",
    r"\bproduction[- ]ready\b",
    r"\b(works|working|runs|running)\s+end[- ]to[- ]end\b",
    r"\bprototype\s+(is\s+)?(working|ready|complete)\b",
    r"\bready to deploy\b",
]
NOT_CONTRAST = [
    (r",\s*not\s+(a|an|the|just|only)?\s*\w+", "“X, not Y” construction"),
    (r"\bnot\s+(just|only|merely|simply)\b", "“not just / not only” construction"),
    (r"\bnot\s+\w+(\s+\w+){0,5}\s*,?\s+but\s+", "“not X but Y” construction"),
    (r"^(no|not)\s+\w+[.,]?\s+(just\s+)?\w+\.?$", "short negation slogan"),
    (r"\b(rather than|instead of)\b", "contrast phrase (fine in a comparison, not as a slogan)"),
]
# (american, british) pairs: unambiguous ones only
SPELL = [
    ("color", "colour"), ("colors", "colours"), ("colored", "coloured"), ("colorful", "colourful"),
    ("favorite", "favourite"), ("behavior", "behaviour"), ("behaviors", "behaviours"), ("center", "centre"),
    ("centers", "centres"), ("centered", "centred"), ("gray", "grey"), ("defense", "defence"),
    ("fiber", "fibre"), ("liter", "litre"), ("liters", "litres"), ("modeling", "modelling"),
    ("modeled", "modelled"), ("traveled", "travelled"), ("traveling", "travelling"), ("labeled", "labelled"),
    ("labeling", "labelling"), ("canceled", "cancelled"), ("aluminum", "aluminium"), ("neighbor", "neighbour"),
    ("neighbors", "neighbours"), ("neighborhood", "neighbourhood"), ("honor", "honour"), ("labor", "labour"),
    ("fueled", "fuelled"), ("signaling", "signalling"), ("kilometer", "kilometre"), ("kilometers", "kilometres"),
]
WORD_RE = re.compile(r"[\w][\w'’.,%/+-]*", re.U)


def load_deck():
    p = DECK / "deck.json"
    if p.exists():
        return json.loads(p.read_text())
    cfg = ROOT / "deck.config.yaml"  # before scaffold: take english_style from the config
    if cfg.exists():
        m = re.search(r"^\s*english_style:\s*([a-zA-Z]+)", cfg.read_text(), re.M)
        if m:
            return {"english_style": m.group(1)}
    return {}


def load_banned():
    g = ROOT / "agent_guide.md"
    if not g.exists():
        return []
    txt = g.read_text(errors="ignore")
    out = []
    for block in re.findall(r"```lint-banned\s*\n(.*?)```", txt, re.S):
        for line in block.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("re:"):
                out.append((re.compile(line[3:].strip(), re.I), line[3:].strip()))
            else:
                out.append((re.compile(r"(?<!\w)" + re.escape(line) + r"(?!\w)", re.I), line))
    return out


def has_word(text, w):
    return re.search(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", text, re.I)


def lint_text(text, size=None, deck=None, banned=()):
    """Return a list of (level, rule, message) for one block of text."""
    deck = deck or {}
    res = []
    t = text.strip()
    if not t:
        return res
    if "—" in t or "―" in t or re.search(r"\s--\s", t):
        res.append(("ERROR", "em-dash", "em dash (use a comma, colon, full stop or brackets)"))
    if re.search(r"\s–\s", t) and not re.search(r"\d\s–\s\d", t):
        res.append(("WARN", "spaced-en-dash", "spaced en dash reads as an em dash; en dash only for ranges like 4–6"))
    if re.match(r"^\s*[•·▪◦‣●○■►▸\-*]\s+", t):
        res.append(("ERROR", "bullet", "bullet point (use numbered steps, wired rows, tables or chips)"))
    if "!" in t:
        res.append(("WARN", "exclaim", "exclamation mark: dramatic tone"))
    if t.endswith("?") and len(t.split()) > 2:
        res.append(("WARN", "question", "question as copy: rhetorical questions read as marketing"))
    for pat, why in NOT_CONTRAST:
        if re.search(pat, t, re.I):
            level = "WARN"
            res.append((level, "not-contrast", why))
            break
    for w in BUZZ:
        if has_word(t, w):
            res.append(("WARN", "buzzword", f"“{w}”: marketing word, state the fact or number"))
    for w in DRAMA:
        if has_word(t, w):
            res.append(("WARN", "dramatic", f"“{w}”: dramatic word, give the number instead"))
    for pat in CLAIMS:
        m = re.search(pat, t, re.I)
        if m:
            res.append(("ERROR", "completion-claim", f"“{m.group(0)}”: completion claim; quote what was measured instead"))
    # tricolon slogan: "Fast. Reliable. Ready."
    if re.fullmatch(r"(?:[\w'-]+\.\s*){2,4}", t) and len(t.split()) <= 4:
        res.append(("WARN", "slogan", "one-word sentences in a row: slogan pattern"))
    # headline-y: big Title Case phrase without a number
    words = t.split()
    if size and size >= 26 and 2 <= len(words) <= 8 and not re.search(r"\d", t):
        caps = [w for w in words if w[:1].isupper()]
        small = {"a", "an", "the", "of", "and", "or", "to", "in", "on", "for", "with", "at", "by"}
        if len(caps) >= len([w for w in words if w.lower() not in small]) and not t.endswith("."):
            res.append(("WARN", "headline", "large Title Case phrase: reads as a headline; say the fact"))
    style = (deck.get("english_style") or "neutral").lower()
    if style in ("indian", "british", "uk"):
        for us, uk in SPELL:
            if has_word(t, us):
                res.append(("WARN", "spelling", f"“{us}” is US spelling; {style} English uses “{uk}”"))
    elif style in ("american", "us"):
        for us, uk in SPELL:
            if has_word(t, uk):
                res.append(("WARN", "spelling", f"“{uk}” is UK spelling; US English uses “{us}”"))
    for rx, raw in banned:
        if rx.search(t):
            res.append(("ERROR", "project-banned", f"banned for this project: “{raw}” (agent_guide.md)"))
    return res


def lint_dump(d, deck, banned):
    rows = []
    for b in d.get("blocks", []):
        for level, rule, msg in lint_text(b["text"], b.get("size"), deck, banned):
            rows.append((level, rule, msg, b["text"]))
    if d.get("ul_items"):
        rows.append(("ERROR", "bullet", f"{d['ul_items']} <ul> list items on the slide", ""))
    budget = d.get("budget")
    if budget:
        lo, hi = budget
        w = d.get("words", 0)
        if w > hi * 1.35:
            rows.append(("ERROR", "words", f"{w} words, budget {lo}-{hi}: cut text or turn it into a diagram", ""))
        elif w > hi * 1.1:
            rows.append(("WARN", "words", f"{w} words, budget {lo}-{hi}", ""))
        elif w < lo * 0.6:
            rows.append(("WARN", "words", f"{w} words, budget {lo}-{hi}: thinner than the chosen density", ""))
    iss = d.get("issues", {})
    for x in iss.get("outside_zone", []):
        rows.append(("ERROR", "outside-zone", f"text outside the content zone at x{x['x']} y{x['y']} (mark with data-bleed only if intended)", x["text"]))
    for x in iss.get("clipped", []):
        rows.append(("ERROR", "clipped", f"text cut off or spilling out of its box at x{x['x']} y{x['y']}", x["text"]))
    for x in iss.get("collisions", []):
        rows.append(("WARN", "collision", f"text overlaps “{x['b']}”", x["a"]))
    for x in iss.get("small_text", []):
        rows.append(("WARN", "small-text", f"{x['size']} px is under the type floor {deck.get('type_floor_px', 13)} px (mark ticks with data-lint=\"off\")", x["text"]))
    for src in iss.get("broken_images", []):
        rows.append(("ERROR", "broken-image", f"image did not load: {src}", ""))
    for e in d.get("console_errors", []):
        rows.append(("WARN", "console", e[:160], ""))
    return rows


def main():
    global DECK, ROOT
    argv = sys.argv[1:]
    if "--root" in argv:
        i = argv.index("--root")
        ROOT = Path(argv[i + 1]).resolve()
        DECK = ROOT / "deck"
        argv = argv[:i] + argv[i + 2:]
    deck = load_deck()
    banned = load_banned()
    if argv[:1] == ["--text"]:
        text = " ".join(argv[1:])
        rows = lint_text(text, None, deck, banned)
        for level, rule, msg in rows:
            print(f"{level:5} {rule:16} {msg}")
        if not rows:
            print("ok")
        sys.exit(1 if any(r[0] == "ERROR" for r in rows) else 0)

    tdir = DECK / "out" / "text"
    ids = argv or [p.stem for p in sorted(tdir.glob("*.json"))]
    if not ids:
        print("no text dumps yet; run `node tools/export.mjs <id>` first")
        sys.exit(1)
    errors = 0
    for i in ids:
        p = tdir / f"{i}.json"
        if not p.exists():
            print(f"{i}: no dump (run `node tools/export.mjs {i}`)")
            errors += 1
            continue
        d = json.loads(p.read_text())
        rows = lint_dump(d, deck, banned)
        b = d.get("budget")
        head = f"{i}: {d.get('words', 0)} words" + (f" (budget {b[0]}-{b[1]})" if b else " (no word budget)")
        if not rows:
            print(f"{head}  ok")
            continue
        e = sum(r[0] == "ERROR" for r in rows)
        errors += e
        print(f"{head}  {e} errors, {len(rows) - e} warnings")
        for level, rule, msg, text in rows:
            snippet = f"  «{text[:70]}{'…' if len(text) > 70 else ''}»" if text else ""
            print(f"  {level:5} {rule:16} {msg}{snippet}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

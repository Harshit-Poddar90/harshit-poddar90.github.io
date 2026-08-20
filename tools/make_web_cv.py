"""Produce the public web copy of the CV with the phone number removed.

    python tools/make_web_cv.py "path/to/CV_full time.pdf"

Writes CV.pdf in the repo root.

Why this exists
---------------
The CV served at /CV.pdf is public. The emailed copy should carry a phone
number; the public one must not. Rather than maintaining two source documents
that drift apart, this derives the public copy from the real one.

This is true redaction, not a black box drawn on top: the glyphs are removed
from the content stream, so the number cannot be selected, copied or recovered
with a text extractor. Because PDF positions text absolutely, the remaining
header items are then translated left to close the gap, and any link
annotations on that line are moved with them.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DecodedStreamObject, FloatObject, NameObject

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "CV.pdf"

# The contact line's baseline in the source template.
HEADER_BASELINE = "748.68"
# Anything matching this is removed from the header, along with the separator
# bullet and padding immediately preceding it.
PHONE_RE = re.compile(r"\+?\d[\d\s()+-]{7,}\d")

# Matches one complete positioned text block: BT /Font size Tf … Tm … [..] TJ ET
BLOCK_RE = re.compile(
    rb"BT\s*/(\w+) ([\d.]+) Tf\s*1 0 0 1 ([\d.]+) ("
    + HEADER_BASELINE.encode()
    + rb") Tm(.*?)(\[.*?\]) TJ\s*ET",
    re.S,
)


def block_text(tj: bytes) -> str:
    """Concatenate the literal strings inside a TJ array."""
    return "".join(m.decode("latin-1") for m in re.findall(rb"\((.*?)\)", tj))


def redact(data: bytes) -> tuple[bytes, float]:
    """Return (new_stream, shift_width). shift_width is 0 if no phone found."""
    blocks = [
        {
            "span": (m.start(), m.end()),
            "x": float(m.group(3)),
            "tj_span": m.span(6),
            "text": block_text(m.group(6)),
        }
        for m in BLOCK_RE.finditer(data)
    ]

    phone_idx = next((i for i, b in enumerate(blocks) if PHONE_RE.fullmatch(b["text"].strip())), None)
    if phone_idx is None:
        return data, 0.0

    # Walk backwards over the padding and separator bullet that precede it, so
    # deleting the number does not leave a doubled separator.
    start_idx = phone_idx
    while start_idx > 0 and not blocks[start_idx - 1]["text"].strip().isalnum():
        if blocks[start_idx - 1]["text"].strip() == "":
            start_idx -= 1
        elif len(blocks[start_idx - 1]["text"].strip()) == 1:  # the bullet glyph
            start_idx -= 1
        else:
            break

    # Walk forward over trailing padding up to (not including) the next bullet.
    end_idx = phone_idx
    while end_idx + 1 < len(blocks) and blocks[end_idx + 1]["text"].strip() == "":
        end_idx += 1

    doomed = blocks[start_idx : end_idx + 1]
    survivors = blocks[end_idx + 1 :]
    if not survivors:
        return data, 0.0

    shift = survivors[0]["x"] - doomed[0]["x"]

    # Apply edits from the end of the stream backwards so earlier offsets stay valid.
    edits: list[tuple[int, int, bytes]] = []
    for b in doomed:
        edits.append((*b["tj_span"], b"[()]"))
    for b in survivors:
        old = f"1 0 0 1 {b['x']:g} {HEADER_BASELINE} Tm".encode()
        new = f"1 0 0 1 {b['x'] - shift:.2f} {HEADER_BASELINE} Tm".encode()
        at = data.find(old, b["span"][0], b["span"][1])
        if at != -1:
            edits.append((at, at + len(old), new))

    for start, end, replacement in sorted(edits, key=lambda e: -e[0]):
        data = data[:start] + replacement + data[end:]

    return data, shift


def shift_annotations(page, shift: float) -> int:
    """Move link rectangles that sit on the header baseline."""
    moved = 0
    for annot in page.get("/Annots", []) or []:
        obj = annot.get_object()
        rect = obj.get("/Rect")
        if not rect:
            continue
        x0, y0, x1, y1 = (float(v) for v in rect)
        # Only the contact line; leave body links alone.
        if not (float(HEADER_BASELINE) - 4 <= y0 <= float(HEADER_BASELINE) + 8):
            continue
        # /Rect must be pypdf objects, not a bare Python list, or write() fails.
        obj[NameObject("/Rect")] = ArrayObject(
            [FloatObject(x0 - shift), FloatObject(y0), FloatObject(x1 - shift), FloatObject(y1)]
        )
        moved += 1
    return moved


def main(source: Path) -> None:
    reader = PdfReader(str(source))
    writer = PdfWriter(clone_from=str(source))

    page = writer.pages[0]
    data = page.get_contents().get_data()

    new_data, shift = redact(data)
    if shift == 0.0:
        print("No phone number found on the header line — copying unchanged.")
    else:
        stream = DecodedStreamObject()
        stream.set_data(new_data)
        page.replace_contents(stream)
        moved = shift_annotations(page, shift)
        print(f"Removed phone glyphs, shifted header left by {shift:.2f}pt, moved {moved} link rect(s).")

    writer.write(str(OUT))

    # Verify: the number must be unrecoverable by a text extractor.
    text = "\n".join(p.extract_text() for p in PdfReader(str(OUT)).pages)
    leaked = PHONE_RE.search(text)
    print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB, {len(reader.pages)} page(s))")
    print("Phone recoverable from output:", bool(leaked), f"-> {leaked.group()!r}" if leaked else "")
    if leaked:
        raise SystemExit("REDACTION FAILED — refusing to leave a leaking CV in place.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(Path(sys.argv[1]))

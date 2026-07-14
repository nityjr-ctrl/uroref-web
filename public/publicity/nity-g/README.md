# Nity G — publicity assets

Print and share assets for the personal profile page **https://uroref.com/nity**.
Regenerate the QR artwork any time with:

```
node scripts/generate-nity-publicity.mjs
```

The script also verifies that **every QR variant decodes to exactly
`https://uroref.com/nity`** (it fails the build of these assets otherwise).

## Contents

| File | Purpose |
| --- | --- |
| `Nity-G.vcf` | Downloadable contact card (vCard 3.0, CRLF line endings) |
| `nity-g-qr-black.svg` / `nity-g-qr-black-2048.png` | QR, black on white — **most reliable variant, prefer for print** |
| `nity-g-qr-white.svg` / `nity-g-qr-white-2048.png` | QR, white on charcoal (inverted). Scans on modern phones, but test your print run — some older scanners refuse inverted codes |
| `nity-g-qr-transparent.svg` / `nity-g-qr-transparent-2048.png` | QR, black modules, transparent background. Only place on light backgrounds (keep module-to-background contrast ≥ 70%) |
| `nity-g-qr-business-card.svg` | Business-card back artwork, 91 × 61 mm (85 × 55 mm + 3 mm bleed) |
| `nity-card-front.svg` | Business-card front artwork, same geometry |
| `nity-card-print.pdf` | Two-page print PDF (front + back) at trim + bleed size, vector text |
| `nity-g-qr-lanyard.svg` | QR end-tag for a lanyard clip card, 30 × 38 mm |
| `nity-lanyard-preview.svg` | 20 mm lanyard strap artwork, two 220 mm repeats shown |
| `nity-g-social-1200x630.png` | Open Graph / social sharing image (1200 × 630 px) |

## QR specifications

- Error correction level **H** (30% damage tolerance).
- 4-module quiet zone baked into every file — do not crop it.
- Plain square modules, no gradients, no centre logo (maximum reliability).
- **Minimum recommended printed size: 15 mm × 15 mm** (verified by decoding a
  simulated 15 mm / 300 dpi print). For posters scanned from ≥ 1 m away, use
  at least 40 mm. Rule of thumb: QR width ≥ scan distance ÷ 10.
- Always test a physical proof with a second device before a print run.

## Business card (UK standard)

- Trim size: **85 × 55 mm**; artwork canvas is **91 × 61 mm** including
  **3 mm bleed** on all sides.
- Keep text and the QR inside a safe zone **3 mm inside the trim edge**
  (i.e. 6 mm from the artwork edge).
- Print at **300 dpi minimum**. `nity-card-print.pdf` is vector and scales to
  any resolution.
- Colours are specified in RGB (charcoal `#050F1C`, teal `#00D4C8`, gold
  `#F5D76E`). Ask the printer for a colour-managed RGB → CMYK conversion
  (FOGRA39/51). For a rich near-black background request a CMYK build of
  approximately C 78 / M 62 / Y 40 / K 60 rather than 100% K alone.
- If your printer requires outlined text, open the SVGs in Inkscape or
  Illustrator and convert text to paths before export.

## Lanyard (20 mm, double-sided, black)

- `nity-lanyard-preview.svg` shows the repeating artwork for a **20 mm**
  strap: white role text, teal UroRef accent, small gold “by Nity G” detail.
- The repeat unit is ~220 mm; supply it to the lanyard manufacturer as a
  seamless repeat.
- Text sits in the middle 12 mm of the strap; the top and bottom 4 mm
  (dashed guides) are kept clear for stitching. Ask the manufacturer to
  confirm their stitch and cut tolerances and to keep artwork clear of clip
  and breakaway fittings (typically the final 30–40 mm at each end).
- A QR on a 20 mm woven strap will not scan reliably — use the
  `nity-g-qr-lanyard.svg` end-tag card behind the ID holder instead.

> **Disclaimer.** Personal branded lanyards should only be worn in clinical
> areas where permitted by the relevant Trust’s identification,
> infection-control and dress policies. Official staff identification must
> remain clearly visible. This artwork is personal branding only and does not
> imply an official hospital identification product; no NHS, hospital or
> Trust logos are used.

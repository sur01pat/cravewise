#!/usr/bin/env python3
"""
Generates CraveWise icon PNGs from SVG sources using cairosvg.
Install: pip install cairosvg
Run:     python3 assets/generate_icons.py
"""

import os
import sys

try:
    import cairosvg
except ImportError:
    print("cairosvg not found. Install with: pip install cairosvg")
    sys.exit(1)

ASSETS = os.path.dirname(os.path.abspath(__file__))

# ── SVG definitions ──────────────────────────────────────────────────────────

# Main icon / splash  (1024×1024, warm-orange rounded square bg + fork+leaf mark)
ICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Background -->
  <rect width="1024" height="1024" rx="200" ry="200" fill="#E8743B"/>

  <!-- Decorative circle -->
  <circle cx="512" cy="512" r="360" fill="#CF5E27" opacity="0.35"/>

  <!-- Fork (left) -->
  <g fill="#FFFFFF" transform="translate(330, 220)">
    <!-- handle -->
    <rect x="47" y="300" width="26" height="220" rx="13"/>
    <!-- tines -->
    <rect x="22" y="60" width="18" height="180" rx="9"/>
    <rect x="47" y="60" width="18" height="180" rx="9"/>
    <rect x="72" y="60" width="18" height="180" rx="9"/>
    <!-- base connector -->
    <path d="M22 240 Q60 290 90 240" stroke="#FFFFFF" stroke-width="18" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Leaf / plant (right, sage green) -->
  <g transform="translate(530, 190)" fill="#5B8E7D">
    <!-- stem -->
    <rect x="55" y="350" width="22" height="230" rx="11" fill="#4A7A6B"/>
    <!-- main leaf -->
    <ellipse cx="80" cy="260" rx="72" ry="110" transform="rotate(-18 80 260)"/>
    <!-- highlight -->
    <ellipse cx="72" cy="240" rx="22" ry="55" fill="#7BB5A4" opacity="0.6" transform="rotate(-18 72 240)"/>
    <!-- small side leaf -->
    <ellipse cx="30" cy="340" rx="40" ry="65" transform="rotate(25 30 340)" fill="#4A7A6B"/>
  </g>

  <!-- "W" wordmark at bottom -->
  <text x="512" y="920" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="120" font-weight="700" fill="#FFFFFF" opacity="0.90"
        text-anchor="middle" letter-spacing="8">CraveWise</text>
</svg>"""

# Android adaptive – foreground only (centred mark on transparent bg, 108dp safe-zone)
ADAPTIVE_FG_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <!-- Fork -->
  <g fill="#FFFFFF" transform="translate(110, 70)">
    <rect x="47" y="140" width="22" height="110" rx="11"/>
    <rect x="20" y="20" width="15" height="90" rx="7"/>
    <rect x="43" y="20" width="15" height="90" rx="7"/>
    <rect x="66" y="20" width="15" height="90" rx="7"/>
    <path d="M20 110 Q54 145 81 110" stroke="#FFFFFF" stroke-width="15" fill="none" stroke-linecap="round"/>
  </g>
  <!-- Leaf -->
  <g transform="translate(218, 55)" fill="#5B8E7D">
    <rect x="48" y="175" width="18" height="115" rx="9" fill="#4A7A6B"/>
    <ellipse cx="68" cy="130" rx="58" ry="90" transform="rotate(-18 68 130)"/>
    <ellipse cx="62" cy="115" rx="18" ry="45" fill="#7BB5A4" opacity="0.6" transform="rotate(-18 62 115)"/>
    <ellipse cx="24" cy="170" rx="32" ry="52" transform="rotate(25 24 170)" fill="#4A7A6B"/>
  </g>
</svg>"""

# Android adaptive – background (solid orange, no shape — Android clips it)
ADAPTIVE_BG_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <rect width="432" height="432" fill="#E8743B"/>
</svg>"""

# Android adaptive – monochrome (single-colour white mark for themed icons)
ADAPTIVE_MONO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <!-- Fork -->
  <g fill="#FFFFFF" transform="translate(110, 70)">
    <rect x="47" y="140" width="22" height="110" rx="11"/>
    <rect x="20" y="20" width="15" height="90" rx="7"/>
    <rect x="43" y="20" width="15" height="90" rx="7"/>
    <rect x="66" y="20" width="15" height="90" rx="7"/>
    <path d="M20 110 Q54 145 81 110" stroke="#FFFFFF" stroke-width="15" fill="none" stroke-linecap="round"/>
  </g>
  <!-- Leaf -->
  <g transform="translate(218, 55)" fill="#FFFFFF">
    <rect x="48" y="175" width="18" height="115" rx="9"/>
    <ellipse cx="68" cy="130" rx="58" ry="90" transform="rotate(-18 68 130)"/>
    <ellipse cx="24" cy="170" rx="32" ry="52" transform="rotate(25 24 170)"/>
  </g>
</svg>"""

# Splash icon (centred mark, transparent bg, 200×200 logical — output 200px)
SPLASH_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="90" fill="#E8743B"/>
  <!-- Fork -->
  <g fill="#FFFFFF" transform="translate(42, 28)">
    <rect x="22" y="65" width="11" height="55" rx="5"/>
    <rect x="10" y="10" width="8" height="45" rx="4"/>
    <rect x="21" y="10" width="8" height="45" rx="4"/>
    <rect x="32" y="10" width="8" height="45" rx="4"/>
    <path d="M10 55 Q26 72 40 55" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>
  <!-- Leaf -->
  <g transform="translate(104, 22)" fill="#5B8E7D">
    <rect x="22" y="88" width="10" height="55" rx="5" fill="#4A7A6B"/>
    <ellipse cx="32" cy="64" rx="28" ry="44" transform="rotate(-18 32 64)"/>
    <ellipse cx="12" cy="85" rx="16" ry="26" transform="rotate(25 12 85)" fill="#4A7A6B"/>
  </g>
</svg>"""

# Favicon (32×32)
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#E8743B"/>
  <g fill="#FFFFFF" transform="translate(5, 4)">
    <rect x="5" y="14" width="4" height="14" rx="2"/>
    <rect x="2" y="2" width="3" height="10" rx="1"/>
    <rect x="6" y="2" width="3" height="10" rx="1"/>
    <rect x="10" y="2" width="3" height="10" rx="1"/>
    <path d="M2 12 Q7.5 17 15 12" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <g transform="translate(17, 4)" fill="#5B8E7D">
    <rect x="4" y="17" width="3" height="11" rx="1" fill="#4A7A6B"/>
    <ellipse cx="8" cy="12" rx="7" ry="11" transform="rotate(-15 8 12)"/>
  </g>
</svg>"""

# ── Output map  (svg_source, output_filename, width_px, height_px) ────────────
OUTPUTS = [
    (ICON_SVG,         "icon.png",                      1024, 1024),
    (ADAPTIVE_FG_SVG,  "android-icon-foreground.png",    432,  432),
    (ADAPTIVE_BG_SVG,  "android-icon-background.png",    432,  432),
    (ADAPTIVE_MONO_SVG,"android-icon-monochrome.png",    432,  432),
    (SPLASH_SVG,       "splash-icon.png",                200,  200),
    (FAVICON_SVG,      "favicon.png",                     32,   32),
]

def main():
    for svg_src, filename, w, h in OUTPUTS:
        out_path = os.path.join(ASSETS, filename)
        cairosvg.svg2png(
            bytestring=svg_src.encode("utf-8"),
            write_to=out_path,
            output_width=w,
            output_height=h,
        )
        print(f"  ✓  {filename}  ({w}×{h})")
    print("\nAll icons written to", ASSETS)

if __name__ == "__main__":
    main()

# ☀️ PV Array Shade Analyser

Interactive client-side simulation tool for investigating the effect of shade on a rectangular PV array.  
No server, no build step — open `index.html` directly in any modern browser.

---

## Features

| Feature | Detail |
|---|---|
| **Array** | 8 rows × 9 columns (72 panels) in landscape orientation |
| **Panel model** | Lucksolar LS-MD120-340W — single-diode model (5 parameters) |
| **Shade interaction** | Click or drag panels to shade/unshade; presets for common scenarios |
| **Wiring configs** | Five options (A–E) always computed simultaneously for instant comparison |
| **IV + PV curves** | Live canvas-based plot per selected config — no external charting library |
| **MPP tracking** | Maximum power point (★) computed per MPPT; power detail cards shown |
| **Mobile friendly** | Touch events supported |

---

## Wiring Configurations

All five configurations are computed in parallel on every shade change. Click a row in the comparison table to annotate the array canvas and see the IV/PV curves for that configuration.

### Option A — 3 MPPTs, Series-Parallel (SP)

Row groups: rows 1–3 | rows 4–6 | rows 7–8

```
Rows 1–3: P[1][1]──…──P[1][9] ─┐
          P[2][1]──…──P[2][9] ─┤─► MPPT 1  (3 × 9 panels SP)
          P[3][1]──…──P[3][9] ─┘

Rows 4–6: P[4][1]──…──P[4][9] ─┐
          P[5][1]──…──P[5][9] ─┤─► MPPT 2  (3 × 9 panels SP)
          P[6][1]──…──P[6][9] ─┘

Rows 7–8: P[7][1]──…──P[7][9] ─┐
          P[8][1]──…──P[8][9] ─┘─► MPPT 3  (2 × 9 panels SP)
```

Each row is a series string; rows within a group are in parallel.

---

### Option B — 3 MPPTs, Vertical Total Cross-Tied (V-TCT)

Same row groups as A, but each group uses vertical TCT wiring: all panels in the same column position are connected in parallel (cross-tie), and column sections are connected in series.

```
  Col 1     Col 2     …    Col 9
P[1][1]─┐ P[1][2]─┐    P[1][9]─┐
P[2][1]─┤ P[2][2]─┤    P[2][9]─┤  → all 9 col-sections in series → MPPT 1
P[3][1]─┘ P[3][2]─┘    P[3][9]─┘
```

V-TCT indicator lines are shown on the array canvas.

---

### Option C — 8 MPPTs, 1 Series String per Row

Each of the 8 rows becomes its own independent MPPT (9 panels in series).

```
Row 1: P[1][1]──P[1][2]──…──P[1][9] ► MPPT 1
Row 2: P[2][1]──P[2][2]──…──P[2][9] ► MPPT 2
…
Row 8: P[8][1]──…──P[8][9] ► MPPT 8
```

Shade on one row has no effect on any other row.

---

### Option D — 9 MPPTs, Block Series-Parallel (SP)

The array is divided into a 3×3 macro grid of blocks (3 column groups × 3 row groups). Within each block, rows form independent series strings in parallel.

Column groups: cols 1–3 | cols 4–6 | cols 7–9  
Row groups:    rows 1–3 | rows 4–6 | rows 7–8

| | Cols 1–3 | Cols 4–6 | Cols 7–9 |
|---|---|---|---|
| **Rows 1–3** | MPPT 1 (3×3 SP) | MPPT 2 (3×3 SP) | MPPT 3 (3×3 SP) |
| **Rows 4–6** | MPPT 4 (3×3 SP) | MPPT 5 (3×3 SP) | MPPT 6 (3×3 SP) |
| **Rows 7–8** | MPPT 7 (2×3 SP) | MPPT 8 (2×3 SP) | MPPT 9 (2×3 SP) |

---

### Option E — 9 MPPTs, Block Vertical TCT

Identical block structure to D, but each block uses V-TCT wiring internally (columns in series, rows in parallel per column within the block).

---

## Quick Comparison

The comparison table always shows all five configurations simultaneously:

| Config | Total Power | % STC | MPPT mini-bars |
|---|---|---|---|
| A — SP | x.xxx kW | xx% | ▐▐▐ |
| B — TCT | x.xxx kW | xx% | ▐▐▐ |
| C — 1×9 | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐ |
| D — Blk SP | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐▐ |
| E — Blk TCT | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐▐ |

Each coloured bar represents one MPPT's power (hover for W/V/A detail). The ★ marks the highest total output under the current shade pattern.

---

## Panel Specifications — Lucksolar LS-MD120-340W

| Parameter | Value |
|---|---|
| Peak power (Pmax) | 340 W |
| Voltage at MPP (Vmp) | 38.4 V |
| Current at MPP (Imp) | 8.85 A |
| Open-circuit voltage (Voc) | 46.4 V |
| Short-circuit current (Isc) | 9.35 A |
| Cells | 120 half-cells (60 equivalent full cells in series) |
| Bypass diodes | 3 × 0.5 V |

---

## Running Locally

```bash
git clone https://github.com/joostmoesker-sys/shade-analyser.git
cd shade-analyser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

The app has **no external dependencies**. An internet connection is not required.

Alternatively serve with any HTTP server:

```bash
python -m http.server 8080   # then visit http://localhost:8080
npx serve .                  # then visit http://localhost:3000
```

---

## Usage

1. **Apply shade** by clicking or dragging over panels (left = shade, right/Shift = clear).
2. **Adjust shade intensity** with the slider (0 % = transparent, 99 % = near-total blockage).
3. **Use presets** to quickly apply row shade, column shade, corner blocks, or checkerboard patterns.
4. **Read the comparison table** — all five wiring configurations update simultaneously.
5. **Click a table row** to annotate the array canvas with MPPT colour zones and TCT tie-line indicators, and to display detailed I–V / P–V curves for that configuration.
6. **Read the MPPT detail cards** below the table for per-MPPT power, voltage, and current at MPP.

---

## Physics Model

Each panel is modelled using the **5-parameter single-diode model**:

```
I = Iph − I₀·(exp((V + I·Rs) / (n·Ns·Vt)) − 1) − (V + I·Rs) / Rsh
```

- `Iph` scales linearly with irradiance fraction (0–1).
- `Voc` shifts logarithmically with irradiance.
- Panel equations are solved by Newton iteration at each operating point.
- **Bypass diodes** (Vd = 0.5 V) prevent reverse bias in SP series strings (Options A, C, D).
- **V-TCT topology** (Options B, E): panels in the same column position share voltage (parallel), so unshaded panels compensate for shaded ones within a cross-tied section.

---

## Browser Support

Any modern browser with ES6+ support: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+.

# ☀️ PV Array Shade Analyser

Interactive client-side simulation tool for investigating the effect of shade on a rectangular PV array.  
No server, no build step — open `index.html` directly in any modern browser.

---

## Features

| Feature | Detail |
|---|---|
| **Array** | 3 rows × 10 columns (30 panels) in landscape orientation |
| **Panel model** | Lucksolar LS-MD120-340W — single-diode model (5 parameters) |
| **Shade interaction** | Click or drag panels to shade/unshade; presets for common scenarios |
| **Wiring configs** | Three options (A / B / C) selectable at runtime |
| **IV + PV curves** | Live canvas-based plot showing I–V (solid) and P–V (dashed) curves — no external charting library |
| **MPP tracking** | Maximum power point (★) computed and displayed per MPPT |
| **Mobile friendly** | Touch events supported |

---

## Wiring Configurations

### Option A — 1 MPPT, 3 parallel strings
```
Row 1: P[1][1]──P[1][2]──…──P[1][10]  ─┐
Row 2: P[2][1]──P[2][2]──…──P[2][10]  ─┤─► MPPT 1
Row 3: P[3][1]──P[3][2]──…──P[3][10]  ─┘
```
All 30 panels feed a single MPPT. A shaded panel anywhere bypasses its cell group but the unshaded rows continue at their natural operating point.

### Option B — 3 MPPTs, 1 string each
```
Row 1: P[1][1]──…──P[1][10] ► MPPT 1
Row 2: P[2][1]──…──P[2][10] ► MPPT 2
Row 3: P[3][1]──…──P[3][10] ► MPPT 3
```
Each row has its own MPPT. Shade on one row does not affect the others.

### Option C — 3 MPPTs, cross-tied column sections
```
Cols 1–3   │ Cols 4–7   │ Cols 8–10
(CT block) │ (CT block) │ (CT block)
   ▼              ▼            ▼
 MPPT 1         MPPT 2       MPPT 3
```
Each MPPT manages a cross-tied (CT) sub-array. Within a column section all panels in the same column are connected in parallel; column sections are connected in series. This topology reduces mismatch losses when individual panels are shaded.

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
| Dimensions (L × W) | 1722 mm × 1134 mm |

---

## Running Locally

### Option 1 — Open directly (simplest)

```bash
# Clone the repository
git clone https://github.com/joostmoesker-sys/shade-analyser.git
cd shade-analyser

# Open in your browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

> The app has **no external dependencies** — everything runs in `index.html` with built-in canvas rendering.  
> An internet connection is **not required**.

### Option 2 — Serve with a local HTTP server

Some browsers restrict local `file://` resources. Use any simple HTTP server:

```bash
# Python 3
python -m http.server 8080
# then visit http://localhost:8080

# Node.js (npx, no install needed)
npx serve .
# then visit http://localhost:3000

# VS Code
# Install the "Live Server" extension and click "Go Live"
```

---

## Usage

1. **Select a wiring configuration** (Option A / B / C) using the buttons at the top-left.
2. **Apply shade** by clicking or dragging over panels in the array grid.  
   - Left-click / drag = shade  
   - Right-click / Shift + drag = remove shade
3. **Adjust shade intensity** with the slider (0 % = transparent, 99 % = near-total blockage).
4. **Use presets** to quickly apply common shading patterns (full row, single column, corner block, checkerboard).
5. **Read the charts** — I–V curve (solid lines, left axis) and P–V curve (dashed lines, right axis). The ★ symbol marks the Maximum Power Point for each MPPT.
6. **Compare configurations** by switching between A / B / C with the same shade pattern to see how wiring topology affects total output.

---

## Physics Model

Each panel is modelled using the **5-parameter single-diode model**:

```
I = Iph − I₀·(exp((V + I·Rs) / (n·Ns·Vt)) − 1) − (V + I·Rs) / Rsh
```

- `Iph` scales linearly with irradiance fraction (0–1).  
- `Voc` shifts logarithmically with irradiance.  
- Panel equations are solved by Newton iteration at each operating point.  
- **Bypass diodes** (Vd = 0.5 V) prevent reverse bias in standard series strings (Options A & B).  
- **Cross-tied topology** (Option C): panels in the same column section share voltage, so unshaded panels compensate for shaded ones without requiring individual bypass action.

---

## Browser Support

Any modern browser with ES6+ support: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+.

# ☀️ PV Array Shade Analyser

Interactive client-side simulation tool for investigating the effect of shade on a rectangular PV array.  
No server, no build step — open `index.html` directly in any modern browser.

---

## Features

| Feature | Detail |
|---|---|
| **Array** | 8 rows × 11 columns (88 panels) in landscape orientation |
| **Panel model** | Lucksolar LS-MD120-340W — single-diode model (5 parameters) |
| **Shade interaction** | Click or drag panels to shade/unshade; presets for common scenarios |
| **Wiring configs** | Wiring options are computed simultaneously for instant comparison; economic V4 comparison focuses on A, C, F, and G |
| **Solar irradiance** | Clear-sky model for Neer, Netherlands (lat 51.27°N, lon 5.99°E) — date picker + time slider |
| **Physical sections** | Top 5 rows (tilt −30°, az 220°) and bottom 3 rows (tilt 30°, az 255°) with independent POA irradiance |
| **IV + PV curves** | Live canvas-based plot per selected config — no external charting library |
| **MPP tracking** | Maximum power point (★) computed per MPPT; power detail cards shown |
| **Mobile friendly** | Touch events supported |

---

## Wiring Configurations

Configurations are computed in parallel on every shade change. Click a row in the comparison table to annotate the array canvas and see the IV/PV curves for that configuration.

### Option A — 3 MPPTs, Series-Parallel (SP)

Row groups: rows 1–3 | rows 4–6 | rows 7–8

```
Rows 1–3: P[1][1]──…──P[1][11] ─┐
          P[2][1]──…──P[2][11] ─┤─► MPPT 1  (3 × 11 panels SP)
          P[3][1]──…──P[3][11] ─┘

Rows 4–6: P[4][1]──…──P[4][11] ─┐
          P[5][1]──…──P[5][11] ─┤─► MPPT 2  (3 × 11 panels SP)
          P[6][1]──…──P[6][11] ─┘

Rows 7–8: P[7][1]──…──P[7][11] ─┐
          P[8][1]──…──P[8][11] ─┘─► MPPT 3  (2 × 11 panels SP)
```

Each row is a series string; rows within a group are in parallel.

In the V4 economic comparison, Option A keeps this wiring configuration and adds option-specific economic model parameters: unlimited charge capability, 18 kW discharge capability, 200 W standby consumption, and 92.5% AC↔battery converter efficiency.

---

### Option B — 3 MPPTs, Vertical Total Cross-Tied (V-TCT)

Same row groups as A, but each group uses vertical TCT wiring: all panels in the same column position are connected in parallel (cross-tie), and column sections are connected in series.

```
  Col 1     Col 2     …    Col 11
P[1][1]─┐ P[1][2]─┐    P[1][11]─┐
P[2][1]─┤ P[2][2]─┤    P[2][11]─┤  → all 11 col-sections in series → MPPT 1
P[3][1]─┘ P[3][2]─┘    P[3][11]─┘
```

V-TCT indicator lines are shown on the array canvas.

---

### Option C — 8 MPPTs, 1 Series String per Row

Each of the 8 rows becomes its own independent MPPT (11 panels in series).

```
Row 1: P[1][1]──P[1][2]──…──P[1][11] ► MPPT 1
Row 2: P[2][1]──P[2][2]──…──P[2][11] ► MPPT 2
…
Row 8: P[8][1]──…──P[8][11] ► MPPT 8
```

Shade on one row has no effect on any other row.

In the V4 economic comparison, Option C keeps this wiring configuration and adds option-specific economic model parameters: unlimited charge capability, 18 kW discharge capability, 200 W standby consumption, and 92.5% AC↔battery converter efficiency.

---

### Option F — 4 MPPTs, 2 Rows × 11 Cols (22 panels per MPPT, SP)

The array is split into four equal horizontal bands, each covering 2 rows × 11 columns = 22 panels wired in Series-Parallel (2 strings of 11 panels in parallel).

Row groups: rows 1–2 | rows 3–4 | rows 5–6 | rows 7–8

```
Rows 1–2: P[1][1]──…──P[1][11] ─┐
          P[2][1]──…──P[2][11] ─┘─► MPPT 1  (2 × 11 panels SP)

Rows 3–4: ─► MPPT 2  (2 × 11 panels SP)
Rows 5–6: ─► MPPT 3  (2 × 11 panels SP)
Rows 7–8: ─► MPPT 4  (2 × 11 panels SP)
```

Each MPPT input voltage = 1 series string Vmpp ≈ 38 V; input current = 2 × Impp ≈ 17.7 A.

For the economic V4 comparison, Option F uses a 16 kW PV clipping limit and 10 kW battery charge/discharge limit. Option G uses the same wiring with a 24 kW PV clipping limit and 10 kW battery charge/discharge limit.
Both high-voltage battery options use the default 95% AC↔battery converter efficiency.

---

## Physical Sections & Solar Irradiance

The 8-row array is physically divided into two sections with different mounting angles:

| Section | Rows | Tilt | Azimuth |
|---|---|---|---|
| **Top** | 1–5 (rows 0–4) | +30° | 225° (SW) |
| **Bottom** | 6–8 (rows 5–7) | −20° | 225° (SW) |

> **Tilt convention**: positive tilt = panel faces the azimuth direction; negative tilt = panel normal tilts to the opposite side of the azimuth direction.  
> Tilt −20°, az 225° is mathematically equivalent to tilt +20°, az 45° (NE-facing), which would represent the rear slope of a dual-pitch roof.

A coloured section-boundary line is drawn on the canvas between rows 5 and 6.

### Clear-Sky Irradiance Model

Location: **Neer, Netherlands** (lat 51.27°N, lon 5.99°E)

Solar position is computed using the Spencer equations for declination and equation of time, with the correct ENU vector formula for azimuth. Clear-sky direct normal irradiance uses the Meinel transmittance with Netherlands turbidity (τ=0.88). Plane-of-array (POA) irradiance uses the isotropic sky diffuse model.

The `irr[r][c]` array (POA / 1000 W/m²) is multiplied by the user-painted `shade[r][c]` to give the effective irradiance fraction used in all physics calculations:

```
effectiveG(r, c) = irr[r][c] × shade[r][c]
```

Netherlands DST is handled automatically (last Sunday March → last Sunday October).

---

The live PV comparison table shows all wiring configurations simultaneously; the Economic Forecast comparison is limited to A, C, F, and G:

| Config | Total Power | % STC | MPPT mini-bars |
|---|---|---|---|
| A — SP | x.xxx kW | xx% | ▐▐▐ |
| B — TCT | x.xxx kW | xx% | ▐▐▐ |
| C — 1×9 | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐ |
| D — Blk SP | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐▐ |
| E — Blk TCT | x.xxx kW | xx% | ▐▐▐▐▐▐▐▐▐ |
| F — 4×18 | x.xxx kW | xx% | ▐▐▐▐ |

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

---

## Economic Analysis & Battery Support

### Overview

The **Economic Forecast** panel (at the bottom of the right column) lets you compare Options A, C, F, and G under your current shade pattern with the V4 euro optimizer, with or without a 64 kWh battery.

### How to Use

1. Run the **Yearly PV Simulation** first (click "↺ Run Yearly Sim" in the Yearly Simulation card). This takes 1–3 s.
2. Scroll to the **🔋 Economic Forecast** card.
3. Configure the parameters (battery enable, grid pre-charge, load profile, sell price factor).
4. Click **▶ Run Economic Analysis** (< 200 ms).

### Parameters

| Parameter | Default | Description |
|---|---|---|
| **64 kWh Battery** | ✅ On | 64 kWh LFP battery, capex excluded (already paid for) |
| **Grid Pre-charge** | Off | Charge battery from grid during cheapest hours on days with predicted low PV yield |
| **Base load** | 12 kWh/day | Household appliances + lighting + EV slow-charge |
| **HP winter** | 28 kWh/day | Heat pump electrical demand at peak winter (electrical kWh, COP not modeled) |
| **Sell factor** | 0.85× | Sell tariff = buy tariff × factor (Dutch feed-in / SDE++ range) |
| **Battery size** | 64 kWh | Sensitivity: 32 / 64 / 96 kWh |

### Battery Dispatch Logic

1. **PV → load** (direct self-consumption, highest priority)
2. **Surplus PV → battery** (charge at 95% efficiency, up to the option's charge limit; A/C are unlimited, F/G use 10 kW)
3. **Remaining surplus PV → grid** (at sell tariff)
4. **Battery → load** (discharge for self-use when PV insufficient, down to 5% SOC)
5. **Grid → load** (import only what battery cannot cover)
6. **After sundown, during top-6 most expensive hours per day**: sell from battery to grid down to **5% SOC** — time-shifts stored solar to high-price periods
7. **Optional grid pre-charge**: on days where next-day PV < next-day load, charge battery during 4 cheapest hours at (deficit / 0.80) kWh

### House Load Model

- **Base**: 12 kWh/day, distributed with morning peak (06–09 h) and evening peak (18–22 h)
- **Heat pump**: seasonal — full load Dec–Jan, tapering through autumn/spring, zero Jun–Aug
- **Variation**: ±5% deterministic daily variation (based on a fixed `sin(doy)` formula — fully reproducible) for realism
- Total yearly load ≈ 9–11 MWh (realistic for a Dutch large detached house + heat pump)

### Tariff Model

Synthetic Dutch dynamic APX/EPEX tariff profile, based on the 12×24 monthly-hourly price matrix (`HOURLY_APX_PRICE_2025`):
- Summer midday prices can go near zero (solar duck curve)
- Winter evening peaks 17–20 h: 0.15–0.40 €/kWh
- Weekend discount ~18%
- Daily variation ±10% (deterministic seed)

### Output Metrics

| Metric | Meaning |
|---|---|
| PV kWh/yr | Annual PV production for this config under current shade |
| SC% | Self-consumption rate (% of PV consumed directly + via battery) |
| Export kWh | Total grid export (PV surplus + battery time-shift) |
| Savings (no bat) | Annual € savings with PV only, no battery |
| Savings (+ bat) | Annual € savings with PV + battery dispatch |
| 🔋 Bonus | Extra savings from battery vs. PV-only |

### Example Results (no shade, 64 kWh battery, clear-sky)

```
Best config: ~€2,400–3,200 annual savings (clear-sky optimistic)
Battery bonus: €300–700 vs PV-only
Self-consumption rate: 60–80% with battery
Real-world estimate: derate by 15–25% for cloud losses
```

### Assumptions & Limitations

- **Clear-sky model** — no clouds, aerosols, or soiling. Real yield is 15–25% lower.
- Fixed shade pattern applied uniformly across all 8760 hours (clear-sky irradiance varies with sun position; shade mask does not change seasonally, except tree foliage).
- Battery capex excluded entirely (already paid for scenario).
- Battery degradation not modeled (single-year snapshot).
- Heat pump modeled as electrical load, COP not applied (conservative — actual savings could be higher if thermal storage is also considered).
- Sell tariff = buy tariff × factor (default 0.85). Dutch saldering rules may allow higher rates.

### Export

Click **💾 Export CSV** to download an hourly CSV with: Hour, Date, PV_kWh, Load_kWh, Tariff_EUR_kWh, SellTariff_EUR_kWh (for the best-savings configuration).

### Customisation

To use a custom load profile or tariff series, edit the `precomputeYearlyLoad()` or `generateYearlyTariffs()` functions in the `<script>` block of `index.html`. Both return `Float64Array(8760)` and are easy to replace with real measured data.

```js
// Example: override with real measured load data
function precomputeYearlyLoad() {
  // return your own Float64Array(8760) in kWh/hour
}
```

---

### Advanced Battery Strategy v3 — Dynamic Programming

#### Overview

**V3** replaces the daily greedy allocation of V2 with a **true lightweight dynamic programming (DP) optimizer** that looks ahead over a user-selectable rolling horizon (24 h / 48 h / 96 h / **120 h**).

It appears alongside V2 in the 🔋 Economic Forecast card and shows a **three-way comparison** (v1 | v2 | v3) with deltas.

#### How to Use

1. Run the **Yearly PV Simulation** and the **Economic Analysis** as normal.
2. The V3 panel appears automatically inside the Economic Forecast results section.
3. Select the **Forecast Horizon** (24 h, 48 h, 96 h, or 120 h — default, 5-day rolling look-ahead).
4. Enable or disable **Use V3 Dynamic Programming** with the checkbox.
5. Click **Re-run V4 Comparison** to refresh the A/C/F/G economic comparison.

#### DP Design

| Parameter | Value |
|---|---|
| SOC states | 20 buckets (5% steps of battery capacity) |
| Actions | charge / discharge\_self / discharge\_export / idle |
| Horizon | 24 h · 48 h · 96 h · **120 h** (rolling, re-run every 24 h) |
| Objective | Maximise net economic value (€) over the horizon |
| Algorithm | Backward induction (classic finite-horizon DP) |
| Terminal value | Remaining SOC × avg sell price × selfUseMultiplier × 0.9 |

#### Tibber Tariff Model (post-2027)

Saldering (net metering) is abolished in 2027. The model uses the post-2027 Tibber pricing:

- **Buy tariff** = bare APX spot price + €0.04/kWh (Tibber opslag surcharge)
- **Sell tariff** = bare APX spot price (no surcharge, no saldering benefit)
- The DP and executor both use the correct asymmetric buy/sell prices for all valuation and gate calculations.

#### V3 Dispatch Logic

| Step | Action |
|---|---|
| **DP planning** | Runs `optimizeBatteryDP()` once per day over the look-ahead horizon, seeded with the battery's actual SOC |
| **Surplus + export** | If DP says *export*: PV surplus goes straight to grid (no round-trip loss); battery also discharged for extra export |
| **Surplus + other** | Default: charge battery from PV surplus; export whatever doesn't fit |
| **Deficit hours** | PV → load; battery self-discharge down to 5% SOC (matches V1/V2); no export unless deficit is fully covered |
| **Export gate** | Battery → grid only when sell price > day-average sell price + min spread **and** DP action = *discharge\_export* |
| **Grid pre-charge** | Optional (same control as V2), triggered when DP action = *charge* during a deficit hour |

#### Expected Improvement

- V3 typically outperforms V1 by **15–25%** and V2 by **+5–10%** in battery-driven annual savings.
- Largest gain on days with strong intra-day price variation (dynamic tariff peak/off-peak spread).
- Performance: even at 120 h horizon the full-year DP run takes < 400 ms on a modern mid-range laptop (Chrome/Firefox, single-threaded JS).

---

### Advanced Battery Strategy v4 — Euro Optimizer

#### Overview

**V4** keeps V3 available as the lightweight rolling DP baseline and adds a full-year, euro-first optimizer. The Economic Forecast table runs this optimizer for Options A, C, F, and G so they can be compared directly. It optimizes annual cashflow directly instead of optimizing proxy rules such as fixed sell windows, average-price export gates, or self-consumption targets.

#### Design

| Parameter | Value |
|---|---|
| SOC states | 96 buckets plus endpoints (≈0.67 kWh at 64 kWh) |
| Horizon | Full 8760-hour year |
| Objective | Maximise export revenue − grid import cost |
| Terminal SOC | Penalised back to the initial 50% SOC to prevent end-of-year draining |
| Dispatch model | Quantity-based SOC transitions; planner and executor use the same transition function |
| Economic options | A, C, F, and G only |
| A/C battery power | Unlimited charge, 18 kW discharge |
| A/C standby consumption | 200 W continuous standby load |
| F/G battery power | 10 kW charge/discharge |
| F/G PV clipping | F: 16 kW PV, G: 24 kW PV |

#### Dispatch Logic

| Flow | Treatment |
|---|---|
| PV → load | Served first as the physical self-consumption baseline |
| PV → battery | Used when its future value beats immediate positive export revenue |
| PV → grid | Exported only when export is allowed and sell price is positive |
| Grid → battery | Optional; selected only when enabled and cheaper than alternative stored energy |
| Battery → load | Used when avoided import value exceeds future value |
| Battery → grid | Used only when export is allowed, sell price is positive, and no grid import remains in that hour |
| Curtailment | Used for zero-export mode, capacity limits, or negative/zero sell prices |

#### Diagnostics

The V4 result line reports battery power, SOC bucket size, curtailed PV, and final SOC for the best option. Battery degradation is excluded because the battery is treated as already paid for. The monthly cashflow chart and July dispatch visualizer use the best V4 option when the optimizer is enabled.

---

## Advanced Battery Strategy v2

### Overview

The **Advanced Battery Strategy v2** panel (inside the 🔋 Economic Forecast card) upgrades the dispatch algorithm from a simple time-shifting approach to a **value-based, forecast-aware strategy** that maximises annual profit.

It runs alongside the standard v1 simulation and shows a **side-by-side comparison** with the savings delta.

### How to Use

1. Run the **Yearly PV Simulation** and then the **Economic Analysis** as normal.
2. The v2 panel appears automatically inside the Economic Forecast results section.
3. Adjust the tunable sliders and toggle v2 on/off.
4. Click **Re-run with v2 Strategy** to refresh the comparison without re-running the full yearly sim.

### v2 Dispatch Logic

| Step | Action |
|---|---|
| **1. Direct self-use** | PV → load first (same as v1) |
| **2. PV → battery** | Surplus PV charges battery at 95% efficiency |
| **3. Remaining PV → grid** | Sell at buy × sell factor |
| **4. Smart self-use discharge** | Discharge during high-price deficit hours weighted by `selfUseMultiplier` (default 1.05) — prioritises the most valuable self-use hours |
| **5. Dynamic SOC floor** | Floor scales 15–55% based on 48-h deficit forecast — reserves energy for when it's most needed |
| **6. v2 Priority Export** | After self-use is covered, sell from battery when sell price is significantly above threshold (min profit spread check) |
| **7. Smart grid pre-charge** | Optional: only charges from grid if `(buy_price / 0.80) + min_spread < next_day_max_price` — never charges at a loss |

### Tunable Parameters

| Parameter | Default | Description |
|---|---|---|
| **v2 Smart Dispatch** | ✅ On | Toggles the advanced algorithm; off = v1 behaviour |
| **Min Profit Spread** | 0.06 €/kWh | Minimum spread required to justify a battery-to-grid export |
| **Self-use Premium** | 1.05× | Weight multiplier for self-use value vs. export value |

### Dispatch Visualizer

A canvas chart shows the sample **July week** (days 180–187) with:
- 🔵 **Blue line** — Battery SOC (kWh)
- 🟠 **Orange line** — Hourly buy price (€/kWh)
- 🟢 **Green bars (↑)** — Charging events
- 🔴 **Red bars (↓)** — Discharge events (self-use + export)

### Expected Improvement

In typical Dutch conditions with the 64 kWh battery:
- v2 improves annual savings by **€50–€200** over v1 depending on tariff volatility.
- Largest gains on high-price winter days when the dynamic SOC floor correctly reserves energy for evening peaks.
- Grid pre-charge provides additional uplift when enabled and the tariff spread is favourable.

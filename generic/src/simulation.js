import { findInverter, findPanelType } from "./model.js";
import { validateProject } from "./validation.js";

const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DUTCH_YIELD_FACTORS = [0.025, 0.045, 0.085, 0.115, 0.135, 0.135, 0.13, 0.115, 0.085, 0.06, 0.04, 0.025];
const HEAT_PUMP_FACTORS = [1, 0.9, 0.65, 0.35, 0.12, 0.02, 0, 0, 0.12, 0.35, 0.7, 0.95];
const IMPORT_BALANCING_COST_EUR_PER_KWH = 0.02;

export function runPreviewSimulation(project, scenario) {
  const validation = validateProject(project, scenario);
  if (validation.some((message) => message.level === "error")) {
    return { validation, results: null };
  }

  const arraySummaries = scenario.arrays.map((array) => simulateArray(project, scenario, array));
  const monthlyPvKwh = Array.from({ length: 12 }, (_, month) =>
    arraySummaries.reduce((sum, array) => sum + array.monthlyKwh[month], 0),
  );
  const yearlyPvKwh = sum(monthlyPvKwh);
  const monthlyLoadKwh = MONTH_DAYS.map((days, month) =>
    days * (scenario.load.baseKwhPerDay + scenario.load.heatPumpWinterKwhPerDay * HEAT_PUMP_FACTORS[month]),
  );
  const yearlyLoadKwh = sum(monthlyLoadKwh);
  const battery = simulateBatteryEconomics(monthlyPvKwh, monthlyLoadKwh, scenario.battery);
  const directSelfUseKwh = monthlyPvKwh.reduce((total, pv, month) => total + Math.min(pv, monthlyLoadKwh[month] * 0.45), 0);
  const selfConsumptionKwh = Math.min(yearlyPvKwh, directSelfUseKwh + battery.batteryToLoadKwh);
  const exportKwh = Math.max(0, yearlyPvKwh - selfConsumptionKwh + battery.batteryExportKwh);
  const importKwh = Math.max(0, yearlyLoadKwh - selfConsumptionKwh);
  const buyPrice = 0.31;
  const sellPrice = 0.09;
  const annualValueEur = selfConsumptionKwh * buyPrice + exportKwh * sellPrice - importKwh * IMPORT_BALANCING_COST_EUR_PER_KWH;

  return {
    validation,
    results: {
      generatedAt: new Date().toISOString(),
      model: "fast-preview-v1",
      assumptions: [
        "Maandelijkse Nederlandse opbrengstfactoren in plaats van historische uurlijkse weerdata.",
        "Eenvoudige schaduwfactor op basis van afstand, hoogte en dichtheid van handmatig geplaatste objecten.",
        "Serie-per-rij en parallel-per-MPPT als eerste bekabelingsmodel.",
        "Eenvoudige maandbalans voor accu en economische waarde.",
      ],
      yearlyPvKwh,
      yearlyLoadKwh,
      selfConsumptionKwh,
      selfConsumptionPct: yearlyPvKwh > 0 ? selfConsumptionKwh / yearlyPvKwh * 100 : 0,
      exportKwh,
      importKwh,
      annualValueEur,
      battery,
      monthly: MONTHS.map((label, month) => ({
        label,
        pvKwh: monthlyPvKwh[month],
        loadKwh: monthlyLoadKwh[month],
      })),
      arrays: arraySummaries,
    },
  };
}

function simulateArray(project, scenario, array) {
  const panel = findPanelType(project, array.panelTypeId);
  const inverter = findInverter(scenario, array.inverterId);
  const mppt = inverter.mppts[array.mpptIndex ?? 0];
  const dcKwp = array.rows * array.columns * panel.pmaxW / 1000;
  const orientationFactor = Math.max(0.62, Math.cos(toRad(array.azimuthDeg - 180)) * 0.18 + 0.82);
  const tiltFactor = Math.max(0.78, 1 - Math.abs(array.tiltDeg - 35) / 160);
  const shadowLossPct = estimateShadowLoss(scenario, array);
  const inverterFactor = Math.min(1, (inverter.efficiencyPct ?? 96) / 100);
  const mpptClipFactor = Math.min(1, mppt.maxPowerKw / Math.max(dcKwp, 0.1));
  const baseYieldKwhPerKwp = 930;
  const annualKwh = dcKwp * baseYieldKwhPerKwp * orientationFactor * tiltFactor * (1 - shadowLossPct / 100) * inverterFactor * mpptClipFactor;

  return {
    arrayId: array.id,
    name: array.name,
    dcKwp,
    panelCount: array.rows * array.columns,
    shadowLossPct,
    clippingLossPct: (1 - mpptClipFactor) * 100,
    annualKwh,
    monthlyKwh: DUTCH_YIELD_FACTORS.map((factor) => annualKwh * factor),
  };
}

function estimateShadowLoss(scenario, array) {
  let loss = 0;

  for (const object of scenario.sceneObjects) {
    const dx = object.x - array.x;
    const dy = object.y - array.y;
    const distance = Math.hypot(dx, dy);
    const density = (object.shadeDensityPct ?? 100) / 100;
    const height = object.heightM ?? 4;
    const reach = object.type === "tree" ? height * 12 + (object.crownRadiusM ?? 0) * 8 : height * 9;
    const southBias = dy > -80 ? 1 : 0.55;
    const contribution = Math.max(0, 1 - distance / reach) * density * southBias * 16;
    loss += contribution;
  }

  return Math.min(55, loss);
}

function simulateBatteryEconomics(monthlyPvKwh, monthlyLoadKwh, battery) {
  if (battery.capacityKwh <= 0) {
    return {
      chargedKwh: 0,
      batteryToLoadKwh: 0,
      batteryExportKwh: 0,
      standbyLossKwh: 0,
      cycles: 0,
    };
  }

  const efficiency = Math.sqrt((battery.roundTripEfficiencyPct ?? 90) / 100);
  const standbyLossKwh = battery.standbyW * 24 * 365 / 1000;
  let chargedKwh = 0;
  let batteryToLoadKwh = 0;
  let batteryExportKwh = 0;

  for (let month = 0; month < 12; month += 1) {
    const pv = monthlyPvKwh[month];
    const load = monthlyLoadKwh[month];
    const direct = Math.min(pv, load * 0.45);
    const surplus = Math.max(0, pv - direct);
    const deficit = Math.max(0, load - direct);
    const monthlyThroughputCap = battery.capacityKwh * 24;
    const charge = Math.min(surplus, monthlyThroughputCap, battery.maxPowerKw * MONTH_DAYS[month] * 3);
    const delivered = Math.min(deficit, charge * efficiency);
    chargedKwh += charge;
    batteryToLoadKwh += delivered;

    if (battery.exportAllowed) {
      batteryExportKwh += Math.max(0, charge * efficiency - delivered) * 0.35;
    }
  }

  return {
    chargedKwh,
    batteryToLoadKwh: Math.max(0, batteryToLoadKwh - standbyLossKwh),
    batteryExportKwh,
    standbyLossKwh,
    cycles: battery.capacityKwh > 0 ? chargedKwh / battery.capacityKwh : 0,
  };
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

import { findInverter, findPanelType } from "./model.js";

// Approximate cold-open-circuit uplift for Dutch winter validation; assumes a cold clear morning around -10 °C.
const COLD_VOC_TEMPERATURE_FACTOR = 1.12;
// Approximate hot-MPPT voltage derate for summer roof validation; assumes hot modules around 70 °C.
const HOT_VMP_TEMPERATURE_FACTOR = 0.85;

export function validateProject(project, scenario) {
  const messages = [];

  if (
    project.location.latitude === null ||
    project.location.latitude === undefined ||
    project.location.longitude === null ||
    project.location.longitude === undefined
  ) {
    messages.push(error("Locatie", "Latitude en longitude zijn nodig voor zonpositie en weerdata."));
  }

  if (!scenario.arrays.length) {
    messages.push(error("PV-arrays", "Voeg minimaal één PV-array toe."));
  }

  if (!scenario.inverters.length) {
    messages.push(error("Inverters", "Voeg minimaal één inverter met MPPT toe."));
  }

  for (const array of scenario.arrays) {
    validateArray(project, scenario, array, messages);
  }

  if (scenario.battery.capacityKwh > 0 && scenario.battery.maxPowerKw <= 0) {
    messages.push(error("Accu", "Een accu met capaciteit heeft ook een laad-/ontlaadvermogen nodig."));
  }

  if (scenario.load.baseKwhPerDay < 0 || scenario.load.heatPumpWinterKwhPerDay < 0) {
    messages.push(error("Verbruik", "Verbruikswaarden mogen niet negatief zijn."));
  }

  if (!messages.some((message) => message.level === "error")) {
    messages.unshift(ok("Project", "Project is klaar voor een eerste previewsimulatie."));
  }

  return messages;
}

function validateArray(project, scenario, array, messages) {
  const panel = findPanelType(project, array.panelTypeId);
  const inverter = findInverter(scenario, array.inverterId);
  const mppt = inverter?.mppts?.[array.mpptIndex ?? 0];

  if (!panel) {
    messages.push(error(array.name, "Paneeltype ontbreekt."));
    return;
  }

  if (!inverter || !mppt) {
    messages.push(error(array.name, "Array is niet gekoppeld aan een geldige inverter/MPPT."));
    return;
  }

  if (array.rows < 1 || array.columns < 1) {
    messages.push(error(array.name, "Rijen en kolommen moeten minimaal 1 zijn."));
    return;
  }

  const panelsPerString = array.columns;
  const parallelStrings = array.rows;
  const coldVoc = panelsPerString * panel.voc * COLD_VOC_TEMPERATURE_FACTOR;
  const hotVmpp = panelsPerString * panel.vmp * HOT_VMP_TEMPERATURE_FACTOR;
  const stringCurrent = panel.imp * parallelStrings;
  const stringIsc = panel.isc * parallelStrings;
  const dcKw = array.rows * array.columns * panel.pmaxW / 1000;

  if (coldVoc > mppt.maxVoltage) {
    messages.push(error(array.name, `Koude Voc ${round(coldVoc)} V is hoger dan MPPT max ${mppt.maxVoltage} V.`));
  }

  if (hotVmpp < mppt.minVoltage) {
    messages.push(error(array.name, `Warme Vmpp ${round(hotVmpp)} V is lager dan MPPT minimum ${mppt.minVoltage} V.`));
  }

  if (stringCurrent > mppt.maxCurrent) {
    messages.push(error(array.name, `Parallelstroom ${round(stringCurrent)} A is hoger dan MPPT max ${mppt.maxCurrent} A.`));
  }

  if (stringIsc > mppt.maxIsc) {
    messages.push(error(array.name, `Kortsluitstroom ${round(stringIsc)} A is hoger dan MPPT Isc max ${mppt.maxIsc} A.`));
  }

  if (dcKw > mppt.maxPowerKw) {
    messages.push(warning(array.name, `DC-vermogen ${round(dcKw)} kWp is hoger dan MPPT richtwaarde ${mppt.maxPowerKw} kW; clipping kan optreden.`));
  }
}

function ok(section, text) {
  return { level: "ok", section, text };
}

function warning(section, text) {
  return { level: "warning", section, text };
}

function error(section, text) {
  return { level: "error", section, text };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

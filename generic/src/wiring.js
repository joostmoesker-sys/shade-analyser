import { findInverter, findPanelType } from "./model.js";

export const WIRING_MODES = [
  {
    id: "series-per-row-parallel",
    label: "Rijstrings parallel",
    description: "Elke rij is één seriestring; rijen staan parallel op de gekozen MPPT.",
  },
  {
    id: "single-string",
    label: "Eén seriestring",
    description: "Alle panelen van de array worden als één seriestring gevalideerd.",
  },
  {
    id: "columns-parallel",
    label: "Kolomstrings parallel",
    description: "Elke kolom is één seriestring; kolommen staan parallel op de gekozen MPPT.",
  },
];

export function getWiringMode(modeId) {
  return WIRING_MODES.find((mode) => mode.id === modeId) ?? WIRING_MODES[0];
}

export function buildArrayPanelGrid(array) {
  const panels = [];
  for (let row = 0; row < array.rows; row += 1) {
    for (let column = 0; column < array.columns; column += 1) {
      panels.push({
        id: `${array.id}-r${row + 1}c${column + 1}`,
        arrayId: array.id,
        row,
        column,
        label: `${row + 1}.${column + 1}`,
      });
    }
  }
  return panels;
}

export function buildWiringSummary(project, scenario, array) {
  const panel = findPanelType(project, array.panelTypeId);
  const inverter = findInverter(scenario, array.inverterId);
  const mppt = inverter?.mppts?.[array.mpptIndex ?? 0];
  const mode = getWiringMode(array.wiring?.mode);
  const strings = buildStrings(array, mode.id);
  const panelsPerString = Math.max(...strings.map((string) => string.panelCount), 0);
  const parallelStrings = strings.length;
  const dcKw = array.rows * array.columns * (panel?.pmaxW ?? 0) / 1000;
  const currentA = panel ? panel.imp * parallelStrings : 0;
  const iscA = panel ? panel.isc * parallelStrings : 0;
  const coldVocV = panel ? panelsPerString * panel.voc : 0;
  const hotVmppV = panel ? panelsPerString * panel.vmp : 0;

  return {
    array,
    panel,
    inverter,
    mppt,
    mode,
    strings,
    panelsPerString,
    parallelStrings,
    dcKw,
    currentA,
    iscA,
    coldVocV,
    hotVmppV,
  };
}

function buildStrings(array, modeId) {
  if (modeId === "single-string") {
    return [
      {
        id: `${array.id}-s1`,
        name: "String 1",
        panelCount: array.rows * array.columns,
      },
    ];
  }

  if (modeId === "columns-parallel") {
    return Array.from({ length: array.columns }, (_, index) => ({
      id: `${array.id}-c${index + 1}`,
      name: `Kolomstring ${index + 1}`,
      panelCount: array.rows,
    }));
  }

  return Array.from({ length: array.rows }, (_, index) => ({
    id: `${array.id}-r${index + 1}`,
    name: `Rijstring ${index + 1}`,
    panelCount: array.columns,
  }));
}

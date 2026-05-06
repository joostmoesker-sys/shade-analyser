export const STORAGE_KEY = "generic-pv-shadow-tool-project";

export const WORKFLOW_STEPS = [
  { id: "location", label: "Locatie" },
  { id: "objects", label: "Objecten" },
  { id: "arrays", label: "PV-arrays" },
  { id: "wiring", label: "Bekabeling" },
  { id: "inverters", label: "Inverters" },
  { id: "battery", label: "Accu & verbruik" },
  { id: "simulation", label: "Simulatie" },
  { id: "results", label: "Resultaten" },
];

export const PANEL_TYPES = [
  {
    id: "panel-lucksolar-340",
    manufacturer: "Lucksolar",
    model: "LS-MD120-340W",
    pmaxW: 340,
    vmp: 34.5,
    imp: 9.85,
    voc: 41.2,
    isc: 10.3,
    widthM: 1.002,
    heightM: 1.684,
    tempCoeffPmaxPct: -0.35,
  },
  {
    id: "panel-generic-430",
    manufacturer: "Generic",
    model: "Mono 430 Wp",
    pmaxW: 430,
    vmp: 32.8,
    imp: 13.1,
    voc: 39.2,
    isc: 13.9,
    widthM: 1.134,
    heightM: 1.722,
    tempCoeffPmaxPct: -0.30,
  },
];

export function createProject() {
  return {
    schemaVersion: 1,
    name: "Nieuw generiek PV-project",
    activeScenarioId: "scenario-base",
    location: {
      name: "Voorbeeldlocatie Nederland",
      latitude: 52.1326,
      longitude: 5.2913,
      elevationM: 4,
    },
    panelTypes: clone(PANEL_TYPES),
    scenarios: [
      {
        id: "scenario-base",
        name: "Basisscenario",
        sceneObjects: [createTree(360, 270), createBuilding(690, 340)],
        arrays: [createArray(470, 300)],
        inverters: [createInverter()],
        battery: {
          capacityKwh: 10,
          maxPowerKw: 5,
          roundTripEfficiencyPct: 92,
          standbyW: 12,
          gridChargeAllowed: false,
          exportAllowed: false,
        },
        load: {
          baseKwhPerDay: 10,
          heatPumpWinterKwhPerDay: 18,
        },
        weather: {
          source: "preview-monthly-profile",
          year: 2025,
          profile: "dutch-average",
          completenessPct: 100,
        },
        tariff: {
          buyEurPerKwh: 0.31,
          sellEurPerKwh: 0.09,
          importBalancingCostEurPerKwh: 0.02,
        },
        results: null,
      },
    ],
  };
}

export function createTree(x = 300, y = 260) {
  return {
    id: makeId("tree"),
    type: "tree",
    name: "Boom",
    x,
    y,
    heightM: 12,
    crownRadiusM: 4,
    trunkHeightM: 3,
    shadeDensityPct: 70,
    seasonalFactorPct: 80,
  };
}

export function createBuilding(x = 650, y = 330) {
  return {
    id: makeId("building"),
    type: "building",
    name: "Gebouw",
    x,
    y,
    widthM: 12,
    depthM: 8,
    heightM: 7,
    rotationDeg: 0,
    shadeDensityPct: 100,
  };
}

export function createChimney(x = 560, y = 260) {
  return {
    id: makeId("chimney"),
    type: "chimney",
    name: "Schoorsteen",
    x,
    y,
    widthM: 0.8,
    depthM: 0.8,
    heightM: 2.2,
    rotationDeg: 0,
    shadeDensityPct: 100,
  };
}

export function createDormer(x = 580, y = 310) {
  return {
    id: makeId("dormer"),
    type: "dormer",
    name: "Dakkapel",
    x,
    y,
    widthM: 4,
    depthM: 2.2,
    heightM: 1.8,
    rotationDeg: 0,
    shadeDensityPct: 95,
  };
}

export function createFreeObject(x = 610, y = 340) {
  return {
    id: makeId("free"),
    type: "free",
    name: "Vrij object",
    x,
    y,
    widthM: 3,
    depthM: 3,
    heightM: 3,
    rotationDeg: 0,
    shadeDensityPct: 80,
  };
}

export function createArray(x = 500, y = 320) {
  return {
    id: makeId("array"),
    name: "PV-array",
    x,
    y,
    rows: 3,
    columns: 6,
    orientation: "landscape",
    tiltDeg: 30,
    azimuthDeg: 180,
    heightM: 4,
    rowSpacingM: 0.2,
    panelTypeId: PANEL_TYPES[1].id,
    inverterId: "inverter-1",
    mpptIndex: 0,
    wiring: {
      mode: "series-per-row-parallel",
    },
  };
}

export function createPanelType() {
  return {
    id: makeId("panel"),
    manufacturer: "Custom",
    model: "Handmatig paneel",
    pmaxW: 420,
    vmp: 32,
    imp: 13.1,
    voc: 39,
    isc: 13.8,
    widthM: 1.13,
    heightM: 1.72,
    tempCoeffPmaxPct: -0.3,
  };
}

export function createInverter() {
  return {
    id: "inverter-1",
    name: "Hybride inverter",
    acMaxKw: 10,
    dcMaxKw: 14,
    standbyW: 15,
    efficiencyPct: 97,
    mppts: [
      {
        name: "MPPT 1",
        minVoltage: 120,
        maxVoltage: 850,
        startVoltage: 150,
        maxCurrent: 45,
        maxIsc: 52,
        maxPowerKw: 8,
      },
      {
        name: "MPPT 2",
        minVoltage: 120,
        maxVoltage: 850,
        startVoltage: 150,
        maxCurrent: 45,
        maxIsc: 52,
        maxPowerKw: 8,
      },
    ],
  };
}

export function duplicateScenario(project, scenarioId) {
  const source = findScenario(project, scenarioId);
  const copy = clone(source);
  copy.id = makeId("scenario");
  copy.name = `${source.name} kopie`;
  copy.results = null;
  project.scenarios.push(copy);
  project.activeScenarioId = copy.id;
  return copy;
}

export function findScenario(project, scenarioId = project.activeScenarioId) {
  return project.scenarios.find((scenario) => scenario.id === scenarioId) ?? project.scenarios[0];
}

export function findPanelType(project, panelTypeId) {
  return project.panelTypes.find((panel) => panel.id === panelTypeId) ?? project.panelTypes[0];
}

export function findInverter(scenario, inverterId) {
  return scenario.inverters.find((inverter) => inverter.id === inverterId) ?? scenario.inverters[0];
}

export function normalizeProject(value) {
  const fallback = createProject();
  if (!value || typeof value !== "object") return fallback;

  const project = {
    ...fallback,
    ...value,
    location: { ...fallback.location, ...(value.location ?? {}) },
    panelTypes: Array.isArray(value.panelTypes) && value.panelTypes.length ? value.panelTypes : fallback.panelTypes,
    scenarios: Array.isArray(value.scenarios) && value.scenarios.length ? value.scenarios : fallback.scenarios,
  };

  project.scenarios = project.scenarios.map((scenario, index) => ({
    id: scenario.id || makeId("scenario"),
    name: scenario.name || `Scenario ${index + 1}`,
    sceneObjects: Array.isArray(scenario.sceneObjects) ? scenario.sceneObjects.map(normalizeSceneObject) : [],
    arrays: Array.isArray(scenario.arrays) ? scenario.arrays : [],
    inverters: Array.isArray(scenario.inverters) && scenario.inverters.length ? scenario.inverters : [createInverter()],
    battery: { ...fallback.scenarios[0].battery, ...(scenario.battery ?? {}) },
    load: { ...fallback.scenarios[0].load, ...(scenario.load ?? {}) },
    weather: { ...fallback.scenarios[0].weather, ...(scenario.weather ?? {}) },
    tariff: { ...fallback.scenarios[0].tariff, ...(scenario.tariff ?? {}) },
    results: scenario.results ?? null,
  }));

  if (!project.scenarios.some((scenario) => scenario.id === project.activeScenarioId)) {
    project.activeScenarioId = project.scenarios[0].id;
  }

  return project;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSceneObject(object) {
  if (!object || typeof object !== "object") return object;
  const hasNoShadeDensity = object.shadeDensityPct === null || object.shadeDensityPct === undefined;
  const hasLegacyDensity = object.densityPct !== null && object.densityPct !== undefined;
  if (object.type === "tree" && hasNoShadeDensity && hasLegacyDensity) {
    const normalized = { ...object, shadeDensityPct: object.densityPct };
    delete normalized.densityPct;
    return normalized;
  }
  return object;
}

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

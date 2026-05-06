import {
  WORKFLOW_STEPS,
  clone,
  createArray,
  createBuilding,
  createChimney,
  createDormer,
  createFreeObject,
  createInverter,
  createPanelType,
  createProject,
  createTree,
  duplicateScenario,
  findInverter,
  findPanelType,
  findScenario,
  normalizeProject,
  STORAGE_KEY,
} from "./model.js";
import { DEFAULT_MAP_ZOOM, TILE_SIZE, buildTileLayout, latLonToPixel, pixelToLatLon } from "./map.js";
import { runPreviewSimulation } from "./simulation.js";
import { validateProject } from "./validation.js";
import { buildWiringSummary, WIRING_MODES } from "./wiring.js";

const state = {
  project: loadProject(),
  activeStep: "location",
  selectedId: null,
  map: null,
  drag: null,
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  bindDom();
  bindEvents();
  render();
});

window.addEventListener("resize", () => {
  if (dom.osmMap) renderOsmMap();
});

function bindDom() {
  for (const id of [
    "newProjectBtn",
    "saveProjectBtn",
    "exportProjectBtn",
    "importProjectInput",
    "projectNameInput",
    "scenarioSelect",
    "scenarioNameInput",
    "duplicateScenarioBtn",
    "runSimulationBtn",
    "runAllScenariosBtn",
    "workflowNav",
    "projectTree",
    "osmMap",
    "tileLayer",
    "sceneCanvas",
    "zoomOutBtn",
    "zoomInBtn",
    "locationSearchInput",
    "locationSearchBtn",
    "locationSearchResults",
    "locationNameInput",
    "locationElevationInput",
    "locationLatInput",
    "locationLonInput",
    "addTreeBtn",
    "addBuildingBtn",
    "addChimneyBtn",
    "addDormerBtn",
    "addFreeObjectBtn",
    "objectEditor",
    "addArrayBtn",
    "addPanelTypeBtn",
    "arrayEditor",
    "panelTypeEditor",
    "wiringEditor",
    "addInverterBtn",
    "inverterEditor",
    "dailyLoadInput",
    "heatPumpWinterInput",
    "batteryCapacityInput",
    "batteryPowerInput",
    "batteryEfficiencyInput",
    "batteryStandbyInput",
    "gridChargeInput",
    "batteryExportInput",
    "validationList",
    "weatherProfileInput",
    "weatherYearInput",
    "tariffBuyInput",
    "tariffSellInput",
    "tariffImportCostInput",
    "runSimulationBtnSecondary",
    "exportCsvBtn",
    "resultCards",
    "monthlyChart",
    "lossDetails",
    "scenarioComparison",
    "exportDialog",
    "exportText",
    "notificationRegion",
  ]) {
    dom[id] = document.getElementById(id);
  }
}

function bindEvents() {
  dom.newProjectBtn.addEventListener("click", () => {
    state.project = createProject();
    state.selectedId = null;
    state.map = null;
    persist();
    render();
  });

  dom.saveProjectBtn.addEventListener("click", persist);
  dom.exportProjectBtn.addEventListener("click", showExportDialog);
  dom.importProjectInput.addEventListener("change", importProject);
  dom.duplicateScenarioBtn.addEventListener("click", () => {
    duplicateScenario(state.project, state.project.activeScenarioId);
    persist();
    render();
  });
  dom.runSimulationBtn.addEventListener("click", runSimulation);
  dom.runSimulationBtnSecondary.addEventListener("click", runSimulation);
  dom.runAllScenariosBtn.addEventListener("click", runAllScenarios);
  dom.zoomOutBtn.addEventListener("click", () => zoomMap(-1));
  dom.zoomInBtn.addEventListener("click", () => zoomMap(1));
  dom.locationSearchBtn.addEventListener("click", searchLocation);
  dom.locationSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchLocation();
    }
  });
  dom.osmMap.addEventListener("click", selectMapLocation);
  dom.osmMap.addEventListener("pointerdown", startMapDrag);
  dom.addTreeBtn.addEventListener("click", () => addSceneObject(createTree()));
  dom.addBuildingBtn.addEventListener("click", () => addSceneObject(createBuilding()));
  dom.addChimneyBtn.addEventListener("click", () => addSceneObject(createChimney()));
  dom.addDormerBtn.addEventListener("click", () => addSceneObject(createDormer()));
  dom.addFreeObjectBtn.addEventListener("click", () => addSceneObject(createFreeObject()));
  dom.addArrayBtn.addEventListener("click", addArray);
  dom.addPanelTypeBtn.addEventListener("click", addPanelType);
  dom.addInverterBtn.addEventListener("click", addInverter);
  dom.exportCsvBtn.addEventListener("click", exportResultsCsv);

  bindInput(dom.projectNameInput, (value) => { state.project.name = value; });
  bindInput(dom.scenarioSelect, (value) => {
    state.project.activeScenarioId = value;
    state.selectedId = null;
  });
  bindInput(dom.scenarioNameInput, (value, scenario) => { scenario.name = value; });
  bindInput(dom.locationNameInput, (value) => { state.project.location.name = value; });
  bindNumber(dom.locationElevationInput, (value) => { state.project.location.elevationM = value; });
  bindNumber(dom.locationLatInput, (value) => { updateProjectLocation({ latitude: value }); });
  bindNumber(dom.locationLonInput, (value) => { updateProjectLocation({ longitude: value }); });

  bindNumber(dom.dailyLoadInput, (value, scenario) => { scenario.load.baseKwhPerDay = value; });
  bindNumber(dom.heatPumpWinterInput, (value, scenario) => { scenario.load.heatPumpWinterKwhPerDay = value; });
  bindNumber(dom.batteryCapacityInput, (value, scenario) => { scenario.battery.capacityKwh = value; });
  bindNumber(dom.batteryPowerInput, (value, scenario) => { scenario.battery.maxPowerKw = value; });
  bindNumber(dom.batteryEfficiencyInput, (value, scenario) => { scenario.battery.roundTripEfficiencyPct = value; });
  bindNumber(dom.batteryStandbyInput, (value, scenario) => { scenario.battery.standbyW = value; });
  bindCheckbox(dom.gridChargeInput, (value, scenario) => { scenario.battery.gridChargeAllowed = value; });
  bindCheckbox(dom.batteryExportInput, (value, scenario) => { scenario.battery.exportAllowed = value; });
  bindInput(dom.weatherProfileInput, (value, scenario) => { scenario.weather.profile = value; });
  bindNumber(dom.weatherYearInput, (value, scenario) => { scenario.weather.year = Math.round(value); });
  bindNumber(dom.tariffBuyInput, (value, scenario) => { scenario.tariff.buyEurPerKwh = value; });
  bindNumber(dom.tariffSellInput, (value, scenario) => { scenario.tariff.sellEurPerKwh = value; });
  bindNumber(dom.tariffImportCostInput, (value, scenario) => { scenario.tariff.importBalancingCostEurPerKwh = value; });
}

function render() {
  const scenario = findScenario(state.project);
  renderWorkflowNav();
  renderSections();
  renderProjectBasics(scenario);
  renderProjectTree(scenario);
  renderLocation();
  renderObjectEditor(scenario);
  renderArrayEditor(scenario);
  renderPanelTypeEditor(scenario);
  renderWiringEditor(scenario);
  renderInverterEditor(scenario);
  renderBatteryEditor(scenario);
  renderSimulationSettings(scenario);
  renderValidation(scenario);
  renderResults(scenario);
  renderCanvas(scenario);
}

function renderWorkflowNav() {
  dom.workflowNav.replaceChildren(...WORKFLOW_STEPS.map((step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = step.label;
    button.setAttribute("aria-current", String(step.id === state.activeStep));
    button.addEventListener("click", () => {
      state.activeStep = step.id;
      render();
    });
    return button;
  }));
}

function renderSections() {
  for (const step of WORKFLOW_STEPS) {
    const section = document.getElementById(`${step.id}Section`);
    if (section) section.hidden = step.id !== state.activeStep;
  }
}

function renderProjectBasics(scenario) {
  setValue(dom.projectNameInput, state.project.name);
  setValue(dom.scenarioNameInput, scenario.name);
  dom.scenarioSelect.replaceChildren(...state.project.scenarios.map((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    option.selected = item.id === scenario.id;
    return option;
  }));
}

function renderProjectTree(scenario) {
  const items = [
    treeHeader("Objecten", scenario.sceneObjects.length),
    ...scenario.sceneObjects.map((object) => treeButton(object.id, object.name, object.type)),
    treeHeader("PV-arrays", scenario.arrays.length),
    ...scenario.arrays.map((array) => treeButton(array.id, array.name, `${array.rows}×${array.columns}`)),
    treeHeader("Inverters", scenario.inverters.length),
    ...scenario.inverters.map((inverter) => treeButton(inverter.id, inverter.name, `${inverter.mppts.length} MPPT`)),
  ];
  dom.projectTree.replaceChildren(...items);
}

function renderLocation() {
  setValue(dom.locationNameInput, state.project.location.name);
  setValue(dom.locationElevationInput, state.project.location.elevationM);
  setValue(dom.locationLatInput, state.project.location.latitude);
  setValue(dom.locationLonInput, state.project.location.longitude);
}

function renderObjectEditor(scenario) {
  const editors = scenario.sceneObjects.map((object) => {
    const item = editorItem(object.name, object.id);
    item.append(
      field("Naam", object.name, (value) => { object.name = value; }),
      numberField("X", object.x, (value) => { object.x = value; }),
      numberField("Y", object.y, (value) => { object.y = value; }),
      numberField("Hoogte (m)", object.heightM, (value) => { object.heightM = value; }),
    );

    if (object.type === "tree") {
      item.append(
        numberField("Kruinradius (m)", object.crownRadiusM, (value) => { object.crownRadiusM = value; }),
        numberField("Stamhoogte (m)", object.trunkHeightM, (value) => { object.trunkHeightM = value; }),
        numberField("Dichtheid (%)", object.shadeDensityPct, (value) => { object.shadeDensityPct = value; }),
        numberField("Seizoensfactor (%)", object.seasonalFactorPct, (value) => { object.seasonalFactorPct = value; }),
      );
    } else {
      item.append(
        numberField("Breedte (m)", object.widthM, (value) => { object.widthM = value; }),
        numberField("Diepte (m)", object.depthM, (value) => { object.depthM = value; }),
        numberField("Rotatie (°)", object.rotationDeg, (value) => { object.rotationDeg = value; }),
        numberField("Schaduwdichtheid (%)", object.shadeDensityPct, (value) => { object.shadeDensityPct = value; }),
      );
    }

    item.append(removeButton("Object verwijderen", () => {
      scenario.sceneObjects = scenario.sceneObjects.filter((candidate) => candidate.id !== object.id);
      state.selectedId = null;
      persist();
      render();
    }));

    return item;
  });

  dom.objectEditor.replaceChildren(...editors);
}

function renderArrayEditor(scenario) {
  const editors = scenario.arrays.map((array) => {
    const item = editorItem(array.name, array.id);
    item.append(
      field("Naam", array.name, (value) => { array.name = value; }),
      numberField("X", array.x, (value) => { array.x = value; }),
      numberField("Y", array.y, (value) => { array.y = value; }),
      numberField("Rijen", array.rows, (value) => { array.rows = Math.max(1, Math.round(value)); }),
      numberField("Kolommen", array.columns, (value) => { array.columns = Math.max(1, Math.round(value)); }),
      selectField("Paneeltype", array.panelTypeId, state.project.panelTypes.map((panel) => ({
        value: panel.id,
        label: `${panel.manufacturer} ${panel.model} (${panel.pmaxW} Wp)`,
      })), (value) => { array.panelTypeId = value; }),
      selectField("Oriëntatie", array.orientation, [
        { value: "landscape", label: "Landscape" },
        { value: "portrait", label: "Portrait" },
      ], (value) => { array.orientation = value; }),
      numberField("Tilt (°)", array.tiltDeg, (value) => { array.tiltDeg = value; }),
      numberField("Azimuth (°)", array.azimuthDeg, (value) => { array.azimuthDeg = value; }),
      numberField("Hoogte (m)", array.heightM, (value) => { array.heightM = value; }),
      numberField("Rijafstand (m)", array.rowSpacingM, (value) => { array.rowSpacingM = value; }),
      selectField("Bekabelingsmodus", array.wiring?.mode ?? "series-per-row-parallel", WIRING_MODES.map((mode) => ({
        value: mode.id,
        label: mode.label,
      })), (value) => { array.wiring = { ...(array.wiring ?? {}), mode: value }; }),
      selectField("Inverter", array.inverterId, scenario.inverters.map((inverter) => ({
        value: inverter.id,
        label: inverter.name,
      })), (value) => { array.inverterId = value; array.mpptIndex = 0; }),
      selectField("MPPT", String(array.mpptIndex ?? 0), mpptOptions(scenario, array), (value) => { array.mpptIndex = Number(value); }),
      removeButton("Array verwijderen", () => {
        scenario.arrays = scenario.arrays.filter((candidate) => candidate.id !== array.id);
        state.selectedId = null;
        persist();
        render();
      }),
    );
    return item;
  });

  dom.arrayEditor.replaceChildren(...editors);
}

function renderPanelTypeEditor(scenario) {
  const usedPanelTypeIds = new Set(scenario.arrays.map((array) => array.panelTypeId));
  const editors = state.project.panelTypes.map((panel) => {
    const item = editorItem(`${panel.manufacturer} ${panel.model}`, panel.id);
    item.append(
      field("Fabrikant", panel.manufacturer, (value) => { panel.manufacturer = value; }),
      field("Model", panel.model, (value) => { panel.model = value; }),
      numberField("Pmax (Wp)", panel.pmaxW, (value) => { panel.pmaxW = value; }),
      numberField("Vmp (V)", panel.vmp, (value) => { panel.vmp = value; }),
      numberField("Imp (A)", panel.imp, (value) => { panel.imp = value; }),
      numberField("Voc (V)", panel.voc, (value) => { panel.voc = value; }),
      numberField("Isc (A)", panel.isc, (value) => { panel.isc = value; }),
      numberField("Breedte (m)", panel.widthM, (value) => { panel.widthM = value; }),
      numberField("Hoogte (m)", panel.heightM, (value) => { panel.heightM = value; }),
      numberField("Tempco Pmax (%/°C)", panel.tempCoeffPmaxPct, (value) => { panel.tempCoeffPmaxPct = value; }),
    );

    if (!usedPanelTypeIds.has(panel.id) && state.project.panelTypes.length > 1) {
      item.append(removeButton("Paneeltype verwijderen", () => {
        state.project.panelTypes = state.project.panelTypes.filter((candidate) => candidate.id !== panel.id);
        persist();
        render();
      }));
    }

    return item;
  });

  dom.panelTypeEditor.replaceChildren(...editors);
}

function renderWiringEditor(scenario) {
  const rows = scenario.arrays.map((array) => {
    const wiring = buildWiringSummary(state.project, scenario, array);
    const item = editorItem(array.name, array.id);
    const text = document.createElement("p");
    text.className = "muted";
    text.textContent = `${wiring.mode.label}: ${wiring.parallelStrings} strings × ${wiring.panelsPerString} panelen serie → ${wiring.inverter?.name ?? "geen inverter"} / ${wiring.mppt?.name ?? "geen MPPT"} · ${wiring.panel?.pmaxW ?? 0} Wp per paneel`;
    item.append(text);
    wiring.strings.forEach((string) => {
      const detail = document.createElement("div");
      detail.className = "muted";
      detail.textContent = `${string.name}: ${string.panelCount} panelen serie`;
      item.append(detail);
    });
    return item;
  });
  dom.wiringEditor.replaceChildren(...rows);
}

function renderInverterEditor(scenario) {
  const editors = scenario.inverters.map((inverter) => {
    const item = editorItem(inverter.name, inverter.id);
    item.append(
      field("Naam", inverter.name, (value) => { inverter.name = value; }),
      numberField("AC max (kW)", inverter.acMaxKw, (value) => { inverter.acMaxKw = value; }),
      numberField("DC max (kW)", inverter.dcMaxKw, (value) => { inverter.dcMaxKw = value; }),
      numberField("Efficiëntie (%)", inverter.efficiencyPct, (value) => { inverter.efficiencyPct = value; }),
      numberField("Standby (W)", inverter.standbyW, (value) => { inverter.standbyW = value; }),
    );

    inverter.mppts.forEach((mppt, index) => {
      item.append(
        field(`MPPT ${index + 1} naam`, mppt.name, (value) => { mppt.name = value; }),
        numberField(`MPPT ${index + 1} min V`, mppt.minVoltage, (value) => { mppt.minVoltage = value; }),
        numberField(`MPPT ${index + 1} max V`, mppt.maxVoltage, (value) => { mppt.maxVoltage = value; }),
        numberField(`MPPT ${index + 1} max A`, mppt.maxCurrent, (value) => { mppt.maxCurrent = value; }),
        numberField(`MPPT ${index + 1} max Isc`, mppt.maxIsc, (value) => { mppt.maxIsc = value; }),
        numberField(`MPPT ${index + 1} max kW`, mppt.maxPowerKw, (value) => { mppt.maxPowerKw = value; }),
      );
    });

    item.append(removeButton("Inverter verwijderen", () => {
      if (scenario.inverters.length <= 1) return;
      scenario.inverters = scenario.inverters.filter((candidate) => candidate.id !== inverter.id);
      scenario.arrays.forEach((array) => {
        if (array.inverterId === inverter.id) {
          array.inverterId = scenario.inverters[0].id;
          array.mpptIndex = 0;
        }
      });
      state.selectedId = null;
      persist();
      render();
    }));

    return item;
  });

  dom.inverterEditor.replaceChildren(...editors);
}

function renderBatteryEditor(scenario) {
  setValue(dom.dailyLoadInput, scenario.load.baseKwhPerDay);
  setValue(dom.heatPumpWinterInput, scenario.load.heatPumpWinterKwhPerDay);
  setValue(dom.batteryCapacityInput, scenario.battery.capacityKwh);
  setValue(dom.batteryPowerInput, scenario.battery.maxPowerKw);
  setValue(dom.batteryEfficiencyInput, scenario.battery.roundTripEfficiencyPct);
  setValue(dom.batteryStandbyInput, scenario.battery.standbyW);
  dom.gridChargeInput.checked = scenario.battery.gridChargeAllowed;
  dom.batteryExportInput.checked = scenario.battery.exportAllowed;
}

function renderSimulationSettings(scenario) {
  setValue(dom.weatherProfileInput, scenario.weather.profile);
  setValue(dom.weatherYearInput, scenario.weather.year);
  setValue(dom.tariffBuyInput, scenario.tariff.buyEurPerKwh);
  setValue(dom.tariffSellInput, scenario.tariff.sellEurPerKwh);
  setValue(dom.tariffImportCostInput, scenario.tariff.importBalancingCostEurPerKwh);
}

function renderValidation(scenario) {
  const messages = validateProject(state.project, scenario);
  dom.validationList.replaceChildren(...messages.map((message) => {
    const item = document.createElement("div");
    item.className = `validation-item ${message.level}`;
    const strong = document.createElement("strong");
    strong.textContent = `${message.level.toUpperCase()} · ${message.section}`;
    const text = document.createElement("div");
    text.textContent = message.text;
    item.append(strong, text);
    return item;
  }));
}

function renderResults(scenario) {
  const results = scenario.results;
  if (!results) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nog geen simulatie uitgevoerd.";
    dom.resultCards.replaceChildren(empty);
    dom.monthlyChart.replaceChildren();
    dom.lossDetails.replaceChildren();
    renderScenarioComparison();
    return;
  }

  dom.resultCards.replaceChildren(
    resultCard("PV-opbrengst", `${format(results.yearlyPvKwh)} kWh/jaar`),
    resultCard("Eigenverbruik", `${format(results.selfConsumptionPct)}%`),
    resultCard("Import", `${format(results.importKwh)} kWh/jaar`),
    resultCard("Export", `${format(results.exportKwh)} kWh/jaar`),
    resultCard("Waarde", `€${format(results.annualValueEur)}/jaar`),
    resultCard("Accucycli", `${format(results.battery.cycles)}/jaar`),
  );

  const maxPv = Math.max(...results.monthly.map((month) => month.pvKwh), 1);
  dom.monthlyChart.replaceChildren(...results.monthly.map((month) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.height = `${Math.max(2, month.pvKwh / maxPv * 115)}px`;
    const label = document.createElement("span");
    label.textContent = month.label;
    bar.title = `${month.label}: ${format(month.pvKwh)} kWh PV, ${format(month.loadKwh)} kWh verbruik`;
    bar.append(fill, label);
    return bar;
  }));

  dom.lossDetails.replaceChildren(...results.arrays.map((array) => {
    const item = document.createElement("div");
    item.className = "editor-item";
    item.append(
      textLine(array.name, `${format(array.annualKwh)} kWh/jaar`),
      textLine("DC vermogen", `${format(array.dcKwp)} kWp`),
      textLine("Bekabeling", `${array.wiringMode}: ${array.stringCount} × ${array.panelsPerString}`),
      textLine("Schaduwverlies", `${format(array.shadowLossPct)}%`),
      textLine("Clippingverlies", `${format(array.clippingLossPct)}%`),
    );
    return item;
  }));
  renderScenarioComparison();
}

function renderCanvas(scenario) {
  renderOsmMap();
  const svg = dom.sceneCanvas;
  clear(svg);

  const defs = svgEl("defs");
  const arrow = svgEl("marker", { id: "northArrow", markerWidth: "8", markerHeight: "8", refX: "4", refY: "4", orient: "auto" });
  arrow.append(svgEl("path", { d: "M0,8 L4,0 L8,8 Z", fill: "#38bdf8" }));
  defs.append(arrow);
  svg.append(defs);

  svg.append(svgEl("line", { x1: 940, y1: 95, x2: 940, y2: 35, stroke: "#38bdf8", "stroke-width": 3, "marker-end": "url(#northArrow)" }));
  const north = svgEl("text", { x: 930, y: 118, fill: "#9ca3af", "font-size": 16 });
  north.textContent = "N";
  svg.append(north);

  renderLocationMarker(svg);
  scenario.sceneObjects.forEach((object) => renderSceneObject(svg, object));
  scenario.arrays.forEach((array) => renderArray(svg, array));
}

function renderOsmMap() {
  ensureMapState();
  const rect = dom.osmMap.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const layout = buildTileLayout(state.map.centerLatitude, state.map.centerLongitude, state.map.zoom, width, height);
  dom.tileLayer.replaceChildren(...layout.tiles.map((tile) => {
    const image = document.createElement("img");
    image.src = `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.style.left = `${tile.left}px`;
    image.style.top = `${tile.top}px`;
    image.width = TILE_SIZE;
    image.height = TILE_SIZE;
    return image;
  }));
}

function renderLocationMarker(svg) {
  const marker = svgEl("g", { class: "location-marker" });
  marker.append(
    svgEl("circle", { cx: 500, cy: 310, r: 13, fill: "#ef4444", stroke: "#fecaca", "stroke-width": 3 }),
    svgEl("circle", { cx: 500, cy: 310, r: 4, fill: "#fff" }),
  );
  const label = svgEl("text", { x: 518, y: 306, fill: "#fff", "font-size": 14, "paint-order": "stroke", stroke: "#0f172a", "stroke-width": 4 });
  label.textContent = state.project.location.name || "Projectlocatie";
  marker.append(label);
  svg.append(marker);
}

function renderSceneObject(svg, object) {
  if (object.type === "tree") {
    const crown = svgEl("circle", {
      cx: object.x,
      cy: object.y,
      r: Math.max(14, object.crownRadiusM * 5),
      fill: "#22c55e",
      "fill-opacity": 0.45 + (object.shadeDensityPct ?? 60) / 250,
      stroke: object.id === state.selectedId ? "#7dd3fc" : "#86efac",
      "stroke-width": object.id === state.selectedId ? 4 : 2,
      class: `canvas-shape${object.id === state.selectedId ? " selected" : ""}`,
    });
    crown.addEventListener("click", (event) => {
      event.stopPropagation();
      selectItem(object.id, "objects");
    });
    svg.append(crown);
  } else {
    const width = Math.max(24, object.widthM * 7);
    const height = Math.max(20, object.depthM * 7);
    const rect = svgEl("rect", {
      x: object.x - width / 2,
      y: object.y - height / 2,
      width,
      height,
      rx: 4,
      fill: objectFill(object.type),
      "fill-opacity": 0.56,
      stroke: object.id === state.selectedId ? "#7dd3fc" : "#fed7aa",
      "stroke-width": object.id === state.selectedId ? 4 : 2,
      transform: `rotate(${object.rotationDeg ?? 0} ${object.x} ${object.y})`,
      class: `canvas-shape${object.id === state.selectedId ? " selected" : ""}`,
    });
    rect.addEventListener("click", (event) => {
      event.stopPropagation();
      selectItem(object.id, "objects");
    });
    svg.append(rect);
  }
}

function renderArray(svg, array) {
  const panelW = array.orientation === "landscape" ? 30 : 18;
  const panelH = array.orientation === "landscape" ? 18 : 30;
  const gap = 4;
  const width = array.columns * panelW + (array.columns - 1) * gap;
  const height = array.rows * panelH + (array.rows - 1) * gap;
  const group = svgEl("g", {
    transform: `translate(${array.x - width / 2} ${array.y - height / 2}) rotate(${array.azimuthDeg - 180} ${width / 2} ${height / 2})`,
    class: `canvas-shape${array.id === state.selectedId ? " selected" : ""}`,
  });
  group.addEventListener("click", (event) => {
    event.stopPropagation();
    selectItem(array.id, "arrays");
  });

  for (let row = 0; row < array.rows; row += 1) {
    for (let column = 0; column < array.columns; column += 1) {
      group.append(svgEl("rect", {
        x: column * (panelW + gap),
        y: row * (panelH + gap),
        width: panelW,
        height: panelH,
        rx: 2,
        fill: "#38bdf8",
        "fill-opacity": 0.72,
        stroke: array.id === state.selectedId ? "#f0f9ff" : "#0ea5e9",
      }));
    }
  }

  svg.append(group);
}

function addSceneObject(object) {
  const scenario = findScenario(state.project);
  scenario.sceneObjects.push(object);
  state.selectedId = object.id;
  state.activeStep = "objects";
  persist();
  render();
}

function addArray() {
  const scenario = findScenario(state.project);
  const array = createArray(500 + scenario.arrays.length * 30, 320 + scenario.arrays.length * 20);
  if (scenario.inverters[0]) array.inverterId = scenario.inverters[0].id;
  scenario.arrays.push(array);
  state.selectedId = array.id;
  state.activeStep = "arrays";
  persist();
  render();
}

function addPanelType() {
  const panel = createPanelType();
  state.project.panelTypes.push(panel);
  state.selectedId = panel.id;
  state.activeStep = "arrays";
  persist();
  render();
}

function addInverter() {
  const scenario = findScenario(state.project);
  const inverter = createInverter();
  inverter.id = `inverter-${scenario.inverters.length + 1}`;
  inverter.name = `Inverter ${scenario.inverters.length + 1}`;
  scenario.inverters.push(inverter);
  state.selectedId = inverter.id;
  state.activeStep = "inverters";
  persist();
  render();
}

function exportResultsCsv() {
  const scenario = findScenario(state.project);
  if (!scenario.results) {
    showNotification("error", "Geen resultaten", "Draai eerst een preview simulatie voordat je CSV exporteert.");
    return;
  }

  const rows = [
    ["month", "pv_kwh", "load_kwh"],
    ...scenario.results.monthly.map((month) => [month.label, roundForCsv(month.pvKwh), roundForCsv(month.loadKwh)]),
    [],
    ["array", "annual_kwh", "dc_kwp", "wiring_mode", "strings", "panels_per_string", "shadow_loss_pct", "clipping_loss_pct"],
    ...scenario.results.arrays.map((array) => [
      array.name,
      roundForCsv(array.annualKwh),
      roundForCsv(array.dcKwp),
      array.wiringMode,
      array.stringCount,
      array.panelsPerString,
      roundForCsv(array.shadowLossPct),
      roundForCsv(array.clippingLossPct),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.project.name.replaceAll(/\W+/g, "-").toLowerCase()}-${scenario.name.replaceAll(/\W+/g, "-").toLowerCase()}-results.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function runSimulation() {
  const scenario = findScenario(state.project);
  const { validation, results } = runPreviewSimulation(state.project, scenario);
  renderValidationMessages(validation);
  if (results) {
    scenario.results = results;
    state.activeStep = "results";
    persist();
    render();
  } else {
    state.activeStep = "simulation";
    render();
  }
}

function runAllScenarios() {
  const originalScenarioId = state.project.activeScenarioId;
  let completed = 0;

  for (const scenario of state.project.scenarios) {
    const { results } = runPreviewSimulation(state.project, scenario);
    if (results) {
      scenario.results = results;
      completed += 1;
    }
  }

  state.project.activeScenarioId = originalScenarioId;
  state.activeStep = "results";
  persist();
  render();
  showNotification("ok", "Scenario's gesimuleerd", `${completed} van ${state.project.scenarios.length} scenario's hebben geldige previewresultaten.`);
}

async function searchLocation() {
  const query = dom.locationSearchInput.value.trim();
  if (!query) {
    showNotification("error", "Geen zoekterm", "Voer een adres, plaats of postcode in om te zoeken.");
    return;
  }

  dom.locationSearchResults.replaceChildren(searchStatus("Zoeken…"));
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("q", query);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Nominatim antwoordde met HTTP ${response.status}.`);
    const results = await response.json();
    renderLocationSearchResults(Array.isArray(results) ? results : []);
  } catch (error) {
    dom.locationSearchResults.replaceChildren(searchStatus("Zoeken mislukt. Controleer de internetverbinding of probeer later opnieuw."));
    showNotification("error", "Locatie zoeken mislukt", error.message);
  }
}

function renderLocationSearchResults(results) {
  if (!results.length) {
    dom.locationSearchResults.replaceChildren(searchStatus("Geen locaties gevonden."));
    return;
  }

  dom.locationSearchResults.replaceChildren(...results.map((result) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.textContent = result.display_name;
    button.addEventListener("click", () => {
      updateProjectLocation({
        latitude: Number(result.lat),
        longitude: Number(result.lon),
        name: result.display_name,
      });
      dom.locationSearchInput.value = result.display_name;
      dom.locationSearchResults.replaceChildren(searchStatus("Locatie geselecteerd."));
      persist();
      render();
    });
    return button;
  }));
}

function selectMapLocation(event) {
  if (state.drag?.suppressClick) {
    state.drag.suppressClick = false;
    return;
  }

  ensureMapState();
  const rect = dom.osmMap.getBoundingClientRect();
  const center = latLonToPixel(state.map.centerLatitude, state.map.centerLongitude, state.map.zoom);
  const x = center.x + event.clientX - rect.left - rect.width / 2;
  const y = center.y + event.clientY - rect.top - rect.height / 2;
  const location = pixelToLatLon(x, y, state.map.zoom);
  updateProjectLocation({
    latitude: location.latitude,
    longitude: location.longitude,
    name: "Geselecteerde kaartlocatie",
  });
  state.activeStep = "location";
  persist();
  render();
}

function startMapDrag(event) {
  if (event.button !== 0 || event.target.closest(".map-controls") || event.target.closest(".canvas-shape")) return;

  ensureMapState();
  const center = latLonToPixel(state.map.centerLatitude, state.map.centerLongitude, state.map.zoom);
  state.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    centerX: center.x,
    centerY: center.y,
    suppressClick: false,
  };
  dom.osmMap.setPointerCapture(event.pointerId);
  dom.osmMap.addEventListener("pointermove", dragMap);
  dom.osmMap.addEventListener("pointerup", endMapDrag, { once: true });
  dom.osmMap.addEventListener("pointercancel", endMapDrag, { once: true });
}

function dragMap(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const dx = event.clientX - state.drag.startX;
  const dy = event.clientY - state.drag.startY;
  if (Math.hypot(dx, dy) > 5) state.drag.suppressClick = true;
  const center = pixelToLatLon(state.drag.centerX - dx, state.drag.centerY - dy, state.map.zoom);
  state.map.centerLatitude = center.latitude;
  state.map.centerLongitude = center.longitude;
  renderOsmMap();
}

function endMapDrag(event) {
  if (state.drag && event.pointerId === state.drag.pointerId) {
    dom.osmMap.releasePointerCapture(event.pointerId);
  }
  dom.osmMap.removeEventListener("pointermove", dragMap);
}

function zoomMap(delta) {
  ensureMapState();
  state.map.zoom = Math.min(20, Math.max(2, state.map.zoom + delta));
  render();
}

function ensureMapState() {
  if (!state.map) {
    state.map = {
      centerLatitude: state.project.location.latitude,
      centerLongitude: state.project.location.longitude,
      zoom: DEFAULT_MAP_ZOOM,
    };
  }
}

function updateProjectLocation({ latitude, longitude, name }) {
  const nextLatitude = latitude ?? state.project.location.latitude;
  const nextLongitude = longitude ?? state.project.location.longitude;
  state.project.location.latitude = clampCoordinate(nextLatitude, -85.05112878, 85.05112878);
  state.project.location.longitude = clampCoordinate(nextLongitude, -180, 180);
  if (name) state.project.location.name = name;
  ensureMapState();
  state.map.centerLatitude = state.project.location.latitude;
  state.map.centerLongitude = state.project.location.longitude;
}

function renderScenarioComparison() {
  const completed = state.project.scenarios.filter((scenario) => scenario.results);
  if (!completed.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nog geen scenarioresultaten beschikbaar.";
    dom.scenarioComparison.replaceChildren(empty);
    return;
  }

  const table = document.createElement("table");
  const header = document.createElement("tr");
  ["Scenario", "PV kWh", "Eigenverbruik", "Import kWh", "Export kWh", "Waarde", "Accucycli"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    header.append(th);
  });
  const thead = document.createElement("thead");
  thead.append(header);
  const tbody = document.createElement("tbody");
  completed.forEach((scenario) => {
    const result = scenario.results;
    const tr = document.createElement("tr");
    [
      scenario.name,
      format(result.yearlyPvKwh),
      `${format(result.selfConsumptionPct)}%`,
      format(result.importKwh),
      format(result.exportKwh),
      `€${format(result.annualValueEur)}`,
      format(result.battery.cycles),
    ].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(thead, tbody);
  dom.scenarioComparison.replaceChildren(table);
}

function renderValidationMessages(messages) {
  dom.validationList.replaceChildren(...messages.map((message) => {
    const item = document.createElement("div");
    item.className = `validation-item ${message.level}`;
    item.textContent = `${message.section}: ${message.text}`;
    return item;
  }));
}

function treeHeader(label, count) {
  const item = document.createElement("div");
  item.className = "tree-item";
  const strong = document.createElement("strong");
  strong.textContent = label;
  const small = document.createElement("small");
  small.textContent = String(count);
  item.append(strong, small);
  return item;
}

function treeButton(id, label, detail) {
  const item = document.createElement("div");
  item.className = `tree-item${id === state.selectedId ? " selected" : ""}`;
  item.addEventListener("click", () => selectItem(id));
  const strong = document.createElement("strong");
  strong.textContent = label;
  const small = document.createElement("small");
  small.textContent = detail;
  item.append(strong, small);
  return item;
}

function selectItem(id, preferredStep = null) {
  state.selectedId = id;
  if (preferredStep) state.activeStep = preferredStep;
  render();
}

function editorItem(title, id) {
  const item = document.createElement("div");
  item.className = "editor-item";
  if (id === state.selectedId) item.style.borderColor = "var(--accent)";
  const heading = document.createElement("strong");
  heading.textContent = title;
  item.append(heading);
  return item;
}

function field(labelText, value, onChange) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "text";
  input.value = value ?? "";
  input.addEventListener("change", () => {
    onChange(input.value);
    persist();
    render();
  });
  label.append(input);
  return label;
}

function numberField(labelText, value, onChange) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  input.value = value ?? 0;
  input.addEventListener("change", () => {
    onChange(Number(input.value));
    persist();
    render();
  });
  label.append(input);
  return label;
}

function selectField(labelText, value, options, onChange) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const select = document.createElement("select");
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    item.selected = option.value === value;
    select.append(item);
  });
  select.addEventListener("change", () => {
    onChange(select.value);
    persist();
    render();
  });
  label.append(select);
  return label;
}

function removeButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function resultCard(label, value) {
  const item = document.createElement("div");
  item.className = "result-card";
  const title = document.createElement("span");
  title.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  item.append(title, strong);
  return item;
}

function textLine(label, value) {
  const line = document.createElement("div");
  line.className = "muted";
  line.textContent = `${label}: ${value}`;
  return line;
}

function searchStatus(text) {
  const item = document.createElement("p");
  item.className = "muted";
  item.textContent = text;
  return item;
}

function mpptOptions(scenario, array) {
  const inverter = findInverter(scenario, array.inverterId);
  return (inverter?.mppts ?? []).map((mppt, index) => ({
    value: String(index),
    label: mppt.name,
  }));
}

function bindInput(input, onChange) {
  input.addEventListener("change", () => {
    onChange(input.value, findScenario(state.project));
    persist();
    render();
  });
}

function bindNumber(input, onChange) {
  input.addEventListener("change", () => {
    onChange(Number(input.value), findScenario(state.project));
    persist();
    render();
  });
}

function bindCheckbox(input, onChange) {
  input.addEventListener("change", () => {
    onChange(input.checked, findScenario(state.project));
    persist();
    render();
  });
}

function setValue(input, value) {
  if (document.activeElement !== input) {
    input.value = value ?? "";
  }
}

function showExportDialog() {
  dom.exportText.value = JSON.stringify(state.project, null, 2);
  dom.exportDialog.showModal();
}

function importProject(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsedProject = JSON.parse(String(reader.result));
      assertImportLooksLikeProject(parsedProject);
      state.project = normalizeProject(parsedProject);
      state.selectedId = null;
      state.map = null;
      persist();
      render();
    } catch (error) {
      const reason = error instanceof SyntaxError ? "Het bestand bevat geen geldige JSON." : "Bestand lijkt geen ondersteund projectexportbestand te zijn.";
      const guidance = "Gebruik een export uit deze generic tool met schemaVersion, location, panelTypes en scenarios.";
      showNotification("error", "Import mislukt", `${reason} ${guidance} Details: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function assertImportLooksLikeProject(value) {
  if (!value || typeof value !== "object") {
    throw new TypeError("De JSON-root moet een projectobject zijn.");
  }
  if (!("schemaVersion" in value) || !("location" in value) || !Array.isArray(value.scenarios)) {
    throw new TypeError("Verwachte projectvelden ontbreken.");
  }
}

function showNotification(type, title, message) {
  const item = document.createElement("div");
  item.className = `notification ${type}`;
  const strong = document.createElement("strong");
  strong.textContent = title;
  const text = document.createElement("div");
  text.textContent = message;
  item.append(strong, text);
  dom.notificationRegion.replaceChildren(item);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
}

function loadProject() {
  try {
    return normalizeProject(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createProject();
  }
}

function svgEl(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function clear(element) {
  element.replaceChildren();
}

function format(value) {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 }).format(value);
}

function objectFill(type) {
  if (type === "chimney") return "#ef4444";
  if (type === "dormer") return "#a855f7";
  if (type === "free") return "#eab308";
  return "#f97316";
}

function clampCoordinate(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function roundForCsv(value) {
  return Math.round(value * 100) / 100;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

# PRD: Generieke PV-, schaduw- en accusimulator

## 1. Doel

Ontwikkel het huidige prototype door tot een generieke webtool waarmee gebruikers voor elke locatie in Nederland een realistische technische en economische simulatie kunnen maken van een PV-systeem met:

- één of meerdere PV-arrays;
- 3D-schaduwobjecten zoals bomen, gebouwen, dakkapellen en schoorstenen;
- paneel-, inverter- en MPPT-specificaties;
- serie-, parallel- en geavanceerde stringtopologieën;
- woningverbruik, warmtepomp en optionele accu;
- historische uurlijkse weerdata;
- dynamische elektriciteitsprijzen en accu-optimalisatie.

De tool moet locatie-onafhankelijk, reproduceerbaar en uitbreidbaar zijn, zodat gebruikers scenario's kunnen ontwerpen, valideren, simuleren en vergelijken.

## 2. Achtergrond

Het bestaande prototype is een client-side `index.html`-app voor een vaste PV-arrayconfiguratie. Het bevat al waardevolle onderdelen:

- paneel-I/V- en P/V-berekeningen;
- vergelijking van meerdere bekabelingsconfiguraties;
- schaduweffecten;
- economische simulatie met accu;
- dynamische tarief- en optimalisatielogica.

De nieuwe versie moet deze prototypekennis behouden, maar het vaste model vervangen door een generiek projectmodel met kaartgebaseerde invoer, meerdere arrays, configureerbare objecten en een modulaire simulatie-engine.

## 3. Doelgroep

- Huiseigenaren met complexe schaduw- of dakvlaksituaties.
- Installateurs die legplannen, strings en inverterkeuzes willen vergelijken.
- Technische gebruikers met dynamische tarieven, accu's en warmtepompen.
- Energie-enthousiastelingen die nauwkeuriger willen rekenen dan standaard PV-calculators.

## 4. Scope

### In scope

- Locatie zoeken binnen Nederland.
- Kaartinterface op basis van OSM of vergelijkbare kaartlagen.
- Handmatig plaatsen en bewerken van 3D-schaduwobjecten.
- Definitie van meerdere PV-arrays met eigen oriëntatie, tilt, hoogte, paneeltype en raster.
- Paneeldatabase plus handmatige paneelspecificaties.
- Inverter- en MPPT-configuratie.
- Visuele bekabeling van panelen naar strings en MPPT's.
- Technische validatie van spanning, stroom en vermogen.
- Uurlijkse simulatie met historische weerdata.
- Schaduw-, PV-, inverter-, accu-, verbruiks- en economische simulatie.
- Scenario's opslaan, kopiëren, vergelijken en exporteren.

### Buiten scope voor MVP

- Constructieve dakberekening.
- Offerte- of installateurmarktplaats.
- Certificering als financieel adviesproduct.
- Volledig automatische detectie van alle bomen en gebouwen uit luchtfoto's.
- Volledige elektrische CAD-functionaliteit.
- Realtime kwartierdata als primaire simulatiestap.

## 5. Productprincipes

1. **Kaart eerst**: locatie, objecten en arrays worden primair visueel geplaatst.
2. **Client-side-first**: simulatie en projectdata blijven bij voorkeur lokaal.
3. **Modulair ontwerp**: UI, projectmodel, validatie en simulatie-engine blijven gescheiden.
4. **Transparante aannames**: resultaten tonen expliciet welke data, aannames en benaderingen zijn gebruikt.
5. **Expert zonder beginner te blokkeren**: templates en defaults voor snelle invoer, geavanceerde instellingen optioneel.
6. **Scenariovergelijking als kernfunctie**: elke ontwerpkeuze moet eenvoudig te kopiëren en te vergelijken zijn.

## 6. User stories

### Locatie en kaart

- Als gebruiker wil ik mijn adres, postcode of locatie kunnen zoeken, zodat de simulatie automatisch de juiste zonpositie en weerdata gebruikt.
- Als gebruiker wil ik mijn huis en omgeving op een kaart kunnen zien, zodat ik panelen en schaduwobjecten op de juiste plek kan plaatsen.
- Als gebruiker wil ik de projectlocatie kunnen vastzetten, zodat alle simulaties reproduceerbaar zijn.

### Schaduwobjecten

- Als gebruiker wil ik bomen kunnen plaatsen met hoogte, kruinbreedte, stamhoogte, dichtheid en seizoensfactor, zodat boomschaduw realistisch wordt meegenomen.
- Als gebruiker wil ik gebouwen en dakobjecten kunnen tekenen met footprint en hoogte, zodat vaste obstakels schaduw veroorzaken.
- Als gebruiker wil ik objecten kunnen dupliceren, verplaatsen, roteren en verwijderen, zodat ik snel mijn omgeving kan modelleren.
- Als gebruiker wil ik per object transparantie of schaduwdichtheid kunnen instellen, zodat gedeeltelijke schaduw mogelijk is.

### PV-arrays en panelen

- Als gebruiker wil ik één of meerdere PV-arrays kunnen plaatsen, zodat meerdere dakvlakken of veldopstellingen ondersteund worden.
- Als gebruiker wil ik per array rijen, kolommen, portrait/landscape, paneelafstand, tilt, azimuth en hoogte kunnen instellen, zodat de fysieke installatie klopt.
- Als gebruiker wil ik arrays via drag-, rotate- en resize-handles kunnen bewerken, zodat kaartplaatsing intuïtief is.
- Als gebruiker wil ik panelen uit een database kunnen kiezen, zodat bekende technische specificaties snel beschikbaar zijn.
- Als gebruiker wil ik paneelspecificaties handmatig kunnen invoeren, zodat onbekende of nieuwe panelen ook bruikbaar zijn.

### Inverters, MPPT's en bekabeling

- Als gebruiker wil ik inverter-specificaties kunnen invoeren, zodat AC-vermogen, DC-limieten, efficiëntie en standby-verbruik worden meegenomen.
- Als gebruiker wil ik per inverter het aantal MPPT's en per MPPT spanning-, stroom- en vermogenslimieten kunnen instellen, zodat stringvalidatie mogelijk is.
- Als gebruiker wil ik panelen visueel kunnen aanklikken om seriestrings te maken, zodat bekabeling begrijpelijk blijft.
- Als gebruiker wil ik meerdere strings parallel op een MPPT kunnen aansluiten, zodat serie-parallelconfiguraties ondersteund worden.
- Als gevorderde gebruiker wil ik total-cross-tie-achtige topologieën kunnen modelleren, zodat ik schaduwgevoelige ontwerpen kan vergelijken.
- Als gebruiker wil ik waarschuwingen krijgen bij te hoge Voc, te lage Vmpp, te hoge stroom of overschrijding van invertervermogen, zodat ongeldige ontwerpen direct zichtbaar zijn.

### Verbruik, warmtepomp en accu

- Als gebruiker wil ik een basisverbruik kunnen instellen via kWh/dag of een profiel, zodat eigenverbruik kan worden berekend.
- Als gebruiker wil ik een warmtepompmodel kunnen toevoegen op basis van winterdagverbruik of temperatuurafhankelijk verbruik, zodat wintervraag realistischer wordt.
- Als gebruiker wil ik een accu kunnen definiëren met capaciteit, laad-/ontlaadvermogen, efficiëntie, SOC-limieten en standby-verbruik, zodat batterijgedrag realistisch wordt gesimuleerd.
- Als gebruiker wil ik kunnen kiezen of grid pre-charge en batterij-export zijn toegestaan, zodat verschillende energiecontractstrategieën ondersteund worden.

### Simulatie en resultaten

- Als gebruiker wil ik een snelle preview kunnen draaien, zodat ik direct feedback krijg tijdens het ontwerpen.
- Als gebruiker wil ik een nauwkeurige jaarberekening met uurlijkse historische weerdata kunnen draaien, zodat opbrengst en economie realistisch worden ingeschat.
- Als gebruiker wil ik zien hoeveel verlies komt door schaduw, mismatch, clipping, inverterefficiëntie en accu, zodat ik ontwerpkeuzes kan begrijpen.
- Als gebruiker wil ik scenario's kunnen kopiëren en vergelijken, zodat ik panelen, bekabeling, inverterkeuze en accugrootte kan optimaliseren.
- Als gebruiker wil ik resultaten kunnen exporteren als JSON en CSV, zodat ik projecten kan delen of verder analyseren.

## 7. Belangrijkste productflows

### 7.1 Locatie kiezen

1. Gebruiker zoekt adres, postcode of klikt op de kaart.
2. App toont kaart, coördinaten en relevante locatiegegevens.
3. Gebruiker bevestigt de projectlocatie.
4. App koppelt zonpositie, weerdata en tariefprofielen aan het project.

### 7.2 Scene modelleren

1. Gebruiker kiest een objecttype: boom, gebouw, schoorsteen, dakkapel of vrij object.
2. Gebruiker tekent of plaatst het object op de kaart.
3. Eigenschappen worden in een zijpaneel bewerkt.
4. De 2D-kaart en optionele 3D-preview tonen direct het resultaat.

### 7.3 PV-array plaatsen

1. Gebruiker kiest paneeltype of voert paneelspecificaties in.
2. Gebruiker plaatst een arrayraster op de kaart.
3. Gebruiker stelt rijen, kolommen, oriëntatie, tilt en hoogte in.
4. App genereert individuele panelen als selecteerbare objecten.

### 7.4 Bekabeling configureren

1. Gebruiker maakt of kiest een inverter.
2. Gebruiker definieert MPPT's en limieten.
3. Gebruiker selecteert panelen in volgorde om strings te maken.
4. Strings worden aan MPPT's gekoppeld.
5. App valideert de elektrische configuratie en toont waarschuwingen.

### 7.5 Simuleren

1. App valideert projectdata.
2. App haalt of laadt historische weerdata.
3. Web Worker berekent zonpositie, irradiance, schaduw, paneelopbrengst, stringgedrag, inverteroutput, load matching en accu-dispatch.
4. Resultaten worden geaggregeerd per uur, dag, maand en jaar.

### 7.6 Resultaten analyseren

1. Gebruiker bekijkt jaaropbrengst, financiële opbrengst en verliezen.
2. Gebruiker opent detailgrafieken en paneelheatmaps.
3. Gebruiker vergelijkt scenario's.
4. Gebruiker exporteert project en resultaten.

## 8. Interfaceconcept

Aanbevolen hoofdstructuur:

- links: projectboom met locatie, objecten, arrays, inverters, MPPT's, accu, verbruik en scenario's;
- midden: kaartcanvas met objecten, arrays en bewerkingshandles;
- rechts: eigenschappenpaneel voor het geselecteerde item;
- onderin: validaties, waarschuwingen, simulatiestatus en korte resultaatkaartjes.

Workflowtabs:

1. **Locatie**
2. **Objecten**
3. **PV-arrays**
4. **Bekabeling**
5. **Inverters**
6. **Accu & verbruik**
7. **Simulatie**
8. **Resultaten**

Belangrijke UI-keuzes:

- 2D-kaart is leidend; 3D-preview ondersteunt schaduwinzicht.
- Alle objecten zijn direct selecteerbaar op kaart of in projectboom.
- Complexe bekabeling is desktop-first.
- Beginners starten met templates; experts kunnen handmatig specificaties aanpassen.
- Simulatie-instellingen tonen duidelijk het verschil tussen preview en jaarberekening.

## 9. Domeinmodel

Belangrijkste entiteiten:

- `Project`
- `Scenario`
- `Location`
- `WeatherDataset`
- `SceneObject`
- `TreeObject`
- `BuildingObject`
- `PVArray`
- `Panel`
- `PanelType`
- `Inverter`
- `MPPT`
- `WiringGraph`
- `Battery`
- `LoadProfile`
- `HeatPumpProfile`
- `TariffProfile`
- `SimulationRun`
- `HourlyResult`
- `ResultSummary`

Het projectmodel moet als versieerbaar JSON-schema worden ontworpen, zodat projectbestanden later migreerbaar blijven.

## 10. Simulatiearchitectuur

Aanbevolen modules:

- `solar-position`: zonhoogte en azimuth per tijdstap.
- `weather`: ophalen, cachen en normaliseren van historische data.
- `geometry`: 2D/3D-vormen, transformaties en ray-intersections.
- `shading`: schaduwfactor per paneel en tijdstap.
- `irradiance`: omzetting van GHI/DNI/DHI naar plane-of-array irradiance.
- `pv-model`: paneel-, bypassdiode-, string- en mismatchmodel.
- `wiring`: vertaling van graph/topologie naar elektrische configuratie.
- `inverter`: MPPT-tracking, clipping en efficiëntie.
- `load`: woningverbruik en warmtepompvraag.
- `battery`: SOC-transities, limieten en verliezen.
- `optimizer`: economische accu-dispatch.
- `results`: aggregatie, grafieken, exports en scenariovergelijking.

De UI roept niet direct rekenfuncties aan. De flow is:

1. projectmodel;
2. validatie;
3. simulatie-input;
4. worker-executie;
5. resultaatmodel;
6. presentatie/export.

## 11. Technologiestack

### Aanbevolen stack

- Frontend: TypeScript, React en Vite.
- State management: Zustand of Redux Toolkit; voorkeur voor Zustand vanwege eenvoud.
- Kaart: MapLibre GL JS.
- Tekenen op kaart: eigen draw-laag of MapLibre-compatibele draw library.
- 3D-preview: Three.js of deck.gl.
- Geometrie: turf.js plus eigen utilities voor 3D-raycasting.
- Simulatie: Web Workers met TypeScript.
- Numeriek zwaar werk: eerst TypeScript optimaliseren; later eventueel Rust/WASM.
- Grafieken: uPlot, Apache ECharts of Plotly; voorkeur voor uPlot bij grote uurlijkse datasets.
- Lokale opslag: IndexedDB via Dexie.
- Export: JSON-schema en CSV.
- Tests: Vitest voor rekencode, Playwright voor UI-smoketests.
- Deployment: statische hosting via GitHub Pages, Cloudflare Pages of Netlify.

### Data-integraties

- Kaart: OSM/MapLibre-compatible tiles.
- Geocoding: PDOK Locatieserver of Nominatim.
- Weerdata: PVGIS hourly data, Open-Meteo historical API of KNMI-bronnen.
- Hoogtedata en gebouwen: BAG, AHN en 3DBAG als latere uitbreiding.
- Prijzen: EPEX/APX/ENTSO-E-bronnen of CSV-import.
- Paneeldatabase: ingebouwde seed-database, later import uit CSV/PAN/PVsyst.

### Clientside haalbaarheid

Volledig client-side is haalbaar voor:

- kaartinteractie;
- projectmodellering;
- zonpositie;
- vereenvoudigde schaduwberekening;
- PV-, inverter- en accusimulatie;
- scenariovergelijking;
- lokale opslag en export.

Een serverless laag is wenselijk voor:

- caching van weerdata en prijzen;
- afschermen van API-sleutels;
- grotere paneeldatabase-updates;
- scenario's delen via links;
- toekomstige AHN/3DBAG-dataverwerking.

Advies: bouw client-side-first, maar ontwerp data-adapters zodat een serverless proxy later zonder rewrite kan worden toegevoegd.

## 12. Functionele eisen voor MVP

- Locatie zoeken in Nederland.
- Projectcanvas met kaart.
- Handmatig tekenen van bomen en eenvoudige gebouwen.
- Meerdere PV-arrays met rasterparameters.
- Paneeltype handmatig invoeren en kleine ingebouwde database.
- Inverter en MPPT's definiëren.
- Serie- en parallelstrings visueel configureren.
- Technische validatie van string- en inverterlimieten.
- Jaarlijkse uurlijkse simulatie op historische weerdata.
- Basisverbruik, warmtepompmodel en accuconfiguratie.
- Economische dispatchoptimalisatie vergelijkbaar met de huidige V4-benadering.
- Resultaten per scenario.
- Project opslaan in browser en exporteren als JSON.
- Resultaten exporteren als CSV.

## 13. Niet-functionele eisen

### Performance

- UI blijft responsief tijdens simulaties.
- Simulaties draaien in Web Workers.
- Previewmodus geeft binnen enkele seconden indicatieve feedback.
- Jaarberekening voor een gemiddeld woonhuisproject streeft naar minder dan 30 seconden.

### Nauwkeurigheid

- Resultaten rapporteren gebruikte aannames en databronnen.
- Schaduwverlies, mismatchverlies, clipping en accu-effecten worden apart zichtbaar.
- Rekenmodellen worden met unit tests geborgd.
- Waar mogelijk worden resultaten vergeleken met PVGIS, SAM, PVsyst of bekende referentiecases.

### Privacy

- Projectdata blijft lokaal tenzij de gebruiker expliciet exporteert of deelt.
- Basisgebruik vereist geen account.
- API-data wordt alleen opgehaald voor de gekozen locatie en simulatie.

### Betrouwbaarheid

- Projectbestanden zijn reproduceerbaar.
- JSON-schema's zijn versieerbaar.
- Ongeldige invoer blokkeert simulatie met duidelijke meldingen.

### Gebruiksgemak

- Templates dekken gangbare woningen en PV-configuraties.
- Expertinstellingen zijn aanwezig maar niet verplicht.
- Tabletgebruik is mogelijk voor kaart en objectplaatsing; complexe wiring mag desktop-first zijn.

## 14. Risico's en mitigaties

| Risico | Impact | Mitigatie |
|---|---|---|
| Wiring-editor wordt te complex | Hoog | Begin met serie/paralleltemplates; TCT als advanced feature later |
| Boomschaduw is lastig realistisch | Middel | Start met vereenvoudigde geometrie, dichtheid en seizoensfactor |
| Historische weerdata is benadering | Middel | Toon databron en resolutie; ondersteun meerdere bronnen |
| Volledig client-side wordt traag | Hoog | Gebruik workers, caching en later WASM voor hotspots |
| Te veel instellingen overweldigen gebruikers | Middel | Werk met basis/advanced-modus en goede defaults |
| API's of databronnen wijzigen | Middel | Gebruik data-adapters en cachelagen |
| Economische optimalisatie is moeilijk uit te leggen | Middel | Toon dispatchgrafieken en verklarende resultaatregels |

## 15. Roadmap

### Fase 1: Fundament

- Projectmodel en JSON-schema.
- TypeScript/Vite-appstructuur.
- Locatiezoeker en kaartcanvas.
- Scenario-opslag in IndexedDB.

### Fase 2: Ontwerpinterface

- Objecteditor voor bomen en gebouwen.
- PV-array editor met paneelraster.
- Paneeldatabase en handmatige paneelinvoer.
- Inverter- en MPPT-editor.

### Fase 3: Bekabeling en validatie

- Serie- en parallelstrings.
- MPPT-koppeling.
- Validatie van spanning, stroom en vermogen.
- Visuele waarschuwingen in projectboom en canvas.

### Fase 4: Simulatie-engine

- Zonpositie en weather-normalisatie.
- Plane-of-array irradiance.
- Schaduwberekening.
- Paneel-, string- en inverterberekening.
- Worker-gebaseerde jaarberekening.

### Fase 5: Accu, verbruik en economie

- Basisverbruikprofielen.
- Warmtepompmodel.
- Accumodel.
- Dynamische tariefprofielen.
- Economische dispatchoptimizer.

### Fase 6: Resultaten en exports

- Jaar-, maand- en uurgrafieken.
- Paneelheatmaps.
- Scenariovergelijking.
- JSON- en CSV-export.

### Fase 7: Geavanceerde uitbreidingen

- Total-cross-tie/topologie-editor.
- AHN/3DBAG-import.
- CSV-import voor werkelijk verbruik en tarieven.
- PDF-rapportage.
- Automatische stringvoorstellen.
- Serverless data-proxy en scenario-sharing.

## 16. MVP-acceptatiecriteria

- Een gebruiker kan een locatie in Nederland kiezen en een project opslaan.
- Een gebruiker kan minimaal één boom, één gebouw en twee PV-arrays plaatsen.
- Een gebruiker kan paneel-, inverter-, MPPT-, accu- en verbruiksgegevens invoeren.
- Een gebruiker kan serie/parallelstrings configureren en technische validatie zien.
- De app kan een uurlijkse jaarberekening uitvoeren met historische weerdata of een expliciete fallback.
- De resultaten tonen jaaropbrengst, schaduwverlies, eigenverbruik, import/export, accugebruik en financiële waarde.
- Een gebruiker kan minstens twee scenario's vergelijken.
- Een project kan als JSON worden geëxporteerd en opnieuw worden geladen.
- Uurlijkse resultaten kunnen als CSV worden geëxporteerd.

## 17. Aanbevolen productrichting

Gebruik het huidige prototype als rekenkundige referentie, maar bouw de generieke versie niet als uitbreiding van één monolithische HTML-file. De nieuwe eisen vragen om een modulaire TypeScript-app met een expliciet projectmodel, Web Workers en duidelijke scheiding tussen kaart-UI, validatie en simulatie.

De meest haalbare route is:

1. client-side TypeScript-app als basis;
2. MapLibre + React voor locatie en editing;
3. Web Workers voor alle zware simulatie;
4. lokale opslag en export vanaf het begin;
5. serverless data-adapters pas toevoegen wanneer weerdata, prijzen of scenario-sharing daarom vragen;
6. eerst betrouwbare serie/parallelconfiguraties bouwen;
7. daarna geavanceerde topologieën zoals TCT toevoegen.

Zo blijft de eerste generieke versie haalbaar, terwijl de architectuur ruimte houdt voor nauwkeurigere simulatiemodellen en rijkere data-integraties.

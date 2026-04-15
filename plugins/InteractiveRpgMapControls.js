/*:
 * @plugindesc v1.4 InteractiveRpgMap Controls (+ Map Notes open key | disable while input open + modifier + DEL delete)
 * @target MV
 * @author Soczó Kristóf
 * @version v1.0
 *
 * @param openMapKey         @default m
 * @param openNotesKey       @default tab
 * @desc Key to open Map Notes. Example: tab, n, pageup, etc.
 *
 * @param zoomInKey          @default numpad+
 * @param zoomOutKey         @default numpad-
 * @param panLeftKey         @default left
 * @param panRightKey        @default right
 * @param panUpKey           @default up
 * @param panDownKey         @default down
 * @param backKey            @default backspace
 * @param markerModifierKey  @default shift
 * @desc Hold left "shift" (or your modifier key) and left click on the map to place a marker.
 *
 * @param routeToggleKey     @default r
 * @desc Toggle route visibility. Example: r, t, f or engine names: pageup/pagedown/shift/ctrl/ok/cancel
 *
 * @param deleteMarkerKey    @default delete
 * @desc Delete selected marker. Example: delete, backspace, d, etc.
 *
 * @help
 * Changelog:
 *   - 2026.04.06 - Initial release v1.0
 */
/*============================================================================*/
(() => {
  const p = (n) =>
    PluginManager.parameters("InteractiveRpgMapControls")[n] || "";

  // Opciós: ha nincs IRMap, ettől még a Notes open működhet, szóval nem lépünk ki
  // csak figyelmeztetünk.
  if (!window.IRMap) {
    console.warn(
      "InteractiveRpgMap nincs betöltve – a Map Controls IRMap-funkciói nem aktívak."
    );
  }

  // Átalakító string → keyCode
  const defaultStr2code =
    (window.IRMap && window.IRMap.str2code) ||
    ((name) => {
      name = (name || "").toLowerCase();
      if (name === "backspace") return 8;
      if (name === "tab") return 9;
      if (name === "enter") return 13;
      if (name === "shift") return 16;
      if (name === "ctrl") return 17;
      if (name === "alt") return 18;
      if (name === "space") return 32;
      if (name === "escape" || name === "esc") return 27;
      if (name === "pageup") return 33;
      if (name === "pagedown") return 34;
      if (name === "end") return 35;
      if (name === "home") return 36;
      if (name === "left") return 37;
      if (name === "up") return 38;
      if (name === "right") return 39;
      if (name === "down") return 40;
      if (name === "delete" || name === "del") return 46;
      // numpad +/- gyors segéd:
      if (name === "numpad+") return 107;
      if (name === "numpad-") return 109;
      return name && name.length === 1
        ? name.toUpperCase().charCodeAt(0)
        : null;
    });

  const str2code = (name) => defaultStr2code(name);

  // --- Action nevek
  const MAP_ACTION = "interactiveMap";
  const NOTES_ACTION = "mapNotesOpen";

  // --- Billentyűtérkép
  const mapPairs = [
    [p("openMapKey"), MAP_ACTION],
    [p("openNotesKey") || "tab", NOTES_ACTION],

    [p("zoomInKey"), "zoomIn"],
    [p("zoomOutKey"), "zoomOut"],
    [p("panLeftKey"), "left"],
    [p("panRightKey"), "right"],
    [p("panUpKey"), "up"],
    [p("panDownKey"), "down"],
    [p("backKey"), "mapBack"],
  ];

  mapPairs.forEach(([keyName, action]) => {
    const c = str2code((keyName || "").toLowerCase());
    if (c != null) Input.keyMapper[c] = action;
  });

  // modifier key
  const modName = (p("markerModifierKey") || "shift").toLowerCase();
  const modCode = str2code(modName);
  if (modCode != null) Input.keyMapper[modCode] = "modifier";

  // Route toggle key → "routeToggle" action
  const routeToggleKey = (p("routeToggleKey") || "r").toLowerCase();
  const routeToggleCode = str2code(routeToggleKey);
  // takarítás (ha volt régi bind)
  Object.keys(Input.keyMapper).forEach((k) => {
    if (Input.keyMapper[k] === "routeToggle") delete Input.keyMapper[k];
  });
  if (routeToggleCode != null) Input.keyMapper[routeToggleCode] = "routeToggle";

  // Delete marker key → "markerDelete" action
  const delKeyName = (p("deleteMarkerKey") || "delete").toLowerCase();
  const delKeyCode = str2code(delKeyName);
  if (delKeyCode != null) Input.keyMapper[delKeyCode] = "markerDelete";

  // Ha IRMap input ablak nyitva van, ne reagáljunk a map-specifikus gombokra
  // (globálisan óvatosak vagyunk; csak ha tényleg IRMap scene aktív és inputol).
  const _origTriggered = Input.isTriggered;
  Input.isTriggered = function (code) {
    const sc = window.IRMap && IRMap.currentScene && IRMap.currentScene();
    if (sc && (sc._activeMarkerInput || sc._lastKb)) return false;
    return _origTriggered.call(this, code);
  };
  const _origPressed = Input.isPressed;
  Input.isPressed = function (code) {
    const sc = window.IRMap && IRMap.currentScene && IRMap.currentScene();
    if (sc && (sc._activeMarkerInput || sc._lastKb)) return false;
    return _origPressed.call(this, code);
  };

  console.log(
    "IRMap Controls v1.4 — openMap:",
    p("openMapKey") || "m",
    "| openNotes:",
    p("openNotesKey") || "tab",
    "| modifier:",
    modName,
    "| deleteMarkerKey:",
    delKeyName
  );
})();

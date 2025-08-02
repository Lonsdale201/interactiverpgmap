/*:
 * @plugindesc v1.2+ InteractiveRpgMap Controls (disable while input open + modifier gomb)
 * @target MV
 * @author Soczó Kristóff
 * @version 1.3
 *
 * @param openMapKey         @default m
 * @param zoomInKey          @default numpad+
 * @param zoomOutKey         @default numpad-
 * @param panLeftKey         @default left
 * @param panRightKey        @default right
 * @param panUpKey           @default up
 * @param panDownKey         @default down
 * @param backKey            @default backspace
 * @param markerModifierKey  @default shift
 * @desc Hold left "shift" or your modifined key, and left click on the map to place marker
 */
/*============================================================================*/
(() => {
  const p = (n) =>
    PluginManager.parameters("InteractiveRpgMapControls")[n] || "";
  if (!window.IRMap) {
    console.error("InteractiveRpgMap nincs betöltve!");
    return;
  }

  // Átalakító string → keyCode
  const defaultStr2code =
    window.IRMap.str2code ||
    ((name) => {
      return name.length === 1 ? name.toUpperCase().charCodeAt(0) : null;
    });
  const str2code = (name) => {
    name = (name || "").toLowerCase();
    if (name === "backspace") return 8;
    if (name === "enter") return 13; // ← Enter
    if (name === "space") return 32; // ← Space bar
    if (name === "shift") return 16;
    if (name === "ctrl") return 17;
    if (name === "alt") return 18;
    return defaultStr2code(name);
  };

  // Alap map, mint eddig
  const MAP_KEY = "interactiveMap";
  const map = [
    [p("openMapKey"), MAP_KEY],
    [p("zoomInKey"), "zoomIn"],
    [p("zoomOutKey"), "zoomOut"],
    [p("panLeftKey"), "left"],
    [p("panRightKey"), "right"],
    [p("panUpKey"), "up"],
    [p("panDownKey"), "down"],
    [p("backKey"), "mapBack"],
  ];
  map.forEach(([k, a]) => {
    const c = str2code(k);
    if (c != null) Input.keyMapper[c] = a;
  });

  // → ide jön a modifier key
  const modName = p("markerModifierKey").toLowerCase();
  const modCode = str2code(modName);
  if (modCode != null) {
    Input.keyMapper[modCode] = "modifier";
  }

  // Ha input ablak nyitva van, ne reagáljunk a map-gombokra
  const _origTriggered = Input.isTriggered;
  Input.isTriggered = function (code) {
    const sc = IRMap.currentScene();
    if (sc && sc._lastKb) return false;
    return _origTriggered.call(this, code);
  };
  const _origPressed = Input.isPressed;
  Input.isPressed = function (code) {
    const sc = IRMap.currentScene();
    if (sc && sc._lastKb) return false;
    return _origPressed.call(this, code);
  };

  console.log("IRMap Controls ← markerModifierKey:", modName);
})();

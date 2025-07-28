/*:
 * @plugindesc InteractiveRpgMap Controls
 * @target MV
 * @author  Soczó Kristóff
 * @version 1.2
 *
 * @param openMapKey    @default q
 * @param zoomInKey     @default numpad+
 * @param zoomOutKey    @default numpad-
 * @param panLeftKey    @default left
 * @param panRightKey   @default right
 * @param panUpKey      @default up
 * @param panDownKey    @default down
 * @param backKey       @default backspace
 */
/*============================================================================*/
(() => {
  const p = (n) =>
    PluginManager.parameters("InteractiveRpgMapControls")[n] || "";
  if (!window.IRMap) {
    console.error("InteractiveRpgMap nincs betöltve!");
    return;
  }

  const defaultStr2code =
    window.IRMap.str2code ||
    function (name) {
      return name.length === 1 ? name.toUpperCase().charCodeAt(0) : null;
    };
  /** kiterjesztjük a “backspace”-t is */
  const str2code = (name) => {
    name = (name || "").toLowerCase();
    if (name === "backspace") return 8;
    return defaultStr2code(name);
  };

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

  map.forEach(([keyStr, action]) => {
    const code = str2code(keyStr.toLowerCase());
    if (code != null) Input.keyMapper[code] = action;
  });
  console.log("IRMap Controls – keyMapper után:", Input.keyMapper);
})();

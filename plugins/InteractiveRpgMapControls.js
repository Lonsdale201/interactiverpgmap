/*:
 * @plugindesc InteractiveRpgMap Controls
 * @target MV
 * @author  Soczó Kristóf
 * @version 1.0
 *
 * @param openMapKey    @default q
 * @param zoomInKey     @default numpad+
 * @param zoomOutKey    @default numpad-
 * @param panLeftKey    @default left
 * @param panRightKey   @default right
 * @param panUpKey      @default up
 * @param panDownKey    @default down
 */
/*============================================================================*/
(() => {
  const p = (n) =>
    PluginManager.parameters("InteractiveRpgMapControls")[n] || "";
  if (!window.IRMap) {
    console.error("InteractiveRpgMap nincs betöltve!");
    return;
  }

  // a core-ból exportált konverter (lásd lejjebb)
  const str2code =
    window.IRMap.str2code ||
    function (name) {
      return name.length === 1 ? name.toUpperCase().charCodeAt(0) : null;
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
  ];

  map.forEach(([keyStr, action]) => {
    const code = str2code(keyStr.toLowerCase());
    if (code != null) Input.keyMapper[code] = action;
  });
  console.log("IRMap Controls – keyMapper után:", Input.keyMapper);
})();

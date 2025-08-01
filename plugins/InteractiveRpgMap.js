/*:
 * @plugindesc InteractiveRpgMap – fullscreen & minimap core w/ player marker, smooth pan, scalable tile mapping, window design modes, addon API
 * @author Soczó Kristóf
 * @target MV
 * @version 0.90
 *
 * ============================================================================
 *  --- Map Settings -----------------------------------------------------------
 * ============================================================================
 *
 * @param ---Map Settings---
 * @desc ▼ General map behaviour (collapse/expand)
 * @default ------------------------------
 *
 * @param textIfNoMapFound
 * @parent ---Map Settings---
 * @text Text If No Map Found
 * @type text
 * @default No map available for this area.
 *
 * @param fallbackMapImage
 * @parent ---Map Settings---
 * @text Fallback Map Image
 * @type file
 * @dir img/maps
 * @desc Shown when the current map has no configured map image.
 *
 * @param fallbackHandler
 * @parent ---Map Settings---
 * @text Enable global fallback
 * @type boolean
 * @on On
 * @off Off
 * @default true
 * @desc If ON, an undefined map loads fallback image / text. If OFF, nothing happens when a map is undefined.
 *
 * @param scaleMode
 * @parent ---Map Settings---
 * @text Image Scale Mode
 * @type select
 * @option Cover (fill window)
 * @value cover
 * @option Contain (fit; letterbox)
 * @value contain
 * @option No Upscale (1:1 max)
 * @value noupscale
 * @default cover
 *
 * @param openSound
 * @parent ---Map Settings---
 * @text Open map Sound
 * @type file
 * @dir audio/se
 * @desc Sound effect to play when the map opens.
 *
 * @param closeSound
 * @parent ---Map Settings---
 * @text Close map Sound
 * @type file
 * @dir audio/se
 * @desc Sound effect to play when the map closed.
 *
 * @param imagePixelsPerTile
 * @parent ---Map Settings---
 * @text Global Pixels Per Tile
 * @type number
 * @min 0
 * @default 0
 * @desc 0 = auto-detect.  >0 forces this PPT for every map unless overridden.
 * @param mapWindowWidthPct
 *
 * @parent ---Map Settings---
 * @text Map Window Width %
 * @type number
 * @min 10
 * @max 100
 * @default 75
 * @desc The width of the map window as a percentage of the screen width.
 *
 * @param mapWindowHeightPct
 * @parent ---Map Settings---
 * @text Map Window Height %
 * @type number
 * @min 10
 * @max 100
 * @default 75
 * @desc The height of the map window as a percentage of the screen height.
 *
 * ============================================================================
 *  --- Player Marker Settings -------------------------------------------------
 * ============================================================================
 *
 * @param ---Player Marker Settings---
 * @desc ▼ Settings for the player dot / custom marker
 * @default ------------------------------
 *
 * @param enablePlayerTracking
 * @parent ---Player Marker Settings---
 * @text Enable Player Tracking
 * @type boolean
 * @on On
 * @off Off
 * @default true
 * @desc Globally enable / disable showing the player’s position.
 *
 * @param useCustomPlayerMarker
 * @parent ---Player Marker Settings---
 * @text Use Custom Player Marker
 * @type boolean
 * @on On
 * @off Off
 * @default false
 * @desc Set to On if you want to use your custom image for player tracking.
 *
 * @param customPlayerMarkerImage
 * @parent ---Player Marker Settings---
 * @text Custom Player Marker Image
 * @type file
 * @dir img/system
 * @desc Image used when “Use Custom Player Marker” is On.
 *
 * @param defaultMarkerColor
 * @parent ---Player Marker Settings---
 * @text Default Marker Color
 * @type text
 * @default #FFFFFF
 * @desc Hex code for the default marker’s fill color (only if not using custom image).
 *
 * @param defaultMarkerShape
 * @parent ---Player Marker Settings---
 * @text Default Marker Shape
 * @type select
 * @option Square
 * @value square
 * @option Circle
 * @value circle
 * @option Diamond
 * @value diamond
 * @option Triangle
 * @value triangle
 * @default circle
 * @desc Shape of the default marker (only if not using custom image).
 *
 * @param defaultMarkerSize
 * @parent ---Player Marker Settings---
 * @text Default Marker Size
 * @type number
 * @min 4
 * @max 64
 * @default 12
 * @desc Size in pixels for the base (non-image-based) marker.
 *
 * @param markerPulse
 * @parent ---Player Marker Settings---
 * @text Marker Pulsate
 * @type boolean
 * @on On
 * @off Off
 * @default false
 * @desc If On, the default marker will gently pulse its opacity while the map is open.
 *
 * ============================================================================
 *  --- Map Window Design ------------------------------------------------------
 * ============================================================================
 *
 * @param ---Map Window Design---
 * @desc ▼ UI styling for the map window
 * @default ------------------------------
 *
 * @param windowDesign
 * @parent ---Map Window Design---
 * @text Window Design Mode
 * @type select
 * @option Default window
 * @value default
 * @option No window
 * @value none
 * @option Custom Window Skin
 * @value customwindow
 * @default default
 *
 * @param customMapWindowSkin
 * @parent ---Map Window Design---
 * @text Map-only Window Skin
 * @type file
 * @dir img/system
 * @desc Ha be van állítva, csak a térkép-ablak ezt a skinsheetet használja.
 * 
 * @param letterboxUnderlayImage
 * @parent ---Map Window Design---
 * @text Letterbox Underlay Image
 * @type file
 * @dir img/system
 * @desc Csak globális. Contain/NoUpscale módban, windowos nézetnél a térkép ALATT kirajzolt háttérréteg (a letterbox sávokba).

 *
 * @param customFrameImage
 * @parent ---Map Window Design---
 * @text Frame Image
 * @type file
 * @dir img/system
 *
 * @param customFramePad
 * @parent ---Map Window Design---
 * @text Custom Frame Padding
 * @type number
 * @min 0
 * @max 100
 * @default 5
 * @desc The value is expressed in %
 *
 * @param customFrameOffsetX
 * @parent ---Map Window Design---
 * @text Custom Frame Offset X (px)
 * @type number
 * @min -999
 * @max 999
 * @default 0
 * @desc Shift left/right (+ right, - left) relative to the centre of the map.
 *
 * @param customFrameOffsetY
 * @parent ---Map Window Design---
 * @text Custom Frame Offset Y (px)
 * @type number
 * @min -999
 * @max 999
 * @default 0
 * @desc Move up/down (+ down, - up) relative to the centre of the map.
 *
 * @param frameOverlap
 * @parent ---Map Window Design---
 * @text Frame Overlap Map?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc If ON, your custom frame will render above the map content (overlap).
 * 
 * ============================================================================
 *  --- Top Level Window -------------------------------------------------------
 * ============================================================================
 *
 * @param ---Top level Window---
 * @default ------------------------------
 *
 * @param showTopLevelWindow
 * @parent ---Top level Window---
 * @text Show top level window
 * @type boolean
 * @on true
 * @off false
 * @default true
 * @desc This is an extra window that appears above the map window, and you can dynamically display data in it.
 *
 * @param topLevelWindowSkin
 * @parent ---Top level Window---
 * @text Top level window skin
 * @type select
 * @option Same as map Window
 * @value same
 * @option Default window
 * @value default
 * @option Custom window
 * @value customwindow
 * @default same
 *
 * @param topLevelCustomSkin
 * @parent ---Top level Window---
 * @text Custom window skin (img/system)
 * @type file
 * @dir img/system
 *
 * @param topLevelHeight
 * @parent ---Top level Window---
 * @text Window height (px)
 * @type number
 * @min 24
 * @default 60
 * @desc Adjust the height of the window
 * 
 * @param topLevelFontSize
 * @parent ---Top level Window---
 * @text Font size(px)
 * @type number
 * @min 6
 * @default 18
 *
 * @param topLevelJustify
 * @parent ---Top level Window---
 * @text Layout
 * @type select
 * @option Center
 * @value center
 * @option Space Between
 * @value spacebetween
 * @option Row Start
 * @value start
 * @option Row End
 * @value end
 * @default center
 * @desc How to position the display of your content in a row.
 * 
 * @param topLevelElements
 * @parent ---Top level Window---
 * @text Top level elements
 * @type text[]
 * @default ["showmap"]
 * @desc Supported commands: showmap showbreadcumb showselected read more about this function  on github
 * 
 *
 * ============================================================================
 *  --- GUI / Scroll Indicators ----------------------------------------------
 * ============================================================================
 *
 * @param ---Gui---
 * @desc ▼ Global GUI tweaks
 * @default ------------------------------
 *
 * @param showScrollIndicators
 * @parent ---Gui---
 * @text Show Scroll Indicators
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 * @desc Show or hide scroll indicators
 * 
 * @param scrollIndicatorSize
 * @parent ---Gui---
 * @text Scroll Indicator Size
 * @type number
 * @min 8
 * @max 128
 * @default 24
 * @desc Scroll indicators size
 *
 * @param scrollIndicatorColor
 * @parent ---Gui---
 * @text Scroll Indicator Color
 * @type text
 * @default #FFFFFF
 * @desc Scroll indicators color
 * 
 * ============================================================================
 *  Map-specific overrides
 * ============================================================================
 *
 * @param --- MAPS Config ---
 * @desc ▼ Map configs
 * @default ------------------------------
 *
 * @param maps
 * @text SETUP YOUR MAPS 
 * @type struct<MapConfig>[]
 * @desc Define per-map overrides and images.
 *
 *
 * @help
 * Custom messages paramteres support special color mode like:  \\c[10]read a maps\\c[0]
 */

/*~struct~MapConfig:
 *
 * @param mapId
 * @text Target Map ID
 * @type number
 * @min 1
 * @default 1
 * @desc Please enter the MAP ID (identifier) to indicate which editor map the loaded map will belong to. (00 is not necessary; for example, 004 = 4)
 *
 * @param fullMapImage
 * @text Fullscreen Map Image
 * @type file
 * @dir img/maps
 * @desc Add the map image. If it does not exist, create the maps folder within the IMG folder!
 *
 * @param MapName
 * @text Custom Map Name
 * @type text
 * @desc Enter the name of the map (this will be displayed in plan text without window skin) in the top center of your map.
 *
 * @param Mapdesc
 * @text Map Description
 * @type text
 * @desc Enter the short map desciprtion if you want to use it in the top level window (Showdesc)
 *
 * @param namePosition
 * @text Choose the position
 * @type select
 * @option Top left
 * @value top-left
 * @option Top center
 * @value top-center
 * @option Top right
 * @value top-right
 * @option Bottom left
 * @value bottom-left
 * @option Bottom center
 * @value bottom-center
 * @option Bottom right
 * @value bottom-right
 * @default top-center
 * @desc Where to draw the map name (Custom map name or Custom map name as img) inside the map window.
 *
 * @param enablePlayerTracking
 * @text Enable Player Tracking (this map)
 * @type boolean
 * @on On
 * @off Off
 * @default true
 *
 * @param inmapSetup
 * @text --- Extras ---
 * @default
 *
 * @param MapNameAsImage
 * @text Custom Map Name As Img
 * @type file
 * @dir img/maplabels
 * @desc Same thing like Current Map name, but instead of plain text, you can display it as an image.
 *
 * @param mapNameImgScale
 * @text Map name auto scale
 * @type boolean
 * @on On
 * @off Off
 * @default true
 * @desc Automatically reduces the size of the image. Perfect results are not guaranteed.
 *
 * @param scaleMode
 * @text Scale Mode (override)
 * @type select
 * @option (use global)
 * @value
 * @option Cover (fill window)
 * @value cover
 * @option Contain (fit; letterbox)
 * @value contain
 * @option No Upscale (1:1 max)
 * @value noupscale
 * @default
 *
 * @param pixelsPerTile
 * @text Pixels Per Tile (override)
 * @type number
 * @min 0
 * @default 0
 *
 * @param imgOffsetX
 * @text Image Offset X
 * @type number
 * @min 0
 * @default 0
 * @desc Left margin in pixels before the first tile. 0 = map starts at the bitmap’s left edge.
 *
 * @param imgOffsetY
 * @text Image Offset Y
 * @type number
 * @min 0
 * @default 0
 * @desc Top margin in pixels before the first tile. 0 = map starts at the bitmap’s top edge.
 *
 * @param imgMapWidth
 * @text Image Map Width
 * @type number
 * @min 0
 * @default 0
 * @desc Playable-area width (px). 0 = bitmap width − imgOffsetX (map reaches the right edge).
 *
 * @param imgMapHeight
 * @text Image Map Height
 * @type number
 * @min 0
 * @default 0
 * @desc Playable-area height (px). 0 = bitmap height − imgOffsetY (map reaches the bottom edge).
 *
 * @param canSeeSeparator
 * @text --- Can See Map If ---
 * @default
 *
 * @param requireItem
 * @text Player Have Item
 * @type item
 * @default 0
 * @desc Only if the player has at least one of this item.
 *
 * @param requireSkill
 * @text Player Have Skill
 * @type skill
 * @default 0
 * @desc Only if any party member has learned this skill.
 *
 * @param requireSwitch
 * @text Switcher On
 * @type switch
 * @default 0
 * @desc Only if this game switch is ON.
 *
 * @param actorInParty
 * @text Actor in party
 * @type actor
 * @default
 * @desc Only if the selected character is included in the party
 *
 * @param customMessages
 * @text --- Custom messages ---
 * @default
 *
 * @param customOutofItem
 * @text If not have item
 * @type text
 * @default you do not have the right item to open the map
 *
 * @param customOutofSkill
 * @text If not learned the right skill
 * @type text
 * @default you have not learned to read a map
 *
 * @param customswictherOff
 * @text If settinged switcher off
 * @type text
 * @default you cannot open the map here
 *
 * @param customactoroff
 * @text If the set character is not in the party
 * @type text
 * @default The required character is not in the party.
 */

(() => {
  "use strict";

  const PLUGIN = "InteractiveRpgMap";
  const params = PluginManager.parameters(PLUGIN);
  const P = (n) => params[n];

  // ---------------------------------------------------------------------------
  // Read params
  // ---------------------------------------------------------------------------
  let TEXT_NO_MAP = P("textIfNoMapFound") || "No map available for this area.";
  const ENABLE_FALLBACK = P("fallbackHandler") !== "false";
  let FALLBACK_IMG = params.fallbackMapImage || "";
  const MAP_WIN_W_PCT = Number(P("mapWindowWidthPct") || 75); // 10–100 %
  const MAP_WIN_H_PCT = Number(P("mapWindowHeightPct") || 75);

  const OPEN_SE = (P("openSound") || "").replace(/\.(ogg|m4a|wav)$/i, "");
  const CLOSE_SE = (P("closeSound") || "").replace(/\.(ogg|m4a|wav)$/i, "");

  const USE_CUSTOM_MARKER = P("useCustomPlayerMarker") === "true";
  const CUSTOM_MARKER_IMAGE = P("customPlayerMarkerImage") || "";
  const DEFAULT_MARKER_COLOR = P("defaultMarkerColor") || "#FFFFFF";
  const DEFAULT_MARKER_SHAPE = P("defaultMarkerShape") || "circle";
  const DEFAULT_MARKER_SIZE = Number(P("defaultMarkerSize") || 12);
  const MARKER_PULSE = P("markerPulse") === "true";

  const UNDERLAY_IMG = P("letterboxUnderlayImage") || "";
  const UNDERLAY_BMP = UNDERLAY_IMG
    ? ImageManager.loadSystem(UNDERLAY_IMG)
    : null;

  const GLOBAL_PPT = Number(P("imagePixelsPerTile") || 0);

  const GLOBAL_SCALE_MODE = (P("scaleMode") || "cover").toLowerCase();

  // --- Top‑level window params -------------------------------------------------
  const TL_SHOW = P("showTopLevelWindow") !== "false";
  const TL_SKIN_MODE = (P("topLevelWindowSkin") || "same").toLowerCase();
  const TL_CUSTOM_SKIN = P("topLevelCustomSkin") || "";
  const TL_H = Number(P("topLevelHeight") || 60);
  const TL_FONT_SIZE = Number(P("topLevelFontSize") || 18);
  const TL_ELEMENTS = JSON.parse(P("topLevelElements") || "[]").map((e) =>
    String(e || "")
      .trim()
      .toLowerCase()
  );
  const TL_JUSTIFY = (P("topLevelJustify") || "center").toLowerCase();

  function effScaleMode(cfg) {
    // Map override -> ha üres, akkor a globális érvényesül
    const m =
      (cfg &&
        String(cfg.scaleMode || "")
          .trim()
          .toLowerCase()) ||
      GLOBAL_SCALE_MODE;
    return m || "cover";
  }

  const WINDOW_DESIGN = P("windowDesign"); // "default" | "none" | "customwindow"
  const MAP_WINDOW_SKIN = P("customMapWindowSkin") || "";
  const CUSTOM_FRAME_IMAGE = P("customFrameImage") || "";
  const CUSTOM_FRAME_PAD = Number(P("customFramePad") || 5);
  const FRAME_OVERLAP = P("frameOverlap") === "true";

  const CUSTOM_FRAME_OFF_X = Number(P("customFrameOffsetX") || 0);
  const CUSTOM_FRAME_OFF_Y = Number(P("customFrameOffsetY") || 0);

  const MAP_CFGS_RAW = JSON.parse(P("maps") || "[]");
  const MAP_CFGS = MAP_CFGS_RAW.map((e) => {
    const cfg = JSON.parse(e);
    cfg.mapDisplayName = cfg.MapName || "";
    cfg.mapDescription = cfg.Mapdesc || "";
    return cfg;
  });

  const GLOBAL_TRACK = P("enablePlayerTracking") === "true";

  const MAP_KEY = "interactiveMap";

  // ---------------------------------------------------------------------------
  // Smooth pan tuning
  // ---------------------------------------------------------------------------
  const PAN_SPEED = 32; // screen px / frame when key held
  const LERP_FACTOR = 0.35; // smoothing toward target
  const SNAP_EPS = 0.5; // snap threshold
  // const REDRAW_EPS = 0.5;   // reserved

  // ---------------------------------------------------------------------------
  // ZPPM FUNCTION
  // ---------------------------------------------------------------------------
  const ZOOM_LEVELS = [1.0, 1.5, 2.0]; // order matters
  const KEY_ZOOM_IN = "zoomIn";
  const KEY_ZOOM_OUT = "zoomOut";

  // map “=” and “–” on US keyboards; tweak if you prefer other keys
  Input.keyMapper[107] = KEY_ZOOM_IN; // +
  Input.keyMapper[109] = KEY_ZOOM_OUT; // -

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  if (!Number.prototype.clamp) {
    Number.prototype.clamp = function (min, max) {
      return Math.min(Math.max(this, min), max);
    };
  }
  const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

  function curMapName() {
    const info = $dataMapInfos[$gameMap.mapId()];
    return info ? info.name : "";
  }
  function findCfgForMapId(mapId) {
    // elsődlegesen próbáljuk meg közvetlenül az ID-t
    const byId = MAP_CFGS.find((c) => Number(c.mapId) === mapId);
    if (byId) return byId;

    // ha nincs ID-alapú config, akkor visszatérünk a régi név-alapú kereséssel
    const info = $dataMapInfos[mapId];
    if (!info) return null;
    return MAP_CFGS.find((c) => c.editorMapName === info.name) || null;
  }
  function findCfg() {
    return findCfgForMapId($gameMap.mapId());
  }
  function pptFor(cfg) {
    const m = Number((cfg && cfg.pixelsPerTile) || 0);
    if (m > 0) return m;
    if (GLOBAL_PPT > 0) return GLOBAL_PPT;
    return 0;
  }

  /* -------------------------------------------------------------
   *  Helper: param-string  →  keyCode
   * ----------------------------------------------------------- */
  const EXTRA = {
    // ami nincs a motorban
    "numpad+": 107,
    "numpad-": 109,
  };

  function str2code(name) {
    name = String(name || "").toLowerCase();

    // 1) van extra táblában?
    if (EXTRA[name] != null) return EXTRA[name];

    // 2) benne van a default keyMapper-ben?
    for (const k in Input.keyMapper) {
      if (Input.keyMapper[k] === name) return Number(k);
    }

    // 3) egyetlen betű / szám  → ASCII
    if (name.length === 1) return name.toUpperCase().charCodeAt(0);

    // 4) végső esetben: null (hibás név)
    return null;
  }

  /**
   * Returns true if no requirement is set, or if **any** one of the three
   * requirements is fulfilled (OR-reláció).
   */
  function canOpenInteractiveMap(cfg) {
    if (!cfg) return true;

    // ─── új actorInParty követelmény ────────────────────────────────
    const actorId = Number(cfg.actorInParty || 0);
    if (actorId > 0) {
      const hasActor = $gameParty
        .members()
        .some((m) => m.actorId() === actorId);
      if (!hasActor) return false;
    }

    const itemId = Number(cfg.requireItem || 0);
    const skillId = Number(cfg.requireSkill || 0);
    const switchId = Number(cfg.requireSwitch || 0);

    // ha nincs egyéb követelmény ⇒ OK
    const anyReq = itemId > 0 || skillId > 0 || switchId > 0;
    if (!anyReq) return true;

    const hasItem = itemId > 0 && $gameParty.hasItem($dataItems[itemId], 1);
    const hasSkill =
      skillId > 0 &&
      $gameParty.members().some((a) => a.isLearnedSkill(skillId));
    const hasSwitch = switchId > 0 && $gameSwitches.value(switchId);

    return hasItem || hasSkill || hasSwitch;
  }

  /**
   * Ha nem lehet megnyitni a térképet, visszaadja a megfelelő üzenetet,
   * különben üres stringet.
   */
  function getOpenInteractiveMapFailureMessage(cfg) {
    if (!cfg) return "";

    // ─── actorInParty hibaüzenet ─────────────────────────────────────
    const actorId = Number(cfg.actorInParty || 0);
    if (actorId > 0) {
      const hasActor = $gameParty
        .members()
        .some((m) => m.actorId() === actorId);
      if (!hasActor) {
        return cfg.customactoroff || "";
      }
    }

    const itemId = Number(cfg.requireItem || 0);
    const skillId = Number(cfg.requireSkill || 0);
    const switchId = Number(cfg.requireSwitch || 0);

    if (itemId > 0 && !$gameParty.hasItem($dataItems[itemId], 1)) {
      return cfg.customOutofItem || "";
    }
    if (
      skillId > 0 &&
      !$gameParty.members().some((a) => a.isLearnedSkill(skillId))
    ) {
      return cfg.customOutofSkill || "";
    }
    if (switchId > 0 && !$gameSwitches.value(switchId)) {
      return cfg.customswictherOff || "";
    }
    return "";
  }

  /**
   * Compute world->image transform for a bitmap+cfg *for the CURRENT MAP ONLY*.
   * Returns {scaleX, scaleY, offsetX, offsetY, usableW, usableH}.
   */
  function calcXform(bmp, cfg) {
    const iw = bmp.width,
      ih = bmp.height;
    const tileW = $gameMap.tileWidth(),
      tileH = $gameMap.tileHeight();
    const tilesX = $dataMap.width,
      tilesY = $dataMap.height;
    const worldPxW = tilesX * tileW,
      worldPxH = tilesY * tileH;

    const offX = Number(cfg.imgOffsetX || 0);
    const offY = Number(cfg.imgOffsetY || 0);
    let usableW = Number(cfg.imgMapWidth || 0);
    let usableH = Number(cfg.imgMapHeight || 0);
    if (!usableW) usableW = iw - offX;
    if (!usableH) usableH = ih - offY;

    const ppt = pptFor(cfg);
    let scaleX, scaleY;
    if (ppt > 0) {
      const expectW = tilesX * ppt;
      const expectH = tilesY * ppt;
      const diffW = Math.abs(usableW - expectW) / expectW;
      const diffH = Math.abs(usableH - expectH) / expectH;
      if (diffW > 0.05 || diffH > 0.05) {
        console.warn(
          `[${PLUGIN}] "${cfg.editorMapName}" ppt mismatch; auto-size.`
        );
        scaleX = usableW / worldPxW;
        scaleY = usableH / worldPxH;
      } else {
        scaleX = ppt / tileW;
        scaleY = ppt / tileH;
      }
    } else {
      scaleX = usableW / worldPxW;
      scaleY = usableH / worldPxH;
    }
    return { scaleX, scaleY, offsetX: offX, offsetY: offY, usableW, usableH };
  }

  /**
   * Current map: tile coords -> image pixel coords (center of tile).
   */
  function worldToImage(tx, ty, xform) {
    const tileW = $gameMap.tileWidth();
    const tileH = $gameMap.tileHeight();
    const worldX = (tx + 0.5) * tileW;
    const worldY = (ty + 0.5) * tileH;
    return {
      imgX: xform.offsetX + worldX * xform.scaleX,
      imgY: xform.offsetY + worldY * xform.scaleY,
    };
  }

  // egy segédfüggvény, ami átfesti a \c[n]–eket igazi MessageWindow‐kódra
  function formatColorCodes(text) {
    // 1) fordítsuk át a kis "\c["-eket nagy "\C["-re
    text = text.replace(/\\c\[(\d+)\]/gi, "\\C[$1]");
    // 2) hívd meg a beépített escape-feldolgozót
    return Window_Base.prototype.convertEscapeCharacters.call(this, text);
  }

  /**
   * Inverse (approx): image pixel -> tile.
   * NOTE: clamps to map bounds; returns floats unless round=true.
   */
  function imageToWorld(px, py, xform, round) {
    const tileW = $gameMap.tileWidth();
    const tileH = $gameMap.tileHeight();
    const worldX = (px - xform.offsetX) / (xform.scaleX || 1);
    const worldY = (py - xform.offsetY) / (xform.scaleY || 1);
    let tx = worldX / tileW;
    let ty = worldY / tileH;
    if (round) {
      tx = Math.round(tx);
      ty = Math.round(ty);
    }
    tx = clamp(tx, 0, $dataMap.width - 1);
    ty = clamp(ty, 0, $dataMap.height - 1);
    return { tx, ty };
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Scroll‑indikátor beállítások
  // ────────────────────────────────────────────────────────────────────────────
  const SHOW_SCROLL_IND = P("showScrollIndicators") !== "false";
  const DEFAULT_IND_SIZE = Number(P("scrollIndicatorSize") || 24);
  const DEFAULT_IND_COLOR = P("scrollIndicatorColor") || "#FFFFFF";

  /** Visszaad egy 24×24‑es fehér, felfelé mutató nyíl‑Bitmapet. */
  function makeArrowBitmap(size = DEFAULT_IND_SIZE, color = DEFAULT_IND_COLOR) {
    const S = size;
    const bmp = new Bitmap(S, S);
    const ctx = bmp._context;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const half = S / 2;
    const baseOffset = S * 0.1;
    ctx.moveTo(half, 0);
    ctx.lineTo(S - baseOffset, S);
    ctx.lineTo(baseOffset, S);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    bmp._setDirty();
    return bmp;
  }
  const ARROW_BMP = makeArrowBitmap();

  // ────────────────────────────────────────────────────────────────────────────
  // 1) In-menu handler hookup (Scene_Menu) – színezés és ikon escape-ekkel
  // ────────────────────────────────────────────────────────────────────────────
  const _SceneMenu_create = Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _SceneMenu_create.call(this);

    /* MINDEN logika egyetlen közös függvényben */
    this._commandWindow.setHandler(MAP_KEY, () => handleMapOpen.call(this));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // 2) Hotkey from Scene_Map – színezés és ikon escape-ekkel
  // ────────────────────────────────────────────────────────────────────────────
  const _SceneMap_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _SceneMap_update.call(this);

    if (Input.isTriggered(MAP_KEY)) {
      handleMapOpen.call(this);
    }
  };

  // ===========================================================================
  // Window_InteractiveMap
  // ===========================================================================
  function Window_InteractiveMap() {
    this.initialize(...arguments);
  }
  Window_InteractiveMap.prototype = Object.create(Window_Base.prototype);
  Window_InteractiveMap.prototype.constructor = Window_InteractiveMap;

  Window_InteractiveMap.prototype.initialize = function (x, y, w, h, design) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this._design = design || "default";

    if (this._design === "customwindow" && MAP_WINDOW_SKIN) {
      // 1) betöltjük a kiválasztott sheetet (NEM kell útvonal, az
      // ImageManager.loadSystem automatikusan „img/system/”-et prefixel)
      this.windowskin = ImageManager.loadSystem(MAP_WINDOW_SKIN);

      // 2) minden rész újrarajzolása, hogy az új skin tényleg megjelenjen
      this._refreshAllParts();
    }

    // --- window chrome -------------------------------------------------------
    if (this._design === "default") {
      this.opacity = 192;
      this.padding = 18;
    } else if (this._design === "none") {
      this.opacity = 0;
      this.backOpacity = 0;
      this.padding = 0;
    }

    // --- zoom ----------------------------------------------------------------
    this._zoomLevels = ZOOM_LEVELS.slice(); // copy for safety
    this._zoomIdx = 0; // start at 1 ×

    // --- camera / bitmap state ----------------------------------------------
    this._bmp = null;
    this._coverScale = 1; // final scale = baseCoverScale * zoom
    this._srcW = 0;
    this._srcH = 0;

    this._camX = this._camY = 0; // current top-left (img-px)
    this._camTX = this._camTY = 0; // tween target
    this._canPan = false;
    this._panSpeed = PAN_SPEED;

    this._cw = this.contentsWidth();
    this._ch = this.contentsHeight();

    // --- marker layer --------------------------------------------------------
    this._markerLayer = new Sprite();
    this._markerLayer.x = this.padding;
    this._markerLayer.y = this.padding;
    this.addChild(this._markerLayer);

    // --- player marker -------------------------------------------------------
    let markerBmp;
    if (USE_CUSTOM_MARKER && CUSTOM_MARKER_IMAGE) {
      markerBmp = ImageManager.loadBitmap(
        "img/system/",
        CUSTOM_MARKER_IMAGE,
        0,
        true
      );
    } else {
      const size = DEFAULT_MARKER_SIZE;
      markerBmp = new Bitmap(size, size);
      const ctx = markerBmp._context;
      ctx.fillStyle = DEFAULT_MARKER_COLOR;
      ctx.beginPath();
      switch (DEFAULT_MARKER_SHAPE) {
        case "circle":
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          break;
        case "diamond":
          ctx.moveTo(size / 2, 0);
          ctx.lineTo(size, size / 2);
          ctx.lineTo(size / 2, size);
          ctx.lineTo(0, size / 2);
          ctx.closePath();
          break;
        case "triangle":
          ctx.moveTo(size / 2, 0);
          ctx.lineTo(size, size);
          ctx.lineTo(0, size);
          ctx.closePath();
          break;
        case "square":
        default:
          ctx.rect(0, 0, size, size);
      }
      ctx.fill();
      markerBmp._setDirty();
    }
    this._playerDot = new Sprite(markerBmp);
    this._playerDot.anchor.set(0.5);
    this._playerDot.visible = false;
    this._markerLayer.addChild(this._playerDot);
    this._scaleMode = GLOBAL_SCALE_MODE;
    this._drawDX = 0;
    this._drawDY = 0;
    this._drawW = this._cw;
    this._drawH = this._ch;
  };

  Window_InteractiveMap.prototype.setBitmap = function (bmp) {
    this._bmp = bmp;
    this._recalcCamera(true);
  };

  /* =====================================================================
   * Window_TopLevel
   *   – csak felirat(ok); szélessége a map‑ablakéval egyezik
   * ===================================================================*/
  function Window_TopLevel() {
    this.initialize(...arguments);
  }
  Window_TopLevel.prototype = Object.create(Window_Base.prototype);
  Window_TopLevel.prototype.constructor = Window_TopLevel;

  Window_TopLevel.prototype.initialize = function (x, y, w, h, skinMode) {
    Window_Base.prototype.initialize.call(this, x, y, w, h);

    if (skinMode === "customwindow" && TL_CUSTOM_SKIN) {
      this.windowskin = ImageManager.loadSystem(TL_CUSTOM_SKIN);
    } else if (skinMode === "default") {
    } else if (skinMode === "same") {
      // később Scene tölti be ugyan‑azt a sheetet mint a map‑ablak
    }
    this.refresh(""); // üres kezdés
  };

  Window_TopLevel.prototype.standardFontSize = function () {
    return TL_FONT_SIZE;
  };

  /** Csak egyszerű szöveg‑kirajzolás */
  Window_TopLevel.prototype.refresh = function (items) {
    this.contents.clear();
    if (!Array.isArray(items) || !items.length) return;

    const gapBase = 16; // gapp
    this.contents.fontSize = TL_FONT_SIZE;
    const lineH = this.lineHeight();
    const widths = items.map((t) => this.textWidth(t));
    const totalW = widths.reduce((a, b) => a + b, 0);
    const cw = this.contentsWidth();
    let gaps = gapBase;
    let x0;

    switch (TL_JUSTIFY) {
      case "start":
        x0 = 0;
        break;
      case "end":
        x0 = cw - (totalW + gapBase * (items.length - 1));
        break;
      case "spacebetween":
        x0 = 0;
        gaps = items.length > 1 ? (cw - totalW) / (items.length - 1) : 0;
        break;
      case "center":
      default:
        x0 = (cw - (totalW + gapBase * (items.length - 1))) / 2;
        break;
    }

    let x = Math.max(0, Math.round(x0));
    const y = Math.round((this.contentsHeight() - lineH) / 2);
    for (let i = 0; i < items.length; i++) {
      this.drawText(items[i], x, y, widths[i], "left");
      x += widths[i] + gaps;
    }
  };

  // ---------------------------------------------------------------------------
  // Window_InteractiveMap.zoomStep
  // ---------------------------------------------------------------------------
  Window_InteractiveMap.prototype.zoomStep = function (dir /* ±1 */) {
    const newIdx = this._zoomIdx + dir;
    if (newIdx < 0 || newIdx >= this._zoomLevels.length) return;

    const cx = this._camX + this._srcW / 2;
    const cy = this._camY + this._srcH / 2;

    this._zoomIdx = newIdx;
    this._recalcCamera(true);

    this.centerOnImagePoint(cx, cy);
  };

  Window_InteractiveMap.prototype._recalcCamera = function (forceCenter) {
    if (!this._bmp) return;

    const cw = this.contentsWidth();
    const ch = this.contentsHeight();
    if (cw <= 0 || ch <= 0) return;

    if (forceCenter || cw !== this._cw || ch !== this._ch) {
      this._cw = cw;
      this._ch = ch;

      const iw = this._bmp.width;
      const ih = this._bmp.height;

      // 1) alapskála a scaleMode szerint
      const mode = this._scaleMode || "cover";
      let base;
      if (mode === "contain") {
        base = Math.min(cw / iw, ch / ih);
      } else if (mode === "noupscale") {
        base = Math.min(1, Math.min(cw / iw, ch / ih));
      } else {
        // cover
        base = Math.max(cw / iw, ch / ih);
      }

      // végső skála = alapskála × zoom
      this._coverScale = base * this._zoomLevels[this._zoomIdx];

      // 2) cél rajzterület (dest rect a contents‑en belül)
      let drawW, drawH, drawDX, drawDY;
      if (mode === "cover") {
        drawW = cw;
        drawH = ch;
        drawDX = 0;
        drawDY = 0;
      } else {
        // contain / noupscale – teljes képet skálázzuk és középre tesszük
        drawW = Math.round(iw * base);
        drawH = Math.round(ih * base);
        drawDX = Math.floor((cw - drawW) / 2);
        drawDY = Math.floor((ch - drawH) / 2);
      }
      this._drawW = drawW;
      this._drawH = drawH;
      this._drawDX = drawDX;
      this._drawDY = drawDY;

      // 3) forrás (crop) téglalap a bitmapon – a rajzterülethez mérve
      let newW = Math.round(drawW / this._coverScale);
      let newH = Math.round(drawH / this._coverScale);
      if (newW > iw) newW = iw;
      if (newH > ih) newH = ih;

      // fókusz megtartása / középre igazítás
      let cX = this._camX + this._srcW / 2;
      let cY = this._camY + this._srcH / 2;
      if (forceCenter) {
        cX = iw / 2;
        cY = ih / 2;
      }
      let sx = Math.round(cX - newW / 2);
      let sy = Math.round(cY - newH / 2);
      sx = clamp(sx, 0, Math.max(0, iw - newW));
      sy = clamp(sy, 0, Math.max(0, ih - newH));

      this._srcW = newW;
      this._srcH = newH;
      this._camX = this._camTX = sx;
      this._camY = this._camTY = sy;

      // akkor pánolható, ha tényleges vágás van (zoom>1 vagy cover)
      this._canPan = iw > newW || ih > newH;

      this._redraw();
      IRMap.emit("camera-changed", { win: this, instant: true });
    }
  };

  Window_InteractiveMap.prototype._redraw = function () {
    this.contents.clear();
    if (!this._bmp) return;

    // ---- LETTERBOX UNDERLAY (globális cover módban, csak windowos nézetben) ----
    const isWindowedUI = this._design !== "none";
    if (UNDERLAY_BMP && isWindowedUI) {
      // Ha még nem töltődött be, egy hullámvölgy: újra redraw, amikor már készen van
      if (!UNDERLAY_BMP.isReady && !UNDERLAY_BMP.width) {
        if (!this._underlayLoadHooked) {
          this._underlayLoadHooked = true;
          UNDERLAY_BMP.addLoadListener(() => this._redraw());
        }
      }

      this.contents.blt(
        UNDERLAY_BMP,
        0,
        0,
        UNDERLAY_BMP.width || 1,
        UNDERLAY_BMP.height || 1,
        0,
        0,
        this._cw,
        this._ch
      );
    }

    // ---- TÉRKÉP kirajzolása ----
    this.contents.blt(
      this._bmp,
      this._camX,
      this._camY,
      this._srcW,
      this._srcH,
      this._drawDX,
      this._drawDY,
      this._drawW,
      this._drawH
    );
  };

  Window_InteractiveMap.prototype.panStep = function (dxScr, dyScr) {
    if (!this._canPan) return;
    const iw = this._bmp.width;
    const ih = this._bmp.height;
    const inv = 1 / this._coverScale;
    let sx = this._camTX + Math.round(dxScr * inv);
    let sy = this._camTY + Math.round(dyScr * inv);
    sx = clamp(sx, 0, iw - this._srcW);
    sy = clamp(sy, 0, ih - this._srcH);
    this._camTX = sx;
    this._camTY = sy;
  };

  Window_InteractiveMap.prototype._updateCameraLerp = function () {
    let moved = false;
    const dx = this._camTX - this._camX;
    const dy = this._camTY - this._camY;

    if (Math.abs(dx) > SNAP_EPS) {
      this._camX += dx * LERP_FACTOR;
      moved = true;
    } else if (dx !== 0) {
      this._camX = this._camTX;
      moved = true;
    }

    if (Math.abs(dy) > SNAP_EPS) {
      this._camY += dy * LERP_FACTOR;
      moved = true;
    } else if (dy !== 0) {
      this._camY = this._camTY;
      moved = true;
    }

    if (moved) {
      this._camX = Math.round(this._camX);
      this._camY = Math.round(this._camY);
      this._redraw();
      IRMap.emit("camera-changed", { win: this, instant: false });
    }
  };

  function shouldTrack(cfg) {
    if (cfg && cfg.enablePlayerTracking != null) {
      return String(cfg.enablePlayerTracking) === "true";
    }
    return GLOBAL_TRACK;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Update the player marker’s position, rotation (if triangle), and pulse opacity
  // ────────────────────────────────────────────────────────────────────────────
  Window_InteractiveMap.prototype.updatePlayerMarker = function (imgX, imgY) {
    const cfg = findCfg();
    if (!shouldTrack(cfg)) {
      this._playerDot.visible = false;
      return;
    }
    if (!this._bmp) return;

    const relX = imgX - this._camX;
    const relY = imgY - this._camY;
    if (relX < 0 || relY < 0 || relX > this._srcW || relY > this._srcH) {
      this._playerDot.visible = false;
      return;
    }

    const s = this._coverScale;
    this._playerDot.visible = true;
    this._playerDot.x = Math.round(this._drawDX + relX * s);
    this._playerDot.y = Math.round(this._drawDY + relY * s);

    // Háromszög forgatása a játékos face irányába
    if (!USE_CUSTOM_MARKER && DEFAULT_MARKER_SHAPE === "triangle") {
      const dir = $gamePlayer.direction();
      let angle = 0;
      // 8 = fel, 6 = jobb, 2 = le, 4 = bal
      if (dir === 8) angle = 0;
      else if (dir === 6) angle = Math.PI / 2;
      else if (dir === 2) angle = Math.PI;
      else if (dir === 4) angle = -Math.PI / 2;
      this._playerDot.rotation = angle;
    } else {
      this._playerDot.rotation = 0;
    }

    // Pulsálás (opacity) ha be van kapcsolva
    if (MARKER_PULSE) {
      const t = (Date.now() / 1000) * Math.PI * 2;
      this._playerDot.opacity =
        160 + Math.round(95 * (0.5 + 0.5 * Math.sin(t)));
    } else {
      this._playerDot.opacity = 255;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Core update loop for the window – camera lerp + base update
  // ────────────────────────────────────────────────────────────────────────────
  Window_InteractiveMap.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this._updateCameraLerp();
  };

  /**
   * Instant scroll so the given image-pixel coordinate becomes the view center.
   * Call only after bitmap + camera sizes are valid.
   */
  Window_InteractiveMap.prototype.centerOnImagePoint = function (imgX, imgY) {
    if (!this._bmp || !this._canPan) return;

    const iw = this._bmp.width;
    const ih = this._bmp.height;

    let sx = Math.round(imgX - this._srcW / 2);
    let sy = Math.round(imgY - this._srcH / 2);
    sx = clamp(sx, 0, Math.max(0, iw - this._srcW));
    sy = clamp(sy, 0, Math.max(0, ih - this._srcH));

    this._camX = this._camTX = sx;
    this._camY = this._camTY = sy;
    this._redraw();
  };

  // --- API helpers exposed on window instance --------------------------------
  Window_InteractiveMap.prototype.cameraRect = function () {
    return { x: this._camX, y: this._camY, w: this._srcW, h: this._srcH };
  };
  Window_InteractiveMap.prototype.coverScale = function () {
    return this._coverScale;
  };
  Window_InteractiveMap.prototype.mapBitmap = function () {
    return this._bmp;
  };

  // ===========================================================================
  // Scene_InteractiveMap
  // ===========================================================================
  function Scene_InteractiveMap() {
    this.initialize(...arguments);
  }
  Scene_InteractiveMap.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_InteractiveMap.prototype.constructor = Scene_InteractiveMap;

  Scene_InteractiveMap.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
    this._cfg = null;
    this._xform = null;
    this._frameSprite = null;
    this._overlayRoot = null;
    this._breadcrumb = IRMap.getAncestorChain($gameMap.mapId()).reverse();
    IRMap._currentScene = this;
    IRMap.emit("scene-open", { scene: this });
    this._selectedName = "";
    this._onPoiClick = ({ poi }) => {
      this._selectedName = (poi && poi.name) || "";
      this._updateTopLevel();
    };
    IRMap.on("poi-click", this._onPoiClick);
    IRMap.on("empty-click", () => {
      this._selectedName = "";
      if (this._topWin) this._updateTopLevel();
    });
  };

  Scene_InteractiveMap.prototype.create = function () {
    // --- eredeti setup ---
    Scene_MenuBase.prototype.create.call(this);
    const winW = Math.floor((Graphics.boxWidth * MAP_WIN_W_PCT) / 100);
    const winH = Math.floor((Graphics.boxHeight * MAP_WIN_H_PCT) / 100);
    const winX = (Graphics.boxWidth - winW) / 2;
    const winY = (Graphics.boxHeight - winH) / 2;
    this._cfg = findCfg();

    // create and add the map window
    this._win = new Window_InteractiveMap(
      winX,
      winY,
      winW,
      winH,
      WINDOW_DESIGN
    );
    this.addWindow(this._win);
    // overlay root for all sprites/text
    this._overlayRoot = new Sprite();
    this.addChild(this._overlayRoot);

    // -------------------------------------------------------------------
    //  Top-level window (opcionális)
    // -------------------------------------------------------------------
    this._topWin = null;
    if (TL_SHOW) {
      const tlW = winW;
      const tlH = TL_H;
      const tlX = winX;
      const tlY = winY - tlH - 8;

      this._topWin = new Window_TopLevel(tlX, tlY, tlW, tlH, TL_SKIN_MODE);

      if (TL_SKIN_MODE === "same") {
        this._topWin.windowskin = this._win.windowskin;
        this._topWin._refreshAllParts();
      }
      this.addWindow(this._topWin);
      this._updateTopLevel();
    }

    // --- custom frame, if any ---
    if (CUSTOM_FRAME_IMAGE) {
      const frameBmp = ImageManager.loadSystem(CUSTOM_FRAME_IMAGE);
      const frameSpr = new Sprite(frameBmp);
      frameSpr.anchor.set(0.5, 0.5);
      frameSpr.x = winX + winW / 2 + CUSTOM_FRAME_OFF_X;
      frameSpr.y = winY + winH / 2 + CUSTOM_FRAME_OFF_Y;
      frameBmp.addLoadListener(() => {
        if (frameBmp.width && frameBmp.height) {
          const factor = 1 + CUSTOM_FRAME_PAD / 100;
          const targetW = winW * factor;
          const targetH = winH * factor;
          const k = Math.max(
            targetW / frameBmp.width,
            targetH / frameBmp.height
          );
          frameSpr.scale.set(k, k);
        }
      });
      if (FRAME_OVERLAP) {
        this.addChild(frameSpr);
      } else {
        const idx = Math.max(0, this.children.indexOf(this._windowLayer));
        this.addChildAt(frameSpr, idx);
      }
      this._frameSprite = frameSpr;
    }

    // --- no config: show fallback text ---
    if (!this._cfg) {
      const lh = this._win.lineHeight();
      this._win.drawText(
        TEXT_NO_MAP,
        0,
        (this._win.contentsHeight() - lh) / 2,
        this._win.contentsWidth(),
        "center"
      );
      IRMap.emit("scene-ready", {
        scene: this,
        win: this._win,
        cfg: null,
        xform: null,
      });
      this._ensureScrollIndicators();
      return;
    }

    // --- load map bitmap ---
    const bmp = ImageManager.loadBitmap(
      "img/maps/",
      this._cfg.fullMapImage,
      0,
      true
    );
    bmp.addLoadListener(() => {
      this._win.setBitmap(bmp);

      this._win._scaleMode = effScaleMode(this._cfg);
      this._win._recalcCamera(true);

      this._xform = calcXform(bmp, this._cfg);
      if (this._win._canPan) {
        const pos = worldToImage($gamePlayer.x, $gamePlayer.y, this._xform);
        this._win.centerOnImagePoint(pos.imgX, pos.imgY);
      }

      IRMap.emit("bitmap-loaded", {
        scene: this,
        win: this._win,
        cfg: this._cfg,
        bmp,
        xform: this._xform,
      });
      this._refreshMarker();

      // --- map name or map-name-as-image at configurable position ---
      const cfg = this._cfg;
      const namePos = (cfg.namePosition || "top-center").toLowerCase();
      const useImg = !!cfg.MapNameAsImage;
      const autoScale = cfg.mapNameImgScale !== false;

      // define all six positions
      const positions = {
        "top-left": {
          anchorX: 0,
          anchorY: 0,
          x: winX + this._win.padding,
          y: winY + this._win.padding,
        },
        "top-center": {
          anchorX: 0.5,
          anchorY: 0,
          x: winX + winW / 2,
          y: winY + this._win.padding,
        },
        "top-right": {
          anchorX: 1,
          anchorY: 0,
          x: winX + winW - this._win.padding,
          y: winY + this._win.padding,
        },
        "bottom-left": {
          anchorX: 0,
          anchorY: 1,
          x: winX + this._win.padding,
          y: winY + winH - this._win.padding,
        },
        "bottom-center": {
          anchorX: 0.5,
          anchorY: 1,
          x: winX + winW / 2,
          y: winY + winH - this._win.padding,
        },
        "bottom-right": {
          anchorX: 1,
          anchorY: 1,
          x: winX + winW - this._win.padding,
          y: winY + winH - this._win.padding,
        },
      };

      const pos = positions[namePos] || positions["top-center"];

      if (useImg) {
        // Image mode
        const labelBmp = ImageManager.loadBitmap(
          "img/maplabels/",
          cfg.MapNameAsImage,
          0,
          true
        );
        const labelSpr = new Sprite(labelBmp);
        labelSpr.anchor.set(pos.anchorX, pos.anchorY);
        labelSpr.x = pos.x;
        labelSpr.y = pos.y;
        if (autoScale) {
          labelBmp.addLoadListener(() => {
            const maxW = winW * 0.25;
            if (labelBmp.width > maxW) {
              const scale = maxW / labelBmp.width;
              labelSpr.scale.set(scale, scale);
            }
          });
        }
        this._overlayRoot.addChild(labelSpr);
      } else if (cfg.mapDisplayName) {
        // Text mode
        const text = cfg.mapDisplayName;
        const lh = this._win.lineHeight();
        const textBmp = new Bitmap(winW, lh);
        // choose alignment based on horizontal position
        const align = namePos.includes("right")
          ? "right"
          : namePos.includes("center")
          ? "center"
          : "left";
        textBmp.drawText(text, 0, 0, winW, lh, align);
        const textSpr = new Sprite(textBmp);
        // for left and center/right, x always padded; vertical y adjusted by anchor
        textSpr.x = winX + this._win.padding;
        textSpr.y = pos.y - pos.anchorY * lh;
        this._overlayRoot.addChild(textSpr);
      }

      // --- overlay addons ---
      IRMap._overlayFns.forEach((fn) => {
        try {
          fn(this, this._win, this._xform);
        } catch (e) {
          console.error(`[${PLUGIN}] overlay fn error:`, e);
        }
      });

      // position scroll indicators after drawing name
      this._ensureScrollIndicators();

      IRMap.emit("scene-ready", {
        scene: this,
        win: this._win,
        cfg: this._cfg,
        xform: this._xform,
      });
    });
    IRMap.on("empty-click", () => {
      // POI elemek ablaka
      if (this._poiImgWin) {
        this.removeChild(this._poiImgWin);
        this._poiImgWin = null;
      }
      if (this._poiTxtWin) {
        this.removeChild(this._poiTxtWin);
        this._poiTxtWin = null;
      }
      // NPC portré ablaka
      if (this._npcImgWin) {
        this.removeChild(this._npcImgWin);
        this._npcImgWin = null;
      }
      if (this._npcTxtWin) {
        this.removeChild(this._npcTxtWin);
        this._npcTxtWin = null;
      }
      // opciós menü (ha van)
      if (this._poiMenu) {
        this.removeChild(this._poiMenu);
        this._poiMenu = null;
      }
      if (this._npcMenu) {
        this.removeChild(this._npcMenu);
        this._npcMenu = null;
      }
    });

    // if still loading, ensure indicators exist
    this._ensureScrollIndicators();
  };

  Scene_InteractiveMap.prototype.terminate = function () {
    IRMap.off("poi-click", this._onPoiClick);
    IRMap.emit("scene-close", { scene: this });
    Scene_MenuBase.prototype.terminate.call(this);
    if (IRMap._currentScene === this) IRMap._currentScene = null;
  };

  const _SceneInt_update = Scene_InteractiveMap.prototype.update;
  Scene_InteractiveMap.prototype.update = function () {
    // --- eredeti update
    Scene_MenuBase.prototype.update.call(this);
    if (Input.isTriggered("cancel") || Input.isTriggered(MAP_KEY)) {
      console.log("◀️ Closing Map SE:", CLOSE_SE);
      if (CLOSE_SE) {
        AudioManager.playSe({
          name: CLOSE_SE,
          pan: 0,
          pitch: 100,
          volume: AudioManager.seVolume,
        });
      }
      SceneManager.pop();
      return;
    }
    if (Input.isTriggered(KEY_ZOOM_IN)) this._win.zoomStep(+1);
    if (Input.isTriggered(KEY_ZOOM_OUT)) this._win.zoomStep(-1);
    this._win._recalcCamera(false);
    if (this._win._canPan) {
      let dx = 0,
        dy = 0;
      if (Input.isPressed("left")) dx -= this._win._panSpeed;
      if (Input.isPressed("right")) dx += this._win._panSpeed;
      if (Input.isPressed("up")) dy -= this._win._panSpeed;
      if (Input.isPressed("down")) dy += this._win._panSpeed;
      if (dx || dy) this._win.panStep(dx, dy);
    }
    this._refreshMarker();
    IRMap.emit("update-tick", {
      scene: this,
      win: this._win,
      xform: this._xform,
    });

    // --- scroll-indikátorok ki/bekapcsolása ---
    const bmp = this._win._bmp;
    if (bmp && bmp.width && bmp.height) {
      const camX = this._win._camTX; // cél X
      const camY = this._win._camTY; // cél Y
      const srcW = this._win._srcW;
      const srcH = this._win._srcH;
      if (SHOW_SCROLL_IND) {
        this._triUp.visible = camY > 0;
        this._triDown.visible = camY + srcH < bmp.height;
        this._triLeft.visible = camX > 0;
        this._triRight.visible = camX + srcW < bmp.width;
      }
    }
  };

  Scene_InteractiveMap.prototype._updateTopLevel = function () {
    if (!this._topWin) return;
    const pieces = [];

    // végig a paraméterben megadott sorrenden
    TL_ELEMENTS.forEach((raw) => {
      const e = raw.trim().toLowerCase();

      // 1) showmap
      if (e === "showmap") {
        if (this._cfg && this._cfg.mapDisplayName) {
          pieces.push(this._cfg.mapDisplayName);
        } else {
          const info = $dataMapInfos[$gameMap.mapId()];
          pieces.push(info ? info.name : "");
        }
        return;
      }

      // 2) showbreadcumb / show breadcumb [+ opcionális topleveloff flag]
      if (e.startsWith("showbreadcumb")) {
        if (this._breadcrumb.length > 1) {
          const tokens = e.split(/\s+/);
          const flag = tokens.slice(1).join(" ");
          const hideRoot = flag === "topleveloff" || flag === "top level off";
          const chain = hideRoot ? this._breadcrumb.slice(1) : this._breadcrumb;
          const names = chain.map((id) => {
            const cfg = findCfgForMapId(id);
            if (cfg && cfg.mapDisplayName) return cfg.mapDisplayName;
            const info = $dataMapInfos[id];
            return info ? info.name : "MAP" + id;
          });
          pieces.push(names.join(" / "));
        }
        return;
      }

      // 3) showdesc / show desc / show description
      if (e === "showdesc" || e === "show desc" || e === "show description") {
        if (this._cfg && this._cfg.mapDescription) {
          pieces.push(this._cfg.mapDescription);
        }
        return;
      }

      // 4) showselected / show selected
      if (e === "showselected" || e === "show selected") {
        if (this._selectedName) {
          pieces.push(this._selectedName);
        }
        return;
      }

      // ide lehet később további showXYZ parancsokat beilleszteni...
    });

    this._topWin.refresh(pieces);
  };

  // ─────────────────────────────────────────────────────────────
  //  Scene_InteractiveMap – dinamikus map váltás ugyanabban az ablakban
  // ─────────────────────────────────────────────────────────────
  Scene_InteractiveMap.prototype.switchToMapById = function (mapId, opts) {
    opts = opts || {};
    const cfg =
      typeof findCfgForMapId === "function" ? findCfgForMapId(mapId) : null;

    // Hozzáférés ellenőrzés
    if (!IRMap.canOpenMap(mapId)) {
      const msg = IRMap.getOpenMapFailureMessage(mapId) || "";
      if (msg.trim()) {
        // ha van üzenet → tegyük ki és zárjuk azonnal a Scene-t, hogy most látszódjon
        $gameMessage.add(
          Window_Base.prototype.convertEscapeCharacters.call(this, msg)
        );
        SceneManager.pop();
      }
      // ha nincs üzenet → csendben elutasítjuk, nem zárjuk be
      return;
    }

    // Ha nincs egyedi konfig: fallback (ha engedélyezett)
    if (!cfg) {
      if (typeof ENABLE_FALLBACK !== "undefined" && ENABLE_FALLBACK) {
        if (typeof FALLBACK_IMG !== "undefined" && FALLBACK_IMG) {
          // Fallback kép megnyitása külön scene-ben (meglévő logikád szerint)
          if (typeof Scene_FallbackMap !== "undefined") {
            SceneManager.push(Scene_FallbackMap);
          } else {
            $gameMessage.add(
              Window_Base.prototype.convertEscapeCharacters.call(
                this,
                TEXT_NO_MAP || "No map available."
              )
            );
          }
        } else {
          $gameMessage.add(
            Window_Base.prototype.convertEscapeCharacters.call(
              this,
              TEXT_NO_MAP || "No map available."
            )
          );
        }
      }
      return;
    }

    this._breadcrumb = IRMap.getAncestorChain(mapId).reverse();

    const win = this._win;
    const oldCfg = this._cfg;
    this._cfg = cfg;
    this._selectedName = "";

    // Új bitmap betöltése
    const bmp = ImageManager.loadBitmap("img/maps/", cfg.fullMapImage, 0, true);
    bmp.addLoadListener(() => {
      // 1) ablak tartalom frissítése
      win.setBitmap(bmp);
      win._scaleMode = effScaleMode(cfg);
      win._recalcCamera(true);
      this._ensureScrollIndicators();
      this._updateTopLevel();

      this._xform =
        typeof calcXform === "function" ? calcXform(bmp, cfg) : null;
      if (win._canPan) {
        const pos =
          typeof worldToImage === "function"
            ? worldToImage($gamePlayer.x, $gamePlayer.y, this._xform)
            : { imgX: bmp.width / 2, imgY: bmp.height / 2 };
        win.centerOnImagePoint(pos.imgX, pos.imgY);
      }

      // 4) overlay réteg újraépítése
      //    – markerLayer ürítése, maszk reset
      if (win._markerLayer) {
        try {
          win._markerLayer.removeChildren();
        } catch (e) {}
        if (win._poiMask) {
          try {
            if (win._markerLayer.mask === win._poiMask)
              win._markerLayer.mask = null;
          } catch (e) {}
          win._poiMask = null;
        }
      }
      //    – feliratok (map name / image) törlése: egyszerűen ürítsük ki az overlayRoot‑ot
      if (this._overlayRoot) {
        try {
          this._overlayRoot.removeChildren();
        } catch (e) {}
        this._ensureScrollIndicators();
      }

      // 5) Map label (szöveg vagy kép) újra kirakása
      const winX = win.x,
        winY = win.y,
        winW = win.width,
        winH = win.height;

      if (cfg.MapNameAsImage) {
        const labelBmp = ImageManager.loadBitmap(
          "img/maplabels/",
          cfg.MapNameAsImage,
          0,
          true
        );
        const labelSpr = new Sprite(labelBmp);
        labelSpr.anchor.set(0.5, 0);
        labelSpr.x = winX + winW / 2;
        labelSpr.y = winY + win.padding;
        // ha az auto‑scale a globális paramodban van, itt opcionálisan ismét skálázhatod
        labelBmp.addLoadListener(() => {
          const maxW = winW * 0.25;
          if (labelBmp.width > maxW) {
            const scale = maxW / labelBmp.width;
            labelSpr.scale.set(scale, scale);
          }
        });
        this._overlayRoot.addChild(labelSpr);
      } else if (cfg.mapDisplayName) {
        const text = cfg.mapDisplayName;
        const lh = win.lineHeight();
        const textBmp = new Bitmap(winW, lh);
        textBmp.drawText(text, 0, 0, winW, lh, "center");
        const textSpr = new Sprite(textBmp);
        textSpr.x = winX + win.padding;
        textSpr.y = winY + win.padding;
        this._overlayRoot.addChild(textSpr);
      }

      // 6) overlay addonok újrahívása (POI‑k, stb.)
      if (Array.isArray(IRMap._overlayFns)) {
        IRMap._overlayFns.forEach((fn) => {
          try {
            fn(this, win, this._xform);
          } catch (e) {
            console.error("[IRMap] overlay fn error:", e);
          }
        });
      }

      // 7) marker frissítés
      this._refreshMarker && this._refreshMarker();

      // 8) események – a meglévőkhöz igazodva
      IRMap.emit &&
        IRMap.emit("bitmap-loaded", {
          scene: this,
          win,
          cfg: this._cfg,
          bmp,
          xform: this._xform,
        });
      IRMap.emit &&
        IRMap.emit("map-switched", {
          scene: this,
          win,
          from: oldCfg ? oldCfg.mapId || oldCfg.editorMapName : null,
          to: cfg.mapId || cfg.editorMapName,
        });
    });
  };

  Scene_InteractiveMap.prototype._ensureScrollIndicators = function () {
    const win = this._win;
    const PAD = 4;

    if (!SHOW_SCROLL_IND) {
      if (this._triUp) {
        [this._triUp, this._triDown, this._triLeft, this._triRight].forEach(
          (sp) => {
            if (sp && sp.parent) sp.parent.removeChild(sp);
          }
        );
        this._triUp = this._triDown = this._triLeft = this._triRight = null;
      }
      return;
    }

    if (!this._triUp) {
      // új Sprite‑ek
      this._triUp = new Sprite(ARROW_BMP);
      this._triDown = new Sprite(ARROW_BMP);
      this._triLeft = new Sprite(ARROW_BMP);
      this._triRight = new Sprite(ARROW_BMP);

      [this._triUp, this._triDown, this._triLeft, this._triRight].forEach(
        (sp) => {
          sp.anchor.set(0.5, 0.5);
          this._overlayRoot.addChild(sp);
        }
      );

      this._triUp.rotation = 0;
      this._triRight.rotation = Math.PI / 2;
      this._triDown.rotation = Math.PI;
      this._triLeft.rotation = -Math.PI / 2;
    }

    // pozíció
    const innerX = win.x + win.padding + (win._drawDX || 0);
    const innerY = win.y + win.padding + (win._drawDY || 0);
    const innerW = win._drawW || win.contentsWidth();
    const innerH = win._drawH || win.contentsHeight();

    this._triUp.x = innerX + innerW / 2;
    this._triUp.y = innerY + PAD;
    this._triDown.x = innerX + innerW / 2;
    this._triDown.y = innerY + innerH - PAD;
    this._triLeft.x = innerX + PAD;
    this._triLeft.y = innerY + innerH / 2;
    this._triRight.x = innerX + innerW - PAD;
    this._triRight.y = innerY + innerH / 2;
  };

  // Kényelmi wrapper: név alapján
  Scene_InteractiveMap.prototype.switchToMapByEditorName = function (
    editorName,
    opts
  ) {
    const id = IRMap.findMapIdByEditorName(editorName);
    if (!id) {
      $gameMessage.add("Related map not found: " + editorName);
      return;
    }
    this.switchToMapById(id, opts);
  };

  Scene_InteractiveMap.prototype._refreshMarker = function () {
    if (!this._xform || !this._win._bmp) return;
    const pos = worldToImage($gamePlayer.x, $gamePlayer.y, this._xform);
    this._win.updatePlayerMarker(pos.imgX, pos.imgY);
  };

  // --- API helpers on scene instance ----------------------------------------
  Scene_InteractiveMap.prototype.mapWindow = function () {
    return this._win;
  };
  Scene_InteractiveMap.prototype.mapConfig = function () {
    return this._cfg;
  };
  Scene_InteractiveMap.prototype.mapTransform = function () {
    return this._xform;
  };

  /* --------------- 2) KÖZÖS segédfüggvény --------------- */

  function handleMapOpen() {
    if (GLOBAL_DISABLED || DISABLED_SET.has($gameMap.mapId())) {
      if (params.fallbackMapImage) {
        SceneManager.push(Scene_FallbackMap);
      } else {
        $gameMessage.add(TEXT_NO_MAP);
      }
      return;
    }
    const cfg = findCfg();
    if (cfg) {
      if (!canOpenInteractiveMap(cfg)) {
        const msg = getOpenInteractiveMapFailureMessage(cfg);
        if (msg) {
          $gameMessage.add(
            Window_Base.prototype.convertEscapeCharacters.call(this, msg)
          );
        }
        return;
      }
      // → ide szúrd be a logot és a SE-t:
      console.log("▶️ Opening Map SE:", OPEN_SE);
      if (OPEN_SE) {
        AudioManager.playSe({
          name: OPEN_SE,
          pan: 0,
          pitch: 100,
          volume: AudioManager.seVolume,
        });
      }
      SceneManager.push(Scene_InteractiveMap);
      return;
    }

    if (!ENABLE_FALLBACK) return;

    if (FALLBACK_IMG) {
      SceneManager.push(Scene_FallbackMap);
    } else {
      const txt = Window_Base.prototype.convertEscapeCharacters.call(
        this,
        TEXT_NO_MAP
      );
      $gameMessage.add(txt);
    }
  }

  // ---------------------------------------------------------------------------
  // Global API object for addons
  // ---------------------------------------------------------------------------
  const IRMap = {
    version: "1.4.1-core",
    params,
    MAP_CFGS,
    getConfigForMap: (mapId) =>
      findCfgForMapId(mapId != null ? mapId : $gameMap.mapId()),
    getTransformForMap(mapId, bmp) {
      // NOTE: needs bitmap; if omitted and current scene active, reuse its transform
      if (mapId == null || mapId === $gameMap.mapId()) {
        const sc = IRMap.currentScene();
        if (sc && sc.mapTransform()) return sc.mapTransform();
        const cfg = findCfg();
        if (!cfg) return null;
        const b =
          bmp ||
          ImageManager.loadBitmap("img/maps/", cfg.fullMapImage, 0, true);
        // WARNING: if bmp not yet loaded, width=0 -> wait
        if (!b.width || !b.height) return null;
        return calcXform(b, cfg);
      } else {
        // other mapId: synchronous only if that bitmap is provided + loaded
        const cfg = findCfgForMapId(mapId);
        if (!cfg) return null;
        const b =
          bmp ||
          ImageManager.loadBitmap("img/maps/", cfg.fullMapImage, 0, true);
        if (!b.width || !b.height) return null;
        return calcXform(b, cfg);
      }
    },
    worldToImage(tx, ty, mapId) {
      const sc = IRMap.currentScene();
      if (mapId == null && sc && sc.mapTransform()) {
        return worldToImage(tx, ty, sc.mapTransform());
      }
      const cfg = IRMap.getConfigForMap(mapId);
      if (!cfg) return null;
      const b = ImageManager.loadBitmap("img/maps/", cfg.fullMapImage, 0, true);
      if (!b.width || !b.height) return null;
      const xf = IRMap.getTransformForMap(mapId, b);
      if (!xf) return null;
      return worldToImage(tx, ty, xf);
    },
    imageToWorld(px, py, mapId, round) {
      const sc = IRMap.currentScene();
      if (mapId == null && sc && sc.mapTransform()) {
        return imageToWorld(px, py, sc.mapTransform(), round);
      }
      const cfg = IRMap.getConfigForMap(mapId);
      if (!cfg) return null;
      const b = ImageManager.loadBitmap("img/maps/", cfg.fullMapImage, 0, true);
      if (!b.width || !b.height) return null;
      const xf = IRMap.getTransformForMap(mapId, b);
      if (!xf) return null;
      return imageToWorld(px, py, xf, round);
    },
    currentScene() {
      return IRMap._currentScene || null;
    },
    currentWindow() {
      const sc = IRMap.currentScene();
      return sc ? sc.mapWindow() : null;
    },

    // Overlay registration ----------------------------------------------------
    _overlayFns: [],
    registerOverlay(fn) {
      if (typeof fn === "function") this._overlayFns.push(fn);
    },

    // Simple event bus --------------------------------------------------------
    _handlers: {},
    on(evt, fn) {
      if (!this._handlers[evt]) this._handlers[evt] = [];
      this._handlers[evt].push(fn);
    },
    off(evt, fn) {
      const arr = this._handlers[evt];
      if (!arr) return;
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    },
    emit(evt, payload) {
      const arr = this._handlers[evt];
      if (!arr) return;
      for (const fn of arr.slice()) {
        try {
          fn(payload);
        } catch (e) {
          console.error(`[${PLUGIN}] emit error (${evt}):`, e);
        }
      }
    },
    imageToWindow(imgX, imgY, win) {
      win = win || IRMap.currentWindow();
      if (!win) return null;

      const dxOff = win._drawDX || 0;
      const dyOff = win._drawDY || 0;
      const sx = win.x + win.padding + dxOff + (imgX - cam.x) * s;
      const sy = win.y + win.padding + dyOff + (imgY - cam.y) * s;
      return { x: sx, y: sy };
    },

    screenToImage(scrX, scrY, win) {
      win = win || IRMap.currentWindow();
      if (!win) return null;
      const dxOff = win._drawDX || 0;
      const dyOff = win._drawDY || 0;
      const dx = scrX - win.x - win.padding - dxOff;
      const dy = scrY - win.y - win.padding - dyOff;
      if (
        dx < 0 ||
        dy < 0 ||
        dx > (win._drawW || win.contentsWidth()) ||
        dy > (win._drawH || win.contentsHeight())
      ) {
        return null;
      }
      const cam = win.cameraRect();
      const s = win.coverScale();
      const imgX = cam.x + dx / s;
      const imgY = cam.y + dy / s;
      return { imgX, imgY };
    },
  };

  const ClickSys = {
    list: [], // {sprite, onClick, blink} elemek
    active: null, // jelenleg villogtatott sprite
    add(sprite, onClick, opt = {}) {
      this.list.push({ sprite, onClick, blink: !!opt.blink });
    },
    remove(sprite) {
      this.list = this.list.filter((e) => e.sprite !== sprite);
      if (this.active && this.active.sprite === sprite) this._stopBlink();
    },
    clear() {
      this._stopBlink();
      this.list = [];
    },

    _processTick() {
      /* 1) CLICK ---------------------------------------------------- */
      if (TouchInput.isTriggered()) {
        const sx = TouchInput.x,
          sy = TouchInput.y;
        const hit = this.list.find(
          (e) =>
            e.sprite.visible &&
            typeof e.sprite.hitTest === "function" &&
            e.sprite.hitTest(sx, sy)
        );
        if (hit) {
          // előző villogás leállítása
          this._stopBlink();
          // callback
          try {
            hit.onClick(hit.sprite);
          } catch (e) {
            console.error(e);
          }
          // új villogás (ha kérte)
          if (hit.blink) this._startBlink(hit);
        } else {
          // üres helyre kattintottak
          IRMap.emit("empty-click");
          this._stopBlink();
        }
      }

      /* 2) BLINK ---------------------------------------------------- */
      if (this.active) {
        // gyorsabb fázisnövelés
        const phaseInc = 0.1; // korábban 0.05 volt
        const phase = (this.active._phase =
          (this.active._phase || 0) + phaseInc);

        const a0 = this.active.baseAlpha;

        // csak 40–100% között villogjon
        const min = 0.4;
        const max = 1.0;
        const amp = max - min; // 0.6

        // sinból [0…1] tartomány
        const t = (Math.sin(phase) + 1) * 0.5;

        this.active.sprite.alpha = a0 * (min + amp * t);
      }
    },

    _startBlink(entry) {
      this.active = entry;
      entry.baseAlpha = entry.sprite.alpha;
      entry._phase = 0;
    },
    _stopBlink() {
      if (this.active) {
        this.active.sprite.alpha = this.active.baseAlpha;
        this.active = null;
      }
    },
  };

  /* automatikusan ráakasztjuk a core saját „update‑tick” bus‑ára */
  IRMap.on("update-tick", () => ClickSys._processTick());
  IRMap.on("scene-close", () => ClickSys.clear());

  /* nyilvános API */
  IRMap.registerClickable = (spr, cb, opt) => ClickSys.add(spr, cb, opt);
  IRMap.unregisterClickable = (spr) => ClickSys.remove(spr);

  // ─────────────────────────────────────────────────────────────
  //  IRMap – extra API: név→id, parent/child, feltételes elérhetőség
  // ─────────────────────────────────────────────────────────────

  IRMap.findMapIdByEditorName = function (editorName) {
    editorName = String(editorName || "").trim();
    if (!editorName) return 0;
    for (let i = 1; i < $dataMapInfos.length; i++) {
      const info = $dataMapInfos[i];
      if (info && info.name === editorName) return i;
    }
    return 0;
  };

  IRMap.getMapInfo = function (mapId) {
    return $dataMapInfos[mapId] || null;
  };

  IRMap.getParentMapId = function (mapId) {
    const info = $dataMapInfos[mapId];
    // MV-ben a map fa a .parentId mezőben él (root: 0)
    return info && info.parentId != null ? info.parentId : 0;
  };

  IRMap.getChildMapIds = function (mapId) {
    const out = [];
    for (let i = 1; i < $dataMapInfos.length; i++) {
      const info = $dataMapInfos[i];
      if (info && info.parentId === mapId) out.push(i);
    }
    return out;
  };

  IRMap.getAncestorChain = function (mapId) {
    const chain = [];
    let cur = mapId;
    while (cur) {
      chain.push(cur);
      const p = IRMap.getParentMapId(cur);
      if (!p || p === cur) break;
      cur = p;
    }
    return chain; // [child, parent, grandparent, ...]
  };

  // Feltételes hozzáférés – újrahasznosítjuk a core belső függvényeit:
  IRMap.canOpenMap = function (mapId) {
    const cfg =
      typeof findCfgForMapId === "function" ? findCfgForMapId(mapId) : null;
    if (!cfg) return true;
    return typeof canOpenInteractiveMap === "function"
      ? canOpenInteractiveMap(cfg)
      : true;
  };
  IRMap.getOpenMapFailureMessage = function (mapId) {
    const cfg =
      typeof findCfgForMapId === "function" ? findCfgForMapId(mapId) : null;
    if (!cfg) return "";
    return typeof getOpenInteractiveMapFailureMessage === "function"
      ? getOpenInteractiveMapFailureMessage(cfg)
      : "";
  };

  IRMap.switchToMapById = function (mapId, opts) {
    const sc = IRMap.currentScene && IRMap.currentScene();
    if (!sc || !(sc instanceof Scene_InteractiveMap)) {
      SceneManager.push(Scene_InteractiveMap);
      const once = ({ scene }) => {
        if (scene instanceof Scene_InteractiveMap) {
          IRMap.off && IRMap.off("scene-ready", once);
          scene.switchToMapById(mapId, opts);
        }
      };
      IRMap.on && IRMap.on("scene-ready", once);
    } else {
      sc.switchToMapById(mapId, opts);
    }
  };

  IRMap.switchToMapByEditorName = function (editorName, opts) {
    const id = IRMap.findMapIdByEditorName(editorName);
    if (!id) {
      $gameMessage.add("Related map not found: " + editorName);
      return;
    }
    IRMap.switchToMapById(id, opts);
  };

  IRMap.imageToWindow = function (imgX, imgY, win) {
    win = win || IRMap.currentWindow();
    if (!win) return null;

    const cam = win.cameraRect();
    const s = win.coverScale();

    const dxOff = win._drawDX || 0;
    const dyOff = win._drawDY || 0;
    const sx = win.x + win.padding + dxOff + (imgX - cam.x) * s;
    const sy = win.y + win.padding + dyOff + (imgY - cam.y) * s;
    return { x: sx, y: sy };
  };

  IRMap.screenToImage = function (scrX, scrY, win) {
    win = win || IRMap.currentWindow();
    if (!win) return null;

    const dxOff = win._drawDX || 0;
    const dyOff = win._drawDY || 0;
    const dx = scrX - win.x - win.padding - dxOff;
    const dy = scrY - win.y - win.padding - dyOff;
    const limW = win._drawW || win.contentsWidth();
    const limH = win._drawH || win.contentsHeight();
    if (dx < 0 || dy < 0 || dx > limW || dy > limH) {
      return null;
    }

    const cam = win.cameraRect();
    const s = win.coverScale();
    const imgX = cam.x + dx / s;
    const imgY = cam.y + dy / s;
    return { imgX, imgY };
  };

  const DISABLED_SET = new Set();
  let GLOBAL_DISABLED = false;

  // wrap original canOpenMap
  const _origCanOpenMap = IRMap.canOpenMap;
  IRMap.canOpenMap = function (mapId) {
    if (GLOBAL_DISABLED) return false;
    if (DISABLED_SET.has(mapId)) return false;
    return _origCanOpenMap.call(this, mapId);
  };

  // Plugin command intercept:
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.apply(this, arguments);

    if (command === "DisableMap") {
      // Aktuális map vagy globális letiltás
      if (args[0] && args[0].toLowerCase() === "current") {
        DISABLED_SET.add($gameMap.mapId());
      } else {
        GLOBAL_DISABLED = true;
      }
      // Ha van második argumentum, az fallback
      if (args[1]) {
        // Ha szóközös szöveget is szeretnél, inkább csatlakozd az összeset:
        const fb = args.slice(1).join(" ");
        if (fb.match(/\.(png|jpe?g|bmp)$/i)) {
          // képes fallback
          params.fallbackMapImage = fb;
          FALLBACK_IMG = fb;
        } else {
          // szöveges fallback
          params.textIfNoMapFound = fb;
          TEXT_NO_MAP = fb;
        }
      }
    }

    if (command === "EnableMap") {
      if (args[0] && args[0].toLowerCase() === "current") {
        DISABLED_SET.delete($gameMap.mapId());
      } else {
        GLOBAL_DISABLED = false;
      }
      // (nem kell itt fallbacket törölni, de ha szeretnéd, tehetsz ide is logikát)
    }
    if (command === "OpenMap") {
      // ha nincs args[0], akkor a current map
      const mapId = args[0] ? Number(args[0]) : $gameMap.mapId();
      if (mapId > 0) {
        IRMap.switchToMapById(mapId);
      }
    }
  };

  /* -----------------------------------------------------------------------
   * 7.  SAVE / LOAD  –  InteractiveRpgMap save system
   * -------------------------------------------------------------------- */

  function _irmSerializeState() {
    return {
      globalDisabled: GLOBAL_DISABLED,
      disabledMaps: Array.from(DISABLED_SET),
      textNoMap: TEXT_NO_MAP,
      fallbackImg: FALLBACK_IMG,
    };
  }

  function _irmApplyState(s) {
    if (!s) return;
    GLOBAL_DISABLED = !!s.globalDisabled;
    DISABLED_SET.clear();
    (s.disabledMaps || []).forEach((id) => DISABLED_SET.add(id));

    if (typeof s.textNoMap === "string") TEXT_NO_MAP = s.textNoMap;
    if (typeof s.fallbackImg === "string") FALLBACK_IMG = s.fallbackImg;
  }

  /* ---------- SAVE ---------- */
  const _IRM_DM_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const contents = _IRM_DM_makeSaveContents.call(this);
    contents.irMapCoreState = _irmSerializeState();
    return contents;
  };

  /* ---------- LOAD ---------- */
  const _IRM_DM_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _IRM_DM_extractSaveContents.call(this, contents);
    _irmApplyState(contents.irMapCoreState);
  };

  // expose
  window.IRMap = IRMap;
  window.IRMap.str2code = str2code;
})();

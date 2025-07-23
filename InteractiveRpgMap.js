/*:
 * @plugindesc InteractiveRpgMap – fullscreen & minimap core w/ player marker, smooth pan, scalable tile mapping, window design modes, addon API
 * @author Soczó Kristóf
 * @target MV
 * @version 0.7
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
 * @param openSound
 * @parent ---Map Settings---
 * @text Play Sound
 * @type file
 * @dir audio/se
 * @desc Sound effect to play when the map opens.
 *
 * @param showMapInMenu
 * @parent ---Map Settings---
 * @text Show Map In Menu
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param mapMenuName
 * @parent ---Map Settings---
 * @text Map Menu Name
 * @type text
 * @default Map
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
 * @text Map Window Width %
 * @type number
 * @min 10
 * @max 100
 * @default 75
 * @desc The width of the map window as a percentage of the screen width.
 *
 * @param mapWindowHeightPct
 * @parent ---Map Settings---
 * @text Map Window Height %
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
 *  Map-specific overrides
 * ============================================================================
 *
 * @param maps
 * @text Maps
 * @type struct<MapConfig>[]
 * @desc Define per-map overrides and images.
 *
 * @help
 * Custom messages paramteres support special color mode like:  \\c[10]read a maps\\c[0]
 */

/*~struct~MapConfig:
 * @param editorMapName
 * @text Editor Map Name
 * @type text
 *
 * @param MapName
 * @text Current map name
 * @type text
 *
 * @param fullMapImage
 * @text Fullscreen Map Image
 * @type file
 * @dir img/maps
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
 * @param enablePlayerTracking
 * @text Enable Player Tracking (this map)
 * @type boolean
 * @on On
 * @off Off
 * @default true
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
  const TEXT_NO_MAP =
    P("textIfNoMapFound") || "No map available for this area.";
  const ENABLE_FALLBACK = P("fallbackHandler") !== "false";
  const FALLBACK_IMG = P("fallbackMapImage") || "";
  const MAP_WIN_W_PCT = Number(P("mapWindowWidthPct") || 75); // 10–100 %
  const MAP_WIN_H_PCT = Number(P("mapWindowHeightPct") || 75);
  const SHOW_IN_MENU = P("showMapInMenu") === "true";
  const MENU_NAME = P("mapMenuName") || "Map";
  const OPEN_SE = P("openSound");

  const USE_CUSTOM_MARKER = P("useCustomPlayerMarker") === "true";
  const CUSTOM_MARKER_IMAGE = P("customPlayerMarkerImage") || "";
  const DEFAULT_MARKER_COLOR = P("defaultMarkerColor") || "#FFFFFF";
  const DEFAULT_MARKER_SHAPE = P("defaultMarkerShape") || "circle";
  const DEFAULT_MARKER_SIZE = Number(P("defaultMarkerSize") || 12);
  const MARKER_PULSE = P("markerPulse") === "true";

  const GLOBAL_PPT = Number(P("imagePixelsPerTile") || 0);

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

  // ---------------------------------------------------------------------------
  // Input mapping
  // ---------------------------------------------------------------------------
  // const openCode = str2code(OPEN_KEY_STR);
  // if (openCode != null) Input.keyMapper[openCode] = MAP_KEY;

  // ────────────────────────────────────────────────────────────────────────────
  // 1) először töltsd be a háromszög‐képeket a plugin tetején, pl. img/system/tri_up.
  //    Ezek lehetnek saját .png fájlok, vagy az MV-ben lévő ikonokból kivágva.
  // ────────────────────────────────────────────────────────────────────────────
  const TRI_UP = ImageManager.loadSystem("tri_up");
  const TRI_DOWN = ImageManager.loadSystem("tri_down");
  const TRI_LEFT = ImageManager.loadSystem("tri_left");
  const TRI_RIGHT = ImageManager.loadSystem("tri_right");

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

  // ────────────────────────────────────────────────────────────────────────────
  // 3) Scene_InteractiveMap.create – ha teljesen hiányzik a map-konfig
  // ────────────────────────────────────────────────────────────────────────────
  const _SceneInt_create = Scene_InteractiveMap.prototype.create;
  Scene_InteractiveMap.prototype.create = function () {
    // eredeti Scene_MenuBase felépítés
    Scene_MenuBase.prototype.create.call(this);

    // beolvassuk az aktuális térkép-konfigot
    this._cfg = findCfg();
    if (!this._cfg) {
      // ha nincs konfig, fallback szöveg
      const raw = TEXT_NO_MAP;
      const msg = Window_Base.prototype.convertEscapeCharacters.call(this, raw);
      $gameMessage.add(msg);
      IRMap.emit("scene-ready", {
        scene: this,
        win: this._win,
        cfg: null,
        xform: null,
      });
      return;
    }

    // ha van konfig, először lejátsszuk a beállított SE-t (ha meg van adva)
    if (OPEN_SE) {
      AudioManager.playSe({ name: OPEN_SE, pan: 0, pitch: 100, volume: 90 });
    }

    // aztán folytatjuk a core create-logikát
    _SceneInt_create.call(this);
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
  };

  Window_InteractiveMap.prototype.setBitmap = function (bmp) {
    this._bmp = bmp;
    this._recalcCamera(true);
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

      const baseCover = Math.max(cw / iw, ch / ih);
      this._coverScale = baseCover * this._zoomLevels[this._zoomIdx];

      let newW = Math.round(cw / this._coverScale);
      let newH = Math.round(ch / this._coverScale);
      if (newW > iw) newW = iw;
      if (newH > ih) newH = ih;

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
      this._canPan = iw > newW || ih > newH;

      this._redraw();
      IRMap.emit("camera-changed", { win: this, instant: true });
    }
  };

  Window_InteractiveMap.prototype._redraw = function () {
    this.contents.clear();
    if (!this._bmp) return;
    this.contents.blt(
      this._bmp,
      this._camX,
      this._camY,
      this._srcW,
      this._srcH,
      0,
      0,
      this._cw,
      this._ch
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
    this._playerDot.x = Math.round(relX * s);
    this._playerDot.y = Math.round(relY * s);

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
    this._overlayRoot = null; // addons rakhatnak gyerekeket
    IRMap._currentScene = this;
    IRMap.emit("scene-open", { scene: this });
  };

  Scene_InteractiveMap.prototype.create = function () {
    // --- eredeti setup ---
    Scene_MenuBase.prototype.create.call(this);
    const winW = Math.floor((Graphics.boxWidth * MAP_WIN_W_PCT) / 100);
    const winH = Math.floor((Graphics.boxHeight * MAP_WIN_H_PCT) / 100);
    const winX = (Graphics.boxWidth - winW) / 2;
    const winY = (Graphics.boxHeight - winH) / 2;
    this._cfg = findCfg();

    this._win = new Window_InteractiveMap(
      winX,
      winY,
      winW,
      winH,
      WINDOW_DESIGN
    );
    this.addWindow(this._win);
    this.addWindow(this._win);

    this._overlayRoot = new Sprite();
    this.addChild(this._overlayRoot);

    // --- ha custom frame van, azt is beszúrjuk ---
    if (CUSTOM_FRAME_IMAGE) {
      const frameBmp = ImageManager.loadSystem(CUSTOM_FRAME_IMAGE);

      const frameSpr = new Sprite(frameBmp);

      // középre igazítás + offset
      frameSpr.anchor.set(0.5, 0.5);
      frameSpr.x = winX + winW / 2 + CUSTOM_FRAME_OFF_X;
      frameSpr.y = winY + winH / 2 + CUSTOM_FRAME_OFF_Y;

      // betöltés után méretezés a pad alapján
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

      // rétegezés: ha overlap, mindig legfelül, különben windowLayer mögé
      if (FRAME_OVERLAP) {
        this.addChild(frameSpr);
      } else {
        const idx = Math.max(0, this.children.indexOf(this._windowLayer));
        this.addChildAt(frameSpr, idx);
      }

      this._frameSprite = frameSpr;
    }

    // --- ha nincs konfiguráció, kiírjuk a fallback szöveget és kilépünk ---
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
      return;
    }

    // --- betöltjük a térkép bitmapet ---
    const bmp = ImageManager.loadBitmap(
      "img/maps/",
      this._cfg.fullMapImage,
      0,
      true
    );
    bmp.addLoadListener(() => {
      this._win.setBitmap(bmp);
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

      // --- mapDisplayName kirajzolása ---
      if (this._cfg.mapDisplayName) {
        const text = this._cfg.mapDisplayName;
        const lh = this._win.lineHeight();
        const textBmp = new Bitmap(winW, lh);
        textBmp.drawText(text, 0, 0, winW, lh, "center");
        const textSpr = new Sprite(textBmp);
        textSpr.x = winX + this._win.padding;
        textSpr.y = winY + this._win.padding;
        this._overlayRoot.addChild(textSpr);
      }

      // --- overlay addonok meghívása ---
      IRMap._overlayFns.forEach((fn) => {
        try {
          fn(this, this._win, this._xform);
        } catch (e) {
          console.error(`[${PLUGIN}] overlay fn error:`, e);
        }
      });

      IRMap.emit("scene-ready", {
        scene: this,
        win: this._win,
        cfg: this._cfg,
        xform: this._xform,
      });
    });

    // --- ÚJ: scroll-indikátorok létrehozása és pozícionálása ---
    this._triUp = new Sprite(TRI_UP);
    this._triDown = new Sprite(TRI_DOWN);
    this._triLeft = new Sprite(TRI_LEFT);
    this._triRight = new Sprite(TRI_RIGHT);

    /*  Kis margin, hogy ne tapadjon a térkép széléhez (igény szerint állítható) */
    const IND_PAD = 4; // px

    // A tényleges térkép-terület (padding nélkül)
    const innerX = this._win.x + this._win.padding;
    const innerY = this._win.y + this._win.padding;
    const innerW = this._win.contentsWidth();
    const innerH = this._win.contentsHeight();

    /* --- felső-alsó --- */
    this._triUp.x = innerX + (innerW - TRI_UP.width) / 2;
    this._triUp.y = innerY + IND_PAD;

    this._triDown.x = innerX + (innerW - TRI_DOWN.width) / 2;
    this._triDown.y = innerY + innerH - TRI_DOWN.height - IND_PAD;

    /* --- bal-jobb --- */
    this._triLeft.x = innerX + IND_PAD;
    this._triLeft.y = innerY + (innerH - TRI_LEFT.height) / 2;

    this._triRight.x = innerX + innerW - TRI_RIGHT.width - IND_PAD;
    this._triRight.y = innerY + (innerH - TRI_RIGHT.height) / 2;
    this._overlayRoot.addChild(this._triUp);
    this._overlayRoot.addChild(this._triDown);
    this._overlayRoot.addChild(this._triLeft);
    this._overlayRoot.addChild(this._triRight);
  };

  Scene_InteractiveMap.prototype.terminate = function () {
    IRMap.emit("scene-close", { scene: this });
    Scene_MenuBase.prototype.terminate.call(this);
    if (IRMap._currentScene === this) IRMap._currentScene = null;
  };

  const _SceneInt_update = Scene_InteractiveMap.prototype.update;
  Scene_InteractiveMap.prototype.update = function () {
    // --- eredeti update
    Scene_MenuBase.prototype.update.call(this);
    if (Input.isTriggered("cancel") || Input.isTriggered(MAP_KEY)) {
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

      this._triUp.visible = camY > 0;
      this._triDown.visible = camY + srcH < bmp.height;
      this._triLeft.visible = camX > 0;
      this._triRight.visible = camX + srcW < bmp.width;
    }
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
  /* ezt a „Utilities” rész után (pl. a clamp függvény alá) szúrd be */

  function handleMapOpen() {
    const cfg = findCfg(); // 1) van-e bejegyzés?
    if (cfg) {
      // → VAN
      if (!canOpenInteractiveMap(cfg)) {
        //   de nincs jog
        const msg = getOpenInteractiveMapFailureMessage(cfg);
        if (msg) {
          $gameMessage.add(
            Window_Base.prototype.convertEscapeCharacters.call(this, msg)
          );
        }
        return; //   <- sosem jön fallback
      }
      SceneManager.push(Scene_InteractiveMap); // jogosultság oké
      return;
    }

    /* 2) NINCS bejegyzés ehhez a pályához */
    if (!ENABLE_FALLBACK) return; // global off → semmi

    if (FALLBACK_IMG) {
      // statikus kép
      SceneManager.push(Scene_FallbackMap);
    } else {
      // csak szöveg
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

      const cam = win.cameraRect();
      const s = win.coverScale();

      const sx = win.x + win.padding + (imgX - cam.x) * s;
      const sy = win.y + win.padding + (imgY - cam.y) * s;
      return { x: sx, y: sy };
    },

    screenToImage(scrX, scrY, win) {
      win = win || IRMap.currentWindow();
      if (!win) return null;

      const dx = scrX - win.x - win.padding;
      const dy = scrY - win.y - win.padding;
      if (
        dx < 0 ||
        dy < 0 ||
        dx > win.contentsWidth() ||
        dy > win.contentsHeight()
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

  // expose
  window.IRMap = IRMap;
  window.IRMap.str2code = str2code;
})();

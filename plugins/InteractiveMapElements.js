/*:
 * @plugindesc InteractiveMapElements – point-of-interest ikonok és címkék az InteractiveRpgMap térképen
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.6
 *
 * @help
 * ---------------------------------------------------------------------------
 *   ▸ Korábbi verziók POI‑jai kicsúsztak scroll alatt: most a markerLayer
 *     lesz maszkolva a window tartalmával, így semmi nem megy ki a keretből.
 *   ▸ A maszk automatikusan a megfelelő ablakméretre lesz belőve.
 * ---------------------------------------------------------------------------
 *
 * @param ---Elements GUI---
 * @desc Elements gui settings
 * @default ------------------------------
 *
 * @param showPoiLabel
 * @parent ---Elements GUI---
 * @text Show Element Labels
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 * @desc By default, display the name of the element on the map below its image.
 *
 * @param ---Portrait window settings---
 * @desc Portrait window setup
 * @default ------------------------------
 *
 * @param portraitTextWindHeight
 * @parent ---Portrait window settings---
 * @text Portrait Text Window Height
 * @type number
 * @min 120
 * @default 240
 * @desc Portrait text window height (in px) The name and description of the Elements appear here.
 *
 * @param portraitTextWindWidth
 * @parent ---Portrait window settings---
 * @text Portrait Text Window Width
 * @type number
 * @min 120
 * @default 200
 * @desc The Portrait text window width (in px). The name and description of the Elements appear here.
 *
 * @param portraitImgWinHeight
 * @parent ---Portrait window settings---
 * @text Portrait Image Window Height
 * @type number
 * @min 120
 * @default 240
 * @desc Portrait img window height (in px). The extra portrait image appears
 *
 * @param portraitImgWinWidth
 * @parent ---Portrait window settings---
 * @text Portrait Image Window Width
 * @type number
 * @min 120
 * @default 240
 * @desc Portrait img window width (in px). The extra portrait image appears
 *
 * @param portraitWindowSkin
 * @parent ---Portrait window settings---
 * @text Portrait Window Skin
 * @type file
 * @dir img/system
 * @desc If specified, the portrait window will use this window skin.
 *
 * @param ---Options window Setup---
 * @desc Options window setup
 * @default ------------------------------
 *
 * @param optionsWindowSkin
 * @parent ---Options window Setup---
 * @text Options Window Skin
 * @type file
 * @dir img/system
 * @desc If specified, the options menu will use this window skin.
 *
 * @param ---Fonts Setup---
 * @desc Font settings
 * @default ------------------------------
 *
 * @param ElementslabelFSize
 * @parent ---Fonts Setup---
 * @text Elements label FSize
 * @type number
 * @min 1
 * @default 16
 * @desc Set your font size
 *
 * @param PortraitElementsnameFSize
 * @parent ---Fonts Setup---
 * @text Portrait Elements name FSize
 * @type number
 * @min 1
 * @default 16
 * @desc Set your font size
 *
 * @param PortraitDescFSize
 * @parent ---Fonts Setup---
 * @text Portrait Desc FSize
 * @type number
 * @min 1
 * @default 14
 * @desc Set your font size
 *
 * @param PortraitBadgeFSize
 * @parent ---Fonts Setup---
 * @text Portrait Badge FSize
 * @type number
 * @min 1
 * @default 14
 * @desc Set your font size
 *
 * @param optionFontSize
 * @parent ---Options window Setup---
 * @text Options menu font size
 * @type number
 * @min 1
 * @default 15
 * @desc Set your font size in the option interact menu
 *
 * @param pois
 * @text ELEMENTS CONFIG
 * @type struct<PoiConfig>[]
 * @desc Define the Elements(POI's) for your maps.
 */

/*~struct~PoiConfig:
 *
 * @param mapId
 * @text Map ID
 * @type number
 * @min 1
 * @desc Please enter the MAP EDITOR ID (identifier) to indicate which map the uploaded items should appear on.
 *
 * @param --- Basic Setup ---
 * @desc Basic Setup
 * @default ------------------------------
 *
 * @param poiName
 * @text Element Name
 * @type text
 * @desc Enter the name of this item. If portrait mode is enabled, this will also appear as the name.
 *
 * @param poiImage
 * @text Element Image
 * @type file
 * @dir img/interactivelements
 * @desc Add an image of the item (building, location, NPC). This image will appear on the map.
 *
 * @param posX
 * @text Position X (tile)
 * @type number
 * @min 0
 * @desc Enter the coordinates where the element should appear on the map (X axis). Use the editor Coordinate as reference if you want.
 *
 * @param posY
 * @text Position Y (tile)
 * @type number
 * @min 0
 * @desc Enter the coordinates where the element should appear on the map (Y axis). Use the editor Coordinate as reference if you want.
 *
 * @param initialShow
 * @text Initially Visible
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc Should it be visible on the map by default?
 *
 * @param hidePoiLabel
 * @text Hide Element Name
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc If you want, you can set it so that the name does not appear on the map. This overrides the global setting.
 *
 * @param --- Elements GUI ---
 * @desc Elements GUI
 * @default ------------------------------
 *
 * @param iconWidth
 * @parent --- Elements GUI ---
 * @text Max Element Width (px)
 * @type number
 * @min 0
 * @default 96
 * @desc Enter the size of the item image (Width)
 *
 * @param iconHeight
 * @parent --- Elements GUI ---
 * @text Max Element Height (px)
 * @type number
 * @min 0
 * @default 96
 * @desc Enter the size of the item image (Height)
 *
 * @param portraitTextWindHeightNo
 * @parent --- Elements GUI ---
 * @text Portrait Text Window Height
 * @type number
 * @min 0
 * @default
 * @desc Portrait text window height (in px) The name and description of the Elements appear here. Leave empty to use global settings.
 *
 * @param portraitTextWindWidthNo
 * @parent --- Elements GUI ---
 * @text Portrait Text Window Width
 * @type number
 * @min 0
 * @default
 * @desc The Portrait text window width (in px). The name and description of the Elements appear here. Leave empty to use global settings.
 *
 * @param portraitImgWinHeightNo
 * @parent --- Elements GUI ---
 * @text Portrait Image Window Height
 * @type number
 * @min 0
 * @default
 * @desc Portrait img window height (in px). The extra portrait image appears. Leave empty to use global settings.
 *
 * @param portraitImgWinWidthNo
 * @parent --- Elements GUI ---
 * @text Portrait Image Window Width
 * @type number
 * @min 0
 * @default
 * @desc Portrait img window width (in px). The extra portrait image appears. Leave empty to use global settings.
 *
 * @param --- Portrait ---
 * @desc Portrait setup
 * @default ------------------------------
 *
 * @param portraitImage
 * @parent --- Portrait ---
 * @text Portrait Image
 * @type file
 * @dir img/interactivelements
 *
 * @param description
 * @parent --- Portrait ---
 * @text POI Description
 * @type note
 *
 * @param portraitBadge
 * @parent --- Portrait ---
 * @text Portrait Badge
 * @type text
 * @desc Enter the icon index number; the icon always appears first in the badge.
 *
 * @param portraitBadgeIcon
 * @parent --- Portrait ---
 * @text Portrait Badge icon
 * @type text
 *
 * @param --- Interact Setup ---
 * @desc Interact Setup
 * @default ------------------------------
 *
 * @param interactable
 * @text Interactable
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc Is it interactive? If so, can you click on it and run events?
 *
 * @param interactMode
 * @text Type of interaction
 * @type select
 * @option Open portrait window
 * @value portrait
 * @option Open Option menu
 * @value options
 * @option Open portrait and option window
 * @value both
 * @option Teleport to map
 * @value teleport
 * @option Open / load the related map
 * @value openload
 * @option Battle Processing
 * @value processbattle
 * @option Run Common event
 * @value runcommonevent
 * @desc Don't forget to load the InteractiveMapManager plugin to use interactions!
 *
 * @param relatedMapId
 * @text Related Map ID
 * @type number
 * @min 1
 * @default 0
 * @desc The ID of the editor map loaded by the open/load interaction. Required if interactMode=openload.
 *
 * @param teleportLocation
 * @text Teleport location
 * @type text
 * @default
 * @desc Format: MAPNAME (X,Y) coordinate like: MAP002 (2,1) Left | You can add the face position too (Left, Right, Top Down or empty to retain) |  Required if interactMode=teleport.
 *
 * @param callCommonEvent
 * @text Run Common event
 * @type common_event
 * @default
 * @desc Format: Choose the Common event which want to run | Required if interactMode=runcommonevent.
 *
 * @param processBattle
 * @text Battle Processing
 * @type text
 * @default
 * @desc Format: Define the enemy (troops) + params like: Bat*2 gameover canescape | Required if interactMode=processbattle.
 *
 * @param InteractOptions
 * @text Interaction options
 * @type text[]
 * @default ["teleport"]
 * @desc Supported commands: teleport, run common event, open map (max 3 option)
 *
 */
(() => {
  "use strict";

  /* ----------------------------------[ 1. Konstansok ]-------------------- */
  const PLUGIN = "InteractiveMapElements";
  const prm = PluginManager.parameters(PLUGIN);
  const P = (k) => prm[k] || "";

  const SHOW_LABEL = P("showPoiLabel") !== "false";
  const IMG_WIN_W = +P("portraitImgWinWidth") || 200;
  const IMG_WIN_H = +P("portraitImgWinHeight") || 240;
  const TXT_WIN_W = +P("portraitTextWindWidth") || 200;
  const TXT_WIN_H = +P("portraitTextWindHeight") || 240;

  const PORTRAIT_SKIN = P("portraitWindowSkin") || "";
  const OPTIONS_SKIN = P("optionsWindowSkin") || "";

  const OPTION_FONT_SIZE = +P("optionFontSize") || 15;
  const ELEMENTS_LABEL_FONT_SIZE = +P("ElementslabelFSize") || 16;
  const PORTRAIT_NAME_FONT_SIZE = +P("PortraitElementsnameFSize") || 18;
  const PORTRAIT_DESC_FONT_SIZE = +P("PortraitDescFSize") || 14;
  const PORTRAIT_BADGE_FONT_SIZE = +P("PortraitBadgeFSize") || 14;

  const LABEL_W = 256;
  const LABEL_H = 24;
  const LABEL_PAD = 6;

  function _calcBottomPad(bmp) {
    const w = bmp.width,
      h = bmp.height;
    try {
      const ctx = bmp._context; // MV belső canvas
      for (let y = h - 1; y >= 0; y--) {
        const row = ctx.getImageData(0, y, w, 1).data;
        for (let i = 3; i < row.length; i += 4) {
          if (row[i] > 0) return h - 1 - y; // ennyi px a transzparens rész alul
        }
      }
    } catch (e) {
      /* ha bármi, marad 0 */
    }
    return 0;
  }

  const IM = Object.freeze({
    PORTRAIT: "portrait",
    OPTIONS: "options",
    BOTH: "both",
    TELEPORT: "teleport",
    OPENLOAD: "openload",
    RUNCOMMONEVENT: "runcommonevent",
    PROCESSBATTLE: "processbattle",
    BATTLE: "battle",
  });
  function parseInteractModeRaw(v) {
    const s = String(v || "")
      .toLowerCase()
      .trim();
    if (
      s === "portrait" ||
      s === "options" ||
      s === "both" ||
      s === "teleport" ||
      s === "openload" ||
      s === "runcommonevent" ||
      s === "processbattle"
    )
      return s;
    if (s.includes("portrait and option")) return IM.BOTH;
    if (s.includes("open portrait")) return IM.PORTRAIT;
    if (s.includes("option")) return IM.OPTIONS;
    if (s.includes("teleport")) return IM.TELEPORT;
    if (s === "processbattle") return IM.PROCESSBATTLE;
    if (s.includes("openload") || (s.includes("open") && s.includes("related")))
      return IM.OPENLOAD;
    if (s.includes("common") && s.includes("event")) return IM.RUNCOMMONEVENT;
    return IM.PORTRAIT;
  }

  /* ----------------------------------[ 2. Adatok betöltése ]-------------- */
  const RAW = JSON.parse(P("pois") || "[]");
  const POIS = RAW.map((e, i) => {
    const j = JSON.parse(e);
    const rawOpts = JSON.parse(j.InteractOptions || "[]");
    const interactOptions = rawOpts.slice(0, 3).map((str) => {
      const [rawKey, rawLabel] = str.split(/\s*:\s*/, 2);
      const key = rawKey.trim().toLowerCase().replace(/\s+/g, "");
      const label = (rawLabel || rawKey).trim();
      return { key, label };
    });
    return {
      id: i,
      mapId: Number(j.mapId) || 0,
      name: j.poiName || "",
      img: j.poiImage || "",
      x: +j.posX || 0,
      y: +j.posY || 0,
      interactable: j.interactable === "true",
      visible: j.initialShow !== "false",
      hidePoiLabel: j.hidePoiLabel === "true",
      w: +j.iconWidth || 96,
      h: +j.iconHeight || 96,
      portraitImg: j.portraitImage || "",
      portraitDesc: j.description || "",
      portraitBadgeText: (j.portraitBadge || "").trim(),
      portraitBadgeIcon: Number(j.portraitBadgeIcon) || 0,

      portraitImgWinWidth:
        +j.portraitImgWinWidthNo > 0 ? +j.portraitImgWinWidthNo : IMG_WIN_W,
      portraitImgWinHeight:
        +j.portraitImgWinHeightNo > 0 ? +j.portraitImgWinHeightNo : IMG_WIN_H,
      portraitTextWinWidth:
        +j.portraitTextWindWidthNo > 0 ? +j.portraitTextWindWidthNo : TXT_WIN_W,
      portraitTextWinHeight:
        +j.portraitTextWindHeightNo > 0
          ? +j.portraitTextWindHeightNo
          : TXT_WIN_H,

      interactMode: parseInteractModeRaw(j.interactMode),
      relatedMapId: +j.relatedMapId || 0,
      teleportLocation: j.teleportLocation || "",
      callCommonEvent: +j.callCommonEvent || 0,
      processBattle: String(j.processBattle || ""),
      interactOptions,
    };
  });

  const POI_BY_MAP = {};
  POIS.forEach((p) => {
    const k = p.mapId;
    if (!POI_BY_MAP[k]) POI_BY_MAP[k] = [];
    POI_BY_MAP[k].push(p);
  });

  /* ----------------------------------[ 3. IME – globális API ]------------ */
  const IME = {
    version: "0.3.2",
    getPois(mapName) {
      if (!mapName) {
        const sc = IRMap.currentScene();
        const mc = sc && sc.mapConfig();
        mapName = mc ? mc.editorMapName : "";
      }
      return (POI_BY_MAP[(mapName || "").toLowerCase()] || []).slice();
    },
    showPoi(id) {
      togglePoi(id, true);
    },
    hidePoi(id) {
      togglePoi(id, false);
    },

    _bus: {},
    on(evt, fn) {
      if (!this._bus[evt]) this._bus[evt] = [];
      this._bus[evt].push(fn);
    },
    emit(evt, payload) {
      (this._bus[evt] || []).forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          // console.error([IME] listener err, e);
        }
      });
    },
  };
  window.IME = IME;

  function togglePoi(id, show) {
    const p = POIS[id];
    if (!p) return;
    p.visible = show;
    const sc = IRMap.currentScene();
    if (sc && sc._imePoiSprites) {
      const spr = sc._imePoiSprites.find((s) => s.poi.id === id);
      if (spr) spr.visible = show;
    }
  }

  function normalizeMode(v) {
    const s = String(v || "")
      .toLowerCase()
      .trim();
    if (
      [
        "portrait",
        "options",
        "both",
        "teleport",
        "openload",
        "runcommonevent",
        "processbattle",
        "battle",
      ].includes(s)
    )
      return s;
    if (s.includes("portrait and option")) return "both";
    if (s.includes("open portrait")) return "portrait";
    if (s.includes("option")) return "options";
    if (s.includes("teleport")) return "teleport";
    if (s.includes("openload") || (s.includes("open") && s.includes("related")))
      return "openload";
    if (s.includes("common") && s.includes("event")) return "runcommonevent";
    if (s.includes("battle")) return "processbattle";
    return "portrait";
  }

  /* ----------------------------------[ 4.  Osztályok ]-------------------- */
  // 4.1  Badge-es portrék (ablak)
  class PoiPortraitImg extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      const w = poi.portraitImgWinWidth || IMG_WIN_W;
      const h = poi.portraitImgWinHeight || IMG_WIN_H;
      Window_Base.prototype.initialize.call(this, x, y, w, h);
      this.opacity = 192;
      applySkin(this, PORTRAIT_SKIN);
      this.refresh();
    }
    standardPadding() {
      return 2;
    }
    refresh() {
      this.contents.clear();
      if (!this._poi.portraitImg) return;
      const bmp = ImageManager.loadBitmap(
        "img/interactivelements/",
        this._poi.portraitImg,
        0,
        true
      );
      bmp.addLoadListener(() => {
        drawCover(this.contents, bmp);
        drawBadge(this.contents, this._poi);
      });
    }
  }
  function drawCover(c, bmp) {
    const CW = c.width,
      CH = c.height;
    const s = Math.max(CW / bmp.width, CH / bmp.height);
    const sw = CW / s,
      sh = CH / s,
      sx = (bmp.width - sw) / 2,
      sy = (bmp.height - sh) / 2;
    c.blt(bmp, sx, sy, sw, sh, 0, 0, CW, CH);
  }

  function drawBadge(c, poi) {
    const pad = 5;
    const icon = poi.portraitBadgeIcon || 0;
    const text = (poi.portraitBadgeText || "").trim();

    const fontSize = PORTRAIT_BADGE_FONT_SIZE;
    c.fontSize = fontSize;
    c.textColor = "#ffffff";

    // ikon tényleges mérete = fontSize + 5
    const iconSize = fontSize + 5;
    const hasIcon = icon > 0;
    const hasText = Boolean(text);

    // csak akkor legyen hézag az ikon és szöveg között, ha mindkettő van
    const between = hasIcon && hasText ? 5 : 0;

    // szöveg szélesség
    const textWidth = hasText ? c.measureTextWidth(text) : 0;

    // háttér szélessége: ikon + hézag + szöveg
    const bgW = (hasIcon ? iconSize : 0) + (hasText ? between + textWidth : 0);
    const bgH = iconSize;

    // plusz padding minden irányba
    const shapePad = 4;
    c.fillRect(
      pad - shapePad,
      pad - shapePad,
      bgW + shapePad * 2,
      bgH + shapePad * 2,
      "rgba(0,0,0,0.6)"
    );

    let x = pad;
    const y = pad;

    if (hasIcon) {
      const iconSet = ImageManager.loadSystem("IconSet");
      const tileW = Window_Base._iconWidth;
      const tileH = Window_Base._iconHeight;
      const sx = (icon % 16) * tileW;
      const sy = Math.floor(icon / 16) * tileH;
      c.blt(iconSet, sx, sy, tileW, tileH, x, y, iconSize, iconSize);
      x += iconSize + between;
    }

    if (hasText) {
      c.drawText(text, x, y, textWidth, bgH, "left");
    }
  }

  // 4.2  Görgethető leírás
  class PoiPortraitText extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      const w = poi.portraitTextWinWidth || TXT_WIN_W;
      const h = poi.portraitTextWinHeight || TXT_WIN_H;
      Window_Base.prototype.initialize.call(this, x, y, w, h);
      this.opacity = 192;
      applySkin(this, PORTRAIT_SKIN);
      this._scrollY = 0;
      this._maxScroll = 0;
      this._dragging = false;
      this._lastTouchY = 0;
      this.createContents();
      this.refresh();
    }
    refresh() {
      const CW = this.contentsWidth(),
        TEMP_H = 5000;
      this.contents = new Bitmap(CW, TEMP_H);
      let y = 0,
        margin = 4;

      this.contents.fontSize = PORTRAIT_NAME_FONT_SIZE;
      const nameLH = this.contents.fontSize + 2;
      this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
      y += nameLH + margin + 5;

      this.contents.fontSize = PORTRAIT_DESC_FONT_SIZE;
      const lineH = this.contents.fontSize + 2;
      let desc = (this._poi.portraitDesc || "")
        .replace(/^"(.*)"$/s, "$1")
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();
      const paras = desc.split(/\r?\n/);
      for (const paragraph of paras) {
        if (!paragraph.trim()) {
          y += lineH;
          continue;
        }
        const words = paragraph.split(/\s+/);
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (this.contents.measureTextWidth(test) > CW && line) {
            this.contents.drawText(line, 0, y, CW, lineH, "left");
            y += lineH;
            line = word;
          } else line = test;
        }
        if (line) {
          this.contents.drawText(line, 0, y, CW, lineH, "left");
          y += lineH;
        }
        y += margin;
      }
      this._contentH = y;
      this._maxScroll = Math.max(0, this._contentH - this.contentsHeight());
    }
    update() {
      super.update();
      this._processWheel();
      this._processTouchScroll();
      this._updateArrows();
    }
    _processWheel() {
      const w = TouchInput.wheelY;
      if (w && this.isTouchedInsideFrame()) this._scrollBy(w > 0 ? 24 : -24);
    }
    _processTouchScroll() {
      if (TouchInput.isPressed() && this.isTouchedInsideFrame()) {
        const y = TouchInput.y;
        if (!this._dragging) {
          this._dragging = true;
          this._lastTouchY = y;
        } else {
          const dy = this._lastTouchY - y;
          if (Math.abs(dy) > 2) {
            this._scrollBy(dy);
            this._lastTouchY = y;
          }
        }
      } else this._dragging = false;
    }
    _scrollBy(dy) {
      this._scrollY = Math.max(
        0,
        Math.min(this._scrollY + dy, this._maxScroll)
      );
      this.origin.y = this._scrollY;
    }
    _updateArrows() {
      this.downArrowVisible = this._scrollY < this._maxScroll;
      this.upArrowVisible = this._scrollY > 0;
    }
    isTouchedInsideFrame() {
      const x = TouchInput.x,
        y = TouchInput.y;
      return (
        x >= this.x &&
        x < this.x + this.width &&
        y >= this.y &&
        y < this.y + this.height
      );
    }
  }

  // 4.3  Opciós menü (Command)
  class PoiOptions extends Window_Command {
    constructor(poi, x = 0, y = 0, options = []) {
      // 0) maximum 3 elemre vágjuk
      const trimmed = Array.isArray(options) ? options.slice(0, 3) : [];

      // 1) ideiglenesen létrehozzuk az ablakot (még rossz listával)
      super(x, y);

      // 2) végleges adatok
      this._poi = poi;
      this._options = trimmed;

      // 3) parancslista teljes újraépítése
      this.clearCommandList();
      this.makeCommandList();

      // 4) méretek újraszámítása a tényleges sor­szám és betűméret alapján
      this.width = this.windowWidth(); // (ha változtatni szeretnéd)
      this.height = this.windowHeight(); // helyes magasság
      this.createContents(); // új bitmap
      this.refresh(); // kirajzolás

      // 5) skin + anim
      applySkin(this, OPTIONS_SKIN);
      this.openness = 0;
      this.open();
    }
    windowWidth() {
      return 180;
    }
    standardFontSize() {
      return OPTION_FONT_SIZE;
    }
    makeCommandList() {
      const list = Array.isArray(this._options) ? this._options : [];
      if (list.length === 0) {
        this.addCommand("OK", "cancel"); // fallback, ne fagyjon üresen
      } else {
        list.forEach((opt) => this.addCommand(opt.label, opt.key));
      }
    }
    numVisibleRows() {
      return Math.max(1, this.maxItems());
    }

    processOk() {
      const cmd = this.currentSymbol();
      switch (cmd) {
        case "teleport":
          IME.emit("poi-teleport", {
            poi: this._poi,
            location: this._poi.teleportLocation,
          });
          break;
        case "openload":
          IME.emit("poi-open-related", {
            poi: this._poi,
            mapId: this._poi.relatedMapId,
          });
          break;
        case "runcommonevent":
          IME.emit("poi-run-common-event", {
            poi: this._poi,
            commonEventId: this._poi.callCommonEvent,
          });
          break;
        case "battle":
          IME.emit("poi-battle", { poi: this._poi });
          break;
        default:
          IME.emit("poi-click", { poi: this._poi });
          IRMap.emit("poi-click", { poi: this._poi });
      }
      this._closeSelf();
    }
    processCancel() {
      this._closeSelf();
    }
    _closeSelf() {
      this.close();
      if (this.parent) this.parent.removeChild(this);
    }
  }

  const _update = PoiOptions.prototype.update;
  PoiOptions.prototype.update = function () {
    _update.call(this);

    if (!this.isOpen()) return;

    if (TouchInput.isTriggered()) {
      const x = TouchInput.x,
        y = TouchInput.y;
      const inside =
        x >= this.x &&
        x < this.x + this.width &&
        y >= this.y &&
        y < this.y + this.height;

      if (!inside) this._closeSelf();
    }
  };
  // 4.4  POI Sprite
  class PoiSprite extends Sprite {
    constructor(poi, scene, win) {
      super();
      this.poi = poi;
      this._scene = scene;
      this._win = win;
      const bmp = ImageManager.loadBitmap(
        "img/interactivelements/",
        poi.img,
        0,
        true
      );
      this._icon = new Sprite(bmp);
      this._icon.anchor.set(0.5, 1.0);
      this.addChild(this._icon);

      bmp.addLoadListener(() => {
        if (this._dead) return;
        this._baseScale = Math.min(poi.w / bmp.width, poi.h / bmp.height, 1);
        this._icon._bottomPadPx = _calcBottomPad(bmp) || 0;
        this._updatePos();
        const natW = bmp.width,
          natH = bmp.height - (this._icon._bottomPadPx || 0);
        this._icon.hitArea = new PIXI.Rectangle(-natW / 2, -natH, natW, natH);
        this._icon.interactive = true;
        this._icon.buttonMode = true;
      });

      this._label =
        SHOW_LABEL && poi.name && !poi.hidePoiLabel
          ? this._makeLabel(poi.name)
          : null;
      this.anchor.set(0.5, 1.0);
      this.visible = poi.visible;
      win._markerLayer.addChild(this);

      this._posUpd = () => this._updatePos();
      this._onClose = ({ scene }) => {
        if (scene !== this._scene) return;
        IRMap.off("camera-changed", this._posUpd);
        IRMap.off("update-tick", this._posUpd);
      };
      IRMap.on("camera-changed", this._posUpd);
      IRMap.on("update-tick", this._posUpd);
      IRMap.on("scene-close", this._onClose);

      /* ÚJ: központi kattintás-regisztráció */
      if (poi.interactable) {
        IRMap.registerClickable(this, () => handlePoiClick(scene, win, this), {
          blink: true,
        });
      }
    }

    dispose() {
      this._dead = true;
      IRMap.unregisterClickable(this);
      if (this._posUpd) {
        IRMap.off("camera-changed", this._posUpd);
        IRMap.off("update-tick", this._posUpd);
      }
      if (this._onClose) IRMap.off("scene-close", this._onClose);
      if (this._icon) {
        try {
          this._icon.bitmap = null;
        } catch (e) {}
        if (this._icon.parent) this._icon.parent.removeChild(this._icon);
      }
      if (this.parent) this.parent.removeChild(this);
    }

    _makeLabel(txt) {
      const bm = new Bitmap(LABEL_W, LABEL_H);
      bm.fontSize = ELEMENTS_LABEL_FONT_SIZE;
      bm.textColor = "#fff";
      bm.outlineColor = "rgba(0,0,0,0.75)";
      bm.outlineWidth = 4;
      bm.drawText(
        txt,
        LABEL_PAD,
        0,
        bm.width - LABEL_PAD * 2,
        bm.height,
        "center"
      );
      const sp = new Sprite(bm);
      sp.anchor.set(0.5, 0);
      this._icon.addChild(sp);
      return sp;
    }

    _updatePos() {
      if (this._dead) return;
      const pos = IRMap.worldToImage(this.poi.x, this.poi.y) || {};
      const imgX = pos.imgX,
        imgY = pos.imgY;
      if (imgX == null) return;

      const cam = this._win.cameraRect(),
        s = this._win.coverScale();
      const rx = imgX - cam.x,
        ry = imgY - cam.y;
      this.visible =
        this.poi.visible && rx >= 0 && ry >= 0 && rx <= cam.w && ry <= cam.h;
      if (!this.visible) return;

      this.x = Math.round(rx * s);
      this.y = Math.round(ry * s);
      const finalScale = (this._baseScale || 1) * s;
      this._icon.scale.set(finalScale);

      const natW = this._icon.bitmap.width,
        natH = this._icon.bitmap.height - (this._icon._bottomPadPx || 0);
      this._icon.hitArea = new PIXI.Rectangle(-natW / 2, -natH, natW, natH);

      if (this._label) {
        const pad = this._icon._bottomPadPx || 0,
          labelH = this._label.bitmap ? this._label.bitmap.height : 0;
        let yLocal = -pad;
        const innerTop = this._win.y + this._win.padding,
          innerBottom = innerTop + this._win.contentsHeight();
        const labelTopScr = innerTop + this.y + yLocal * finalScale;
        if (labelTopScr + labelH > innerBottom) yLocal = -pad - labelH;

        this._label.scale.set(1 / finalScale);
        this._label.x = 0;
        this._label.y = yLocal;
      }
    }

    hitTest(scrX, scrY) {
      if (!this.visible || !this._icon.hitArea) return false;
      const local = this._icon.toLocal(
        new PIXI.Point(scrX, scrY),
        undefined,
        new PIXI.Point()
      );
      return this._icon.hitArea.contains(local.x, local.y);
    }
  }

  /* ----------------------------------[ 5. Overlay ]------------------------ */
  IRMap.registerOverlay((scene, win) => {
    const cfg0 = scene.mapConfig();
    if (!cfg0) return;

    // segédek
    const clearPoiUi = () => {
      if (scene._poiImgWin) {
        scene.removeChild(scene._poiImgWin);
        scene._poiImgWin = null;
      }
      if (scene._poiTxtWin) {
        scene.removeChild(scene._poiTxtWin);
        scene._poiTxtWin = null;
      }
      if (scene._poiMenu && scene._poiMenu.parent) {
        scene._poiMenu.parent.removeChild(scene._poiMenu);
      }
      scene._poiMenu = null;
    };

    const disposePoiSprite = (sp) => {
      if (!sp) return;
      sp.dispose && sp.dispose();
    };
    const removePoiSprites = () => {
      (scene._imePoiSprites || []).forEach(disposePoiSprite);
      scene._imePoiSprites = [];
    };

    const buildPoiSpritesForCurrentMap = () => {
      // Mindig az AKTUÁLIS konfigot kérjük le, ne a closure‑ben tárolt régit!
      const curCfg = scene.mapConfig();
      if (!curCfg) return;

      const list = POI_BY_MAP[curCfg.mapId] || [];
      scene._imePoiSprites = list.map((p) => new PoiSprite(p, scene, win));
    };

    // maszk
    if (!win._poiMask) {
      const g = new PIXI.Graphics();
      g.beginFill(0xffffff);
      g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
      g.endFill();
      win._markerLayer.addChildAt(g, 0);
      win._markerLayer.mask = g;
      win._poiMask = g;
    }

    // első felépítés
    removePoiSprites();
    buildPoiSpritesForCurrentMap();

    // rebuild map-váltáskor
    scene._imeLastEditorName = (cfg0.editorMapName || "").toLowerCase();
    const maybeRebuild = () => {
      const c2 = scene.mapConfig && scene.mapConfig();
      if (!c2) return;
      if (c2.mapId !== scene._imeLastMapId) {
        // ID‑alapú összehasonlítás
        scene._imeLastMapId = c2.mapId;
        clearPoiUi();
        removePoiSprites();
        buildPoiSpritesForCurrentMap();
      }
    };
    IRMap.on("update-tick", maybeRebuild);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", maybeRebuild);
      clearPoiUi();
      removePoiSprites();
    });
  });

  /* ----------------------------------[ 6. Központi click-callback ]--------- */
  function handlePoiClick(scene, win, spr) {
    const poi = spr.poi;
    if (!poi.interactable) return;

    if (poi.interactMode === IM.PROCESSBATTLE && poi.processBattle) {
      IME.emit("poi-battle", { poi });
      return;
    }

    // 1) Régi UI törlése
    if (!scene._poiMenu) {
      if (scene._poiImgWin) {
        scene.removeChild(scene._poiImgWin);
        scene._poiImgWin = null;
      }
      if (scene._poiTxtWin) {
        scene.removeChild(scene._poiTxtWin);
        scene._poiTxtWin = null;
      }
      // gond, ha itt töröljük a menüt, ezért ezt kitöröljük
      // if (scene._poiMenu) {
      //   scene.removeChild(scene._poiMenu);
      //   scene._poiMenu = null;
      // }
    }
    scene._poiMenu = null;

    // 2) Mód és alappozíció
    const mode = normalizeMode(poi.interactMode);
    const baseX = win.x + win.padding;
    const baseY = win.y + win.padding;

    // ─── PORTRÉ-ÁG (CSAK portrait vagy both) ───────────────────
    if ((mode === IM.PORTRAIT || mode === IM.BOTH) && poi.portraitImg) {
      scene._poiImgWin = new PoiPortraitImg(poi, baseX, baseY);
      scene.addChild(scene._poiImgWin);
    }
    if ((mode === IM.PORTRAIT || mode === IM.BOTH) && poi.name) {
      const imgWinH = poi.portraitImgWinHeight || IMG_WIN_H;
      const yOffset = scene._poiImgWin ? scene._poiImgWin.height : 0;
      scene._poiTxtWin = new PoiPortraitText(poi, baseX, baseY + yOffset);
      scene.addChild(scene._poiTxtWin);
    }

    // 4) Options ága
    if (
      (mode === IM.OPTIONS || mode === IM.BOTH) &&
      poi.interactOptions.length
    ) {
      // 4.1) Létrehozunk egy ideiglenes menüt
      const menu = new PoiOptions(poi, 0, 0, poi.interactOptions);
      // 4.2) Lekérjük a méreteit
      const mw = menu.windowWidth();
      const mh = menu.numVisibleRows() * menu.lineHeight();

      // 4.3) A win belső koordinátái
      const innerX = win.x + win.padding;
      const innerY = win.y + win.padding;
      const innerW = win.contentsWidth();
      const innerH = win.contentsHeight();

      // 4.4) Sprite skálázott mérete
      const bmp = spr._icon.bitmap;
      const scale = spr._icon.scale.x;
      const iconW = bmp ? bmp.width * scale : 0;
      const gap = 8;

      // 4.5) Jobb oldali próbálkozás
      let mx = innerX + spr.x + iconW / 2 + gap;
      if (mx + mw > innerX + innerW) {
        // ha nem fér, balra pakoljuk
        mx = innerX + spr.x - iconW / 2 - gap - mw;
      }

      // 4.6) Függőleges középre igazítás
      let my = innerY + spr.y - mh / 2;
      my = Math.max(innerY, Math.min(my, innerY + innerH - mh));

      // 4.7) Végleges pozíció alkalmazása és kirakás
      menu.x = Math.round(mx);
      menu.y = Math.round(my);
      scene.addWindow(menu);
      scene._poiMenu = menu;
    }
    // 4.8) Ha nincs egyetlen opció sem, vissza a sima kattintásra
    else if (mode === IM.OPTIONS) {
      IME.emit("poi-click", { poi });
      IRMap.emit("poi-click", { poi });
    }

    // 5) Teleport / openload / runcommonevent ágak
    if (mode === IM.TELEPORT) {
      IME.emit("poi-teleport", { poi, location: poi.teleportLocation });
      return;
    }
    if (mode === IM.OPENLOAD) {
      IME.emit("poi-open-related", { poi, mapId: poi.relatedMapId });
      return;
    }
    if (mode === IM.RUNCOMMONEVENT) {
      IME.emit("poi-run-common-event", {
        poi,
        commonEventId: poi.callCommonEvent,
      });
      return;
    }

    // 6) Simai kattintás fallback
    IME.emit("poi-click", { poi });
    IRMap.emit("poi-click", { poi });
  }
  /* ----------------------------------[ util ]------------------------------ */
  function applySkin(win, skin) {
    if (!skin) return;
    win.windowskin = ImageManager.loadSystem(skin);
    if (win._refreshAllParts) win._refreshAllParts();
  }

  // ——— Plugin Commands: ShowElements / DisableElements ———
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    // Find POI by its configured name
    function findPoiByName(name) {
      return POIS.find(function (p) {
        return p.name.toLowerCase() === name.toLowerCase();
      });
    }

    switch (command) {
      case "ShowElements": {
        var name = args.join(" ");
        if (!name) {
          console.error("ShowElements requires an element name");
          break;
        }
        var poi = findPoiByName(name);
        if (poi) {
          poi.visible = true;
          IME.showPoi(poi.id);
        } else {
          console.warn("ShowElements: no POI named '" + name + "'");
        }
        break;
      }
      case "DisableElements": {
        var name = args.join(" ");
        if (!name) {
          console.error("DisableElements requires an element name");
          break;
        }
        var poi = findPoiByName(name);
        if (poi) {
          poi.visible = false;
          IME.hidePoi(poi.id);
        } else {
          console.warn("DisableElements: no POI named '" + name + "'");
        }
        break;
      }
      case "ChangeElementsPosition": {
        var name = args[0];
        var x = parseInt(args[1], 10);
        var y = parseInt(args[2], 10);
        if (!name || isNaN(x) || isNaN(y)) {
          console.error(
            "ChangeElementsPosition requires: <element name> <x> <y> (all mandatory)"
          );
          break;
        }
        var poi = findPoiByName(name);
        if (poi) {
          // override data
          poi.x = x;
          poi.y = y;
          // reposition any existing sprite
          var scene = SceneManager._scene;
          if (scene && scene._imePoiSprites) {
            var spr = scene._imePoiSprites.find(function (s) {
              return s.poi.id === poi.id;
            });
            if (spr) spr._updatePos();
          }
        } else {
          console.warn("ChangeElementsPosition: no POI named '" + name + "'");
        }
        break;
      }
      case "ChangeElementsImg": {
        var name = args[0];
        var img = args[1];
        if (!name || !img) {
          console.error(
            "ChangeElementsImg requires: <element name> <image filename> (both mandatory)"
          );
          break;
        }
        // helper: POI keresése név alapján
        function findPoiByName(name) {
          return POIS.find(function (p) {
            return p.name.toLowerCase() === name.toLowerCase();
          });
        }
        var poi = findPoiByName(name);
        if (!poi) {
          console.warn("ChangeElementsImg: no POI named '" + name + "'");
          break;
        }
        // ha van kiterjesztés, levágjuk (.png, .jpg, .jpeg, .bmp)
        var baseName = img.replace(/\.(png|jpe?g|bmp)$/i, "");
        // felülírjuk az adatot
        poi.img = baseName;
        // ha már kirajzolva, frissítjük a sprite-ot is
        var scene = SceneManager._scene;
        if (scene && scene._imePoiSprites) {
          var spr = scene._imePoiSprites.find(function (s) {
            return s.poi.id === poi.id;
          });
          if (spr) {
            var newBmp = ImageManager.loadBitmap(
              "img/interactivelements/",
              baseName,
              0,
              true
            );
            newBmp.addLoadListener(function () {
              spr._icon.bitmap = newBmp;
              // újraszámoljuk a skálát és a hitArea-t
              spr._baseScale =
                Math.min(poi.w / newBmp.width, poi.h / newBmp.height, 1) || 1;
              spr._icon._bottomPadPx = _calcBottomPad(newBmp) || 0;
              spr._updatePos();
            });
          }
        }
        break;
      }
      case "ElementsDisableInteract": {
        var name = args.join(" ");
        if (!name) {
          console.error("ElementsDisableInteract requires an element name");
          break;
        }
        var poi = findPoiByName(name);
        if (!poi) {
          console.warn("ElementsDisableInteract: no POI named '" + name + "'");
          break;
        }
        // kikapcsoljuk az interaktivitást
        poi.interactable = false;
        // ha már van sprite, töröljük a kattinthatóságot
        var scene = SceneManager._scene;
        if (scene && scene._imePoiSprites) {
          var spr = scene._imePoiSprites.find(function (s) {
            return s.poi.id === poi.id;
          });
          if (spr) {
            IRMap.unregisterClickable(spr);
            spr._icon.interactive = false;
            spr._icon.buttonMode = false;
          }
        }
        break;
      }
      case "ElementsEnableInteract": {
        var name = args.join(" ");
        if (!name) {
          console.error("ElementsEnableInteract requires an element name");
          break;
        }
        var poi = findPoiByName(name);
        if (!poi) {
          console.warn("ElementsEnableInteract: no POI named '" + name + "'");
          break;
        }
        // bekapcsoljuk az interaktivitást
        poi.interactable = true;
        // ha már van sprite, újra regisztráljuk
        var scene = SceneManager._scene;
        if (scene && scene._imePoiSprites) {
          var spr = scene._imePoiSprites.find(function (s) {
            return s.poi.id === poi.id;
          });
          if (spr) {
            spr._icon.interactive = true;
            spr._icon.buttonMode = true;
            IRMap.registerClickable(
              spr,
              function () {
                handlePoiClick(spr._scene, spr._win, spr);
              },
              { blink: true }
            );
          }
        }
        break;
      }
    }
  };
  function _imeSerializePoi(p) {
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      visible: p.visible,
      img: p.img,
      interactable: p.interactable,
    };
  }

  /* ----- SAVE: plusz adat becsatolása ----- */
  const _IME_DM_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const contents = _IME_DM_makeSaveContents.call(this);

    /* minden POI aktuális állapota */
    contents.imePoiState = POIS.map(_imeSerializePoi);

    return contents;
  };

  /* ----- LOAD: adatok visszatöltése ----- */
  const _IME_DM_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _IME_DM_extractSaveContents.call(this, contents);

    const arr = contents.imePoiState;
    if (Array.isArray(arr)) {
      arr.forEach((saved) => {
        const p = POIS[saved.id];
        if (p) {
          p.x = saved.x;
          p.y = saved.y;
          p.visible = saved.visible;
          p.img = saved.img;
          p.interactable = saved.interactable;
        }
      });
    }
  };
})();

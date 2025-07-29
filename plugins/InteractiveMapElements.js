/*:
 * @plugindesc InteractiveMapElements – point-of-interest ikonok és címkék az InteractiveRpgMap térképen
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.4
 *
 * @help
 * ---------------------------------------------------------------------------
 *   ▸ Korábbi verziók POI‑jai kicsúsztak scroll alatt: most a markerLayer
 *     lesz maszkolva a window tartalmával, így semmi nem megy ki a keretből.
 *   ▸ A maszk automatikusan a megfelelő ablakméretre lesz belőve.
 * ---------------------------------------------------------------------------
 *
 * @param showPoiLabel
 * @text Show POI Labels
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param portraitTextWindHeight
 * @text Portrait Text Window Height
 * @type number
 * @min 120
 * @default 240
 *
 * @param portraitTextWindWidth
 * @text Portrait Text Window Width
 * @type number
 * @min 120
 * @default 200
 *
 * @param portraitImgWinHeight
 * @text Portrait Image Window Height
 * @type number
 * @min 120
 * @default 240
 *
 * @param portraitImgWinWidth
 * @text Portrait Image Window Width
 * @type number
 * @min 120
 * @default 240
 *
 * @param portraitWindowSkin
 * @text Portrait Window Skin
 * @type file
 * @dir img/system
 * @desc If specified, the portrait window will use this window skin.
 *
 * @param optionsWindowSkin
 * @text Options Window Skin
 * @type file
 * @dir img/system
 * @desc If specified, the options menu will use this window skin.
 *
 * @param pois
 * @text Points of Interest
 * @type struct<PoiConfig>[]
 * @desc Define the Elements for your maps.
 */

/*~struct~PoiConfig:
 *
 * @param editorMapName
 * @text Editor Map Name
 * @type text
 * @desc Enter the name of the map where this Element can appear.
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
 * @param --- Elements GUI ---
 * @desc Elements GUI
 * @default ------------------------------
 *
 * @param iconWidth
 * @text Max Element Width (px)
 * @type number
 * @min 0
 * @default 96
 * @desc Enter the size of the item image (Width)
 *
 * @param iconHeight
 * @text Max Element Height (px)
 * @type number
 * @min 0
 * @default 96
 * @desc Enter the size of the item image (Height)
 *
 * @param portraitImage
 * @text Portrait Image
 * @type file
 * @dir img/interactivelements
 *
 * @param description
 * @text POI Description
 * @type note
 *
 * @param portraitBadge
 * @text Portrait Badge
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
 * @option Run Common event
 * @value runcommonevent
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

  const LABEL_W = 256;
  const LABEL_H = 24;
  const LABEL_PAD = 6;
  // const LABEL_GAP_BELOW = 0;
  // const LABEL_GAP_ABOVE = 2;

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
      s === "runcommonevent"
    )
      return s;
    if (s.includes("portrait and option")) return IM.BOTH;
    if (s.includes("open portrait")) return IM.PORTRAIT;
    if (s.includes("option")) return IM.OPTIONS;
    if (s.includes("teleport")) return IM.TELEPORT;
    if (s.includes("openload") || (s.includes("open") && s.includes("related")))
      return IM.OPENLOAD;
    if (s.includes("common") && s.includes("event")) return IM.RUNCOMMONEVENT;
    return IM.PORTRAIT;
  }

  /* ----------------------------------[ 2. Adatok betöltése ]-------------- */
  const RAW = JSON.parse(P("pois") || "[]");
  const POIS = RAW.map((e, i) => {
    const j = JSON.parse(e);
    return {
      id: i, // stabil belső ID
      map: (j.editorMapName || "").trim(),
      name: j.poiName || "",
      img: j.poiImage || "",
      x: +j.posX || 0,
      y: +j.posY || 0,
      interactable: j.interactable === "true",
      visible: j.initialShow !== "false",
      w: +j.iconWidth || 96,
      h: +j.iconHeight || 96,
      portraitImg: j.portraitImage || "",
      portraitDesc: j.description || "",
      portraitBadge: j.portraitBadge || "",

      interactMode: parseInteractModeRaw(j.interactMode),
      relatedMapId: +j.relatedMapId || 0,
      teleportLocation: j.teleportLocation || "",
      callCommonEvent: +j.callCommonEvent || 0,
    };
  });

  const POI_BY_MAP = {};
  POIS.forEach((p) => {
    const k = p.map.toLowerCase();
    if (!POI_BY_MAP[k]) POI_BY_MAP[k] = [];
    POI_BY_MAP[k].push(p);
  });

  /* ----------------------------------[ 3. IME – globális API ]------------ */
  const IME = {
    version: "0.3.1",
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
          console.error(`[IME] listener err`, e);
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

  /* ----------------------------------[ 4.  Osztályok ]-------------------- */

  // ~~~~~~~~~~~ 4.1  Badge‑es portrék (ablak) ~~~~~~~~~~~
  class PoiPortraitImg extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      Window_Base.prototype.initialize.call(this, x, y, IMG_WIN_W, IMG_WIN_H);
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
        drawBadge(this.contents, this._poi.portraitBadge);
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
  function drawBadge(c, txt) {
    if (!txt) return;
    const pad = 5;
    c.fontSize = 14;
    const w = c.measureTextWidth(txt),
      h = c.fontSize + 4;
    c.fillRect(pad - 2, pad - 2, w + 4, h + 4, "rgba(0,0,0,0.6)");
    c.textColor = "#fff";
    c.drawText(txt, pad, pad, w, h, "left");
  }

  // ~~~~~~~~~~~ 4.2  Görgethető leírás – KORÁBBI word‑wrap visszahozva ~~~~~
  class PoiPortraitText extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      Window_Base.prototype.initialize.call(this, x, y, TXT_WIN_W, TXT_WIN_H);
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
      const CW = this.contentsWidth();
      const TEMP_H = 5000;
      this.contents = new Bitmap(CW, TEMP_H);

      let y = 0;
      const margin = 4;

      // Cím
      this.contents.fontSize = 18;
      const nameLH = this.contents.fontSize + 2;
      this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
      y += nameLH + margin + 5;

      // Leírás word‑wrap bekezdésenként
      this.contents.fontSize = 16;
      const lineH = this.contents.fontSize + 2;

      let desc = (this._poi.portraitDesc || "")
        .replace(/^"(.*)"$/s, "$1")
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();

      const paras = desc.split(/\r?\n/);
      for (let pi = 0; pi < paras.length; pi++) {
        const paragraph = paras[pi].trim();
        if (!paragraph) {
          y += lineH;
          continue;
        }
        const words = paragraph.split(/\s+/);
        let line = "";
        for (let wi = 0; wi < words.length; wi++) {
          const word = words[wi];
          const test = line ? line + " " + word : word;
          if (this.contents.measureTextWidth(test) > CW && line) {
            this.contents.drawText(line, 0, y, CW, lineH, "left");
            y += lineH;
            line = word;
          } else {
            line = test;
          }
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
      const wheel = TouchInput.wheelY;
      if (wheel !== 0 && this.isTouchedInsideFrame()) {
        this._scrollBy(wheel > 0 ? 24 : -24);
      }
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
      } else {
        this._dragging = false;
      }
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

  // ~~~~~~~~~~~ 4.3  Opciós menü (Command) – Skin + pontos pozicionálás ~~~~
  class PoiOptions extends Window_Command {
    constructor(poi, x, y) {
      super(x, y);
      this._poi = poi;
      applySkin(this, OPTIONS_SKIN);
      this.openness = 0;
      this.open();
    }
    windowWidth() {
      return 180;
    }
    numVisibleRows() {
      return this.maxItems();
    }
    makeCommandList() {
      this.addCommand("Opció 1", "opt1");
      this.addCommand("Opció 2", "opt2");
      this.addCommand("Opció 3", "opt3");
    }
    processOk() {
      IME.emit("poi-option", { poi: this._poi, opt: this.currentSymbol() });
      this._closeSelf();
    }
    processCancel() {
      this._closeSelf();
    }
    _closeSelf() {
      this.close();
      if (this.parent) this.parent.removeChild(this);
      const sc = SceneManager._scene;
      if (sc && sc._activePoi) clearActivePoi(sc);
    }
  }

  // ~~~~~~~~~~~ 4.4  Δ  POI Sprite (core) + villogás támogatás ~~~~~~~~~~~~~
  class PoiSprite extends Sprite {
    constructor(poi, scene, win) {
      super();
      this.poi = poi;
      this._scene = scene;
      this._win = win;

      // Csak param-POI képből dolgozunk
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
      });

      this._label = SHOW_LABEL && poi.name ? this._makeLabel(poi.name) : null;

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
    }

    dispose() {
      this._dead = true;
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
      bm.fontSize = 18;
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

      const cam = this._win.cameraRect();
      const s = this._win.coverScale();
      const rx = imgX - cam.x,
        ry = imgY - cam.y;

      const inside = rx >= 0 && ry >= 0 && rx <= cam.w && ry <= cam.h;
      this.visible = this.poi.visible && inside;
      if (!this.visible) return;

      this.x = Math.round(rx * s);
      this.y = Math.round(ry * s);

      this._icon.scale.set((this._baseScale || 1) * s);

      if (this._label) {
        const sIcon = this._icon.scale.y;
        const pad = this._icon._bottomPadPx || 0;
        const labelH = this._label.bitmap ? this._label.bitmap.height : 0;
        let yLocal = -pad;

        const innerTop = this._win.y + this._win.padding;
        const innerBottom = innerTop + this._win.contentsHeight();
        const labelTopScreenY = innerTop + this.y + yLocal * sIcon;
        if (labelTopScreenY + labelH > innerBottom) yLocal = -pad - labelH;

        this._label.scale.set(1 / sIcon);
        this._label.x = 0;
        this._label.y = yLocal;
      }
    }

    hitTest(scrX, scrY) {
      if (!this.visible) return false;
      const b = this._icon.getBounds();
      return (
        scrX >= b.x &&
        scrX <= b.x + b.width &&
        scrY >= b.y &&
        scrY <= b.y + b.height
      );
    }
  }

  /* ----------------------------------[ 5. Overlay – Sprite‑ek létrehozása ] */
  IRMap.registerOverlay((scene, win) => {
    const cfg0 = scene.mapConfig();
    if (!cfg0) return;

    // ── segédek ────────────────────────────────────────────────────────────────
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
      scene._activePoi = null;
    };

    function disposePoiSprite(sp) {
      try {
        if (sp && sp._posUpd) {
          IRMap.off("camera-changed", sp._posUpd);
          IRMap.off("update-tick", sp._posUpd);
        }
        if (sp && sp._onClose) IRMap.off("scene-close", sp._onClose);
        // ikon bitmap leválasztása, hogy a GC könnyebben dolgozzon
        if (sp && sp._icon) {
          try {
            sp._icon.bitmap = null;
          } catch (e) {}
          if (sp._icon.parent) sp._icon.parent.removeChild(sp._icon);
        }
      } catch (e) {}
      if (sp && sp.parent) sp.parent.removeChild(sp);
    }

    const removePoiSprites = () => {
      (scene._imePoiSprites || []).forEach(disposePoiSprite);
      scene._imePoiSprites = [];
    };

    const addSprites = (pois) => {
      for (const p of pois)
        scene._imePoiSprites.push(new PoiSprite(p, scene, win));
    };

    const buildPoiSpritesForCurrentMap = () => {
      const cfgNow = scene.mapConfig && scene.mapConfig();
      if (!cfgNow) return;

      const list =
        POI_BY_MAP[(cfgNow.editorMapName || "").trim().toLowerCase()] || [];
      scene._imePoiSprites = list.map((p) => new PoiSprite(p, scene, win));
    };

    // Maszk egyszer / scene
    if (!win._poiMask) {
      const g = new PIXI.Graphics();
      g.beginFill(0xffffff);
      g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
      g.endFill();
      win._markerLayer.addChildAt(g, 0);
      win._markerLayer.mask = g;
      win._poiMask = g;
    }

    // Első felépítés
    removePoiSprites();
    buildPoiSpritesForCurrentMap();

    // Map‑váltás detektálása és rebuild ugyanazon Scene alatt
    scene._imeLastEditorName = (cfg0.editorMapName || "").toLowerCase();
    const maybeRebuildOnMapChange = () => {
      const c2 = scene.mapConfig && scene.mapConfig();
      const now = ((c2 && c2.editorMapName) || "").toLowerCase();
      if (now !== scene._imeLastEditorName) {
        scene._imeLastEditorName = now;
        clearPoiUi();
        removePoiSprites();
        buildPoiSpritesForCurrentMap();
      }
    };
    IRMap.on("update-tick", maybeRebuildOnMapChange);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", maybeRebuildOnMapChange);
      // biztos takarítás záráskor is
      clearPoiUi();
      removePoiSprites();
    });

    // Kattintás és villogás (once guard a saját függvényeikben)
    installClickHandler(scene, win);
    installBlinkUpdater(scene);
  });

  function iconScreenBounds(icon) {
    const w = icon.bitmap ? icon.bitmap.width : 0;
    const h = icon.bitmap ? icon.bitmap.height : 0;
    const ax = icon.anchor.x,
      ay = icon.anchor.y;
    const tl = icon.toGlobal(new PIXI.Point(-ax * w, -ay * h));
    const br = icon.toGlobal(new PIXI.Point((1 - ax) * w, (1 - ay) * h));
    return { L: tl.x, T: tl.y, R: br.x, B: br.y };
  }

  function _clearPoiUi(scene) {
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
      scene._poiMenu = null;
    }
    scene._activePoi = null;
  }

  function _removePoiSprites(scene, win) {
    (scene._imePoiSprites || []).forEach((sp) => {
      if (sp && sp.parent) sp.parent.removeChild(sp);
    });
    scene._imePoiSprites = [];
    // A maszkon nem változtatunk (win._poiMask marad)
  }

  function _buildPoiSpritesForCurrentMap(scene, win) {
    const cfg = scene.mapConfig && scene.mapConfig();
    if (!cfg) return;

    const list =
      POI_BY_MAP[(cfg.editorMapName || "").trim().toLowerCase()] || [];
    scene._imePoiSprites = list.map((p) => new PoiSprite(p, scene, win));

    // Esemény‑alapú POI-k újraolvasása a jelenlegi játéktérképről
    if ($gameMap) {
      const liveEventsWithInfo = $gameMap
        .events()
        .map((ev) => ({ ev, info: imeTagInfo(ev) }))
        .filter((x) => x.info.present);

      const evPois = liveEventsWithInfo.map(({ ev, info }) =>
        makePoiFromEvent(ev, cfg.editorMapName, info)
      );
      for (const p of evPois)
        scene._imePoiSprites.push(new PoiSprite(p, scene, win));
    }
  }
  /* ----------------------------------[ 6. Kattintás + menü pozicionálás ]-- */
  function installClickHandler(scene, win) {
    if (scene._imeClickInstalled) return;
    scene._imeClickInstalled = true;

    function normalizeMode(v) {
      const s = String(v || "")
        .toLowerCase()
        .trim();
      if (
        s === "portrait" ||
        s === "options" ||
        s === "both" ||
        s === "teleport" ||
        s === "openload" ||
        s === "runcommonevent"
      )
        return s;
      if (s.includes("portrait and option")) return "both";
      if (s.includes("open portrait")) return "portrait";
      if (s.includes("option")) return "options";
      if (s.includes("teleport")) return "teleport";
      if (
        s.includes("openload") ||
        (s.includes("open") && s.includes("related"))
      )
        return "openload";
      if (s.includes("common") && s.includes("event")) return "runcommonevent";
      return "portrait";
    }

    IRMap.on("update-tick", () => {
      if (!TouchInput.isTriggered()) return;

      const sx = TouchInput.x,
        sy = TouchInput.y;
      const spr = (scene._imePoiSprites || []).find((sp) => sp.hitTest(sx, sy));
      if (!spr) return;

      const poi = spr.poi;
      if (!poi.interactable) return;

      setActivePoi(scene, spr);

      // Régi ablakok bezárása
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
        scene._poiMenu = null;
      }

      const mode = normalizeMode(poi.interactMode);

      // PORTRÉ (portrait / both)
      if (mode === "portrait" || mode === "both") {
        const baseX = win.x + win.padding;
        const baseY = win.y + win.padding;

        if (poi.portraitImg) {
          scene._poiImgWin = new PoiPortraitImg(poi, baseX, baseY);
          scene.addChild(scene._poiImgWin);
        }
        if (poi.name) {
          scene._poiTxtWin = new PoiPortraitText(
            poi,
            baseX,
            baseY + (scene._poiImgWin ? IMG_WIN_H : 0)
          );
          scene.addChild(scene._poiTxtWin);
        }
      }

      // OPCIÓ MENÜ (options / both)
      if (mode === "options" || mode === "both") {
        const menu = new PoiOptions(poi, 0, 0);

        const mw = menu.windowWidth(),
          mh = menu.height;
        const innerX = win.x + win.padding,
          innerY = win.y + win.padding;
        const innerW = win.contentsWidth(),
          innerH = win.contentsHeight();
        const innerR = innerX + innerW,
          innerB = innerY + innerH;

        const hasParent = spr._icon && spr._icon.parent;
        let L, R, T;
        if (hasParent) {
          const bb = iconScreenBounds(spr._icon);
          L = bb.L;
          R = bb.R;
          T = bb.T;
        } else {
          L = innerX;
          R = innerX;
          T = innerY;
        }

        const MARGIN = menu._margin || 0;
        const GAPX = 0,
          GAPY = 0;
        let mx = Math.round(R - MARGIN + GAPX);
        let my = Math.round(T - MARGIN + GAPY);
        if (mx + mw > innerR) mx = Math.round(L + MARGIN - mw - GAPX);

        if (mx < innerX) mx = innerX;
        if (my < innerY) my = innerY;
        if (my + mh > innerB) my = innerB - mh;

        menu.x = mx;
        menu.y = my;
        scene.addWindow(menu);
        scene._poiMenu = menu;
      }

      if (mode === "teleport") {
        IME.emit("poi-teleport", { poi, location: poi.teleportLocation });
        return;
      }
      if (mode === "openload") {
        IME.emit("poi-open-related", { poi, mapId: poi.relatedMapId });
        return;
      }
      if (mode === "runcommonevent") {
        const ceId = +poi.callCommonEvent || 0;
        IME.emit("poi-run-common-event", { poi, commonEventId: ceId });
        return;
      }

      IME.emit("poi-click", { poi });
    });

    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      // nincs extra teendő
    });
  }

  /* ----------------------------------[ 7. Aktív POI villogás ]------------ */
  function setActivePoi(scene, spr) {
    if (scene._activePoi === spr) return;
    clearActivePoi(scene);
    scene._activePoi = spr;
    spr._baseAlpha = spr._icon.alpha;
    spr._blinkPhase = 0;
  }
  function clearActivePoi(scene) {
    if (!scene._activePoi) return;
    const s = scene._activePoi;
    if (s && s._icon) s._icon.alpha = s._baseAlpha != null ? s._baseAlpha : 1;
    scene._activePoi = null;

    if (scene._poiImgWin) {
      scene.removeChild(scene._poiImgWin);
      scene._poiImgWin = null;
    }
    if (scene._poiTxtWin) {
      scene.removeChild(scene._poiTxtWin);
      scene._poiTxtWin = null;
    }
  }
  function installBlinkUpdater(scene) {
    if (scene._blinkUpdaterInstalled) return;
    scene._blinkUpdaterInstalled = true;

    const blinkUpdate = () => {
      const spr = scene._activePoi;
      if (!spr || !spr._icon) return;
      spr._blinkPhase = (spr._blinkPhase || 0) + 0.15;
      const norm = (Math.sin(spr._blinkPhase) + 1) * 0.5;
      const newAlpha =
        (spr._baseAlpha != null ? spr._baseAlpha : 1) * (0.5 + 0.5 * norm);
      spr._icon.alpha = newAlpha;
    };

    IRMap.on("update-tick", blinkUpdate);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", blinkUpdate);
    });
  }

  /* ----------------------------------[ util ]------------------------------ */
  function applySkin(win, skin) {
    if (!skin) return;
    win.windowskin = ImageManager.loadSystem(skin);
    if (win._refreshAllParts) win._refreshAllParts();
  }
})();

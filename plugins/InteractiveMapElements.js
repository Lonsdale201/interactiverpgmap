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
      mapId: Number(j.mapId) || 0,
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
    return "portrait";
  }

  /* ----------------------------------[ 4.  Osztályok ]-------------------- */
  // 4.1  Badge-es portrék (ablak)
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

  // 4.2  Görgethető leírás
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
      const CW = this.contentsWidth(),
        TEMP_H = 5000;
      this.contents = new Bitmap(CW, TEMP_H);
      let y = 0,
        margin = 4;

      this.contents.fontSize = 18;
      const nameLH = this.contents.fontSize + 2;
      this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
      y += nameLH + margin + 5;

      this.contents.fontSize = 16;
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
    }
  }

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
      const list = POI_BY_MAP[cfg0.mapId] || [];
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
      const now = ((c2 && c2.editorMapName) || "").toLowerCase();
      if (now !== scene._imeLastEditorName) {
        scene._imeLastEditorName = now;
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

    // bezárjuk a régi UI-t
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

    const mode = normalizeMode(poi.interactMode);
    const baseX = win.x + win.padding,
      baseY = win.y + win.padding;

    if (mode === "portrait" || mode === "both") {
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

    if (mode === "options" || mode === "both") {
      const menu = new PoiOptions(poi, 0, 0);
      const mw = menu.windowWidth(),
        mh = menu.height;
      const innerX = win.x + win.padding,
        innerY = win.y + win.padding;
      const innerW = win.contentsWidth(),
        innerH = win.contentsHeight();
      let mx = spr.x + win.x + win.padding,
        my = spr.y + win.y + win.padding - mh;
      if (mx + mw > innerX + innerW) mx = innerX + innerW - mw;
      if (mx < innerX) mx = innerX;
      if (my < innerY) my = innerY;
      if (my + mh > innerY + innerH) my = innerY + innerH - mh;
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
    IRMap.emit("poi-click", { poi });
  }

  /* ----------------------------------[ util ]------------------------------ */
  function applySkin(win, skin) {
    if (!skin) return;
    win.windowskin = ImageManager.loadSystem(skin);
    if (win._refreshAllParts) win._refreshAllParts();
  }
})();

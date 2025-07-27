/*:
 * @plugindesc InteractiveMapElements – point-of-interest ikonok és címkék az InteractiveRpgMap térképen • v1.2
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.2
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
 * @desc Define POIs for your maps.
 */

/*~struct~PoiConfig:
 * @param editorMapName
 * @text Editor Map Name
 * @type text
 *
 * @param poiMapName
 * @text Map name
 * @type text
 * @desc Enter the exact name of the map to which the POI belongs.
 *
 * @param poiName
 * @text POI Name
 * @type text
 *
 * @param poiImage
 * @text POI Image
 * @type file
 * @dir img/poi
 *
 * @param posX
 * @text Position X (tile)
 * @type number
 * @min 0
 *
 * @param posY
 * @text Position Y (tile)
 * @type number
 * @min 0
 *
 * @param interactable
 * @text Interactable
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param initialShow
 * @text Initially Visible
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param iconWidth
 * @text Max Icon Width (px)
 * @type number
 * @min 0
 * @default 0
 *
 * @param iconHeight
 * @text Max Icon Height (px)
 * @type number
 * @min 0
 * @default 0
 *
 * @param enablePortrait
 * @text Enable Portrait
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param portraitImage
 * @text Portrait Image
 * @type file
 * @dir img/poi
 *
 * @param description
 * @text POI Description
 * @type note
 */
(() => {
  "use strict";

  /* -------------------------------------------------------------------- *
   *  0)  Param‑beolvasás
   * -------------------------------------------------------------------- */
  const PLUGIN = "InteractiveMapElements";
  const P = (tag) => PluginManager.parameters(PLUGIN)[tag] || "";
  const SHOW_LABEL = P("showPoiLabel") !== "false";
  const IMG_WIN_W = +P("portraitImgWinWidth") || 200;
  const IMG_WIN_H = +P("portraitImgWinHeight") || 240;
  const TXT_WIN_W = +P("portraitTextWindWidth") || 200;
  const TXT_WIN_H = +P("portraitTextWindHeight") || 240;

  const IMG_PADDING = 2; // 1‑3 px körüli padding a képablaknak
  const TEXT_WRAP = true; // ha szeretnéd kikapcsolni a word‑wrap‑et

  const PORTRAIT_SKIN = P("portraitWindowSkin") || "";
  const OPTIONS_SKIN = P("optionsWindowSkin") || "";
  const RAW = JSON.parse(P("pois") || "[]");

  const POIS = RAW.map((e) => {
    const j = JSON.parse(e);
    return {
      map: (j.editorMapName || "").trim(),
      name: j.poiName || "",
      img: j.poiImage || "",
      x: +j.posX || 0,
      y: +j.posY || 0,
      interactable: j.interactable === "true",
      visible: j.initialShow !== "false",
      w: +j.iconWidth || 0,
      h: +j.iconHeight || 0,
      portraitEnabled: j.enablePortrait === "true",
      portraitImg: j.portraitImage || "",
      portraitDesc: j.description || "",
    };
  });

  const POI_BY_MAP = {};
  for (let i = 0; i < POIS.length; i++) {
    const p = POIS[i];
    if (!p.map) continue;
    const key = p.map.toLowerCase();
    if (!POI_BY_MAP[key]) POI_BY_MAP[key] = [];
    POI_BY_MAP[key].push(p);
  }

  function applySkin(win, skinName) {
    if (!skinName) return;
    win.windowskin = ImageManager.loadSystem(skinName);
    if (win._refreshAllParts) win._refreshAllParts();
  }

  /* -------------------------------------------------------------------- *
   *  1)  Maszk a markerLayer‑re (egyszer / scene)
   * -------------------------------------------------------------------- */
  IRMap.on("scene-ready", ({ win }) => {
    if (win._poiMask) return;
    const g = new PIXI.Graphics();
    g.beginFill(0xffffff);
    g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
    g.endFill();
    win._markerLayer.addChildAt(g, 0);
    win._markerLayer.mask = g;
    win._poiMask = g;
  });

  /* -------------------------------------------------------------------- *
   *  2)  Mini Window a POI‑menühöz
   * -------------------------------------------------------------------- */
  function Window_PoiOptions(poi, x, y) {
    this.initialize(poi, x, y);
  }
  Window_PoiOptions.prototype = Object.create(Window_Command.prototype);
  Window_PoiOptions.prototype.constructor = Window_PoiOptions;

  Window_PoiOptions.prototype.initialize = function (poi, x, y) {
    this._poi = poi;
    Window_Command.prototype.initialize.call(this, x, y);
    ["opt1", "opt2", "opt3"].forEach((s) =>
      this.setHandler(s, this.onOk.bind(this))
    );
    this.setHandler("cancel", this.onOk.bind(this));
    applySkin(this, OPTIONS_SKIN);
    this.openness = 0;
    this.open();
  };
  Window_PoiOptions.prototype.windowWidth = function () {
    return 180;
  };
  Window_PoiOptions.prototype.numVisibleRows = function () {
    return this.maxItems();
  };
  Window_PoiOptions.prototype.makeCommandList = function () {
    this.addCommand("Opció 1", "opt1");
    this.addCommand("Opció 2", "opt2");
    this.addCommand("Opció 3", "opt3");
  };
  Window_PoiOptions.prototype.onOk = function () {
    console.log(
      'POI "' + this._poi.name + '" – választott:',
      this.currentSymbol()
    );
    this.close();
    if (this.parent) this.parent.removeChild(this);
    if (SceneManager._scene && SceneManager._scene._activePoi) {
      clearActivePoi(SceneManager._scene);
    }
  };

  /* -------------------------------------------------------------------- *
   *  2)  POI Profile – két külön Window
   * -------------------------------------------------------------------- */

  /* ---- 2/a) Kép ablak ------------------------------------------------ */
  function Window_PoiPortraitImg(poi, x, y) {
    this.initialize(poi, x, y);
  }
  Window_PoiPortraitImg.prototype = Object.create(Window_Base.prototype);
  Window_PoiPortraitImg.prototype.constructor = Window_PoiPortraitImg;
  Window_PoiPortraitImg.prototype.standardPadding = function () {
    return IMG_PADDING;
  };

  Window_PoiPortraitImg.prototype.initialize = function (poi, x, y) {
    Window_Base.prototype.initialize.call(this, x, y, IMG_WIN_W, IMG_WIN_H);
    this._poi = poi;
    this.opacity = 192;
    applySkin(this, PORTRAIT_SKIN);
    this.createContents();
    this.refresh();
  };

  Window_PoiPortraitImg.prototype.refresh = function () {
    this.contents.clear();
    if (!this._poi.portraitEnabled || !this._poi.portraitImg) return;

    const bmp = ImageManager.loadBitmap(
      "img/poi/",
      this._poi.portraitImg,
      0,
      true
    );
    bmp.addLoadListener(() => {
      const CW = this.contentsWidth();
      const CH = this.contentsHeight();
      const scale = Math.max(CW / bmp.width, CH / bmp.height); // cover
      const drawW = CW,
        drawH = CH;
      const srcW = drawW / scale,
        srcH = drawH / scale;
      const srcX = Math.max(0, (bmp.width - srcW) / 2);
      const srcY = Math.max(0, (bmp.height - srcH) / 2);
      this.contents.blt(bmp, srcX, srcY, srcW, srcH, 0, 0, drawW, drawH);
    });
  };

  /* ---- 2/b) Szöveg ablak (scroll) ----------------------------------- */
  function Window_PoiPortraitText(poi, x, y) {
    this.initialize(poi, x, y);
  }
  Window_PoiPortraitText.prototype = Object.create(Window_Base.prototype);
  Window_PoiPortraitText.prototype.constructor = Window_PoiPortraitText;

  Window_PoiPortraitText.prototype.initialize = function (poi, x, y) {
    Window_Base.prototype.initialize.call(this, x, y, TXT_WIN_W, TXT_WIN_H);
    this._poi = poi;
    this.opacity = 192;
    applySkin(this, PORTRAIT_SKIN);

    this._scrollY = 0;
    this._maxScroll = 0;
    this._dragging = false;
    this._lastTouchY = 0;

    this.createContents();
    this.refresh();
  };

  Window_PoiPortraitText.prototype.refresh = function () {
    const CW = this.contentsWidth();
    const TEMP_H = 5000;
    // új, nagyobb bitmap a scrollozáshoz
    this.contents = new Bitmap(CW, TEMP_H);

    let y = 0;
    const margin = 4;

    // ----- Cím középre -----
    this.contents.fontSize = 18;
    const nameLH = this.contents.fontSize + 2;
    this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
    y += nameLH;
    y += margin;
    y += 5;

    // ----- Leírás word-wrap -----
    this.contents.fontSize = 16;
    const lineH = this.contents.fontSize + 2;

    // JSON note‑ból escaped \\n és <br> → valódi sor
    let desc = (this._poi.portraitDesc || "")
      .replace(/^"(.*)"$/s, "$1")
      .replace(/\\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();

    // először bontsuk sorokra a valódi '\n' mentén
    const paras = desc.split(/\r?\n/);
    for (let pi = 0; pi < paras.length; pi++) {
      const paragraph = paras[pi].trim();
      if (!paragraph) {
        y += lineH;
        continue;
      }
      // szavakra bontva wrapeljük
      const words = paragraph.split(/\s+/);
      let line = "";
      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi];
        const test = line ? line + " " + word : word;
        if (this.contents.measureTextWidth(test) > CW && line) {
          // kirajzoljuk az előző sort
          this.contents.drawText(line, 0, y, CW, lineH, "left");
          y += lineH;
          line = word; // új sor kezdete
        } else {
          line = test;
        }
      }
      // maradék sor
      if (line) {
        this.contents.drawText(line, 0, y, CW, lineH, "left");
        y += lineH;
      }
      // paragrafusok között extra tér
      y += margin;
    }

    // ----- Scroll‑limitek -----
    this._contentH = y;
    this._maxScroll = Math.max(0, this._contentH - this.contentsHeight());
  };

  Window_PoiPortraitText.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    this.processWheel();
    this.processTouchScroll();
    this.updateArrows();
  };
  Window_PoiPortraitText.prototype.processWheel = function () {
    const wheel = TouchInput.wheelY;
    if (wheel !== 0 && this.isTouchedInsideFrame()) {
      this.scrollBy(wheel > 0 ? 24 : -24);
    }
  };
  Window_PoiPortraitText.prototype.processTouchScroll = function () {
    if (TouchInput.isPressed() && this.isTouchedInsideFrame()) {
      const y = TouchInput.y;
      if (!this._dragging) {
        this._dragging = true;
        this._lastTouchY = y;
      } else {
        const dy = this._lastTouchY - y;
        if (Math.abs(dy) > 2) {
          this.scrollBy(dy);
          this._lastTouchY = y;
        }
      }
    } else {
      this._dragging = false;
    }
  };
  Window_PoiPortraitText.prototype.scrollBy = function (dy) {
    this._scrollY = Math.max(0, Math.min(this._scrollY + dy, this._maxScroll));
    this.origin.y = this._scrollY;
  };
  Window_PoiPortraitText.prototype.updateArrows = function () {
    this.downArrowVisible = this._scrollY < this._maxScroll;
    this.upArrowVisible = this._scrollY > 0;
  };
  Window_PoiPortraitText.prototype.isTouchedInsideFrame = function () {
    const x = TouchInput.x,
      y = TouchInput.y;
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    );
  };

  /* -------------------------------------------------------------------- *
   *  3)  POI‑Sprite készítő
   * -------------------------------------------------------------------- */
  function createPoiSprite(poi, scene, win) {
    const cont = new Sprite();
    win._markerLayer.addChild(cont);
    cont._worldTileX = poi.x;
    cont._worldTileY = poi.y;
    cont._poiMeta = poi;
    cont.visible = poi.visible;

    /* ikon */
    const bmp = ImageManager.loadBitmap("img/poi/", poi.img, 0, true);
    const icon = new Sprite(bmp);
    icon.anchor.set(0.5, 1.0);
    cont.addChild(icon);

    /* label */
    let label = null;
    function refreshLabel() {
      if (!label) return;
      label.y = -icon.height - 4;
    }

    bmp.addLoadListener(function () {
      const mw = poi.w > 0 ? poi.w : 64;
      const mh = poi.h > 0 ? poi.h : 64;
      const sc = Math.min(mw / bmp.width, mh / bmp.height, 1);
      icon.scale.set(sc, sc);

      if (SHOW_LABEL && poi.name && !label) {
        const b = new Bitmap(256, 24);
        b.fontSize = 18;
        b.drawText(poi.name, 0, 0, b.width, b.height, "center");
        label = new Sprite(b);
        label.anchor.set(0.5, 1.0);
        cont.addChild(label);
        refreshLabel();
      }
      positionSprite();
    });

    function positionSprite() {
      const p = IRMap.worldToImage(cont._worldTileX, cont._worldTileY);
      if (!p) return;
      const cam = win.cameraRect(),
        s = win.coverScale();
      const rx = p.imgX - cam.x,
        ry = p.imgY - cam.y;
      const inside = rx >= 0 && ry >= 0 && rx <= cam.w && ry <= cam.h;
      cont.visible = poi.visible && inside;
      if (!inside) return;
      cont.x = Math.round(rx * s);
      cont.y = Math.round(ry * s);
      cont.scale.set(s, s);
      refreshLabel();
    }

    IRMap.on("camera-changed", positionSprite);
    IRMap.on("update-tick", positionSprite);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("camera-changed", positionSprite);
      IRMap.off("update-tick", positionSprite);
    });

    scene._poiSprites.push(cont);
  }

  /* -------------------------------------------------------------------- *
   *  4)  Egyszerű TouchInput‑alapú kattintás‑checker
   * -------------------------------------------------------------------- */
  function installClickChecker(scene) {
    if (scene._poiClickCheckerInstalled) return;
    scene._poiClickCheckerInstalled = true;

    function handleClick() {
      if (!TouchInput.isTriggered()) return;

      const sx = TouchInput.x;
      const sy = TouchInput.y;

      const win = scene._win;
      const innerX = win.x + win.padding;
      const innerY = win.y + win.padding;
      const innerW = win.contentsWidth();
      const innerH = win.contentsHeight();
      const innerR = innerX + innerW;
      const innerB = innerY + innerH;

      const H_OFF = 0;
      const V_OFF = 0;

      for (const spr of scene._poiSprites) {
        if (!spr.visible) continue;

        const icon = spr.children[0];
        const bounds = icon.getBounds();
        const L = bounds.x,
          R = bounds.x + bounds.width;
        const T = bounds.y,
          B = bounds.y + bounds.height;

        if (sx >= L && sx <= R && sy >= T && sy <= B) {
          const poi = spr._poiMeta;
          if (!poi.interactable) return;

          setActivePoi(scene, spr);

          // régi ablakok törlése
          if (scene._poiImgWin) {
            scene.removeChild(scene._poiImgWin);
            scene._poiImgWin = null;
          }
          if (scene._poiTxtWin) {
            scene.removeChild(scene._poiTxtWin);
            scene._poiTxtWin = null;
          }

          if (poi.portraitEnabled) {
            const baseX = win.x + win.padding;
            let baseY = win.y + win.padding;

            if (poi.portraitImg) {
              scene._poiImgWin = new Window_PoiPortraitImg(poi, baseX, baseY);
              scene.addChild(scene._poiImgWin);
              baseY += IMG_WIN_H; // text alá
            }

            scene._poiTxtWin = new Window_PoiPortraitText(poi, baseX, baseY);
            scene.addChild(scene._poiTxtWin);
          }

          // opció menü
          if (scene._poiMenu) scene.removeChild(scene._poiMenu);
          const menu = new Window_PoiOptions(poi, 0, 0);
          const mw = menu.windowWidth();
          const mh = menu.height;

          let mx = R + H_OFF;
          let my = T + V_OFF;
          if (mx + mw > innerR) mx = L - mw - H_OFF;
          if (mx < innerX) mx = innerX;
          if (my < innerY) my = B - mh - V_OFF;
          if (my < innerY) my = innerY;
          if (my + mh > innerB) my = innerB - mh;

          menu.x = mx;
          menu.y = my;
          scene.addChild(menu);
          scene._poiMenu = menu;
          return;
        }
      }
    }

    IRMap.on("update-tick", handleClick);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", handleClick);
    });

    installBlinkUpdater(scene);
  }

  /* -------------------------------------------------------------------- *
   *  4/b)  Aktív POI kijelölés & villogás
   * -------------------------------------------------------------------- */
  function setActivePoi(scene, spr) {
    if (scene._activePoi === spr) return;
    clearActivePoi(scene);
    scene._activePoi = spr;
    spr._baseAlpha = spr.alpha;
    spr._blinkPhase = 0;
  }

  function clearActivePoi(scene) {
    if (!scene._activePoi) return;
    const s = scene._activePoi;
    s.alpha = s._baseAlpha != null ? s._baseAlpha : 1;
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

    function blinkUpdate() {
      const spr = scene._activePoi;
      if (!spr) return;
      spr._blinkPhase = (spr._blinkPhase || 0) + 0.15;
      const norm = (Math.sin(spr._blinkPhase) + 1) * 0.5;
      spr.alpha = spr._baseAlpha * (0.5 + 0.5 * norm);
    }

    IRMap.on("update-tick", blinkUpdate);
    IRMap.on("scene-close", ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", blinkUpdate);
    });
  }

  /* -------------------------------------------------------------------- *
   *  5)  Overlay regisztráció
   * -------------------------------------------------------------------- */
  IRMap.registerOverlay(function (scene, win) {
    const cfg = scene.mapConfig();
    if (!cfg) return;
    const key = (cfg.editorMapName || "").trim().toLowerCase();
    const list = POI_BY_MAP[key];
    if (!list || !list.length) {
      console.warn("[IME] Nincs POI a maphez:", cfg.editorMapName);
      return;
    }

    scene._poiSprites = [];
    for (let i = 0; i < list.length; i++) createPoiSprite(list[i], scene, win);
    installClickChecker(scene);
  });
})();

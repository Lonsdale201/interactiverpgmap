/*:
 * @plugindesc Interactive POIs – point-of-interest ikonok és címkék az InteractiveRpgMap térképen • v1.2
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.1
 *
 * @help
 * ---------------------------------------------------------------------------
 *   ▸ Korábbi verziók POI-jai kicsúsztak scroll alatt: most a markerLayer
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
 */

/* Interactive POIs  ·  v1.3.1  (RPG Maker‑MV kompatibilis) */
(() => {
  "use strict";

  /* -------------------------------------------------------------------- *
   *  0)  Param‑beolvasás
   * -------------------------------------------------------------------- */
  const PLUGIN = "InteractiveMapElements";
  const P = (tag) => PluginManager.parameters(PLUGIN)[tag] || "";
  const SHOW_LABEL = P("showPoiLabel") !== "false";
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
    };
  });
  const POI_BY_MAP = {};
  for (let i = 0; i < POIS.length; i++) {
    const p = POIS[i];
    if (!p.map) continue;
    if (!POI_BY_MAP[p.map]) POI_BY_MAP[p.map] = [];
    POI_BY_MAP[p.map].push(p);
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
   *  2)  Mini Window a POI‑menühöz
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
    this.addCommand("Opció 1", "opt1");
    this.addCommand("Opció 2", "opt2");
    this.addCommand("Opció 3", "opt3");
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

    /* pozíció frissítés */
    function positionSprite() {
      const p = IRMap.worldToImage(cont._worldTileX, cont._worldTileY);
      if (!p) return;
      const cam = win.cameraRect(),
        s = win.coverScale();
      const rx = p.imgX - cam.x,
        ry = p.imgY - cam.y;
      if (rx < 0 || ry < 0 || rx > cam.w || ry > cam.h) {
        cont.visible = false;
        return;
      }
      cont.visible = poi.visible;
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
      const sx = TouchInput.x,
        sy = TouchInput.y;

      for (let i = 0; i < scene._poiSprites.length; i++) {
        const spr = scene._poiSprites[i];
        if (!spr.visible) continue;
        const icon = spr.children[0];
        const gPos = spr.getGlobalPosition();
        const w = icon.width * icon.scale.x,
          h = icon.height * icon.scale.y;
        const L = gPos.x - w / 2,
          R = gPos.x + w / 2;
        const T = gPos.y - h,
          B = gPos.y;

        if (sx >= L && sx <= R && sy >= T && sy <= B) {
          const poi = spr._poiMeta;
          if (!poi.interactable) return;
          setActivePoi(scene, spr);
          /* menü */
          if (scene._poiMenu) scene.removeChild(scene._poiMenu);
          const menu = new Window_PoiOptions(poi, 0, 0);
          const mw = menu.windowWidth(),
            mh = menu.height;
          let mx = gPos.x + w / 2 + 8;
          if (mx + mw > Graphics.boxWidth) mx = gPos.x - w / 2 - mw - 8;
          let my = gPos.y - h / 2 - mh / 2;
          my = Math.max(0, Math.min(my, Graphics.boxHeight - mh));
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
   *  4/b)  Aktív POI kijelölés & villogás
   * -------------------------------------------------------------------- */
  function setActivePoi(scene, spr) {
    if (scene._activePoi === spr) return; // már ez az aktív
    clearActivePoi(scene); // előző leállítása
    scene._activePoi = spr;
    spr._baseAlpha = spr.alpha;
    spr._blinkTick = 0;
  }

  function clearActivePoi(scene) {
    if (!scene._activePoi) return;
    const s = scene._activePoi;
    s.alpha = s._baseAlpha != null ? s._baseAlpha : 1;
    scene._activePoi = null;
  }

  /* egyszerű 20 frame‑es periódusú villogás */
  function installBlinkUpdater(scene) {
    if (scene._blinkUpdaterInstalled) return;
    scene._blinkUpdaterInstalled = true;

    function blinkUpdate() {
      var spr = scene._activePoi;
      if (!spr) return;
      // minden frame növeljük a fázist
      spr._blinkPhase = (spr._blinkPhase || 0) + 0.15;
      // sin(phase) ∈ [-1,1] → normáljuk [0,1]
      var norm = (Math.sin(spr._blinkPhase) + 1) * 0.5;
      // skálázzuk [0.5,1.0] közé (vagy tetszőleges tartományba)
      var intensity = 0.5 + 0.5 * norm;
      spr.alpha = spr._baseAlpha * intensity;
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
    const list = POI_BY_MAP[cfg.editorMapName];
    if (!list || !list.length) return;

    scene._poiSprites = [];
    for (let i = 0; i < list.length; i++) createPoiSprite(list[i], scene, win);
    installClickChecker(scene);
  });
})();

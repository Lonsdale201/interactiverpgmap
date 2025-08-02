/*:
 * @plugindesc v1.5+ Pontos marker‐pozíció kattintásra az InteractiveRpgMap-hez (Shift+Click) – extra paramokkal
 * @author Soczó
 *
 * @param MarkerType
 * @text Marker típus
 * @type select
 * @option Triangle
 * @option Diamond
 * @option Circle
 * @option Dot
 * @option Custom
 * @default Circle
 *
 * @param CustomMarkerImage
 * @text Egyedi marker kép
 * @desc Ha MarkerType=Custom, itt add meg a img/system mappában lévő fájl nevét (kiterjesztés nélkül)
 * @default
 *
 * @param MarkerSize
 * @text Marker mérete (px)
 * @type number
 * @min 8
 * @max 128
 * @default 16
 *
 * @param MarkerColor
 * @text Marker szín (ha nem Custom)
 * @default #ff4444
 *
 * @help
 *  • Shift+Click a térképen üres pontra a marker létrehozásához.
 *  • A marker pontosan ott ugrik fel.
 *  • Utána beviteli ablak, Enter → címke.
 *  • Mentéskor/betöltéskor megmarad.
 *  • Core ≥ 1.4.1
 */
(() => {
  "use strict";

  const PLUGIN = "InteractiveRpgMapUserMarkers";
  const params = PluginManager.parameters(PLUGIN);
  const controlsParams =
    PluginManager.parameters("InteractiveRpgMapControls") || {};
  const modifierKeyName = (
    controlsParams.markerModifierKey || "shift"
  ).toLowerCase();

  // ── 1) Input ablak ──
  function Window_KeyInput() {
    this.initialize.apply(this, arguments);
  }
  Window_KeyInput.prototype = Object.create(Window_Base.prototype);
  Window_KeyInput.prototype.constructor = Window_KeyInput;
  Window_KeyInput.prototype.initialize = function (opt) {
    this._typeText = "";
    this._placeholder = opt.placeholder || "";
    this._maxChar = Number(opt.max_characters || 32);
    Window_Base.prototype.initialize.call(this, 0, 0, 1, 1);
    this.openness = 0;
    const dummy = "A".repeat(this._maxChar);
    this.width = this.textWidth(dummy) + this.standardPadding() * 2;
    this.height = this.fittingHeight(1);
    this.createContents();
    this.opacity = opt.opacity != null ? Number(opt.opacity) : 255;
    this.refresh();
  };
  Window_KeyInput.prototype.refresh = function () {
    this.contents.clear();
    if (this._typeText) {
      this.drawText(this._typeText, 0, 0, this.contents.width, "left");
    } else if (this._placeholder) {
      this.contents.paintOpacity = 160;
      this.drawText(this._placeholder, 0, 0, this.contents.width, "left");
      this.contents.paintOpacity = 255;
    }
  };

  // ── 2) MarkerSprite + STORE ──
  const markerSize = Number(params.MarkerSize || 16);
  const markerColor = params.MarkerColor || "#ff4444";
  const STORE = {}; // STORE[mapId] = [ {imgX,imgY,x,y,label}, ... ]

  function MarkerSprite(rec, scene) {
    Sprite.call(this, new Bitmap(markerSize, markerSize));
    this.anchor.set(0.5);
    this.bitmap.drawCircle(
      markerSize / 2,
      markerSize / 2,
      markerSize / 2,
      markerColor
    );
    this._rec = rec;
    this._scene = scene;
    this._buildLabel();

    this.interactive = this.buttonMode = true;
    this.hitArea = new PIXI.Circle(0, 0, markerSize / 2);
    this.on("pointertap", () => (this._lbl.visible = !this._lbl.visible));

    this._refresh = this._updatePos.bind(this);
    IRMap.on("camera-changed", this._refresh);
    IRMap.on("update-tick", this._refresh);
    this._updatePos();
  }
  MarkerSprite.prototype = Object.create(Sprite.prototype);
  MarkerSprite.prototype.constructor = MarkerSprite;
  MarkerSprite.prototype._buildLabel = function () {
    if (this._lbl && this._lbl.parent) this.removeChild(this._lbl);
    const bmp = new Bitmap(128, 24);
    bmp.fontSize = 18;
    bmp.textColor = "#ffffff";
    bmp.outlineColor = "rgba(0,0,0,0.6)";
    bmp.outlineWidth = 3;
    bmp.drawText(this._rec.label || "", 0, 0, 128, 24, "center");
    this._lbl = new Sprite(bmp);
    this._lbl.anchor.set(0.5, 0);
    this._lbl.y = markerSize / 2 + 4;
    this._lbl.visible = !!this._rec.label;
    this.addChild(this._lbl);
  };
  MarkerSprite.prototype.setLabel = function (txt) {
    this._rec.label = txt;
    this._buildLabel();
  };
  MarkerSprite.prototype._updatePos = function () {
    const win = this._scene.mapWindow();
    if (!win) return;
    const scr = IRMap.imageToWindow(this._rec.imgX, this._rec.imgY, win);
    if (!scr) {
      this.visible = false;
      return;
    }
    this.visible = true;
    this.x = scr.x - win.x;
    this.y = scr.y - win.y;
  };
  MarkerSprite.prototype.dispose = function () {
    IRMap.off("camera-changed", this._refresh);
    IRMap.off("update-tick", this._refresh);
    if (this.parent) this.parent.removeChild(this);
  };

  // ── 3) Scene-ready & map-switched ──
  IRMap.on("scene-ready", ({ scene, cfg }) => {
    if (!scene.mapWindow) return;

    // melyik mapId-hez kötünk most mindent?
    let activeMapId = Number(cfg && cfg.mapId);

    // build a userMarkerLayer
    if (!scene._userMarkerLayer) {
      scene._userMarkerLayer = new Sprite();
      scene.mapWindow().addChild(scene._userMarkerLayer);
    }

    // helper: kirajzolás az épp aktív mapId-hez
    const rebuild = () => {
      scene._userMarkerLayer.removeChildren();
      (STORE[activeMapId] || []).forEach((rec) => {
        scene._userMarkerLayer.addChild(new MarkerSprite(rec, scene));
      });
    };
    rebuild();

    // ha a core-on belül dinamikusan váltunk térképet:
    IRMap.on("map-switched", ({ scene: sc2, to }) => {
      if (sc2 !== scene) return;
      activeMapId = Number(to);
      rebuild();
    });

    // Shift+click lehelyezés
    IRMap.off("empty-click");
    IRMap.on("empty-click", () => {
      if (!Input.isPressed("modifier")) return;

      // előző popup cleanup
      if (scene._lastKb) {
        document.body.removeEventListener("keydown", scene._lastKb._onKey);
        scene.removeChild(scene._lastKb);
        scene._lastKb = null;
      }

      const winMap = scene.mapWindow();
      const imgP = IRMap.screenToImage(TouchInput.x, TouchInput.y, winMap);
      if (!imgP) return;
      const tile = IRMap.imageToWorld(imgP.imgX, imgP.imgY, null, true);
      if (!tile) return;

      // itt már a **activeMapId** kulcsot használjuk
      const rec = {
        imgX: imgP.imgX,
        imgY: imgP.imgY,
        x: tile.tx,
        y: tile.ty,
        label: "",
      };
      STORE[activeMapId] = STORE[activeMapId] || [];
      STORE[activeMapId].push(rec);

      const ms = new MarkerSprite(rec, scene);
      scene._userMarkerLayer.addChild(ms);

      // bevitel
      const kb = new Window_KeyInput({
        placeholder: "Címke…",
        max_characters: 32,
        opacity: 255,
      });
      const absX = winMap.x + ms.x;
      const absY = winMap.y + ms.y;
      kb.x = Math.round(absX - kb.width / 2);
      kb.y = Math.round(absY - kb.height - 4);
      scene.addChild(kb);
      kb.open();
      scene._lastKb = kb;

      const onKey = (ev) => {
        const c = ev.which;
        if ([37, 38, 39, 40].includes(c)) return;
        if ([8, 46].includes(c)) {
          SoundManager.playCancel();
          kb._typeText = kb._typeText.slice(0, -1);
          kb.refresh();
          ev.preventDefault();
          return;
        }
        if (c === 13) {
          SoundManager.playOk();
          kb.close();
          const done = () => {
            if (kb.openness > 0) return requestAnimationFrame(done);
            document.body.removeEventListener("keydown", onKey);
            scene.removeChild(kb);
            scene._lastKb = null;
            const txt = kb._typeText.trim().slice(0, 32);
            if (txt) {
              ms.setLabel(txt);
            } else {
              // törlés
              scene._userMarkerLayer.removeChild(ms);
              STORE[activeMapId] = STORE[activeMapId].filter((x) => x !== rec);
            }
          };
          requestAnimationFrame(done);
          ev.preventDefault();
        }
        const ch = ev.key;
        if (ch.length === 1 && kb._typeText.length < kb._maxChar) {
          SoundManager.playCursor();
          kb._typeText += ch;
          kb.refresh();
        }
        ev.preventDefault();
      };
      kb._onKey = onKey;
      document.body.addEventListener("keydown", onKey);
    });
  });

  // ── 4) Save/Load ──
  const _dm1 = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const c = _dm1.call(this);
    c._userMarkers = STORE;
    return c;
  };
  const _dm2 = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _dm2.call(this, contents);
    if (contents._userMarkers) {
      Object.keys(contents._userMarkers).forEach((m) => {
        STORE[m] = contents._userMarkers[m];
      });
    }
  };

  console.log("[UserMarkers] v1.5+ pontosítás betöltve");
})();

/*:
 * @plugindesc v1.10 User Markers – precise position (Shift+Click), empty label saving, DEL delete, px scaling, ESC cancel, blink, layer & map-switch fixes + initial enable & note disable + plugin commands
 * @author Soczó
 *
 * @param MarkerType
 * @text Marker Type
 * @type select
 * @option Triangle
 * @option Diamond
 * @option Circle
 * @option Dot
 * @option Custom
 * @default Circle
 * @desc Shape used for markers (when not using a custom image).
 *
 * @param CustomMarkerImage
 * @text Custom Marker IMG
 * @type file
 * @dir img/system
 * @require 1
 * @desc If MarkerType = Custom: filename inside img/system (extension optional).
 * @default
 *
 * @param MarkerSize
 * @text Marker Size (px)
 * @type number
 * @min 8
 * @max 256
 * @default 16
 * @desc Marker visual size in pixels. For custom images the longer side is scaled to this value.
 *
 * @param MarkerColor
 * @text Marker Color (if no custom)
 * @default #ff4444
 * @desc Fill color for non-custom marker shapes (hex).
 *
 * @param Initial enable
 * @text Initial enable
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @desc If true, marker create/edit/delete is enabled by default. Can be overridden by plugin commands and is saved/loaded.
 * @default true
 *
 * @param Disable Note
 * @text Disable Note
 * @type boolean
 * @on Notes disabled
 * @off Notes enabled
 * @desc If true, markers can be placed but labels (notes) cannot be created/edited. Can be overridden by commands and is saved/loaded.
 * @default false
 *
 * @param Marker Consumable
 * @text Marker Consumable
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @default false
 * @desc If enabled AND a Required Item is set, each marker placement consumes 1 of that item.
 *
 * @param Required Item
 * @text Required Item
 * @type item
 * @desc The item required (and consumed) per marker placement when consumables are enabled.
 *
 * @param Fallback Message
 * @text Fallback Message
 * @type string
 * @default
 * @desc Message shown if the player lacks the required item. If empty: no message, just no placement. If shown, the map will close first.
 *
 *
 * @help
 *  • Shift+Click on empty spot → create marker at precise position.
 *  • Shift+Click near an existing marker → select (blink) and edit label (no duplicate).
 *  • Enter: save. Empty label allowed → marker REMAINS without a label.
 *  • ESC: cancel new marker (deletes it) or close editing.
 *  • DEL (bind via the Controls plugin): deletes the selected marker (only if marker feature is enabled).
 *  • While the input is active, all game keys (e.g., M) are blocked from reaching the game.
 *  • With a custom image, MarkerSize sets the longer side (aspect ratio preserved).
 *  • Markers live on the map’s ._markerLayer in their own sub-layer → drawn below POI UI windows.
 *  • Markers persist across save/load (bound to mapId) and are rebuilt on map switch.
 *  • Core ≥ 1.4.1
 *
 *  NEW settings (save-compatible):
 *   - Initial enable: initial on/off for create/edit/delete. Overridable via commands.
 *   - Disable Note: when on, label writing/editing is disabled. Overridable via commands.
 *
 *  Plugin commands (MV):
 *   EnableMarker         → enables the marker feature (create/edit/delete)
 *   DisableMarker        → disables marker placement AND editing (DEL delete also disabled)
 *   DeleteAllMarker      → deletes ALL markers on ALL maps (runtime + saved state)
 *   EnableMarkerNote     → enables label (note) writing/editing
 *   DisableMarkerNote    → disables label (note) writing/editing
 *
 *  Note:
 *   – Command states are saved and remain in effect after loading.
 *
 *  Further info: https://github.com/Lonsdale201/rpgmakermyplugins/wiki/Interactive-Map-User-Markers
 */

(() => {
  "use strict";

  // ───────────────────────────── Plugin + Paramok ─────────────────────────────
  const PLUGIN = (function () {
    try {
      return (
        (document.currentScript &&
          document.currentScript.src.split("/").pop()) ||
        "UserMarkers"
      ).replace(/\.js$/i, "");
    } catch (_) {
      return "UserMarkers";
    }
  })();

  const params = PluginManager.parameters(PLUGIN);

  const MarkerType = String(params.MarkerType || "Circle").toLowerCase();
  const MarkerSize = Number(params.MarkerSize || 16);
  const MarkerColor = String(params.MarkerColor || "#ff4444");

  // file-param csupaszítás
  const CustomMarkerImageRaw = String(params.CustomMarkerImage || "").trim();
  const CustomMarkerImageBase = CustomMarkerImageRaw.replace(
    /^img[\/\\]system[\/\\]/i,
    ""
  ).replace(/\.(png|jpe?g|bmp|gif)$/i, "");

  const InitialEnable =
    String(params["Initial enable"]).toLowerCase() !== "false"; // default true
  const DisableNoteParam =
    String(params["Disable Note"]).toLowerCase() === "true"; // default false

  const STORE = {};

  const SETTINGS = {
    enabled: InitialEnable,
    notesEnabled: !DisableNoteParam,
  };

  const ConsumableEnabled =
    String(params["Marker Consumable"]).toLowerCase() === "true";

  const RequiredItemId = Number(params["Required Item"] || 0);

  const FallbackMessage = String(params["Fallback Message"] || "");

  const setEnabled = (flag) => {
    SETTINGS.enabled = !!flag;
    // Ha épp inputban vagyunk és letiltunk → zárjuk be
    const sc = window.IRMap && IRMap.currentScene && IRMap.currentScene();
    if (
      !SETTINGS.enabled &&
      sc &&
      sc._activeMarkerInput &&
      sc._activeMarkerInput.kb
    ) {
      try {
        sc._activeMarkerInput.kb._close(false);
      } catch (_) {}
      sc._activeMarkerInput = null;
      sc._selectedMarker = null;
    }
    console.log(
      "[UserMarkers] markers",
      SETTINGS.enabled ? "ENABLED" : "DISABLED"
    );
  };

  const setNotesEnabled = (flag) => {
    SETTINGS.notesEnabled = !!flag;
    // Ha épp címkeszerkesztés megy és letiltjuk → zárjuk be inputot
    const sc = window.IRMap && IRMap.currentScene && IRMap.currentScene();
    if (
      !SETTINGS.notesEnabled &&
      sc &&
      sc._activeMarkerInput &&
      sc._activeMarkerInput.kb
    ) {
      try {
        sc._activeMarkerInput.kb._close(false);
      } catch (_) {}
      sc._activeMarkerInput = null;
    }
    console.log(
      "[UserMarkers] notes",
      SETTINGS.notesEnabled ? "ENABLED" : "DISABLED"
    );
  };

  const deleteAllMarkers = () => {
    // töröljük a runtime sprite-okat az aktív jelenetről is
    const sc = window.IRMap && IRMap.currentScene && IRMap.currentScene();
    if (sc && sc.mapWindow) {
      const win = sc.mapWindow();
      const layer = win && win._userMarkerSubLayer;
      if (layer)
        layer.children.slice().forEach((ch) => ch.dispose && ch.dispose());
      sc._selectedMarker = null;
      if (sc._activeMarkerInput && sc._activeMarkerInput.kb) {
        try {
          sc._activeMarkerInput.kb._close(false);
        } catch (_) {}
        sc._activeMarkerInput = null;
      }
    }
    // clear STORE
    Object.keys(STORE).forEach((k) => {
      const arr = STORE[k];
      if (Array.isArray(arr)) {
        arr.forEach(
          (rec) => rec._spr && rec._spr.dispose && rec._spr.dispose()
        );
      }
      STORE[k] = [];
    });
    console.log("[UserMarkers] All markers deleted across ALL maps");
  };

  // ─────────────────────────── Map + helper függvények ───────────────────────
  const mapIdFromCfg = (cfg) => {
    if (!cfg) return 0;
    if (cfg.mapId) return Number(cfg.mapId) || 0;
    if (cfg.editorMapName && window.IRMap && IRMap.findMapIdByEditorName) {
      return IRMap.findMapIdByEditorName(String(cfg.editorMapName)) || 0;
    }
    return 0;
  };
  const normalizeToMapId = (to, scene) => {
    if (typeof to === "number") return to || 0;
    if (typeof to === "string") {
      const n = Number(to);
      if (n > 0) return n;
      if (window.IRMap && IRMap.findMapIdByEditorName) {
        const id = IRMap.findMapIdByEditorName(to.trim());
        if (id) return id;
      }
    }
    try {
      return mapIdFromCfg(scene && scene.mapConfig && scene.mapConfig());
    } catch (_) {
      return 0;
    }
  };
  const getActiveSceneMapId = (scene) =>
    mapIdFromCfg(scene && scene.mapConfig && scene.mapConfig());

  const isModifierDown = () =>
    Input.isPressed("modifier") || Input.isPressed("shift");

  function getRequiredItem() {
    try {
      if (RequiredItemId > 0 && $dataItems && $dataItems[RequiredItemId]) {
        return $dataItems[RequiredItemId];
      }
    } catch (_) {}
    return null;
  }

  function requestCloseMap() {
    try {
      if (window.IRMap) {
        if (IRMap.requestClose) return IRMap.requestClose();
        if (IRMap.close) return IRMap.close();
        const sc = IRMap.currentScene && IRMap.currentScene();
        if (sc) {
          if (typeof sc._commandBack === "function") return sc._commandBack();
          if (typeof sc.commandBack === "function") return sc.commandBack();
        }
      }
      if (window.SceneManager && SceneManager.pop) {
        SceneManager.pop();
      }
    } catch (_) {}
  }

  function closeMapAndShowMessage(text) {
    try {
      requestCloseMap();
      setTimeout(() => {
        try {
          if (text) $gameMessage.add(text);
          SoundManager.playBuzzer();
        } catch (_) {}
      }, 0);
    } catch (_) {}
  }

  function canPlaceWithConsumable() {
    if (!ConsumableEnabled) return true;
    const item = getRequiredItem();
    if (!item) return true;

    const have =
      window.$gameParty && $gameParty.numItems(item)
        ? $gameParty.numItems(item)
        : 0;
    if (have > 0) return true;

    if (FallbackMessage) {
      closeMapAndShowMessage(FallbackMessage);
    }
    return false;
  }

  function consumeAfterCommit() {
    if (!ConsumableEnabled) return;
    const item = getRequiredItem();
    if (!item) return;
    try {
      $gameParty.loseItem(item, 1, false);
    } catch (_) {}
  }

  // ───────────────────────────── 1) Input ablak ──────────────────────────────
  function Window_KeyInput() {
    this.initialize.apply(this, arguments);
  }
  Window_KeyInput.prototype = Object.create(Window_Base.prototype);
  Window_KeyInput.prototype.constructor = Window_KeyInput;
  Window_KeyInput.prototype.initialize = function (opt) {
    this._typeText = opt.initial_text || "";
    this._placeholder = opt.placeholder || "";
    this._maxChar = Number(opt.max_characters || 32);
    this._onDone = opt.onDone || function () {};
    this._onCancel = opt.onCancel || function () {};
    Window_Base.prototype.initialize.call(this, 0, 0, 1, 1);
    this.openness = 0;
    const dummy = "A".repeat(this._maxChar);
    this.width = this.textWidth(dummy) + this.standardPadding() * 2;
    this.height = this.fittingHeight(1);
    this.createContents();
    this.opacity = opt.opacity != null ? Number(opt.opacity) : 255;
    this.refresh();
    this._bind();
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
  Window_KeyInput.prototype._bind = function () {
    const kb = this;

    this._onKey = function (ev) {
      const c = ev.which || ev.keyCode;

      const stopAll = () => {
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        ev.preventDefault();
      };

      // --- Kijelölt marker törlése input közben, ha engedélyezett a marker funkció ---
      if (
        Input &&
        Input.keyMapper &&
        Input.keyMapper[c] === "markerDelete" &&
        SETTINGS.enabled
      ) {
        const sc = IRMap.currentScene && IRMap.currentScene();
        if (sc && sc._activeMarkerInput && sc._activeMarkerInput.kb === kb) {
          const st = sc._activeMarkerInput;

          // active map id from the same scene
          const effMapId =
            (function () {
              try {
                return (sc.mapConfig && sc.mapConfig().mapId | 0) || 0;
              } catch (_) {
                return 0;
              }
            })() || 0;

          const arr = (STORE[effMapId] = STORE[effMapId] || []);
          const i = arr.indexOf(st.rec);
          if (i >= 0) arr.splice(i, 1);
          if (st.spr && st.spr.dispose) st.spr.dispose();

          sc._selectedMarker = null;
          sc._activeMarkerInput = null;

          // close editor without committing text
          kb._close(false);
          SoundManager.playCancel();

          stopAll();
          return;
        }
      }
      // ------------------------------------------------------------------------

      // Arrow keys → swallow
      if ([37, 38, 39, 40].includes(c)) {
        stopAll();
        return;
      }

      // Backspace/Delete → edit text (character delete)
      if ([8, 46].includes(c)) {
        SoundManager.playCancel();
        kb._typeText = kb._typeText.slice(0, -1);
        kb.refresh();
        stopAll();
        return;
      }

      // ESC → cancel/close
      if (c === 27) {
        SoundManager.playCancel();
        kb._close(false);
        stopAll();
        return;
      }

      // Enter → commit/close
      if (c === 13) {
        SoundManager.playOk();
        kb._close(true);
        stopAll();
        return;
      }

      // Typeable char
      const ch = ev.key;
      if (ch && ch.length === 1 && kb._typeText.length < kb._maxChar) {
        SoundManager.playCursor();
        kb._typeText += ch;
        kb.refresh();
        stopAll();
        return;
      }

      // Swallow everything else while editor is open
      stopAll();
    };

    // capture phase: make sure we intercept before the engine/game
    document.addEventListener("keydown", this._onKey, true);
  };

  Window_KeyInput.prototype._close = function (commit) {
    const kb = this;
    const done = () => {
      if (kb.openness > 0) return requestAnimationFrame(done);
      document.removeEventListener("keydown", kb._onKey, true);
      if (kb.parent) kb.parent.removeChild(kb);
      if (commit) kb._onDone(kb._typeText.trim().slice(0, kb._maxChar));
      else kb._onCancel();
    };
    this.close();
    requestAnimationFrame(done);
  };

  // ─────────────────────────── 2) MarkerSprite ───────────────────────────────
  function MarkerSprite(rec, scene) {
    PIXI.Container.call(this);
    this._rec = rec;
    this._scene = scene;

    this.interactive = this.buttonMode = true;
    this.hitArea = new PIXI.Circle(0, 0, Math.max(8, MarkerSize) / 2);

    if (MarkerType === "custom" && CustomMarkerImageBase) {
      const texPath = `img/system/${CustomMarkerImageBase}.png`;
      const tex = PIXI.Texture.fromImage(texPath);
      const sp = new PIXI.Sprite(tex);
      sp.anchor.set(0.5);
      sp.tint = 0xffffff;
      sp.alpha = 0;
      sp.visible = false;
      sp.blendMode = PIXI.BLEND_MODES.NORMAL;
      sp.filters = null;
      const applyScale = () => {
        const w = tex.width,
          h = tex.height;
        const s = MarkerSize / Math.max(w, h);
        sp.scale.set(s);
        this.hitArea = new PIXI.Circle(0, 0, (Math.max(w, h) * s) / 2);
        sp.alpha = 1;
        sp.visible = true;
      };
      if (tex.baseTexture.hasLoaded) applyScale();
      else tex.baseTexture.once("loaded", applyScale);
      this._shape = sp;
    } else {
      const g = new PIXI.Graphics();
      g.beginFill(parseInt(MarkerColor.replace(/^#/, ""), 16));
      switch (MarkerType) {
        case "triangle":
          g.drawPolygon([
            0,
            -MarkerSize / 2,
            MarkerSize / 2,
            MarkerSize / 2,
            -MarkerSize / 2,
            MarkerSize / 2,
          ]);
          break;
        case "diamond":
          g.drawPolygon([
            0,
            -MarkerSize / 2,
            MarkerSize / 2,
            0,
            0,
            MarkerSize / 2,
            -MarkerSize / 2,
            0,
          ]);
          break;
        case "dot":
          g.drawCircle(0, 0, MarkerSize / 4);
          break;
        case "circle":
        default:
          g.drawCircle(0, 0, MarkerSize / 2);
          break;
      }
      g.endFill();
      this._shape = g;
    }
    this.alpha = 1.0;
    this.blendMode = PIXI.BLEND_MODES.NORMAL;
    this.filters = null;

    this.addChild(this._shape);
    this._buildLabel();

    // label láthatóság toggler (nem kötelező címke!)
    this.on("pointertap", () => {
      if (this._scene._activeMarkerInput) return;
      if (this._lbl) this._lbl.visible = !this._lbl.visible;
      // jelöltté tesszük kattintáskor is (kényelmesebb DEL-hez)
      this._scene._selectedMarker = this._rec;
    });

    this._refresh = this._updateLoop.bind(this);
    IRMap.on("camera-changed", this._refresh);
    IRMap.on("update-tick", this._refresh);
    this._blinkUntil = 0;
    this._updateLoop();
  }
  MarkerSprite.prototype = Object.create(PIXI.Container.prototype);
  MarkerSprite.prototype.constructor = MarkerSprite;
  MarkerSprite.prototype._halfVisualSize = function () {
    if (this._shape && this._shape.texture)
      return (this._shape.height || MarkerSize) / 2;
    return MarkerSize / 2;
  };
  MarkerSprite.prototype._buildLabel = function () {
    if (this._lbl && this._lbl.parent) this.removeChild(this._lbl);
    const bmp = new Bitmap(160, 24);
    bmp.fontSize = 18;
    bmp.textColor = "#ffffff";
    bmp.outlineColor = "rgba(0,0,0,0.6)";
    bmp.outlineWidth = 3;
    bmp.drawText(this._rec.label || "", 0, 0, 160, 24, "center");
    const sp = new Sprite(bmp);
    sp.anchor.set(0.5, 0);
    sp.y = this._halfVisualSize() + 4;
    sp.visible = !!(this._rec.label && this._rec.label.length);
    this._lbl = sp;
    this.addChild(sp);
  };
  MarkerSprite.prototype.setLabel = function (txt) {
    this._rec.label = txt || "";
    this._buildLabel();
  };
  MarkerSprite.prototype._updateLoop = function () {
    const sc = this._scene;
    const win = sc && sc.mapWindow && sc.mapWindow();
    if (!win) return;

    const scr = IRMap.imageToWindow(this._rec.imgX, this._rec.imgY, win);
    if (!scr) {
      this.visible = false;
      return;
    }
    this.visible = true;

    this.x = Math.round(scr.x - (win.x + win.padding));
    this.y = Math.round(scr.y - (win.y + win.padding));
    if (this._lbl) this._lbl.y = this._halfVisualSize() + 4;

    if (Date.now() < (this._blinkUntil || 0)) {
      const t = Date.now() / 120;
      this.alpha = 0.55 + 0.45 * Math.abs(Math.sin(t));
    } else {
      this.alpha = 1.0;
    }
  };
  MarkerSprite.prototype.blink = function (ms = 600) {
    this._blinkUntil = Date.now() + ms;
  };
  MarkerSprite.prototype.dispose = function () {
    IRMap.off("camera-changed", this._refresh);
    IRMap.off("update-tick", this._refresh);
    if (this.parent) this.parent.removeChild(this);
  };

  // ─────────────── 3) Scene integration: réteg + események ───────────────
  IRMap.on("scene-ready", ({ scene }) => {
    if (!scene.mapWindow) return;
    let activeMapId = getActiveSceneMapId(scene);

    const win = scene.mapWindow();
    const ensureLayer = () => {
      if (!win._userMarkerSubLayer || !win._userMarkerSubLayer.parent) {
        const sub = new PIXI.Container();
        sub.filters = null;
        sub.alpha = 1.0;
        sub.blendMode = PIXI.BLEND_MODES.NORMAL;
        if (win._markerLayer) win._markerLayer.addChild(sub);
        else win.addChild(sub);
        win._userMarkerSubLayer = sub;
      }
      return win._userMarkerSubLayer;
    };
    const currentLayer = () => ensureLayer();

    // állapot
    scene._activeMarkerInput = null;
    scene._selectedMarker = null;

    function attachSprite(rec) {
      const layer = currentLayer();
      const ms = new MarkerSprite(rec, scene);
      layer.addChild(ms);
      rec._spr = ms;
      return ms;
    }

    const rebuild = () => {
      const layer = currentLayer();
      layer.removeChildren();
      const arr = (STORE[activeMapId] = STORE[activeMapId] || []);
      arr.forEach((rec) => attachSprite(rec));
    };

    STORE[activeMapId] = STORE[activeMapId] || [];
    rebuild();

    // --- hookok ---
    const onBitmapLoaded = ({ scene: sc2 }) => {
      if (sc2 !== scene) return;
      activeMapId = getActiveSceneMapId(scene);
      STORE[activeMapId] = STORE[activeMapId] || [];
      rebuild();
      cancelActiveInput(false);
      scene._selectedMarker = null;
    };

    const onMapSwitched = ({ scene: sc2, to }) => {
      if (sc2 !== scene) return;
      const newId = normalizeToMapId(to, scene);
      if (newId && newId !== activeMapId) activeMapId = newId;
      STORE[activeMapId] = STORE[activeMapId] || [];
      rebuild();
      cancelActiveInput(false);
      scene._selectedMarker = null;
    };

    const onPoiClick = () => cancelActiveInput(false);

    const onEmptyClick = () => {
      // input alatt → ESC-hez hasonló bezárás, ha nincs modifier
      if (scene._activeMarkerInput && !isModifierDown()) {
        cancelActiveInput(false);
        return;
      }
      if (!isModifierDown()) return;

      if (!SETTINGS.enabled) return;

      const imgP = IRMap.screenToImage(TouchInput.x, TouchInput.y, win);
      if (!imgP) return;

      const near = findNearestMarker(
        TouchInput.x,
        TouchInput.y,
        Math.max(12, MarkerSize)
      );
      if (near) {
        const spr = near._spr || attachSprite(near);
        spr.blink(700);
        scene._selectedMarker = near; // kijelölés
        // Jegyzet tiltott? → ne nyissunk inputot
        if (!SETTINGS.notesEnabled) return;
        openInput("edit", near, spr);
        return;
      }

      if (!canPlaceWithConsumable()) {
        return;
      }

      const tile = IRMap.imageToWorld(imgP.imgX, imgP.imgY, null, true);
      if (!tile) return;

      const rec = {
        imgX: imgP.imgX,
        imgY: imgP.imgY,
        x: tile.tx,
        y: tile.ty,
        label: "",
      };
      const arr = (STORE[activeMapId] = STORE[activeMapId] || []);
      arr.push(rec);
      const spr = attachSprite(rec);
      scene._selectedMarker = rec;

      if (!SETTINGS.notesEnabled) {
        consumeAfterCommit();
        return;
      }

      openInput("new", rec, spr);
    };

    IRMap.on("bitmap-loaded", onBitmapLoaded);
    IRMap.on("map-switched", onMapSwitched);
    IRMap.on("poi-click", onPoiClick);
    IRMap.on("empty-click", onEmptyClick);

    const onSceneClose = ({ scene: sc2 }) => {
      if (sc2 !== scene) return;
      IRMap.off("bitmap-loaded", onBitmapLoaded);
      IRMap.off("map-switched", onMapSwitched);
      IRMap.off("poi-click", onPoiClick);
      IRMap.off("empty-click", onEmptyClick);
      IRMap.off("scene-close", onSceneClose);
      cancelActiveInput(false);
      const layer = win._userMarkerSubLayer;
      if (layer)
        layer.children.slice().forEach((ch) => ch.dispose && ch.dispose());
      scene._selectedMarker = null;
    };
    IRMap.on("scene-close", onSceneClose);

    // helpers
    function findNearestMarker(scrX, scrY, maxR) {
      const recs = STORE[activeMapId] || [];
      let best = null,
        bestD2 = maxR * maxR;
      for (const rec of recs) {
        const p = IRMap.imageToWindow(rec.imgX, rec.imgY, win);
        if (!p) continue;
        const dx = p.x - scrX,
          dy = p.y - scrY;
        const d2 = dx * dx + dy * dy;
        if (d2 <= bestD2) {
          bestD2 = d2;
          best = rec;
        }
      }
      return best;
    }

    function deleteSelectedMarker() {
      if (!SETTINGS.enabled) return;
      const rec = scene._selectedMarker;
      if (!rec) return;
      const arr = STORE[activeMapId] || [];
      const idx = arr.indexOf(rec);
      if (idx >= 0) arr.splice(idx, 1);
      if (rec._spr && rec._spr.dispose) rec._spr.dispose();
      scene._selectedMarker = null;
      SoundManager.playCancel();
    }

    function openInput(mode, rec, spr) {
      cancelActiveInput(false);
      const scr = IRMap.imageToWindow(rec.imgX, rec.imgY, win);
      const kb = new Window_KeyInput({
        placeholder: "Label…",
        max_characters: 32,
        opacity: 255,
        initial_text: mode === "edit" ? rec.label || "" : "",
        onDone: (val) => {
          scene._activeMarkerInput = null;
          spr.setLabel(val || "");
          if (mode === "new") {
            consumeAfterCommit();
          }
        },
        onCancel: () => {
          scene._activeMarkerInput = null;
          if (mode === "new") {
            const arr = STORE[activeMapId];
            const idx = arr.indexOf(rec);
            if (idx >= 0) arr.splice(idx, 1);
            if (spr.parent) spr.parent.removeChild(spr);
            scene._selectedMarker = null;
          }
        },
      });
      kb.x = Math.round(scr.x - kb.width / 2);
      kb.y = Math.round(scr.y - kb.height - 4);

      kb._openedAtFrame = Graphics.frameCount;

      scene.addChild(kb);
      kb.open();
      scene._activeMarkerInput = { kb, mode, rec, spr };
    }

    function cancelActiveInput() {
      const st = scene._activeMarkerInput;
      if (!st) return;
      if (st.kb && st.kb._close) st.kb._close(false);
      scene._activeMarkerInput = null;
    }

    const _update = scene.update;
    scene.update = function () {
      _update.call(this);

      if (scene._activeMarkerInput) {
        const st = scene._activeMarkerInput;
        const guard = Graphics.frameCount <= (st.kb._openedAtFrame || 0) + 1;
        if (!guard && TouchInput.isTriggered() && !isModifierDown()) {
          const px = TouchInput.x,
            py = TouchInput.y;
          const insideKb =
            px >= st.kb.x &&
            px < st.kb.x + st.kb.width &&
            py >= st.kb.y &&
            py < st.kb.y + st.kb.height;

          if (!insideKb) {
            st.kb._close(false); // ESC-szerű bezárás
            scene._activeMarkerInput = null;
          }
        }
      }

      if (Input.isTriggered("markerDelete") && !scene._activeMarkerInput) {
        deleteSelectedMarker();
      }
    };
  });

  // ─────────────────────────── 4) Save/Load ──────────────────────────
  const _dm1 = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const c = _dm1.call(this);
    const cleanStore = {};
    Object.keys(STORE).forEach((k) => {
      cleanStore[k] = (STORE[k] || []).map(({ _spr, ...rest }) => rest);
    });
    c._userMarkers = cleanStore;
    c._userMarkersSettings = {
      enabled: !!SETTINGS.enabled,
      notesEnabled: !!SETTINGS.notesEnabled,
    };
    return c;
  };
  const _dm2 = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _dm2.call(this, contents);
    if (contents._userMarkers) {
      Object.keys(contents._userMarkers).forEach((m) => {
        const id = Number(m) || 0;
        STORE[id] = (contents._userMarkers[m] || []).map((rec) => ({
          ...rec,
          _spr: null,
        }));
      });
    }
    if (contents._userMarkersSettings) {
      SETTINGS.enabled =
        contents._userMarkersSettings.enabled != null
          ? !!contents._userMarkersSettings.enabled
          : SETTINGS.enabled;
      SETTINGS.notesEnabled =
        contents._userMarkersSettings.notesEnabled != null
          ? !!contents._userMarkersSettings.notesEnabled
          : SETTINGS.notesEnabled;
    }
  };

  // ─────────────────────────── 5) Plugin commands ──────────────────────
  const _oldPluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _oldPluginCommand.call(this, command, args);
    const cmd = (command || "").toLowerCase();

    switch (cmd) {
      case "enablemarker":
        setEnabled(true);
        break;
      case "disablemarker":
        setEnabled(false);
        break;
      case "enablemarkernote":
        setNotesEnabled(true);
        break;
      case "disablemarkernote":
        setNotesEnabled(false);
        break;
      case "deleteallmarker":
        deleteAllMarkers();
        break;
    }
  };

  // ─────────────────────────── 6) Log ─────────────────────────────────
  console.log(
    `[UserMarkers] v1.10 – initial enable=${SETTINGS.enabled}, notes=${
      SETTINGS.notesEnabled ? "EN" : "DIS"
    } – empty-label save, selection + DEL delete (guarded), stable layers & rebuild, plugin commands ready`
  );
})();

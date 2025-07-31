/*:
 * @plugindesc InteractiveMapManager – központi interakció‑kezelő az InteractiveRpgMap + Elements pluginokhoz
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.3
 * @help
 *  Nincs plugin‑paraméter. Az Elements által kilőtt eseményekre reagál:
 *    - poi-open-related: kapcsolódó térkép betöltése ugyanabba a Map ablakba (history push)
 *    - poi-teleport: (később) teleport kezelés
 *    - poi-option: opciók központi kezelése (példa)
 *  Tipp: az InteractiveRpgMapControls pluginban kösd a Backspace-t a "mapBack" akcióra.
 */
(() => {
  "use strict";
  const PLG = "InteractiveMapManager";

  // --- IME busz biztos készenléte ---
  function onImeReadyOnce(fn) {
    if (window.IME && typeof IME.on === "function") return fn();
    const tryLater = () => {
      if (window.IME && typeof IME.on === "function") {
        SceneManager._scene &&
          SceneManager._scene.off &&
          SceneManager._scene.off("update", tryLater);
        fn();
      }
    };
    const _update = Scene_Boot.prototype.update;
    Scene_Boot.prototype.update = function () {
      _update.call(this);
      tryLater();
    };
  }
  function safeOnIME(evt, handler) {
    onImeReadyOnce(() => {
      IME.on(evt, (payload) => {
        try {
          handler(payload);
        } catch (e) {
          console.error(`[${PLG}] handler error for ${evt}`, e);
        }
      });
    });
  }

  function resolveMapId(token) {
    if (!token) return 0;
    const t = String(token).trim();
    // "#12" vagy "12" → ID
    const mId = t.match(/^#?(\d+)$/);
    if (mId) return Number(mId[1]);
    // Egyébként editor‑név (pl. "MAP002", "Town Center", stb.)
    return window.IRMap && IRMap.findMapIdByEditorName
      ? IRMap.findMapIdByEditorName(t) || 0
      : 0;
  }

  function parseTeleportLocation(str) {
    if (!str) return null;
    const s = String(str).trim();
    const m = s.match(
      /^(.+?)\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*(?:\s+(Left|Right|Up|Down))?\s*$/i
    );
    if (!m) return null;

    const mapToken = m[1].trim();
    const x = Number(m[2]);
    const y = Number(m[3]);
    const dirWord = m[4] ? m[4].toLowerCase() : null;

    // resolve mapId
    const mapId = resolveMapId(mapToken);
    if (!mapId) return null;

    // map face word → RPG Maker iránykód
    const dirMap = { up: 8, right: 6, down: 2, left: 4 };
    const dir = dirWord && dirMap[dirWord] ? dirMap[dirWord] : null;

    return { mapId, x, y, dir, mapToken };
  }

  // --- Visszalépési history + Backspace figyelő (mapBack input akció) -----
  const NavHistory = (() => {
    const st = [];
    return {
      push(id) {
        if (id) st.push(id);
      },
      pop() {
        return st.pop();
      },
      clear() {
        st.length = 0;
      },
      get length() {
        return st.length;
      },
    };
  })();

  function _installBackWatcherOnce() {
    if (_installBackWatcherOnce._done) return;
    _installBackWatcherOnce._done = true;

    IRMap.on("update-tick", () => {
      // csak akkor reagáljunk, ha tényleg nyitva van a Map scene
      const sc = IRMap.currentScene && IRMap.currentScene();
      if (!sc) return;

      if (Input.isTriggered && Input.isTriggered("mapBack")) {
        const prev = NavHistory.pop();
        if (prev) IRMap.switchToMapById(prev);
        else if (SoundManager && SoundManager.playBuzzer)
          SoundManager.playBuzzer();
      }
    });
  }

  // --- Related map megnyitása ugyanabban a Map ablakban + history push -----
  safeOnIME("poi-open-related", ({ poi, mapId, mapName }) => {
    // ─── Helper: üzenet + azonnali Scene-zárás ─────────────────────
    function sayAndPop(text) {
      if (!text) return;
      try {
        const msg =
          Window_Base && Window_Base.prototype.convertEscapeCharacters
            ? Window_Base.prototype.convertEscapeCharacters.call(null, text)
            : text;
        $gameMessage.add(msg);
      } catch (_) {
        $gameMessage.add(String(text));
      }
      SoundManager && SoundManager.playBuzzer && SoundManager.playBuzzer();
      SceneManager.pop();
    }

    // ─── Cél-map ID feloldása (id vagy név) ─────────────────────────
    let id = Number(mapId || 0);
    if (!id && mapName && IRMap && IRMap.findMapIdByEditorName) {
      id = IRMap.findMapIdByEditorName(String(mapName).trim());
    }

    if (!id) {
      sayAndPop("Related map is not set for this element.");
      return;
    }
    if (!$dataMapInfos || !$dataMapInfos[id]) {
      sayAndPop("Related map not found: ID " + id);
      return;
    }

    // ─── Megjelenített térkép ID-je (history + leszármazott-check) ──
    let currentId = 0;
    try {
      const sc = IRMap.currentScene && IRMap.currentScene();
      const cfg = sc && sc.mapConfig && sc.mapConfig();
      if (cfg) {
        if (cfg.mapId) {
          currentId = Number(cfg.mapId); // új, ID-alapú
        } else if (cfg.editorMapName && IRMap.findMapIdByEditorName) {
          currentId = IRMap.findMapIdByEditorName(cfg.editorMapName) || 0; // visszamenőleges
        }
      }
    } catch (_) {
      /* ignore */
    }

    // ─── Leszármazott-ellenőrzés (bármely mélység) ──────────────────
    if (
      currentId && // van aktuális térkép
      !IRMap.getAncestorChain(id).includes(currentId) // currentId NEM ős
    ) {
      sayAndPop("This related map is not a descendant of the current map.");
      return;
    }

    // ─── Hozzáférési szabályok (core) ───────────────────────────────
    if (IRMap && IRMap.canOpenMap && !IRMap.canOpenMap(id)) {
      const failMsg =
        (IRMap.getOpenMapFailureMessage &&
          IRMap.getOpenMapFailureMessage(id)) ||
        "You cannot open this map.";
      sayAndPop(failMsg);
      return;
    }

    // ─── History push, csak ha tényleg váltunk ──────────────────────
    if (currentId && currentId !== id) NavHistory.push(currentId);

    _installBackWatcherOnce(); // Backspace figyelő egyszer kapcsol
    IRMap.switchToMapById(id); // térkép-váltás
  });

  // --- Teleport – placeholder ---
  safeOnIME("poi-teleport", ({ poi, location }) => {
    // ha esetleg target helyett location jön
    const specs = parseTeleportLocation(
      location || (poi && poi.teleportLocation) || ""
    );
    if (!specs) {
      $gameMessage.add("Invalid teleport location.");
      return;
    }
    const { mapId, x, y, dir } = specs;
    if (!$dataMapInfos[mapId]) {
      $gameMessage.add("Target map not found: " + specs.mapToken);
      return;
    }

    // Transfer vs. same‐map
    const same = $gameMap.mapId() === mapId;
    if (same) {
      $gamePlayer.locate(x, y);
      if (dir) $gamePlayer.setDirection(dir);
      SceneManager.pop(); // bezárjuk a térképet
    } else {
      // Ha definiálták a dir‑t, adjuk át
      const faceDir = dir != null ? dir : $gamePlayer.direction();
      $gamePlayer.reserveTransfer(mapId, x, y, faceDir);
      SceneManager.pop();
    }
  });

  safeOnIME("poi-run-common-event", ({ poi, commonEventId }) => {
    // ha nincs átadva, megpróbáljuk a POI-ból
    const id = Number(commonEventId || (poi && poi.callCommonEvent) || 0);

    // hiba helper: üzenet + azonnali pop
    function sayAndPop(text) {
      if (text) $gameMessage.add(String(text));
      SceneManager.pop(); // zárjuk a Map overlayt, hogy azonnal látszódjon bármi
    }

    if (!id) {
      sayAndPop("Common Event is not set for this element.");
      return;
    }
    if (!$dataCommonEvents || !$dataCommonEvents[id]) {
      sayAndPop("Common Event not found: ID " + id);
      return;
    }

    // lefoglaljuk a CE-t és zárjuk a térképet; a CE a Map Scene-ben fut le
    $gameTemp.reserveCommonEvent(id);
    SceneManager.pop();
  });

  // --- Opció választás – példa ---
  safeOnIME("poi-option", ({ poi, opt }) => {
    console.log(`[${PLG}] option selected:`, opt, "for", poi && poi.name);
    // ide jöhet pl. common event trigger
  });
})();

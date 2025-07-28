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
    let id = Number(mapId || 0);

    // Back‑compat: ha név jön
    if (!id && mapName && IRMap && IRMap.findMapIdByEditorName) {
      id = IRMap.findMapIdByEditorName(String(mapName).trim());
    }

    if (!id) {
      $gameMessage.add("Related map is not set for this element.");
      return;
    }
    if (!$dataMapInfos || !$dataMapInfos[id]) {
      $gameMessage.add("Related map not found: ID " + id);
      return;
    }

    // Aktuális (megjelenített) editor‑map ID kinyerése history-hoz
    let currentId = 0;
    try {
      const sc = IRMap.currentScene && IRMap.currentScene();
      const cfg = sc && sc.mapConfig && sc.mapConfig();
      if (cfg && IRMap.findMapIdByEditorName) {
        currentId = IRMap.findMapIdByEditorName(cfg.editorMapName || "");
      }
    } catch (e) {
      /* ignore */
    }

    // Opcionális gyerek‑ellenőrzés (ha definiált a parent → children reláció)
    const kids =
      IRMap && IRMap.getChildMapIds
        ? IRMap.getChildMapIds(currentId) || []
        : [];
    if (kids.length && !kids.includes(id)) {
      $gameMessage.add("This related map is not a child of the current map.");
      return;
    }

    // Hozzáférési feltételek (core szabályok)
    if (IRMap && IRMap.canOpenMap && !IRMap.canOpenMap(id)) {
      const msg =
        (IRMap.getOpenMapFailureMessage &&
          IRMap.getOpenMapFailureMessage(id)) ||
        "You cannot open this map.";
      $gameMessage.add(
        Window_Base.prototype.convertEscapeCharacters.call(null, msg)
      );
      return;
    }

    // History‑ba csak akkor toljuk, ha valós váltás lesz
    if (currentId && currentId !== id) NavHistory.push(currentId);

    _installBackWatcherOnce(); // Backspace figyelő bekapcsolása (egyszer)
    IRMap.switchToMapById(id); // váltás
  });

  // --- Teleport – placeholder ---
  safeOnIME("poi-teleport", ({ poi }) => {
    console.log(`[${PLG}] teleport requested for`, poi && poi.name);
    $gameMessage.add("Teleport is not implemented yet.");
  });

  // --- Opció választás – példa ---
  safeOnIME("poi-option", ({ poi, opt }) => {
    console.log(`[${PLG}] option selected:`, opt, "for", poi && poi.name);
    // ide jöhet pl. common event trigger
  });
})();

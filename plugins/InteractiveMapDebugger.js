/*:
 * @plugindesc  InteractiveRpgMap – Debug helper  v0.3
 * @author      🔧
 * @help
 *   Helyezd a core és a többi IRMap addon után.
 *   – Betöltési sorrend + duplikált script detektálás
 *   – IRMap.emit wrapper (kivéve update-tick)
 *   – ClickSys patch: trigger / empty-click, register/unregister log
 *   – UserMarkers patch: _promptNote + empty-click watch + _makeNote hook
 *   – Ha ClickSys vagy IRMap később jön létre, vár rájuk
 */

(() => {
  "use strict";

  /* -------------------------------------------------- *
   * 0)  Betöltött <script> elemek vizsgálata
   * -------------------------------------------------- */
  (() => {
    const scripts = [...document.querySelectorAll("script[src]")];
    const irList = scripts.filter((s) => /InteractiveRpgMap/i.test(s.src));
    console.info("%c[IRM-DBG] script-betöltési sorrend:", "color:#0af");
    scripts.forEach((s, i) =>
      console.info(
        `${(i + 1).toString().padStart(2, "0")}  ${s.src.split("/").pop()}`
      )
    );
    const dup = irList
      .map((s) => s.src)
      .reduce((a, src) => ((a[src] = (a[src] || 0) + 1), a), {});
    const dups = Object.entries(dup).filter(([, n]) => n > 1);
    if (dups.length) {
      console.warn("%c[IRM-DBG] DUPLIKÁLT core betöltés!", "color:#f40", dups);
    }
  })();

  /* -------------------------------------------------- *
   * Helper – késleltetve patch-elünk, ha még nincs IRMap
   * -------------------------------------------------- */
  function waitFor(getObj, cb, tries = 30) {
    const o = getObj();
    if (o) cb(o);
    else if (tries > 0) setTimeout(() => waitFor(getObj, cb, tries - 1), 50);
  }

  /* -------------------------------------------------- *
   * 1) IRMap.emit  – szűrt logger
   * -------------------------------------------------- */
  waitFor(
    () => window.IRMap,
    (IRMap) => {
      if (IRMap.__dbgPatched) return;
      IRMap.__dbgPatched = true;
      const orig = IRMap.emit.bind(IRMap);
      const noisy = new Set(["update-tick"]);
      IRMap.emit = function (evt, payload) {
        if (!noisy.has(evt)) {
          console.log(`%c[IRMap.emit]`, "color:#0af", evt, payload);
        }
        return orig(evt, payload);
      };
      console.info("%c[IRM-DBG] IRMap.emit patch OK", "color:#0af");
    }
  );

  /* -------------------------------------------------- *
   * 2) ClickSys – trigger/empty-click log + reg/unreg
   * -------------------------------------------------- */
  waitFor(
    () => window.ClickSys && window.ClickSys._processTick,
    (CS) => {
      if (CS.__dbgPatched) return;
      CS.__dbgPatched = true;

      // register / unregister látható legyen
      const reg0 = CS.add.bind(CS);
      CS.add = function (sprite, onClick, opt) {
        console.log("%c[ClickSys] register", "color:#0a0", sprite);
        return reg0(sprite, onClick, opt);
      };
      const rem0 = CS.remove.bind(CS);
      CS.remove = function (sprite) {
        console.log("%c[ClickSys] unregister", "color:#a0a", sprite);
        return rem0(sprite);
      };

      // trigger / empty-click trace
      const tick0 = CS._processTick.bind(CS);
      CS._processTick = function () {
        const trig = TouchInput.isTriggered();
        if (trig) {
          console.log(
            "%c[ClickSys] trigger",
            "color:#fa0",
            TouchInput.x,
            TouchInput.y
          );
        }
        tick0();
        if (trig) {
          if (
            this._dbg_lastEmpty &&
            this._dbg_lastEmpty.x === TouchInput.x &&
            this._dbg_lastEmpty.y === TouchInput.y
          ) {
            console.log("%c[ClickSys] → empty-click ELKÜLDVE", "color:#6a0");
          } else {
            console.log(
              "%c[ClickSys] → nem empty (találat volt)",
              "color:#a00"
            );
          }
        }
      };

      // flageljük a valódi empty-click-et
      waitFor(
        () => window.IRMap,
        (IRMap) => {
          IRMap.on("empty-click", () => {
            CS._dbg_lastEmpty = { x: TouchInput.x, y: TouchInput.y };
          });
        }
      );

      console.info("%c[IRM-DBG] ClickSys patch OK", "color:#0af");
    }
  );

  /* -------------------------------------------------- *
   * 3) UserMarkers – _makeNote + empty-click watch
   * -------------------------------------------------- */
  waitFor(
    () => window.IRMap && window.Scene_InteractiveMap,
    () => {
      if (window.__IRM_USERMARK_DBG__) return;
      window.__IRM_USERMARK_DBG__ = true;

      const IRMap = window.IRMap;
      const SceneClass = window.Scene_InteractiveMap;

      // monitor scene-open
      IRMap.on("scene-open", ({ scene }) => {
        if (!(scene instanceof SceneClass)) return;

        // patch _makeNote (ahol valójában megjelenik a szövegablak)
        if (scene._makeNote) {
          const oldMake = scene._makeNote;
          scene._makeNote = function (tx, ty) {
            console.log(
              "%c[UM-DBG] _makeNote called at tile:",
              "color:#f6a",
              tx,
              ty
            );
            return oldMake.call(this, tx, ty);
          };
          console.log("%c[UM-DBG] _makeNote patched", "color:#f6a");
        }

        // log create() marker-layer és click-hook regisztrációját
        if (scene.create) {
          const create0 = scene.create;
          scene.create = function () {
            create0.call(this);
            console.log(
              "%c[UM-DBG] Scene.create() – marker-layer + click-hook regisztrálva",
              "color:#f6a"
            );
          };
        }
      });

      // global empty-click listener
      IRMap.on("empty-click", () => {
        console.log(
          "%c[UM-DBG] IRMap.emit empty-click → UserMarkersnek mennie kéne",
          "color:#f6a"
        );
      });

      console.info("%c[IRM-DBG] UserMarkers patch OK", "color:#0af");
    }
  );
  waitFor(
    () => window.IRMap && window.POI_BY_MAP && window.POIS,
    () => {
      // Listen on every map-switched (openload után is mindig hívódik)
      IRMap.on("map-switched", ({ scene, to, win }) => {
        // to: lehet string vagy number
        const mapId =
          Number(to) || (scene && scene.mapConfig && scene.mapConfig().mapId);
        // Az összes POI az új térképen
        const pois = (window.POI_BY_MAP[mapId] || []).map((p) => ({
          name: p.name,
          x: p.x,
          y: p.y,
          img: p.img,
          id: p.id,
          mapId: p.mapId,
          interactMode: p.interactMode,
        }));

        console.info(
          "%c[IRM-DBG] map-switched → Elements plugin POI-k az új térképen (mapId=" +
            mapId +
            "):",
          "color:#1af",
          pois
        );
      });
    }
  );
})();

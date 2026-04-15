/*:
 * @plugindesc InteractiveMapRouter – útvonalrajzolás kijelölt Region ID-n, POI-ra kattintva (aktuális map), toggle-olható láthatósággal v1.2
 * @author Soczó
 *
 * @param EnableMovingRouter
 * @text Enable Moving router
 * @type boolean
 * @on On
 * @off Off
 * @default true
 *
 * @param RouteRegionId
 * @text Route region number
 * @type number
 * @min 1
 * @desc A régió ID, amelyen az útvonal futhat. Kötelező beállítani!
 *
 * @param ExcludedRegions
 * @text Excluded region IDs
 * @type text
 * @default
 * @desc Vesszővel elválasztva (pl. 2,3,5). Ezekre SOHA nem rajzolunk (a player→csatlakozásra sem).
 *
 * @param RouteColor
 * @text Route color (hex)
 * @type text
 * @default #44aaff
 *
 * @param RouteThickness
 * @text Route thickness (px)
 * @type number
 * @min 1
 * @max 12
 * @default 3
 *
 * @param SnapRadiusTiles
 * @text Snap radius around POI (tiles)
 * @type number
 * @min 0
 * @desc Hány tile-on belül fogadjuk el, hogy a POI „a route-hálózathoz közel van”.
 * @default 6
 * 
 * @param GoalXEnabled
 * @text Draw goal “X”
 * @type boolean
 * @on On
 * @off Off
 * @default true
 * @desc Ha be van kapcsolva, X-et rajzol a célcsempére.

 * @param GoalXSizePx
 * @text Goal “X” size (px)
 * @type number
 * @min 6
 * @max 128
 * @default 20
 * @desc Az X teljes mérete (pixel).

 * @param GoalXHandDrawn
 * @text Hand-drawn look for X
 * @type boolean
 * @on On
 * @off Off
 * @default true
 * @desc Ha On, kicsit “kézzel rajzolt” lesz (enyhe jitter).
 *
 * @help
 * Használat:
 *  - Állíts be egy region ID-t a pálya „járható útvonalaira”.
 *  - POI-ra kattintva a plugin megkeresi a legrövidebb utat a kijelölt régió
 *    csempéin a játékostól a POI közeléig (ha a POI körül van ilyen régió),
 *    és szaggatottan felrajzolja.
 *  - A vonal most már a játékosból indul: a playerből egy nem-tiltott csempéken
 *    futó rövid 4-irányú útvonal beköti az első elérhető RouteRegionId csempébe,
 *    onnan megy tovább a fő útvonal a POI-ig.
 *  - R (alap) megnyomásával ki/be kapcsolhatod a vonal láthatóságát.
 *
 * Szabályok:
 *  - Nincs átlós lépés (csak 4-irány).
 *  - Csak a megadott RouteRegionId csempéin halad a fő útvonal.
 *  - Start/Goal csak akkor „snap-elhető”, ha a megadott sugaron belül van ilyen régió.
 *  - ExcludedRegions ID-ken soha nem rajzolunk (a player→bekötés sem mehet át rajtuk).
 *  - Csak az AKTUÁLIS mapon működik (ahol a játékos áll).
 *
 * Törlés:
 *  - Map-váltáskor és Scene zárásakor törli. Üres kattintás NEM törli.
 *
 * Függőség: InteractiveRpgMap (core ≥ 1.4.1), Elements/POI emit („poi-click”)
 */
(() => {
  "use strict";
  const PLUGIN = "InteractiveMapRouter";
  const prm = PluginManager.parameters(PLUGIN);
  const ENABLED = String(prm.EnableMovingRouter || "true") !== "false";
  const ROUTE_REGION = Number(prm.RouteRegionId || 0);
  const EXCL_SET = new Set(
    String(prm.ExcludedRegions || "")
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
  );
  const ROUTE_COLOR_HEX = String(prm.RouteColor || "#44aaff").trim();
  const ROUTE_COLOR =
    parseInt(ROUTE_COLOR_HEX.replace(/^#/, ""), 16) || 0x44aaff;
  const ROUTE_THICK = Math.max(1, Number(prm.RouteThickness || 3));
  const SNAP_R = Math.max(0, Number(prm.SnapRadiusTiles || 6));

  const GOALX_ENABLED = String(prm.GoalXEnabled || "true") !== "false";
  const GOALX_SIZE = Math.max(6, Number(prm.GoalXSizePx || 20));
  const GOALX_HAND = String(prm.GoalXHandDrawn || "true") !== "false";

  if (!window.IRMap) {
    console.error(`[${PLUGIN}] IRMap core required!`);
    return;
  }

  try {
    const hasRouteToggle =
      Object.values(Input.keyMapper || {}).indexOf("routeToggle") !== -1;
    if (!hasRouteToggle) {
      Input.keyMapper[82] = "routeToggle";
      console.log("[InteractiveMapRouter] routeToggle fallback → 'R'");
    }
  } catch (e) {
    // csendben ignoráljuk
  }

  // --- kis segédek -----------------------------------------------------------
  const mapIdFromCfg = (cfg) => {
    if (!cfg) return 0;
    if (cfg.mapId) return Number(cfg.mapId) || 0;
    if (cfg.editorMapName && IRMap.findMapIdByEditorName) {
      return IRMap.findMapIdByEditorName(String(cfg.editorMapName).trim()) || 0;
    }
    return 0;
  };
  const displayedMapId = (scene) =>
    mapIdFromCfg(scene && scene.mapConfig && scene.mapConfig());
  const isOnPlayerMap = (scene) => displayedMapId(scene) === $gameMap.mapId();

  // --- útvonal állapot -------------------------------------------------------
  let _routeTiles = null; // [{x,y}, ...] – teljes lánc (player-connector + route)
  let _routeLayer = null; // PIXI.Graphics egy külön sublayeren
  let _routeWin = null; // Window_InteractiveMap referencia az átrajzoláshoz
  let _routeScene = null;
  let _visible = true; // toggle-olható láthatóság

  function ensureRouteLayer(win) {
    if (!win) return null;
    if (!win._routeSubLayer || !win._routeSubLayer.parent) {
      const sub = new PIXI.Container();
      if (win._markerLayer) win._markerLayer.addChild(sub);
      else win.addChild(sub);
      win._routeSubLayer = sub;
    }
    if (!_routeLayer || !_routeLayer.parent) {
      _routeLayer = new PIXI.Graphics();
      win._routeSubLayer.addChild(_routeLayer);
    }
    _routeLayer.visible = _visible;
    return _routeLayer;
  }

  function clearRoute() {
    _routeTiles = null;
    if (_routeLayer) {
      _routeLayer.clear();
      if (_routeLayer.parent) _routeLayer.parent.removeChild(_routeLayer);
      _routeLayer = null;
    }
    _routeWin = null;
    _routeScene = null;
  }

  // determinisztikus RNG (tile + map alapján), hogy ne "rezegjen" az X minden frame-en
  function seededRng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // "kézzel rajzolt" vonal: a fő szakaszra merőlegesen jitterelünk pár pontot
  function roughStroke(g, x1, y1, x2, y2, jitterPx, segments, rng) {
    const dx = x2 - x1,
      dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len,
      ny = dx / len; // merőleges egységvektor
    const n = Math.max(2, segments | 0);
    g.moveTo(x1, y1);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const px = x1 + dx * t + nx * (rng() * 2 - 1) * jitterPx;
      const py = y1 + dy * t + ny * (rng() * 2 - 1) * jitterPx;
      g.lineTo(px, py);
    }
    g.lineTo(x2, y2);
  }

  function drawGoalXAt(win, g, tx, ty, sizePx, color, thick, handDrawn) {
    const ia = IRMap.worldToImage(tx, ty, null);
    if (!ia) return;
    const sw = IRMap.imageToWindow(ia.imgX, ia.imgY, win);
    if (!sw) return;

    const offX = win.x + win.padding + (win._drawDX || 0);
    const offY = win.y + win.padding + (win._drawDY || 0);
    const cx = sw.x - offX;
    const cy = sw.y - offY;

    const h = sizePx / 2;

    // kiinduló diagonálok
    let a1 = { x: cx - h, y: cy - h },
      b1 = { x: cx + h, y: cy + h };
    let a2 = { x: cx - h, y: cy + h },
      b2 = { x: cx + h, y: cy - h };

    // brush‑szerű végek
    const capR = Math.max(1, thick * 0.55);

    g.lineStyle(thick, color, 1);

    if (handDrawn) {
      // finom görbület + pici jitter, de seedelt → stabil
      const seed =
        ($gameMap.mapId() * 73856093) ^ (tx * 19349663) ^ (ty * 83492791);
      const rng = seededRng(seed);

      function jitterPt(p, amp) {
        const jx = (rng() * 2 - 1) * amp;
        const jy = (rng() * 2 - 1) * amp;
        return { x: p.x + jx, y: p.y + jy };
      }

      // mennyi legyen a "íveltség": képen kb. 12–20% a félméretből
      const curveAmp = sizePx * (0.12 + rng() * 0.08);
      const endJitter = Math.min(4, sizePx * 0.1);

      // középpontból képezzünk merőlegest a szakaszokra → kontrollpontok
      function drawCurvedCross(a, b) {
        // jitterelt végpontok
        const A = jitterPt(a, endJitter);
        const B = jitterPt(b, endJitter);

        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2;

        const dx = B.x - A.x,
          dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        // merőleges irány
        const nx = -dy / len,
          ny = dx / len;

        // kissé hand‑crafted: a kontrollpontot nem pont középre tesszük,
        // kap egy kicsi előre‑hátra eltolást is
        const along = (rng() * 0.3 - 0.15) * h; // -0.15h..+0.15h
        const kx = mx + nx * curveAmp + (dx / len) * along;
        const ky = my + ny * curveAmp + (dy / len) * along;

        // stroke (quadraticBezier)
        g.moveTo(A.x, A.y);
        g.quadraticCurveTo(kx, ky, B.x, B.y);

        // ecsetvégek: telt pöttyök
        g.beginFill(color, 1);
        g.drawCircle(A.x, A.y, capR);
        g.drawCircle(B.x, B.y, capR);
        g.endFill();
      }

      drawCurvedCross(a1, b1);
      drawCurvedCross(a2, b2);
    } else {
      // szabályos X + kerek végek
      g.moveTo(a1.x, a1.y);
      g.lineTo(b1.x, b1.y);
      g.moveTo(a2.x, a2.y);
      g.lineTo(b2.x, b2.y);
      g.beginFill(color, 1);
      g.drawCircle(a1.x, a1.y, capR);
      g.drawCircle(b1.x, b1.y, capR);
      g.drawCircle(a2.x, a2.y, capR);
      g.drawCircle(b2.x, b2.y, capR);
      g.endFill();
    }
  }

  // --- „közeli” RouteRegion csempe keresés SUGARON BELÜL + exclude check ----
  function nearestRouteRegionWithinRadius(cx, cy, r) {
    const W = $dataMap.width,
      H = $dataMap.height;
    let best = null,
      bestD = 1e9;
    const x0 = Math.max(0, cx - r),
      x1 = Math.min(W - 1, cx + r);
    const y0 = Math.max(0, cy - r),
      y1 = Math.min(H - 1, cy + r);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const rid = $gameMap.regionId(x, y);
        if (rid !== ROUTE_REGION) continue;
        if (EXCL_SET.has(rid)) continue; // ha valaki kitiltotta magát a route-régiót: treated as no-route
        const d = Math.abs(x - cx) + Math.abs(y - cy);
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
    return best;
  }

  function isExcludedTile(x, y) {
    return EXCL_SET.has($gameMap.regionId(x, y));
  }

  // --- BFS a route-régión (4-irány) -----------------------------------------
  function bfsRegionPath(ax, ay, bx, by) {
    const W = $dataMap.width,
      H = $dataMap.height;
    const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const idx = (x, y) => y * W + x;
    if (!inB(ax, ay) || !inB(bx, by)) return null;
    if (
      $gameMap.regionId(ax, ay) !== ROUTE_REGION ||
      $gameMap.regionId(bx, by) !== ROUTE_REGION
    )
      return null;

    const qx = new Uint16Array(W * H);
    const qy = new Uint16Array(W * H);
    const prev = new Int32Array(W * H);
    prev.fill(-1);
    let qh = 0,
      qt = 0;

    prev[idx(ax, ay)] = -3;
    qx[qt] = ax;
    qy[qt] = ay;
    qt++;

    while (qh < qt) {
      const x = qx[qh],
        y = qy[qh];
      qh++;
      if (x === bx && y === by) break;
      const i = idx(x, y);
      if (
        x > 0 &&
        $gameMap.regionId(x - 1, y) === ROUTE_REGION &&
        prev[idx(x - 1, y)] === -1
      ) {
        prev[idx(x - 1, y)] = i;
        qx[qt] = x - 1;
        qy[qt] = y;
        qt++;
      }
      if (
        x < W - 1 &&
        $gameMap.regionId(x + 1, y) === ROUTE_REGION &&
        prev[idx(x + 1, y)] === -1
      ) {
        prev[idx(x + 1, y)] = i;
        qx[qt] = x + 1;
        qy[qt] = y;
        qt++;
      }
      if (
        y > 0 &&
        $gameMap.regionId(x, y - 1) === ROUTE_REGION &&
        prev[idx(x, y - 1)] === -1
      ) {
        prev[idx(x, y - 1)] = i;
        qx[qt] = x;
        qy[qt] = y - 1;
        qt++;
      }
      if (
        y < H - 1 &&
        $gameMap.regionId(x, y + 1) === ROUTE_REGION &&
        prev[idx(x, y + 1)] === -1
      ) {
        prev[idx(x, y + 1)] = i;
        qx[qt] = x;
        qy[qt] = y + 1;
        qt++;
      }
    }

    const goalI = idx(bx, by);
    if (prev[goalI] === -1) return null;
    const path = [{ x: bx, y: by }];
    let cur = prev[goalI];
    while (cur >= 0) {
      const cx = cur % W,
        cy = (cur / W) | 0;
      path.push({ x: cx, y: cy });
      cur = prev[cur];
    }
    path.reverse();
    return path;
  }

  // --- BFS player→sA: bármin mehet, ami NINCS az excluded-ben (4-irány) ------
  function bfsConnector(ax, ay, bx, by) {
    const W = $dataMap.width,
      H = $dataMap.height;
    const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const idx = (x, y) => y * W + x;
    if (!inB(ax, ay) || !inB(bx, by)) return null;

    const qx = new Uint16Array(W * H);
    const qy = new Uint16Array(W * H);
    const prev = new Int32Array(W * H);
    prev.fill(-1);
    let qh = 0,
      qt = 0;

    function allowed(x, y) {
      const rid = $gameMap.regionId(x, y);
      return !EXCL_SET.has(rid); // bármi mehet, ami NEM tiltott
    }

    if (!allowed(ax, ay)) return null; // a player tiltott zónában áll → nincs connector

    prev[idx(ax, ay)] = -3;
    qx[qt] = ax;
    qy[qt] = ay;
    qt++;

    while (qh < qt) {
      const x = qx[qh],
        y = qy[qh];
      qh++;
      if (x === bx && y === by) break;
      const i = idx(x, y);
      if (x > 0 && allowed(x - 1, y) && prev[idx(x - 1, y)] === -1) {
        prev[idx(x - 1, y)] = i;
        qx[qt] = x - 1;
        qy[qt] = y;
        qt++;
      }
      if (x < W - 1 && allowed(x + 1, y) && prev[idx(x + 1, y)] === -1) {
        prev[idx(x + 1, y)] = i;
        qx[qt] = x + 1;
        qy[qt] = y;
        qt++;
      }
      if (y > 0 && allowed(x, y - 1) && prev[idx(x, y - 1)] === -1) {
        prev[idx(x, y - 1)] = i;
        qx[qt] = x;
        qy[qt] = y - 1;
        qt++;
      }
      if (y < H - 1 && allowed(x, y + 1) && prev[idx(x, y + 1)] === -1) {
        prev[idx(x, y + 1)] = i;
        qx[qt] = x;
        qy[qt] = y + 1;
        qt++;
      }
    }

    const goalI = idx(bx, by);
    if (prev[goalI] === -1) return null;
    const path = [{ x: bx, y: by }];
    let cur = prev[goalI];
    while (cur >= 0) {
      const cx = cur % W,
        cy = (cur / W) | 0;
      path.push({ x: cx, y: cy });
      cur = prev[cur];
    }
    path.reverse();
    return path;
  }

  // --- rajzolás (szaggatott „dash” minden szomszédpárra) --------------------
  function redrawRoute() {
    if (!_routeTiles || !_routeWin || !_routeLayer) return;
    const win = _routeWin;
    const g = _routeLayer;
    g.clear();
    g.visible = _visible;
    if (!_visible) return;

    for (let i = 0; i < _routeTiles.length - 1; i++) {
      const a = _routeTiles[i],
        b = _routeTiles[i + 1];

      // ha bármelyik végpont excluded régión áll, ezt a „dash”-t kihagyjuk
      if (isExcludedTile(a.x, a.y) || isExcludedTile(b.x, b.y)) continue;

      const ia = IRMap.worldToImage(a.x, a.y, null);
      const ib = IRMap.worldToImage(b.x, b.y, null);
      if (!ia || !ib) continue;

      const sa = IRMap.imageToWindow(ia.imgX, ia.imgY, win);
      const sb = IRMap.imageToWindow(ib.imgX, ib.imgY, win);
      if (!sa || !sb) continue;

      // „dash” = a két pont közepe köré rajzolt rövid szegmens
      const mx = (sa.x + sb.x) / 2,
        my = (sa.y + sb.y) / 2;
      const dx = sb.x - sa.x,
        dy = sb.y - sa.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      const dash = Math.min(len * 0.6, 14);
      const hx = (ux * dash) / 2,
        hy = (uy * dash) / 2;

      const offX = win.x + win.padding + (win._drawDX || 0);
      const offY = win.y + win.padding + (win._drawDY || 0);

      g.lineStyle(ROUTE_THICK, ROUTE_COLOR, 0.95);
      g.moveTo(mx - hx - offX, my - hy - offY);
      g.lineTo(mx + hx - offX, my + hy - offY);
    }
    if (GOALX_ENABLED && _routeTiles && _routeTiles.length > 0) {
      const last = _routeTiles[_routeTiles.length - 1];
      // ha a cél tile excluded lenne, nem rajzolunk X-et
      if (!isExcludedTile(last.x, last.y)) {
        const thick = Math.max(ROUTE_THICK, 2); // picit vastagabb jól áll az X-nek
        drawGoalXAt(
          win,
          g,
          last.x,
          last.y,
          GOALX_SIZE,
          ROUTE_COLOR,
          thick,
          GOALX_HAND
        );
      }
    }
  }

  // --- fő logika: route készítés egy POI kattintásra -------------------------
  function buildRouteToPoi(scene, poi) {
    if (!ENABLED || !ROUTE_REGION) return;
    if (!scene || !isOnPlayerMap(scene)) return; // csak aktuális map
    if (!$dataMap || !$dataMap.width) return;

    // cél tile feloldása
    let tx = null,
      ty = null;
    if (poi) {
      if (typeof poi.tx === "number" && typeof poi.ty === "number") {
        tx = Math.round(poi.tx);
        ty = Math.round(poi.ty);
      } else if (typeof poi.x === "number" && typeof poi.y === "number") {
        tx = Math.round(poi.x);
        ty = Math.round(poi.y);
      } else if (typeof poi.imgX === "number" && typeof poi.imgY === "number") {
        const tw = IRMap.imageToWorld(poi.imgX, poi.imgY, null, true);
        if (tw) {
          tx = tw.tx;
          ty = tw.ty;
        }
      }
    }
    if (tx == null || ty == null) return;

    const sx = $gamePlayer.x | 0,
      sy = $gamePlayer.y | 0;

    // okos snap: csak ha a sugáron belül talál route-régiót, és nem excluded
    const sA = nearestRouteRegionWithinRadius(sx, sy, SNAP_R);
    const sB = nearestRouteRegionWithinRadius(tx, ty, SNAP_R);
    if (!sA || !sB) {
      SoundManager && SoundManager.playBuzzer && SoundManager.playBuzzer();
      return;
    }

    // fő útvonal a route-régión
    const mainPath = bfsRegionPath(sA.x, sA.y, sB.x, sB.y);
    if (!mainPath || mainPath.length < 2) {
      SoundManager && SoundManager.playBuzzer && SoundManager.playBuzzer();
      return;
    }

    // player-connector: csak nem-excluded csempéken
    let full = mainPath.slice();
    const conn = bfsConnector(sx, sy, sA.x, sA.y);
    if (conn && conn.length > 1) {
      // kerüljük a duplikált csomópontot a találkozásnál
      full = conn.slice(0, -1).concat(full);
    }

    // állapot + rajz
    _routeScene = scene;
    _routeWin = scene.mapWindow();
    ensureRouteLayer(_routeWin);
    _routeTiles = full;
    redrawRoute();
  }

  // --- event hookok ----------------------------------------------------------
  IRMap.on("poi-click", ({ poi }) => {
    const sc = IRMap.currentScene && IRMap.currentScene();
    if (!sc) return;
    buildRouteToPoi(sc, poi); // üres kattintás nem töröl; új POI felülírja
  });

  IRMap.on("map-switched", () => clearRoute());
  IRMap.on("scene-close", () => clearRoute());
  IRMap.on("camera-changed", () => redrawRoute());
  IRMap.on("bitmap-loaded", ({ scene }) => {
    if (_routeScene && scene === _routeScene) clearRoute();
  });

  // toggle figyelés
  IRMap.on("update-tick", () => {
    if (Input.isTriggered && Input.isTriggered("routeToggle")) {
      _visible = !_visible;
      if (_routeLayer) _routeLayer.visible = _visible;
    }
  });

  console.log(
    `[${PLUGIN}] ready – router ${ENABLED ? "enabled" : "disabled"}, region=${
      ROUTE_REGION || "(unset)"
    }, excluded=[${[...EXCL_SET].join(
      ", "
    )}], color=${ROUTE_COLOR_HEX}, thick=${ROUTE_THICK}, snapR=${SNAP_R}`
  );
})();

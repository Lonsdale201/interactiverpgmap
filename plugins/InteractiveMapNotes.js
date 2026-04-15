/*:
 * @plugindesc Interactive Map Notes – tabs (Info/POI/Monsters), visibility flags, layouts + centralized pagination (v0.6)
 * @author Soczó Kristóf
 * @version v1.0
 *
 * @param menuTitle
 * @text Menu Window Title
 * @type string
 * @default Map Notes
 *
 * @param enableInitial
 * @text Initially Enabled
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @default true
 *
 * @param grpVisibility
 * @text — Visibility —
 * @type string
 * @default
 *
 * @param hideUntilVisited
 * @parent grpVisibility
 * @text Hide maps until visited
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc When ON, a map appears only after the player has visited it at least once (uses Gamemory.hasVisited).
 *
 * @param grpTabs
 * @text — Tabs —
 * @type string
 * @default
 *
 * @param enableTabInfo
 * @parent grpTabs
 * @text Enable Tab: Info
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param enableTabPoi
 * @parent grpTabs
 * @text Enable Tab: Elements
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param enableTabMonsters
 * @parent grpTabs
 * @text Enable Tab: Monsters
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param tabLabelInfo
 * @parent grpTabs
 * @text Tab Label: Info
 * @type string
 * @default Info
 *
 * @param tabLabelPoi
 * @parent grpTabs
 * @text Tab Label: Elements
 * @type string
 * @default Elements
 *
 * @param tabLabelMonsters
 * @parent grpTabs
 * @text Tab Label: Monsters
 * @type string
 * @default Monsters
 *
 * @param grpElements
 * @text — Elements Tab —
 * @type string
 * @default
 *
 * @param poiIntroTitle
 * @parent grpElements
 * @text Elements intro title
 * @type string
 * @default
 *
 * @param poiIntroNote
 * @parent grpElements
 * @text Elements intro note
 * @type note
 * @default
 *
 * @param poiLayoutMode
 * @parent grpElements
 * @text Elements layout mode
 * @type select
 * @option grid
 * @option list
 * @default grid
 *
 * @param poiGridCols
 * @parent grpElements
 * @text Elements grid columns
 * @type number
 * @min 1
 * @max 8
 * @default 3
 *
 * @param poiListCols
 * @parent grpElements
 * @text Elements list columns
 * @type number
 * @min 1
 * @max 4
 * @default 1
 *
 * @param poiListThumbW
 * @parent grpElements
 * @text Elements list thumb W (px)
 * @type number
 * @min 16
 * @max 256
 * @default 64
 *
 * @param poiListThumbH
 * @parent grpElements
 * @text Elements list thumb H (px)
 * @type number
 * @min 16
 * @max 256
 * @default 64
 *
 * @param grpMonsters
 * @text — Monsters Tab —
 * @type string
 * @default
 *
 * @param monVisibility
 * @parent grpMonsters
 * @text — Monsters Visibility —
 * @type string
 * @default
 *
 * @param hideUntilDefeated
 * @parent monVisibility
 * @text Hide enemy until you defeat him
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc When ON, an enemy appears only after the player defeated it at least once (uses Gamemory.getEnemyKillCount>0).
 *
 * @param monLayoutMode
 * @parent grpMonsters
 * @text Monsters layout mode
 * @type select
 * @option grid
 * @option list
 * @default list
 *
 * @param monGridCols
 * @parent grpMonsters
 * @text Monsters grid columns
 * @type number
 * @min 1
 * @max 8
 * @default 3
 *
 * @param monListCols
 * @parent grpMonsters
 * @text Monsters list columns
 * @type number
 * @min 1
 * @max 4
 * @default 1
 *
 * @param monListThumbW
 * @parent grpMonsters
 * @text Monsters list thumb W (px)
 * @type number
 * @min 16
 * @max 256
 * @default 64
 *
 * @param monListThumbH
 * @parent grpMonsters
 * @text Monsters list thumb H (px)
 * @type number
 * @min 16
 * @max 256
 * @default 64
 *
 * @param monIntroTitle
 * @parent grpMonsters
 * @text Monsters intro title
 * @type string
 * @default
 *
 * @param monIntroNote
 * @parent grpMonsters
 * @text Monsters intro note
 * @type note
 * @default
 *
 * @param grpTypography
 * @text — Typography —
 * @type string
 * @default
 *
 * @param fsInfoText
 * @parent grpTypography
 * @text Font size: Info description
 * @type number
 * @min 8
 * @max 96
 * @default 28
 *
 * @param fsGridItemName
 * @parent grpTypography
 * @text Font size: Grid item name
 * @type number
 * @min 8
 * @max 96
 * @default 28
 *
 * @param fsListItemName
 * @parent grpTypography
 * @text Font size: List item name
 * @type number
 * @min 8
 * @max 96
 * @default 28
 *
 * @param fsIntroTitle
 * @parent grpTypography
 * @text Font size: Intro title
 * @type number
 * @min 8
 * @max 96
 * @default 28
 *
 * @param fsIntroNote
 * @parent grpTypography
 * @text Font size: Intro note
 * @type number
 * @min 8
 * @max 96
 * @default 28
 *
 * @param grpColors
 * @text — Colors —
 * @type string
 * @default
 *
 * @param colorIntroTitleHex
 * @parent grpColors
 * @text Color: Intro title (hex)
 * @type string
 * @default
 * @desc e.g. #FFCC00 (leave empty to use systemColor)
 *
 * @param colorAccentHex
 * @parent grpColors
 * @text Color: Pager & “+more” (hex)
 * @type string
 * @default
 * @desc e.g. #A0A0A0 (leave empty to use systemColor)
 *
 * @help
 * Left: map list (respects IRMap visibility + <IMEMAP HIDDEN> in map NOTE).
 * Right/top: header (optional noteImage, name, info).
 * Right/bottom: tabs – Info / Elements / Monsters (labels & enable flags in params).
 * Elements & Monsters support Grid/List with configurable columns & thumb sizes.
 * All tabs use a centralized paginator (PgUp/PgDn).
 * Use <IMEMONSTER HIDDEN> in the ENEMY note if you don't want it to appear in the monster list.
 * Monsters can be hidden until first defeat (see "Hide enemy until you defeat him").
 * Uses IME.getVisiblePoiSummaries(mapId) -> {id,name,img}.
 *
 * Commands:
 *   EnableMapNotes / DisableMapNotes
 *
 * Changelog:
 *   - 2026.04.06 - Initial release v1.0
 */

(() => {
  "use strict";

  const pluginName = "InteractiveMapNotes";
  const params = PluginManager.parameters(pluginName);

  const MENU_TITLE = String(params.menuTitle || "Map Notes");
  const enableInitial = String(params.enableInitial || "true") === "true";
  // (Hotkey optional – menu entry always works)
  const MAPNOTES_KEY = "mapNotesOpen";

  const TAB_INFO_LABEL = String(params.tabLabelInfo || "Info");
  const TAB_POI_LABEL = String(params.tabLabelPoi || "Elements");
  const TAB_MON_LABEL = String(params.tabLabelMonsters || "Monsters");

  const TAB_INFO_ON = String(params.enableTabInfo || "true") === "true";
  const TAB_POI_ON = String(params.enableTabPoi || "true") === "true";
  const TAB_MON_ON = String(params.enableTabMonsters || "true") === "true";

  // POI layout
  const POI_LAYOUT_MODE = String(params.poiLayoutMode || "grid");
  const POI_GRID_COLS = Math.max(1, +params.poiGridCols || 3);
  const POI_LIST_COLS = Math.max(1, +params.poiListCols || 1);
  const POI_LIST_THUMB_W = Math.max(16, +params.poiListThumbW || 64);
  const POI_LIST_THUMB_H = Math.max(16, +params.poiListThumbH || 64);

  // MON layout + visibility
  const MON_LAYOUT_MODE = String(params.monLayoutMode || "list");
  const MON_GRID_COLS = Math.max(1, +params.monGridCols || 3);
  const MON_LIST_COLS = Math.max(1, +params.monListCols || 1);
  const MON_LIST_THUMB_W = Math.max(16, +params.monListThumbW || 64);
  const MON_LIST_THUMB_H = Math.max(16, +params.monListThumbH || 64);
  const HIDE_MON_UNTIL_DEFEATED =
    String(params.hideUntilDefeated || "false") === "true";

  // Map list visibility
  const HIDE_UNTIL_VISITED =
    String(params.hideUntilVisited || "false") === "true";

  const POI_INTRO_TITLE = String(params.poiIntroTitle || "");
  const POI_INTRO_NOTE = _stripQuotes(
    String(params.poiIntroNote || "")
  ).replace(/\\n/g, "\n");

  const MON_INTRO_TITLE = String(params.monIntroTitle || "");
  const MON_INTRO_NOTE = _stripQuotes(
    String(params.monIntroNote || "")
  ).replace(/\\n/g, "\n");

  // helpers for params
  function _toNum(v, d) {
    const n = Number(v);
    return isNaN(n) ? d : n;
  }
  function _clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function _parseHexColor(s) {
    const m = String(s || "").trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(m) ? m : "";
  }
  function _lineH(fs) {
    return Math.max(16, Math.round(Number(fs) + 8));
  }

  // font size params
  const FS_INFO_TEXT = _clamp(_toNum(params.fsInfoText, 28), 8, 96);
  const FS_GRID_NAME = _clamp(_toNum(params.fsGridItemName, 28), 8, 96);
  const FS_LIST_NAME = _clamp(_toNum(params.fsListItemName, 28), 8, 96);
  const FS_INTRO_TITLE = _clamp(_toNum(params.fsIntroTitle, 28), 8, 96);
  const FS_INTRO_NOTE = _clamp(_toNum(params.fsIntroNote, 28), 8, 96);

  // color params
  const COLOR_INTRO_TITLE = _parseHexColor(params.colorIntroTitleHex);
  const COLOR_ACCENT = _parseHexColor(params.colorAccentHex);

  // ───────────────── helpers ─────────────────
  function _stripQuotes(s) {
    s = String(s || "").trim();
    if (s === '""') return "";
    if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"')
      s = s.slice(1, -1).trim();
    return s;
  }
  function mapDisplayFallback(mapId) {
    const info = $dataMapInfos && $dataMapInfos[mapId];
    return info && info.name ? String(info.name) : "Map " + mapId;
  }

  function mapMeta(mapId) {
    try {
      if (window.IRMap) {
        if (typeof IRMap.getMapMeta === "function") {
          const m = IRMap.getMapMeta(mapId) || {};
          return {
            id: mapId,
            name: String(m.displayName || mapDisplayFallback(mapId)),
            info: _stripQuotes(m.info),
            desc: _stripQuotes(m.description),
            img: String(m.noteImage || ""),
          };
        }
        const name =
          (IRMap.getMapDisplayName && IRMap.getMapDisplayName(mapId)) ||
          mapDisplayFallback(mapId);
        const info = _stripQuotes(
          (IRMap.getMapNoteInfo && IRMap.getMapNoteInfo(mapId)) || ""
        );
        const desc = _stripQuotes(
          (IRMap.getMapDesc && IRMap.getMapDesc(mapId)) || ""
        );
        const img =
          (IRMap.getMapNoteImage && IRMap.getMapNoteImage(mapId)) || "";
        return { id: mapId, name: String(name), info, desc, img: String(img) };
      }
    } catch (_) {}
    return {
      id: mapId,
      name: mapDisplayFallback(mapId),
      info: "",
      desc: "",
      img: "",
    };
  }

  // EXTRA: <IMEMAP HIDDEN> from map NOTE
  const _hiddenByNote = Object.create(null),
    _loadingNote = Object.create(null);
  function _pad3(n) {
    let s = String(n);
    while (s.length < 3) s = "0" + s;
    return s;
  }
  function _fetchMapNoteHiddenAsync(mapId, onDone) {
    if (_hiddenByNote[mapId] !== undefined) {
      onDone && onDone(_hiddenByNote[mapId]);
      return;
    }
    if (_loadingNote[mapId]) return;
    _loadingNote[mapId] = true;
    const url = "data/Map" + _pad3(mapId) + ".json";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => {
      _loadingNote[mapId] = false;
      try {
        const j = JSON.parse(xhr.responseText);
        const note = String(j && j.note ? j.note : "");
        const hidden = /<\s*IMEMAP\s+HIDDEN\s*>/i.test(note);
        _hiddenByNote[mapId] = hidden;
        onDone && onDone(hidden);
      } catch (e) {
        _hiddenByNote[mapId] = false;
        onDone && onDone(false);
      }
    };
    xhr.onerror = () => {
      _loadingNote[mapId] = false;
      _hiddenByNote[mapId] = false;
      onDone && onDone(false);
    };
    xhr.send();
  }
  function _isHiddenByNote(mapId) {
    if (_hiddenByNote[mapId] === undefined) {
      _fetchMapNoteHiddenAsync(mapId, () => {
        const sc = SceneManager._scene;
        if (sc && sc._listWindow && sc._listWindow.refresh)
          sc._listWindow.refresh();
      });
      return false;
    }
    return !!_hiddenByNote[mapId];
  }
  function visibleMapIds() {
    const all = [];
    if ($dataMapInfos) {
      for (let i = 1; i < $dataMapInfos.length; i++)
        if ($dataMapInfos[i]) all.push(i);
    }
    let ids = all;

    if (window.IRMap) {
      if (typeof IRMap.getVisibleMapIds === "function")
        ids = IRMap.getVisibleMapIds();
      else if (typeof IRMap.isMapHidden === "function")
        ids = all.filter((id) => !IRMap.isMapHidden(id));
    }

    ids = ids.filter((id) => !_isHiddenByNote(id));

    if (HIDE_UNTIL_VISITED) {
      ids = ids.filter((id) => {
        try {
          return window.Gamemory && typeof Gamemory.hasVisited === "function"
            ? !!Gamemory.hasVisited(id)
            : true;
        } catch (e) {
          return true;
        }
      });
    }

    return ids;
  }

  function buildMapList() {
    return visibleMapIds().map((id) => {
      const meta = mapMeta(id);
      return { id, name: meta.name, meta };
    });
  }

  // ─────────── MONSTER EXTRACT (Encounters -> Troops -> Enemies) ───────────
  const _encEnemiesByMapId = Object.create(null);
  const _encWaiters = Object.create(null);
  const _encLoading = Object.create(null);

  function _enemyHiddenByNote(enemyId) {
    const e = $dataEnemies && $dataEnemies[enemyId];
    if (!e || !e.note) return false;
    return /<\s*IMEMONSTER\s+HIDDEN\s*>/i.test(String(e.note));
  }

  function _isDefeatedAtLeastOnce(enemyId) {
    try {
      if (!HIDE_MON_UNTIL_DEFEATED) return true;
      if (!window.Gamemory || typeof Gamemory.getEnemyKillCount !== "function")
        return true; // ha nincs Gamemory, ne tartsuk vissza
      return Gamemory.getEnemyKillCount(enemyId) > 0;
    } catch (e) {
      return true;
    }
  }

  function _fetchMapEncounterEnemies(mapId, onDone) {
    if (_encEnemiesByMapId[mapId]) {
      onDone && onDone(_encEnemiesByMapId[mapId].slice());
      return;
    }
    if (_encLoading[mapId]) {
      (_encWaiters[mapId] = _encWaiters[mapId] || []).push(onDone);
      return;
    }
    _encLoading[mapId] = true;
    _encWaiters[mapId] = _encWaiters[mapId] || [];
    if (onDone) _encWaiters[mapId].push(onDone);

    const url = "data/Map" + _pad3(mapId) + ".json";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => {
      _encLoading[mapId] = false;
      let out = [];
      try {
        const j = JSON.parse(xhr.responseText);
        const enc = (j && j.encounterList) || [];
        const troopIds = enc.map((e) => e.troopId).filter((id) => id > 0);

        const seen = Object.create(null);
        for (const tid of troopIds) {
          const troop = $dataTroops && $dataTroops[tid];
          if (!troop || !troop.members) continue;
          for (const m of troop.members) {
            const enemyId = m && m.enemyId;
            if (!enemyId || seen[enemyId]) continue;
            seen[enemyId] = true;
            if (_enemyHiddenByNote(enemyId)) continue;
            if (!_isDefeatedAtLeastOnce(enemyId)) continue;

            const e = $dataEnemies && $dataEnemies[enemyId];
            if (e) {
              out.push({
                id: enemyId,
                name: String(e.name || ""),
                img: String(e.battlerName || ""),
                hue: Number(e.battlerHue || 0),
              });
            }
          }
        }
      } catch (_) {
        out = [];
      }
      _encEnemiesByMapId[mapId] = out;
      const waiters = _encWaiters[mapId] || [];
      _encWaiters[mapId] = [];
      waiters.forEach((fn) => fn && fn(out.slice()));
    };
    xhr.onerror = () => {
      _encLoading[mapId] = false;
      _encEnemiesByMapId[mapId] = [];
      const waiters = _encWaiters[mapId] || [];
      _encWaiters[mapId] = [];
      waiters.forEach((fn) => fn && fn([]));
    };
    xhr.send();
  }

  // ─────────── commands ───────────
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    switch (String(command || "")) {
      case "EnableMapNotes":
        $gameSystem._mapNotesEnabled = true;
        break;
      case "DisableMapNotes":
        $gameSystem._mapNotesEnabled = false;
        break;
    }
  };

  // ─────────── menu entry ───────────
  const _Window_MenuCommand_addOriginalCommands =
    Window_MenuCommand.prototype.addOriginalCommands;
  Window_MenuCommand.prototype.addOriginalCommands = function () {
    _Window_MenuCommand_addOriginalCommands.call(this);
    if ($gameSystem._mapNotesEnabled === undefined)
      $gameSystem._mapNotesEnabled = enableInitial;
    if ($gameSystem._mapNotesEnabled)
      this.addCommand(MENU_TITLE, "mapNotesList", true);
  };
  const _Scene_Menu_createCommandWindow =
    Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler(
      "mapNotesList",
      this.commandMapNotes.bind(this)
    );
  };
  Scene_Menu.prototype.commandMapNotes = function () {
    SceneManager.push(Scene_MapNotes);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    const enabled =
      $gameSystem._mapNotesEnabled === undefined
        ? enableInitial
        : !!$gameSystem._mapNotesEnabled;
    if (Input.isTriggered(MAPNOTES_KEY) && enabled)
      SceneManager.push(Scene_MapNotes);
  };
  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _Scene_Boot_start.call(this);
    if ($gameSystem._mapNotesEnabled === undefined)
      $gameSystem._mapNotesEnabled = enableInitial;
  };

  // ─────────── Scene_MapNotes ───────────
  function Scene_MapNotes() {
    this.initialize.apply(this, arguments);
  }
  Scene_MapNotes.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_MapNotes.prototype.constructor = Scene_MapNotes;

  Scene_MapNotes.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
    this._detailsActive = false;
    this._currentTabIndex = 0;
    this._currentMapId = 0;
    this._tabKinds = [];
  };

  Scene_MapNotes.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);

    this._titleWindow = new Window_MapNotesTitle();
    this.addWindow(this._titleWindow);

    const titleHeight = this._titleWindow.height;
    const tempWindow = new Window_Base(0, 0, 0, 0);
    const headerHeight = tempWindow.fittingHeight(3);
    const contentHeight = Graphics.boxHeight - titleHeight - headerHeight;

    this._listWindow = new Window_MapNotesList(
      0,
      titleHeight,
      300,
      contentHeight + headerHeight
    );
    this._listWindow.setHandler("ok", this.onItemOk.bind(this));
    this._listWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._listWindow);

    this._headerWindow = new Window_MapNotesHeader(
      300,
      titleHeight,
      Graphics.boxWidth - 300,
      headerHeight
    );
    this.addWindow(this._headerWindow);

    const rightX = 300,
      rightW = Graphics.boxWidth - 300,
      tabBarH = tempWindow.fittingHeight(1);

    const tabs = [];
    if (TAB_INFO_ON) tabs.push({ kind: "info", label: TAB_INFO_LABEL });
    if (TAB_POI_ON) tabs.push({ kind: "poi", label: TAB_POI_LABEL });
    if (TAB_MON_ON) tabs.push({ kind: "mon", label: TAB_MON_LABEL });
    if (tabs.length === 0) tabs.push({ kind: "info", label: TAB_INFO_LABEL });
    this._tabKinds = tabs.map((t) => t.kind);

    this._tabBar = new Window_MapNotesTabBar(
      rightX,
      titleHeight + headerHeight,
      rightW,
      tabBarH,
      tabs.map((t) => t.label)
    );
    this.addWindow(this._tabBar);

    this._contentWindow = new Window_MapNotesContent(
      rightX,
      titleHeight + headerHeight + tabBarH,
      rightW,
      contentHeight - tabBarH
    );
    this.addWindow(this._contentWindow);
  };

  Scene_MapNotes.prototype.onItemOk = function () {
    const row = this._listWindow.item();
    if (!row) return;
    const m = row.meta || mapMeta(row.id);
    this._currentMapId = row.id;
    this._headerWindow.setData(m.img, m.name, m.info);
    this._currentTabIndex = 0;
    this._tabBar.select(0);
    this._applyTab(0);
    this._detailsActive = true;
    this._contentWindow.activate();
  };

  Scene_MapNotes.prototype.update = function () {
    Scene_MenuBase.prototype.update.call(this);

    // bal/jobb: TAB váltás csak ha a content nem lapoz
    if (this._detailsActive && this._tabBar) {
      const contentConsumes =
        this._contentWindow && this._contentWindow.consumesLeftRight();
      if (!contentConsumes) {
        if (Input.isTriggered("left") || Input.isRepeated("left"))
          this._moveTab(-1);
        if (Input.isTriggered("right") || Input.isRepeated("right"))
          this._moveTab(1);
      }
    }

    // ha a TabBar indexe változna kívülről
    if (this._detailsActive && this._tabBar) {
      const idx = this._tabBar.index();
      if (idx !== this._currentTabIndex) {
        this._currentTabIndex = idx;
        this._applyTab(idx);
      }
    }

    if (this._detailsActive && Input.isTriggered("cancel")) {
      this._detailsActive = false;
      this._headerWindow.clear();
      this._contentWindow.clear();
      this._tabBar.deselect();
      this._listWindow.activate();
    }
  };

  Scene_MapNotes.prototype._moveTab = function (delta) {
    const max = this._tabBar.maxItems();
    let i = (this._tabBar.index() + delta + max) % max;
    this._tabBar.select(i);
    this._applyTab(i);
    if (window.SoundManager && SoundManager.playCursor)
      SoundManager.playCursor();
  };

  Scene_MapNotes.prototype._applyTab = function (idx) {
    const mapId = this._currentMapId;
    if (!mapId) return;
    const kind = this._tabKinds[idx] || "info";
    const m = mapMeta(mapId);
    if (kind === "info") {
      this._contentWindow.setModeInfo(m.desc);
    } else if (kind === "poi") {
      const list =
        window.IME && IME.getVisiblePoiSummaries
          ? IME.getVisiblePoiSummaries(mapId)
          : [];
      this._contentWindow.setModeListLike("poi", list, {
        mode: POI_LAYOUT_MODE,
        colsGrid: POI_GRID_COLS,
        colsList: POI_LIST_COLS,
        thumbW: POI_LIST_THUMB_W,
        thumbH: POI_LIST_THUMB_H,
      });
    } else {
      // MONSTERS: először üres, majd async tölti az encounters-ből
      this._contentWindow.setModeListLike("mon", [], {
        mode: MON_LAYOUT_MODE,
        colsGrid: MON_GRID_COLS,
        colsList: MON_LIST_COLS,
        thumbW: MON_LIST_THUMB_W,
        thumbH: MON_LIST_THUMB_H,
      });

      _fetchMapEncounterEnemies(mapId, (enemyList) => {
        if (this._currentMapId !== mapId) return;
        const list = HIDE_MON_UNTIL_DEFEATED
          ? enemyList.filter(
              (e) =>
                !Gamemory ||
                typeof Gamemory.getEnemyKillCount !== "function" ||
                Gamemory.getEnemyKillCount(e.id) > 0
            )
          : enemyList;
        this._contentWindow.setModeListLike("mon", list, {
          mode: MON_LAYOUT_MODE,
          colsGrid: MON_GRID_COLS,
          colsList: MON_LIST_COLS,
          thumbW: MON_LIST_THUMB_W,
          thumbH: MON_LIST_THUMB_H,
        });
      });
    }
  };

  // ─────────── Windows ───────────
  function Window_MapNotesTitle() {
    const tmp = new Window_Base(0, 0, 0, 0);
    const h = tmp.fittingHeight(1);
    Window_Base.call(this, 0, 0, Graphics.boxWidth, h);
    this.refresh();
  }
  Window_MapNotesTitle.prototype = Object.create(Window_Base.prototype);
  Window_MapNotesTitle.prototype.constructor = Window_MapNotesTitle;
  Window_MapNotesTitle.prototype.refresh = function () {
    this.contents.clear();
    const y = (this.contentsHeight() - this.lineHeight()) / 2;
    this.drawText(MENU_TITLE, 0, y, this.contentsWidth(), "center");
  };

  function Window_MapNotesList(x, y, w, h) {
    Window_Selectable.call(this, x, y, w, h);
    this.refresh();
    this.select(0);
    this.activate();
  }
  Window_MapNotesList.prototype = Object.create(Window_Selectable.prototype);
  Window_MapNotesList.prototype.constructor = Window_MapNotesList;
  Window_MapNotesList.prototype.refresh = function () {
    this._data = buildMapList();
    this.createContents();
    this.drawAllItems();
  };
  Window_MapNotesList.prototype.maxItems = function () {
    return this._data ? this._data.length : 0;
  };
  Window_MapNotesList.prototype.item = function () {
    return this._data && this.index() >= 0 ? this._data[this.index()] : null;
  };
  Window_MapNotesList.prototype.drawItem = function (index) {
    const item = this._data[index];
    if (!item) return;
    const rect = this.itemRectForText(index);
    this.drawText(item.name, rect.x, rect.y, rect.width);
  };

  function Window_MapNotesHeader(x, y, w, h) {
    Window_Base.call(this, x, y, w, h);
    this._imgName = "";
    this._bmp = null;
    this._name = "";
    this._info = "";
  }
  Window_MapNotesHeader.prototype = Object.create(Window_Base.prototype);
  Window_MapNotesHeader.prototype.constructor = Window_MapNotesHeader;
  Window_MapNotesHeader.prototype.setData = function (
    imgName,
    mapName,
    infoText
  ) {
    this._imgName = String(imgName || "");
    this._name = String(mapName || "");
    this._info = String(infoText || "");
    this._bmp = null;
    if (this._imgName) {
      const b = ImageManager.loadBitmap("img/maps/", this._imgName, 0, true);
      b.addLoadListener(() => {
        this._bmp = b;
        this.refresh();
      });
    }
    this.refresh();
  };
  Window_MapNotesHeader.prototype.setMapName = function (name) {
    this._name = String(name || "");
    this.refresh();
  };
  Window_MapNotesHeader.prototype.clear = function () {
    this._imgName = "";
    this._bmp = null;
    this._name = "";
    this._info = "";
    this.refresh();
  };
  Window_MapNotesHeader.prototype.refresh = function () {
    this.contents.clear();
    const pad = this.textPadding();
    let x = pad;
    if (this._bmp && this._bmp.width && this._bmp.height) {
      const boxW = Window_Base._faceWidth || 144;
      const topY = Math.floor(pad / 2),
        bottomY = this.contentsHeight() - pad;
      const boxH = Math.max(1, bottomY - topY);
      let k = boxH / this._bmp.height;
      if (this._bmp.width * k > boxW) k = boxW / this._bmp.width;
      const dw = Math.round(this._bmp.width * k),
        dh = Math.round(this._bmp.height * k);
      const dx = x + Math.floor((boxW - dw) / 2),
        dy = topY;
      this.contents.blt(
        this._bmp,
        0,
        0,
        this._bmp.width,
        this._bmp.height,
        dx,
        dy,
        dw,
        dh
      );
      x += boxW + 12;
    }
    this.changeTextColor(this.normalColor());
    this.drawText(this._name || "", x, pad / 2, this.contentsWidth() - x - pad);
    if (this._info) {
      this.changeTextColor(this.systemColor());
      this.drawText(
        this._info,
        x,
        pad / 2 + this.lineHeight(),
        this.contentsWidth() - x - pad
      );
      this.resetTextColor();
    }
  };

  function Window_MapNotesTabBar(x, y, w, h, labels) {
    this._labels = labels || ["Info", "Elements", "Monsters"];
    this._fixedW = w;
    this._fixedH = h;
    Window_Command.prototype.initialize.call(this, x, y);
    this.select(0);
    this.deactivate();
  }
  Window_MapNotesTabBar.prototype = Object.create(Window_Command.prototype);
  Window_MapNotesTabBar.prototype.constructor = Window_MapNotesTabBar;
  Window_MapNotesTabBar.prototype.windowWidth = function () {
    return this._fixedW || 240;
  };
  Window_MapNotesTabBar.prototype.windowHeight = function () {
    return this._fixedH || this.fittingHeight(1);
  };
  Window_MapNotesTabBar.prototype.numVisibleRows = function () {
    return 1;
  };
  Window_MapNotesTabBar.prototype.maxCols = function () {
    return this._labels.length;
  };
  Window_MapNotesTabBar.prototype.makeCommandList = function () {
    for (let i = 0; i < this._labels.length; i++)
      this.addCommand(this._labels[i], "tab" + i);
  };
  Window_MapNotesTabBar.prototype.itemTextAlign = function () {
    return "center";
  };
  Window_MapNotesTabBar.prototype.update = function () {
    Window_Command.prototype.update.call(this);
    if (
      !this.active &&
      TouchInput.isTriggered() &&
      this.isTouchedInsideFrame()
    ) {
      const localX = TouchInput.x - this.x - this.padding;
      const w = this.itemWidth();
      let idx = Math.floor(localX / Math.max(1, w));
      idx = Math.max(0, Math.min(idx, this.maxItems() - 1));
      this.select(idx);
      const sc = SceneManager._scene;
      if (sc && sc._applyTab) sc._applyTab(idx);
      if (window.SoundManager && SoundManager.playCursor)
        SoundManager.playCursor();
    }
  };

  // ─────────── Content with centralized pagination ───────────
  function Window_MapNotesContent(x, y, w, h) {
    Window_Base.call(this, x, y, w, h);
    this._mode = "info";
    this._infoText = "";
    this._poiList = [];
    this._monList = [];
    this._poiToken = 0;

    // intro (title + note) a lista módokhoz
    this._introTitle = "";
    this._introNote = "";

    // paginator state
    this._pageIdx = 0;
    this._pagesTotal = 1;
  }
  Window_MapNotesContent.prototype = Object.create(Window_Base.prototype);
  Window_MapNotesContent.prototype.constructor = Window_MapNotesContent;

  Window_MapNotesContent.prototype.consumesLeftRight = function () {
    return false;
  };

  Window_MapNotesContent.prototype.clear = function () {
    this._mode = "info";
    this._infoText = "";
    this._poiList = [];
    this._monList = [];
    this._introTitle = "";
    this._introNote = "";
    this._pageIdx = 0;
    this._pagesTotal = 1;
    this.contents.clear();
  };

  Window_MapNotesContent.prototype.setModeInfo = function (desc) {
    this._mode = "info";
    this._infoText = String(_stripQuotes(desc || "")).replace(/\\n/g, "\n");
    this._pageIdx = 0;
    this._pagesTotal = 1;
    this.refresh();
    this.activate();
  };

  // generic list-like (poi/mon)
  Window_MapNotesContent.prototype.setModeListLike = function (
    kind,
    items,
    layout
  ) {
    this._mode = kind === "poi" ? "poi" : "mon";
    if (this._mode === "poi") {
      this._poiList = Array.isArray(items) ? items.slice() : [];
      this._poiToken++;
      this._poiLayout = Object.assign(
        { mode: "grid", colsGrid: 3, colsList: 1, thumbW: 64, thumbH: 64 },
        layout || {}
      );
      this._introTitle = POI_INTRO_TITLE;
      this._introNote = POI_INTRO_NOTE;
    } else {
      this._monList = Array.isArray(items) ? items.slice() : [];
      this._monLayout = Object.assign(
        { mode: "list", colsGrid: 3, colsList: 1, thumbW: 48, thumbH: 48 },
        layout || {}
      );
      this._introTitle = MON_INTRO_TITLE;
      this._introNote = MON_INTRO_NOTE;
    }
    this._pageIdx = 0;
    this._pagesTotal = 1;
    this.refresh();
    this.activate();
  };

  Window_MapNotesContent.prototype.setModeMonsters = function (monsters) {
    this.setModeListLike("mon", monsters || [], {
      mode: "list",
      colsList: 1,
      thumbW: 48,
      thumbH: 48,
    });
  };

  // paginator controls
  Window_MapNotesContent.prototype._setPages = function (total) {
    this._pagesTotal = Math.max(1, total | 0);
    this._pageIdx = Math.min(this._pageIdx, this._pagesTotal - 1);
  };
  Window_MapNotesContent.prototype._pageUp = function () {
    if (this._pageIdx > 0) {
      this._pageIdx--;
      if (this._mode === "poi") this._poiToken++;
      this.refresh();
    }
  };
  Window_MapNotesContent.prototype._pageDown = function () {
    if (this._pageIdx < this._pagesTotal - 1) {
      this._pageIdx++;
      if (this._mode === "poi") this._poiToken++;
      this.refresh();
    }
  };

  Window_MapNotesContent.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    if (!this.active) return;
    if (this._pagesTotal > 1) {
      if (Input.isTriggered("pageup") || Input.isRepeated("pageup"))
        this._pageUp();
      if (Input.isTriggered("pagedown") || Input.isRepeated("pagedown"))
        this._pageDown();
    }
  };

  Window_MapNotesContent.prototype.refresh = function () {
    this.contents.clear();
    if (this._mode === "info") this._refreshInfo();
    else if (this._mode === "poi")
      this._refreshListLike(this._poiList, this._poiLayout, this._poiToken);
    else
      this._refreshListLike(
        this._monList,
        this._monLayout || { mode: "list", colsList: 1 },
        /*token*/ null
      );
  };

  // text wrap
  Window_MapNotesContent.prototype._wrapText = function (text, maxW, fontSize) {
    const prev = this.contents.fontSize;
    if (fontSize) this.contents.fontSize = fontSize;

    const t = String(text || "").split(/\r?\n/);
    const out = [];
    for (const para of t) {
      if (!para.trim()) {
        out.push("");
        continue;
      }
      const words = para.split(/\s+/);
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (this.textWidth(test) > maxW - this.textPadding() * 2 && line) {
          out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) out.push(line);
    }

    this.contents.fontSize = prev;
    return out;
  };

  Window_MapNotesContent.prototype._drawPagerHint = function () {
    if (this._pagesTotal <= 1) return;
    const pad = this.textPadding();
    const y = this.contentsHeight() - this.lineHeight();

    if (COLOR_ACCENT) this.changeTextColor(COLOR_ACCENT);
    else this.changeTextColor(this.systemColor());

    this.drawText(
      "Lap: " + (this._pageIdx + 1) + "/" + this._pagesTotal + " (PgUp/PgDn)",
      pad,
      y,
      this.contentsWidth() - pad * 2,
      "right"
    );
    this.resetTextColor();
  };

  // Info mode with pagination
  Window_MapNotesContent.prototype._refreshInfo = function () {
    const pad = this.textPadding();
    const cw = this.contentsWidth();

    const prevFS = this.contents.fontSize;
    const lh = _lineH(FS_INFO_TEXT);
    this.contents.fontSize = FS_INFO_TEXT;

    const lines = this._wrapText(this._infoText, cw, FS_INFO_TEXT);
    const linesPerPage = Math.max(
      1,
      Math.floor((this.contentsHeight() - pad * 2) / lh) - 1
    );
    const totalPages = Math.max(1, Math.ceil(lines.length / linesPerPage));
    this._setPages(totalPages);

    const start = this._pageIdx * linesPerPage;
    const pageLines = lines.slice(start, start + linesPerPage);

    let y = pad;
    for (const line of pageLines) {
      this.drawText(line, pad, y, cw - pad * 2, "left");
      y += lh;
    }

    this.contents.fontSize = prevFS;
    this._drawPagerHint();
  };

  // Unified renderer for POI/Monsters (grid/list) with pagination
  Window_MapNotesContent.prototype._refreshListLike = function (
    list,
    layout,
    token
  ) {
    const pad = this.textPadding(),
      cw = this.contentsWidth(),
      ch = this.contentsHeight();

    const mode = (layout && layout.mode) === "list" ? "list" : "grid";
    const cols =
      mode === "grid"
        ? Math.max(1, layout.colsGrid || 3)
        : Math.max(1, layout.colsList || 1);

    const gutterX = 10,
      gutterY = 8;
    const cellW = Math.floor((cw - pad * 2 - gutterX * (cols - 1)) / cols);

    // név sor-magasság
    const nameLH =
      mode === "grid" ? _lineH(FS_GRID_NAME) : _lineH(FS_LIST_NAME);
    let cellH, imgBoxW, imgBoxH, nameYOffset;

    if (mode === "grid") {
      imgBoxW = cellW;
      imgBoxH = cellW;
      cellH = imgBoxH + 6 + nameLH;
      nameYOffset = imgBoxH + 6;
    } else {
      imgBoxW = Math.min(layout.thumbW || 64, cellW);
      imgBoxH = Math.min(
        layout.thumbH || 64,
        Math.floor(this.contentsHeight() / 2)
      );
      const rowH = Math.max(imgBoxH, nameLH);
      cellH = rowH;
      nameYOffset = Math.floor((rowH - nameLH) / 2);
    }

    // INTRO blokk
    let introH = 0;
    if (this._introTitle || this._introNote) {
      let y = pad;

      let titleLH = 0,
        noteLH = 0;

      // Title
      if (this._introTitle) {
        const prevFS = this.contents.fontSize;
        this.contents.fontSize = FS_INTRO_TITLE;

        if (COLOR_INTRO_TITLE) this.changeTextColor(COLOR_INTRO_TITLE);
        else this.changeTextColor(this.systemColor());

        this.drawText(this._introTitle, pad, y, cw - pad * 2, "left");
        this.resetTextColor();

        titleLH = _lineH(FS_INTRO_TITLE);
        const gapTiny = Math.max(2, Math.floor(titleLH / 6));
        y += titleLH + gapTiny;

        this.contents.fontSize = prevFS;
      }

      // Note
      if (this._introNote) {
        const prevFS = this.contents.fontSize;
        this.contents.fontSize = FS_INTRO_NOTE;

        noteLH = _lineH(FS_INTRO_NOTE);
        const lines = this._wrapText(this._introNote, cw, FS_INTRO_NOTE);
        for (const line of lines) {
          this.drawText(line, pad, y, cw - pad * 2, "left");
          y += noteLH;
        }

        this.contents.fontSize = prevFS;
      }

      const baseLH = Math.max(
        titleLH || _lineH(FS_INTRO_TITLE),
        noteLH || _lineH(FS_INTRO_NOTE)
      );
      const hrTopGap = Math.max(4, Math.floor(baseLH / 4));
      const hrBottomGap = Math.max(8, Math.floor(baseLH / 3));

      const hrY = y + hrTopGap;
      const prevOpacity = this.contents.paintOpacity;
      this.contents.paintOpacity = 192;
      this.contents.fillRect(pad, hrY, cw - pad * 2, 1, "#FFFFFF");
      this.contents.paintOpacity = prevOpacity;

      y = hrY + 1 + hrBottomGap;
      introH = y - pad;
    }

    // kapacitás
    const usable = Math.max(1, ch - pad * 2 - introH);
    const rows = Math.max(
      1,
      Math.floor((usable + gutterY) / (cellH + gutterY))
    );
    const capacity = rows * cols;

    const totalPages = Math.max(
      1,
      Math.ceil(list.length / Math.max(1, capacity))
    );
    this._setPages(totalPages);

    const start = this._pageIdx * capacity;
    const count = Math.min(capacity, Math.max(0, list.length - start));

    // lista elemek
    for (let i = 0; i < count; i++) {
      const it = list[start + i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cellW + gutterX);
      const y = pad + introH + row * (cellH + gutterY);

      // kép
      const imgName = String(it.img || "");
      if (imgName) {
        let bmp;
        if (this._mode === "mon") {
          const hue = Number(it.hue || it.imgHue || 0);
          bmp = ImageManager.loadEnemy(imgName, hue);
        } else {
          bmp = ImageManager.loadBitmap(
            "img/interactivelements/",
            imgName,
            0,
            true
          );
        }

        bmp.addLoadListener(() => {
          if (this._mode !== "poi" && this._mode !== "mon") return;
          if (token != null && token !== this._poiToken) return;
          const iw = bmp.width,
            ih = bmp.height;
          if (!iw || !ih) return;

          if (mode === "grid") {
            const scale = Math.min(imgBoxW / iw, imgBoxH / ih);
            const dw = Math.round(iw * scale),
              dh = Math.round(ih * scale);
            const dx = x + Math.floor((cellW - dw) / 2);
            const dy = y + Math.floor((imgBoxH - dh) / 2);
            this.contents.blt(bmp, 0, 0, iw, ih, dx, dy, dw, dh);
          } else {
            const scale = Math.min(imgBoxW / iw, imgBoxH / ih);
            const dw = Math.round(iw * scale),
              dh = Math.round(ih * scale);
            const dx = x;
            const dy = y + Math.floor((cellH - dh) / 2);
            this.contents.blt(bmp, 0, 0, iw, ih, dx, dy, dw, dh);
          }
        });
      }

      // név
      const name = String(it.name || "");
      const prevFS = this.contents.fontSize;
      this.contents.fontSize = mode === "grid" ? FS_GRID_NAME : FS_LIST_NAME;

      this.changeTextColor(this.normalColor());
      if (mode === "grid") {
        this.drawText(name, x, y + nameYOffset, cellW, "center");
      } else {
        const textX = x + imgBoxW + 8;
        this.drawText(
          name,
          textX,
          y + nameYOffset,
          cellW - imgBoxW - 8,
          "left"
        );
      }
      this.resetTextColor();
      this.contents.fontSize = prevFS;
    }

    // “+more…”
    if (this._pageIdx === this._pagesTotal - 1 && list.length > start + count) {
      const remain = list.length - (start + count);
      if (COLOR_ACCENT) this.changeTextColor(COLOR_ACCENT);
      else this.changeTextColor(this.systemColor());

      this.drawText(
        "+" + remain + " more…",
        pad,
        ch - this.lineHeight() - 2,
        cw - pad * 2,
        "right"
      );
      this.resetTextColor();
    }

    this._drawPagerHint();
  };
  const _IMN_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    _IMN_endBattle.call(this, result);
    try {
      const mapId = $gameMap ? $gameMap.mapId() : 0;
      if (mapId && typeof _encEnemiesByMapId !== "undefined") {
        delete _encEnemiesByMapId[mapId];
      }
      const sc = SceneManager._scene;
      if (
        sc &&
        sc.constructor === Scene_MapNotes &&
        sc._tabKinds[sc._tabBar.index()] === "mon"
      ) {
        sc._applyTab(sc._tabBar.index());
      }
    } catch (e) {}
  };
})();

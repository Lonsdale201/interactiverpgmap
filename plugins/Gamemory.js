/*:
 * @plugindesc v1.1 Gamemory - persistent memory for map visits and battle stats (enemy kills, troop encounters/win/loss, total victories/game overs/monster kills). Data survives save/load.
 * @author Soczó Kristóf
 * @version v1.0
 * @help
 * Goals:
 * 1) Track whether a map was ever visited and how many times.
 * 2) Battle stats:
 *    - Enemy kill counter: how many times each ENEMY was defeated (counts multiple deaths per battle).
 *    - Troop encounter counter: how many times each TROOP was encountered.
 *    - Troop win / loss counters per TROOP.
 *    - Totals: totalVictories, totalGameOvers, totalMonsterKills.
 *
 * The starting map is marked as visited immediately.
 *
 * @param enableConsoleLog
 * @text Enable log to console
 * @type boolean
 * @on On
 * @off Off
 * @default true
 *
 * @param enableDebugWindow
 * @text Enable Debug Window
 * @type boolean
 * @on On
 * @off Off
 * @default false
 *
 * @param debugHotkey
 * @text Debug Hotkey
 * @type string
 * @default C
 * @desc Keycode number or single character that opens the debug window.
 *
 * === Script/API (from other plugins or Script calls) ===
 *   // Maps
 *   Gamemory.hasVisited(mapId)                -> boolean
 *   Gamemory.getVisitCount(mapId)             -> number (0 if never visited)
 *   Gamemory.markVisited(mapId)               -> number (new visit count)
 *   Gamemory.visitedMaps()                    -> number[] (all visited mapIds)
 *   Gamemory.resetMap(mapId)                  -> void
 *   Gamemory.getAll()                         -> { [mapId: number]: number } (map visit counts)
 *
 *   // Battle - Enemy
 *   Gamemory.getEnemyKillCount(enemyId)       -> number
 *   Gamemory.getEnemyKillCountForMap(enemyId, mapId) -> number
 *   Gamemory.getEnemyKillMaps(enemyId)        -> { [mapId: number]: number }
 *   Gamemory.markEnemyDefeated(enemyId[, mapId]) -> number (total kills)
 *
 *   // Battle - Troop
 *   Gamemory.getTroopEncounterCount(troopId)  -> number
 *   Gamemory.getTroopWinCount(troopId)        -> number
 *   Gamemory.getTroopLossCount(troopId)       -> number
 *   Gamemory.markBattleEncounter(troopId)     -> number
 *   Gamemory.markBattleWin(troopId)           -> number
 *   Gamemory.markBattleLoss(troopId)          -> number
 *
 *   // Battle - Totals
 *   Gamemory.getTotalVictories()              -> number
 *   Gamemory.getTotalGameOvers()              -> number
 *   Gamemory.getTotalMonstersDefeated()       -> number
 *   Gamemory.markGameOver()                   -> number
 *
 *   // Snapshot
 *   Gamemory.getBattleStats() -> {
 *     enemyKills: { [enemyId]: count },
 *     enemyKillsByMap: { [enemyId]: { [mapId]: count } },
 *     troopEncounters: { [troopId]: count },
 *     troopWins: { [troopId]: count },
 *     troopLosses: { [troopId]: count },
 *     totalVictories: number,
 *     totalGameOvers: number,
 *     totalMonsterKills: number
 *   }
 *
 * === Plugin Commands (MV) ===
 *   // Maps
 *   GAMEMORY CHECK_VISITED <mapId|CURRENT> <switchId>
 *   GAMEMORY GET_COUNT    <mapId|CURRENT> <variableId>
 *   GAMEMORY MARK_VISITED <mapId|CURRENT>
 *   GAMEMORY RESET_MAP    <mapId|CURRENT>
 *
 *   // Battle stats to variables
 *   GAMEMORY ENEMY_KILLS         <enemyId>     <variableId>
 *   GAMEMORY TROOP_ENCOUNTERS    <troopId>     <variableId>
 *   GAMEMORY TROOP_WINS          <troopId>     <variableId>
 *   GAMEMORY TROOP_LOSSES        <troopId>     <variableId>
 *   GAMEMORY TOTAL_VICTORIES     <variableId>
 *   GAMEMORY TOTAL_GAMEOVERS     <variableId>
 *   GAMEMORY TOTAL_MONSTER_KILLS <variableId>
 *
 *   // Logging helpers
 *   GAMEMORY LOG_BATTLE          // logs current troop id + encounter results
 *   GAMEMORY LOG_ALL             // dumps all stats
 *
 * Changelog:
 *   - 2026.04.06 - Initial release v1.0
 */

(function () {
  "use strict";

  // Plugin params
  var GM_PARAMS = PluginManager.parameters("Gamemory"); // ensure the filename is Gamemory.js
  var GM_LOG_ENABLED = (GM_PARAMS["enableConsoleLog"] || "true") !== "false";

  var GM_DEBUG_ENABLED =
    String(GM_PARAMS["enableDebugWindow"] || "false").toLowerCase() === "true";
  var GM_DEBUG_HOTKEY_RAW = GM_PARAMS["debugHotkey"] || "C";

  function gmParseDebugHotkey(value) {
    if (value === null || value === undefined) {
      return 67;
    }
    if (typeof value === "number" && !isNaN(value)) {
      return Math.max(1, Math.floor(value));
    }
    var str = String(value).trim();
    if (!str) {
      return 67;
    }
    var numeric = parseInt(str, 10);
    if (!isNaN(numeric) && numeric > 0) {
      return numeric;
    }
    return str.toUpperCase().charCodeAt(0);
  }

  function gmFormatDebugHotkeyLabel(code) {
    if (code >= 65 && code <= 90) return String.fromCharCode(code);
    if (code >= 48 && code <= 57) return String.fromCharCode(code);
    return String(code);
  }

  var GM_DEBUG_HOTKEY_CODE = gmParseDebugHotkey(GM_DEBUG_HOTKEY_RAW);
  var GM_DEBUG_HOTKEY_LABEL = gmFormatDebugHotkeyLabel(GM_DEBUG_HOTKEY_CODE);
  var GM_DEBUG_KEY_STATE = { down: false, trigger: false };
  var GM_DEBUG_LISTENERS_INSTALLED = false;

  function gmInstallDebugHotkeyListeners() {
    if (GM_DEBUG_LISTENERS_INSTALLED) return;
    if (typeof window === "undefined") return;
    GM_DEBUG_LISTENERS_INSTALLED = true;
    window.addEventListener("keydown", function (event) {
      if (!GM_DEBUG_ENABLED) return;
      if (!event) return;
      if (event.keyCode !== GM_DEBUG_HOTKEY_CODE) return;
      var target = event.target;
      if (target && target.tagName) {
        var tag = String(target.tagName).toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA") {
          return;
        }
      }
      if (!GM_DEBUG_KEY_STATE.down) {
        GM_DEBUG_KEY_STATE.trigger = true;
      }
      GM_DEBUG_KEY_STATE.down = true;
    });
    window.addEventListener("keyup", function (event) {
      if (!event) return;
      if (event.keyCode === GM_DEBUG_HOTKEY_CODE) {
        GM_DEBUG_KEY_STATE.down = false;
      }
    });
    window.addEventListener("blur", function () {
      GM_DEBUG_KEY_STATE.down = false;
    });
  }

  function gmConsumeDebugHotkeyTrigger() {
    if (!GM_DEBUG_ENABLED) return false;
    if (GM_DEBUG_KEY_STATE.trigger) {
      GM_DEBUG_KEY_STATE.trigger = false;
      return true;
    }
    return false;
  }

  function gmResetDebugHotkeyState() {
    GM_DEBUG_KEY_STATE.trigger = false;
    GM_DEBUG_KEY_STATE.down = false;
  }

  if (GM_DEBUG_ENABLED) {
    gmInstallDebugHotkeyListeners();
  }

  function Game_Gamemory() {
    this.initialize();
  }

  Game_Gamemory.prototype.initialize = function () {
    // MAP DATA
    this._mapVisits = {}; // mapId -> count

    // HARC - ENEMY
    this._enemyKills = {}; // enemyId -> killCount
    this._enemyKillsByMap = {}; // enemyId -> { mapId: killCount }

    // HARC - TROOP
    this._troopEncounters = {}; // troopId -> count
    this._troopWins = {}; // troopId -> wins
    this._troopLosses = {}; // troopId -> losses

    // COMBAT TOTALS
    this._totalVictories = 0;
    this._totalGameOvers = 0;
    this._totalMonsterKills = 0;

    // DAMAGE TRACKING
    this._totalDamageDealt = 0;
    this._totalDamageTaken = 0;
    this._damageDealtByType = {}; // damageTypeId -> total damage dealt
    this._damageTakenByType = {}; // damageTypeId -> total damage taken
  };

  Game_Gamemory.prototype._coerceId = function (id) {
    var n = Number(id);
    return isNaN(n) ? 0 : Math.max(0, Math.floor(n));
  };

  Game_Gamemory.prototype._incMap = function (obj, key, delta) {
    key = String(this._coerceId(key));
    var d = delta == null ? 1 : Number(delta) || 0;
    obj[key] = (obj[key] || 0) + d;
    return obj[key];
  };

  Game_Gamemory.prototype.markVisited = function (mapId) {
    var id = this._coerceId(mapId);
    if (id <= 0) return 0;
    var next = (this._mapVisits[id] || 0) + 1;
    this._mapVisits[id] = next;
    Gamemory._log("Map #" + id + " visited -> count: " + next);
    return next;
  };

  Game_Gamemory.prototype.hasVisited = function (mapId) {
    var id = this._coerceId(mapId);
    return (this._mapVisits[id] || 0) > 0;
  };

  Game_Gamemory.prototype.getVisitCount = function (mapId) {
    var id = this._coerceId(mapId);
    return this._mapVisits[id] || 0;
  };

  Game_Gamemory.prototype.resetMap = function (mapId) {
    var id = this._coerceId(mapId);
    if (id > 0 && this._mapVisits[id]) {
      delete this._mapVisits[id];
      Gamemory._log("Map #" + id + " counter reset.");
    }
  };

  Game_Gamemory.prototype.visitedMaps = function () {
    var result = [];
    for (var k in this._mapVisits)
      if (this._mapVisits.hasOwnProperty(k)) {
        if (this._mapVisits[k] > 0) result.push(Number(k));
      }
    return result;
  };

  Game_Gamemory.prototype.getAll = function () {
    // Return a shallow copy (maps only) to keep backward compatibility
    var copy = {};
    for (var k in this._mapVisits)
      if (this._mapVisits.hasOwnProperty(k)) copy[k] = this._mapVisits[k];
    return copy;
  };

  Game_Gamemory.prototype.clear = function () {
    this.initialize();
    Gamemory._log("All Gamemory data cleared.");
  };

  Game_Gamemory.prototype.markEnemyDefeated = function (enemyId, mapId) {
    var id = this._coerceId(enemyId);
    if (id <= 0) return 0;
    var totalKills = this._incMap(this._enemyKills, id, 1);
    this._totalMonsterKills += 1;

    var map = this._coerceId(mapId);
    if (
      map <= 0 &&
      typeof $gameMap !== "undefined" &&
      $gameMap &&
      $gameMap.mapId
    ) {
      map = this._coerceId($gameMap.mapId());
    }

    var mapKills = 0;
    if (map > 0) {
      if (!this._enemyKillsByMap[id]) this._enemyKillsByMap[id] = {};
      mapKills = this._incMap(this._enemyKillsByMap[id], map, 1);
    }

    var log = "Enemy #" + id + " defeated -> total kills: " + totalKills;
    if (map > 0) {
      log += " (map #" + map + ": " + mapKills + ")";
    }
    Gamemory._log(log);
    return totalKills;
  };
  Game_Gamemory.prototype.getEnemyKillCount = function (enemyId) {
    var id = this._coerceId(enemyId);
    return this._enemyKills[id] || 0;
  };

  Game_Gamemory.prototype.getEnemyKillCountForMap = function (enemyId, mapId) {
    var id = this._coerceId(enemyId);
    var map = this._coerceId(mapId);
    if (id <= 0 || map <= 0) return 0;
    var table = this._enemyKillsByMap[id];
    return (table && table[map]) || 0;
  };

  Game_Gamemory.prototype.getEnemyKillMaps = function (enemyId) {
    var id = this._coerceId(enemyId);
    if (id <= 0) return {};
    var source = this._enemyKillsByMap[id] || {};
    var result = {};
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        result[Number(key)] = source[key] || 0;
      }
    }
    return result;
  };

  Game_Gamemory.prototype.markBattleEncounter = function (troopId) {
    var id = this._coerceId(troopId);
    if (id <= 0) return 0;
    var next = this._incMap(this._troopEncounters, id, 1);
    Gamemory._log("Troop #" + id + " encounter -> " + next);
    return next;
  };
  Game_Gamemory.prototype.markBattleWin = function (troopId) {
    var id = this._coerceId(troopId);
    if (id <= 0) return 0;
    var next = this._incMap(this._troopWins, id, 1);
    this._totalVictories += 1;
    Gamemory._log(
      "Troop #" +
        id +
        " WIN -> wins: " +
        next +
        " | totalVictories: " +
        this._totalVictories
    );
    return next;
  };
  Game_Gamemory.prototype.markBattleLoss = function (troopId) {
    var id = this._coerceId(troopId);
    if (id <= 0) return 0;
    var next = this._incMap(this._troopLosses, id, 1);
    Gamemory._log("Troop #" + id + " loss -> losses: " + next);
    return next;
  };
  Game_Gamemory.prototype.getTroopEncounterCount = function (troopId) {
    var id = this._coerceId(troopId);
    return this._troopEncounters[id] || 0;
  };
  Game_Gamemory.prototype.getTroopWinCount = function (troopId) {
    var id = this._coerceId(troopId);
    return this._troopWins[id] || 0;
  };
  Game_Gamemory.prototype.getTroopLossCount = function (troopId) {
    var id = this._coerceId(troopId);
    return this._troopLosses[id] || 0;
  };

  // ------------------------------------------------------------------------------
  Game_Gamemory.prototype.markGameOver = function () {
    this._totalGameOvers += 1;
    Gamemory._log("Game over -> totalGameOvers: " + this._totalGameOvers);
    return this._totalGameOvers;
  };
  Game_Gamemory.prototype.getTotalVictories = function () {
    return this._totalVictories | 0;
  };
  Game_Gamemory.prototype.getTotalGameOvers = function () {
    return this._totalGameOvers | 0;
  };
  Game_Gamemory.prototype.getTotalMonstersDefeated = function () {
    return this._totalMonsterKills | 0;
  };

  Game_Gamemory.prototype._normalizeTypeId = function (typeId) {
    var n = Number(typeId);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  Game_Gamemory.prototype._incDamageTypeMap = function (map, typeId, amount) {
    var id = this._normalizeTypeId(typeId);
    var key = String(id);
    var value = Number(amount) || 0;
    if (value <= 0) return 0;
    map[key] = (map[key] || 0) + value;
    return map[key];
  };

  Game_Gamemory.prototype.recordDamageDealt = function (amount, typeId) {
    var value = Number(amount) || 0;
    if (value <= 0) return this._totalDamageDealt | 0;
    var id = this._normalizeTypeId(typeId);
    this._totalDamageDealt += value;
    this._incDamageTypeMap(this._damageDealtByType, id, value);
    return this._totalDamageDealt | 0;
  };

  Game_Gamemory.prototype.recordDamageTaken = function (amount, typeId) {
    var value = Number(amount) || 0;
    if (value <= 0) return this._totalDamageTaken | 0;
    var id = this._normalizeTypeId(typeId);
    this._totalDamageTaken += value;
    this._incDamageTypeMap(this._damageTakenByType, id, value);
    return this._totalDamageTaken | 0;
  };

  Game_Gamemory.prototype.getTotalDamageDealt = function () {
    return this._totalDamageDealt | 0;
  };

  Game_Gamemory.prototype.getTotalDamageTaken = function () {
    return this._totalDamageTaken | 0;
  };

  Game_Gamemory.prototype.getDamageDealtForType = function (typeId) {
    var id = this._normalizeTypeId(typeId);
    return this._damageDealtByType[String(id)] || 0;
  };

  Game_Gamemory.prototype.getDamageTakenForType = function (typeId) {
    var id = this._normalizeTypeId(typeId);
    return this._damageTakenByType[String(id)] || 0;
  };

  Game_Gamemory.prototype.getDamageDealtTypeMap = function () {
    var copy = {};
    for (var key in this._damageDealtByType)
      if (this._damageDealtByType.hasOwnProperty(key))
        copy[Number(key)] = this._damageDealtByType[key] || 0;
    return copy;
  };

  Game_Gamemory.prototype.getDamageTakenTypeMap = function () {
    var copy = {};
    for (var key in this._damageTakenByType)
      if (this._damageTakenByType.hasOwnProperty(key))
        copy[Number(key)] = this._damageTakenByType[key] || 0;
    return copy;
  };

  Game_Gamemory.prototype.getBattleStats = function () {
    function clone(obj) {
      var out = {};
      for (var k in obj) if (obj.hasOwnProperty(k)) out[k] = obj[k];
      return out;
    }
    function cloneNested(obj) {
      var out = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var value = obj[key];
          out[key] = value && typeof value === "object" ? clone(value) : value;
        }
      }
      return out;
    }
    return {
      enemyKills: clone(this._enemyKills),
      enemyKillsByMap: cloneNested(this._enemyKillsByMap),
      troopEncounters: clone(this._troopEncounters),
      troopWins: clone(this._troopWins),
      troopLosses: clone(this._troopLosses),
      totalVictories: this._totalVictories | 0,
      totalGameOvers: this._totalGameOvers | 0,
      totalMonsterKills: this._totalMonsterKills | 0,
      totalDamageDealt: this._totalDamageDealt | 0,
      totalDamageTaken: this._totalDamageTaken | 0,
      damageDealtByType: clone(this._damageDealtByType),
      damageTakenByType: clone(this._damageTakenByType),
    };
  };

  // ------------------------------------------------------------------------------
  // DataManager hooks - persist the Gamemory object in save files
  // ------------------------------------------------------------------------------
  var _DataManager_createGameObjects = DataManager.createGameObjects;
  DataManager.createGameObjects = function () {
    _DataManager_createGameObjects.call(this);
    window.$gameGamemory = new Game_Gamemory();
    // On New Game make sure the opening map increments immediately
    window._GAMEMORY_SKIP_NEXT_MARK = false;
  };

  var _DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    var contents = _DataManager_makeSaveContents.call(this);
    contents.gamemory = window.$gameGamemory; // persist the full object into the save
    return contents;
  };

  var _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _DataManager_extractSaveContents.call(this, contents);
    window.$gameGamemory =
      contents.gamemory instanceof Game_Gamemory
        ? contents.gamemory
        : (function (raw) {
            // Ensure compatibility when loading from older saves
            var g = new Game_Gamemory();
            if (raw) {
              if (raw._mapVisits) g._mapVisits = raw._mapVisits;
              if (raw._enemyKills) g._enemyKills = raw._enemyKills;
              if (raw._enemyKillsByMap)
                g._enemyKillsByMap = raw._enemyKillsByMap;
              if (raw._troopEncounters)
                g._troopEncounters = raw._troopEncounters;
              if (raw._troopWins) g._troopWins = raw._troopWins;
              if (raw._troopLosses) g._troopLosses = raw._troopLosses;
              if (typeof raw._totalVictories === "number")
                g._totalVictories = raw._totalVictories;
              if (typeof raw._totalGameOvers === "number")
                g._totalGameOvers = raw._totalGameOvers;
              if (typeof raw._totalMonsterKills === "number")
                g._totalMonsterKills = raw._totalMonsterKills;
              if (typeof raw._totalDamageDealt === "number")
                g._totalDamageDealt = raw._totalDamageDealt;
              if (typeof raw._totalDamageTaken === "number")
                g._totalDamageTaken = raw._totalDamageTaken;
              if (raw._damageDealtByType)
                g._damageDealtByType = raw._damageDealtByType;
              if (raw._damageTakenByType)
                g._damageTakenByType = raw._damageTakenByType;
            }
            return g;
          })(contents.gamemory);

    // After loading skip incrementing during the first map setup
    window._GAMEMORY_SKIP_NEXT_MARK = true;
  };

  // ------------------------------------------------------------------------------
  // Map entry detection - immediately count the opening map
  // (except when we just loaded and skip the first setup)
  // ------------------------------------------------------------------------------
  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function (mapId) {
    _Game_Map_setup.call(this, mapId);
    if (!window.$gameGamemory) return;

    if (window._GAMEMORY_SKIP_NEXT_MARK) {
      Gamemory._log("Load detected -> skip increment on map #" + mapId);
      window._GAMEMORY_SKIP_NEXT_MARK = false;
      return;
    }

    window.$gameGamemory.markVisited(mapId);
  };

  // ------------------------------------------------------------------------------
  // HARC HOOKOK
  // ------------------------------------------------------------------------------

  // 1) Encounter counter - increments when a battle is set up
  var _BattleManager_setup = BattleManager.setup;
  BattleManager.setup = function (troopId, canEscape, canLose) {
    _BattleManager_setup.call(this, troopId, canEscape, canLose);
    try {
      if (window.$gameGamemory) {
        var tid =
          ($gameTroop && $gameTroop.troop() && $gameTroop.troop().id) ||
          troopId ||
          0;
        if (tid > 0) window.$gameGamemory.markBattleEncounter(tid);
      }
    } catch (e) {}
  };

  // 2) Enemy kill counter - increments when an enemy dies (party-wide)
  var _Game_Enemy_die = Game_Enemy.prototype.die;
  Game_Enemy.prototype.die = function () {
    _Game_Enemy_die.call(this);
    try {
      if (window.$gameGamemory) {
        var enemy = this.enemy && this.enemy();
        var id = enemy && enemy.id;
        if (id > 0) {
          var mapId = 0;
          if (typeof $gameMap !== "undefined" && $gameMap && $gameMap.mapId) {
            mapId = $gameMap.mapId();
          }
          window.$gameGamemory.markEnemyDefeated(id, mapId);
        }
      }
    } catch (e) {}
  };

  // 3) Outcome counter - handled in BattleManager.endBattle(result)
  //    result: 0 = win, 1 = escape, 2 = lose (MV)
  var _BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    try {
      if (window.$gameGamemory) {
        var tid =
          ($gameTroop && $gameTroop.troop && $gameTroop.troop().id) || 0;
        if (tid > 0) {
          if (result === 0) {
            window.$gameGamemory.markBattleWin(tid);
          } else if (result === 2) {
            window.$gameGamemory.markBattleLoss(tid);
          }
        } else {
          // Unknown troopId - only update totalVictories on win
          if (result === 0) window.$gameGamemory._totalVictories += 1;
        }
      }
    } catch (e) {}
    _BattleManager_endBattle.call(this, result);
  };

  // 4) Game over counter - when Scene_Gameover starts
  var _Scene_Gameover_start = Scene_Gameover.prototype.start;
  Scene_Gameover.prototype.start = function () {
    _Scene_Gameover_start.call(this);
    try {
      if (window.$gameGamemory) window.$gameGamemory.markGameOver();
    } catch (e) {}
  };

  var _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
  Game_Action.prototype.executeDamage = function (target, value) {
    var elementId = gmResolveElementId(this);
    _Game_Action_executeDamage.call(this, target, value);
    try {
      if (!window.$gameGamemory) return;
      if (!target || !target.result || typeof target.result !== "function") return;
      var result = target.result();
      if (!result) return;
      var hpDamage = result.hpDamage || 0;
      if (hpDamage <= 0) return;
      var subject = this.subject && this.subject();
      if (!subject) return;
      if (target.isEnemy && target.isEnemy() && subject.isActor && subject.isActor()) {
        window.$gameGamemory.recordDamageDealt(hpDamage, elementId);
      } else if (target.isActor && target.isActor() && subject.isEnemy && subject.isEnemy()) {
        window.$gameGamemory.recordDamageTaken(hpDamage, elementId);
      }
    } catch (e) {}
  };

  function gmResolveElementId(action) {
    if (!action || typeof action.item !== "function") return 0;
    var item = action.item();
    if (!item || !item.damage) return 0;
    var elementId = item.damage.elementId || 0;
    if (elementId < 0) {
      var subject = action.subject && action.subject();
      if (subject && subject.attackElements) {
        var elements = subject.attackElements();
        if (elements && elements.length > 0) {
          return Math.max(0, Math.floor(elements[0] || 0));
        }
      }
      return 0;
    }
    return Math.max(0, Math.floor(elementId || 0));
  };

  // ------------------------------------------------------------------------------
  // Global API for other plugins or script calls
  // ------------------------------------------------------------------------------
  window.Gamemory = window.Gamemory || {};

  // Internal log helper that honours the plugin parameter
  window.Gamemory._log = function (msg) {
    if (!GM_LOG_ENABLED) return;
    if (typeof console !== "undefined" && console.log) {
      console.log("[Gamemory] " + msg);
    }
  };

  window.Gamemory.isDebugWindowEnabled = function () {
    return GM_DEBUG_ENABLED;
  };
  window.Gamemory.getDebugHotkeyCode = function () {
    return GM_DEBUG_HOTKEY_CODE;
  };
  window.Gamemory.getDebugHotkeyLabel = function () {
    return GM_DEBUG_HOTKEY_LABEL;
  };
  window.Gamemory.consumeDebugHotkeyTrigger = function () {
    return gmConsumeDebugHotkeyTrigger();
  };
  window.Gamemory.resetDebugHotkeyState = function () {
    gmResetDebugHotkeyState();
  };

  // Proxy helpers around $gameGamemory
  // MAP
  window.Gamemory.hasVisited = function (mapId) {
    return window.$gameGamemory
      ? window.$gameGamemory.hasVisited(mapId)
      : false;
  };
  window.Gamemory.getVisitCount = function (mapId) {
    return window.$gameGamemory ? window.$gameGamemory.getVisitCount(mapId) : 0;
  };
  window.Gamemory.markVisited = function (mapId) {
    return window.$gameGamemory ? window.$gameGamemory.markVisited(mapId) : 0;
  };
  window.Gamemory.resetMap = function (mapId) {
    if (window.$gameGamemory) window.$gameGamemory.resetMap(mapId);
  };
  window.Gamemory.visitedMaps = function () {
    return window.$gameGamemory ? window.$gameGamemory.visitedMaps() : [];
  };
  window.Gamemory.getAll = function () {
    return window.$gameGamemory ? window.$gameGamemory.getAll() : {};
  };
  window.Gamemory.clear = function () {
    if (window.$gameGamemory) window.$gameGamemory.clear();
  };

  // HARC - ENEMY
  window.Gamemory.getEnemyKillCount = function (enemyId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getEnemyKillCount(enemyId)
      : 0;
  };
  window.Gamemory.getEnemyKillCountForMap = function (enemyId, mapId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getEnemyKillCountForMap(enemyId, mapId)
      : 0;
  };
  window.Gamemory.getEnemyKillMaps = function (enemyId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getEnemyKillMaps(enemyId)
      : {};
  };
  window.Gamemory.markEnemyDefeated = function (enemyId, mapId) {
    return window.$gameGamemory
      ? window.$gameGamemory.markEnemyDefeated(enemyId, mapId)
      : 0;
  };

  // HARC - TROOP
  window.Gamemory.getTroopEncounterCount = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getTroopEncounterCount(troopId)
      : 0;
  };
  window.Gamemory.getTroopWinCount = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getTroopWinCount(troopId)
      : 0;
  };
  window.Gamemory.getTroopLossCount = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getTroopLossCount(troopId)
      : 0;
  };
  window.Gamemory.markBattleEncounter = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.markBattleEncounter(troopId)
      : 0;
  };
  window.Gamemory.markBattleWin = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.markBattleWin(troopId)
      : 0;
  };
  window.Gamemory.markBattleLoss = function (troopId) {
    return window.$gameGamemory
      ? window.$gameGamemory.markBattleLoss(troopId)
      : 0;
  };

  // COMBAT TOTALS
  window.Gamemory.getTotalVictories = function () {
    return window.$gameGamemory ? window.$gameGamemory.getTotalVictories() : 0;
  };
  window.Gamemory.getTotalGameOvers = function () {
    return window.$gameGamemory ? window.$gameGamemory.getTotalGameOvers() : 0;
  };
  window.Gamemory.getTotalMonstersDefeated = function () {
    return window.$gameGamemory
      ? window.$gameGamemory.getTotalMonstersDefeated()
      : 0;
  };
  window.Gamemory.markGameOver = function () {
    return window.$gameGamemory ? window.$gameGamemory.markGameOver() : 0;
  };
  window.Gamemory.recordDamageDealt = function (amount, typeId) {
    return window.$gameGamemory
      ? window.$gameGamemory.recordDamageDealt(amount, typeId)
      : 0;
  };
  window.Gamemory.recordDamageTaken = function (amount, typeId) {
    return window.$gameGamemory
      ? window.$gameGamemory.recordDamageTaken(amount, typeId)
      : 0;
  };
  window.Gamemory.getTotalDamageDealt = function () {
    return window.$gameGamemory ? window.$gameGamemory.getTotalDamageDealt() : 0;
  };
  window.Gamemory.getTotalDamageTaken = function () {
    return window.$gameGamemory ? window.$gameGamemory.getTotalDamageTaken() : 0;
  };
  window.Gamemory.getDamageDealtForType = function (typeId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getDamageDealtForType(typeId)
      : 0;
  };
  window.Gamemory.getDamageTakenForType = function (typeId) {
    return window.$gameGamemory
      ? window.$gameGamemory.getDamageTakenForType(typeId)
      : 0;
  };
  window.Gamemory.getDamageDealtTypeMap = function () {
    return window.$gameGamemory
      ? window.$gameGamemory.getDamageDealtTypeMap()
      : {};
  };
  window.Gamemory.getDamageTakenTypeMap = function () {
    return window.$gameGamemory
      ? window.$gameGamemory.getDamageTakenTypeMap()
      : {};
  };

  window.Gamemory.getBattleStats = function () {
    return window.$gameGamemory
      ? window.$gameGamemory.getBattleStats()
      : {
          enemyKills: {},
          troopEncounters: {},
          troopWins: {},
          troopLosses: {},
          totalVictories: 0,
          totalGameOvers: 0,
          totalMonsterKills: 0,
        };
  };

  // ------------------------------------------------------------------------------
  // Debug window scene -------------------------------------------------------

  var GM_DEBUG_CATEGORY_CONFIG = [
    { symbol: "maps", name: "Maps" },
    { symbol: "enemies", name: "Enemies" },
    { symbol: "totals", name: "Totals" },
  ];

  var GM_DEBUG_SUBCATEGORY_CONFIG = [
    { symbol: "enemies", name: "Enemies" },
    { symbol: "troops", name: "Troops" },
    { symbol: "battles", name: "Battles" },
  ];

  function gmPadNumber(value, length) {
    var str = String(Math.max(0, value || 0));
    while (str.length < length) {
      str = "0" + str;
    }
    return str;
  }

  function gmGetMapName(mapId) {
    if (!$dataMapInfos || !$dataMapInfos[mapId]) {
      return "Map #" + mapId;
    }
    var name = $dataMapInfos[mapId].name;
    if (name === null || name === undefined || name === "") {
      return "Map #" + mapId;
    }
    return name;
  }

  function gmGetTroopName(troopId) {
    if (!$dataTroops || !$dataTroops[troopId]) {
      return "Troop #" + troopId;
    }
    var name = $dataTroops[troopId].name;
    if (name === null || name === undefined || name === "") {
      return "Troop #" + troopId;
    }
    return name;
  }

  function gmGetEnemyName(enemyId) {
    if (!$dataEnemies || !$dataEnemies[enemyId]) {
      return "Enemy #" + enemyId;
    }
    var name = $dataEnemies[enemyId].name;
    if (name === null || name === undefined || name === "") {
      return "Enemy #" + enemyId;
    }
    return name;
  }

  function gmCollectMapEntries() {
    if (!window.$gameGamemory || !$gameGamemory.visitedMaps) return [];
    var ids = $gameGamemory
      .visitedMaps()
      .slice()
      .sort(function (a, b) {
        return a - b;
      });
    var result = [];
    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      var count = $gameGamemory.getVisitCount(id);
      var name = gmGetMapName(id);
      result.push({
        type: "map",
        id: id,
        name: name,
        visits: count,
        label: gmPadNumber(id, 3) + ": " + name,
        summary: "Visits: " + count,
      });
    }
    return result;
  }

  function gmCollectTroopEntries() {
    if (!window.$gameGamemory || !$gameGamemory.getBattleStats) return [];
    var stats = $gameGamemory.getBattleStats();
    var catalog = {};
    var ids = [];
    var sources = [
      stats.troopEncounters || {},
      stats.troopWins || {},
      stats.troopLosses || {},
    ];
    for (var s = 0; s < sources.length; s += 1) {
      var table = sources[s];
      for (var key in table) {
        if (table.hasOwnProperty(key)) {
          var id = parseInt(key, 10);
          if (!catalog[id] && id > 0) {
            catalog[id] = true;
            ids.push(id);
          }
        }
      }
    }
    ids.sort(function (a, b) {
      var nameA = gmGetTroopName(a).toUpperCase();
      var nameB = gmGetTroopName(b).toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return a - b;
    });
    var result = [];
    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      var encounters =
        (stats.troopEncounters && stats.troopEncounters[id]) || 0;
      var wins = (stats.troopWins && stats.troopWins[id]) || 0;
      var losses = (stats.troopLosses && stats.troopLosses[id]) || 0;
      var name = gmGetTroopName(id);
      result.push({
        type: "troop",
        id: id,
        name: name,
        encounters: encounters,
        wins: wins,
        losses: losses,
        winRate: encounters > 0 ? wins / Math.max(1, encounters) : 0,
        label: gmPadNumber(id, 3) + ": " + name,
        summary: "Enc: " + encounters + "  W/L: " + wins + "/" + losses,
      });
    }
    return result;
  }

  function gmCollectEnemyEntries() {
    if (!window.$gameGamemory || !$gameGamemory.getBattleStats) return [];
    var stats = $gameGamemory.getBattleStats();
    var kills = stats.enemyKills || {};
    var ids = [];
    for (var key in kills) {
      if (kills.hasOwnProperty(key)) {
        var id = parseInt(key, 10);
        if (id > 0) ids.push(id);
      }
    }
    ids.sort(function (a, b) {
      var nameA = gmGetEnemyName(a).toUpperCase();
      var nameB = gmGetEnemyName(b).toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return a - b;
    });
    var result = [];
    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      var count = kills[id] || 0;
      var name = gmGetEnemyName(id);
      var mapCounts =
        window.Gamemory && window.Gamemory.getEnemyKillMaps
          ? window.Gamemory.getEnemyKillMaps(id)
          : {};
      var mapBreakdown = [];
      for (var mapKey in mapCounts) {
        if (mapCounts.hasOwnProperty(mapKey)) {
          var mapId = parseInt(mapKey, 10);
          if (mapId > 0) {
            mapBreakdown.push({
              mapId: mapId,
              count: mapCounts[mapKey] || 0,
              name: gmGetMapName(mapId),
            });
          }
        }
      }
      mapBreakdown.sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        var nameA = (a.name || "").toUpperCase();
        var nameB = (b.name || "").toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return a.mapId - b.mapId;
      });
      result.push({
        type: "enemy",
        id: id,
        name: name,
        kills: count,
        mapBreakdown: mapBreakdown,
        label: gmPadNumber(id, 3) + ": " + name,
        summary: "Total kills: " + count,
      });
    }
    return result;
  }

  function gmCollectTotalEntries() {
    if (!window.$gameGamemory || !$gameGamemory.getBattleStats) return [];
    var stats = $gameGamemory.getBattleStats();

    var mapCounts = window.$gameGamemory.getAll
      ? window.$gameGamemory.getAll()
      : {};
    var visitedList = window.$gameGamemory.visitedMaps
      ? window.$gameGamemory.visitedMaps()
      : [];

    var uniqueMaps = visitedList.length;
    var totalVisits = 0;

    for (var mapKey in mapCounts) {
      if (mapCounts.hasOwnProperty(mapKey)) {
        var count = mapCounts[mapKey] || 0;
        if (count > 0) totalVisits += count;
      }
    }

    if (!uniqueMaps) {
      for (var mapKey2 in mapCounts) {
        if (mapCounts.hasOwnProperty(mapKey2) && mapCounts[mapKey2] > 0) {
          uniqueMaps += 1;
        }
      }
    }

    var totalVictories = stats.totalVictories || 0;
    var totalGameOvers = stats.totalGameOvers || 0;
    var totalMonsterKills = stats.totalMonsterKills || 0;
    var totalDamageDealt = stats.totalDamageDealt || 0;
    var totalDamageTaken = stats.totalDamageTaken || 0;
    var totalBattles = totalVictories + totalGameOvers;

    var entries = [];
    function pushEntry(id, name, value, options) {
      var opt = options || {};
      entries.push({
        type: "total",
        id: id,
        name: name,
        label: name,
        summary: String(value),
        value: value,
        valueLabel: opt.valueLabel || "Value",
        extra: opt.extra || null,
        description: opt.description || "",
      });
    }

    pushEntry("totalBattles", "Total Battles", totalBattles, {
      valueLabel: "Total",
      extra: [
        { label: "Victories", value: totalVictories },
        { label: "Game Overs", value: totalGameOvers },
      ],
    });
    pushEntry("totalVictories", "Total Victories", totalVictories, {
      valueLabel: "Victories",
    });
    pushEntry("totalGameOvers", "Total Game Overs", totalGameOvers, {
      valueLabel: "Game Overs",
    });
    pushEntry("totalMonsterKills", "Total Monster Kills", totalMonsterKills, {
      valueLabel: "Kills",
    });
    pushEntry("totalDamageDealt", "Total Damage Dealt", totalDamageDealt, {
      valueLabel: "Damage",
    });
    pushEntry("totalDamageTaken", "Total Damage Taken", totalDamageTaken, {
      valueLabel: "Damage",
    });
    pushEntry("uniqueMaps", "Unique Maps Visited", uniqueMaps, {
      valueLabel: "Maps",
    });
    pushEntry("totalVisits", "Total Map Visits", totalVisits, {
      valueLabel: "Visits",
    });

    return entries;
  }
  function gmCollectDebugEntries(category, subcategory) {
    var primary = (category || "").toLowerCase();
    switch (primary) {
      case "maps":
        return gmCollectMapEntries();
      case "totals":
        return gmCollectTotalEntries();
      case "enemies":
      default: {
        var secondary = (subcategory || "enemies").toLowerCase();
        switch (secondary) {
          case "troops":
            return gmCollectTroopEntries();
          case "battles":
            return [];
          case "enemies":
          default:
            return gmCollectEnemyEntries();
        }
      }
    }
  }

  window.Gamemory.getDebugCategories = function () {
    return GM_DEBUG_CATEGORY_CONFIG.slice(0);
  };

  window.Gamemory.getDebugEntries = function (category, subcategory) {
    return gmCollectDebugEntries(category, subcategory);
  };

  window.Gamemory.getDebugSubCategories = function () {
    return GM_DEBUG_SUBCATEGORY_CONFIG.slice(0);
  };

  function Window_GamemoryCategory() {
    this.initialize.apply(this, arguments);
  }

  Window_GamemoryCategory.prototype = Object.create(
    Window_HorzCommand.prototype
  );
  Window_GamemoryCategory.prototype.constructor = Window_GamemoryCategory;

  Window_GamemoryCategory.prototype.initialize = function (x, y) {
    Window_HorzCommand.prototype.initialize.call(this, x, y);
  };

  Window_GamemoryCategory.prototype.windowWidth = function () {
    return Graphics.boxWidth;
  };

  Window_GamemoryCategory.prototype.maxCols = function () {
    return Math.max(1, GM_DEBUG_CATEGORY_CONFIG.length);
  };

  Window_GamemoryCategory.prototype.makeCommandList = function () {
    for (var i = 0; i < GM_DEBUG_CATEGORY_CONFIG.length; i += 1) {
      var cfg = GM_DEBUG_CATEGORY_CONFIG[i];
      this.addCommand(cfg.name, cfg.symbol);
    }
  };

  Window_GamemoryCategory.prototype.itemTextAlign = function () {
    return "center";
  };

  function Window_GamemorySubCategory() {
    this.initialize.apply(this, arguments);
  }

  Window_GamemorySubCategory.prototype = Object.create(
    Window_HorzCommand.prototype
  );
  Window_GamemorySubCategory.prototype.constructor = Window_GamemorySubCategory;

  Window_GamemorySubCategory.prototype.initialize = function (x, y) {
    Window_HorzCommand.prototype.initialize.call(this, x, y);
  };

  Window_GamemorySubCategory.prototype.windowWidth = function () {
    return Math.floor(Graphics.boxWidth * 0.7);
  };

  Window_GamemorySubCategory.prototype.maxCols = function () {
    return Math.max(1, GM_DEBUG_SUBCATEGORY_CONFIG.length);
  };

  Window_GamemorySubCategory.prototype.makeCommandList = function () {
    for (var i = 0; i < GM_DEBUG_SUBCATEGORY_CONFIG.length; i += 1) {
      var cfg = GM_DEBUG_SUBCATEGORY_CONFIG[i];
      this.addCommand(cfg.name, cfg.symbol);
    }
  };

  Window_GamemorySubCategory.prototype.itemTextAlign = function () {
    return "center";
  };

  function Window_GamemoryList() {
    this.initialize.apply(this, arguments);
  }

  Window_GamemoryList.prototype = Object.create(Window_Selectable.prototype);
  Window_GamemoryList.prototype.constructor = Window_GamemoryList;

  Window_GamemoryList.prototype.initialize = function (x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._category = "maps";
    this._subCategory = null;
    this._data = [];
  };

  Window_GamemoryList.prototype.maxCols = function () {
    return 1;
  };

  Window_GamemoryList.prototype.maxItems = function () {
    return this._data ? this._data.length : 0;
  };

  Window_GamemoryList.prototype.makeItemList = function () {
    var entries =
      gmCollectDebugEntries(this._category, this._subCategory) || [];
    this._data = Array.isArray(entries) ? entries.slice(0) : [];
  };

  Window_GamemoryList.prototype.refresh = function () {
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
    if (!this.maxItems()) {
      this.drawEmptyMessage();
    }
    this.callUpdateDetail();
  };

  Window_GamemoryList.prototype.drawEmptyMessage = function () {
    this.changeTextColor(this.textColor(8));
    this.drawText("No data yet.", 0, 0, this.contentsWidth(), "center");
    this.resetTextColor();
  };

  Window_GamemoryList.prototype.drawItem = function (index) {
    var item = this._data[index];
    if (!item) return;
    var rect = this.itemRectForText(index);
    this.resetFontSettings();
    this.drawText(item.label || "", rect.x, rect.y, rect.width);
    if (item.summary) {
      this.changeTextColor(this.textColor(8));
      this.drawText(item.summary, rect.x, rect.y, rect.width, "right");
      this.resetTextColor();
    }
  };

  Window_GamemoryList.prototype.item = function () {
    if (this.index() < 0) return null;
    return this._data[this.index()] || null;
  };

  Window_GamemoryList.prototype.setCategory = function (category) {
    var normalized = category || "maps";
    var changed = this._category !== normalized;
    this._category = normalized;
    this.refresh();
    if (changed) {
      this.setTopRow(0);
      this.select(this.maxItems() > 0 ? 0 : -1);
    } else {
      this.callUpdateDetail();
    }
  };

  Window_GamemoryList.prototype.setSubCategory = function (subcategory) {
    var normalized = subcategory == null ? null : subcategory;
    var changed = this._subCategory !== normalized;
    this._subCategory = normalized;
    this.refresh();
    if (changed) {
      this.setTopRow(0);
      this.select(this.maxItems() > 0 ? 0 : -1);
    } else {
      this.callUpdateDetail();
    }
  };

  Window_GamemoryList.prototype.select = function (index) {
    Window_Selectable.prototype.select.call(this, index);
    this.callUpdateDetail();
  };

  Window_GamemoryList.prototype.setDetailWindow = function (window) {
    this._detailWindow = window;
    this.callUpdateDetail();
  };

  Window_GamemoryList.prototype.callUpdateDetail = function () {
    if (this._detailWindow && this._detailWindow.setItem) {
      this._detailWindow.setItem(this.item());
    }
  };

  Window_GamemoryList.prototype.setTopRow = function (row) {
    Window_Selectable.prototype.setTopRow.call(this, row);
  };

  function Window_GamemoryDetail() {
    this.initialize.apply(this, arguments);
  }

  Window_GamemoryDetail.prototype = Object.create(Window_Base.prototype);
  Window_GamemoryDetail.prototype.constructor = Window_GamemoryDetail;

  Window_GamemoryDetail.prototype.initialize = function (x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._item = null;
  };

  Window_GamemoryDetail.prototype.setItem = function (item) {
    if (this._item === item) return;
    this._item = item;
    this.refresh();
  };

  Window_GamemoryDetail.prototype.refresh = function () {
    this.contents.clear();
    this.resetFontSettings();
    var item = this._item;
    var width = this.contentsWidth();
    var y = 0;
    if (!item) {
      this.changeTextColor(this.textColor(8));
      this.drawText("No data selected.", 0, y, width, "center");
      y += this.lineHeight();
      this.drawText("Use PgUp/PgDn to change category.", 0, y, width, "center");
      this.resetTextColor();
      this.drawHotkeyHint();
      return;
    }
    if (item.type === "map") {
      this.changeTextColor(this.systemColor());
      this.drawText("Map #" + item.id, 0, y, width);
      this.resetTextColor();
      y += this.lineHeight();
      this.drawText(item.name || "", 0, y, width);
      y += this.lineHeight();
      y = this.drawStatLine("Visits", item.visits, y);
    } else if (item.type === "troop") {
      this.changeTextColor(this.systemColor());
      this.drawText("Troop #" + item.id, 0, y, width);
      this.resetTextColor();
      y += this.lineHeight();
      this.drawText(item.name || "", 0, y, width);
      y += this.lineHeight();
      y = this.drawStatLine("Encounters", item.encounters, y);
      y = this.drawStatLine("Wins", item.wins, y);
      y = this.drawStatLine("Losses", item.losses, y);
      if (item.encounters > 0) {
        var rate = Math.round(item.winRate * 1000) / 10;
        y = this.drawStatLine("Win Rate", rate.toFixed(1) + "%", y);
      }
    } else if (item.type === "enemy") {
      this.changeTextColor(this.systemColor());
      this.drawText("Enemy #" + item.id, 0, y, width);
      this.resetTextColor();
      y += this.lineHeight();
      this.drawText(item.name || "", 0, y, width);
      y += this.lineHeight();
      y = this.drawStatLine("Total Kills", item.kills, y);
      var breakdown = item.mapBreakdown || [];
      if (breakdown.length > 0) {
        y += this.lineHeight() / 2;
        this.changeTextColor(this.systemColor());
        this.drawText("Kills by Map", 0, y, width);
        this.resetTextColor();
        y += this.lineHeight();
        var limit = Math.min(breakdown.length, 10);
        for (var bi = 0; bi < limit; bi += 1) {
          var entry = breakdown[bi];
          var mapLabel = "Map #" + entry.mapId + ": " + (entry.name || "");
          this.drawText(mapLabel, 0, y, width);
          this.drawText(String(entry.count), 0, y, width, "right");
          y += this.lineHeight();
        }
        if (breakdown.length > limit) {
          this.changeTextColor(this.textColor(8));
          this.drawText(
            "+" + (breakdown.length - limit) + " more maps...",
            0,
            y,
            width
          );
          this.resetTextColor();
          y += this.lineHeight();
        }
      } else {
        this.changeTextColor(this.textColor(8));
        this.drawText("No map-specific kills recorded.", 0, y, width);
        this.resetTextColor();
        y += this.lineHeight();
      }
    } else if (item.type === "total") {
      this.changeTextColor(this.systemColor());
      this.drawText(item.name || "Totals", 0, y, width);
      this.resetTextColor();
      y += this.lineHeight();

      var value = item.value != null ? item.value : 0;
      var valueLabel = item.valueLabel || "Value";
      y = this.drawStatLine(valueLabel, value, y);

      if (item.extra && item.extra.length) {
        for (var ei = 0; ei < item.extra.length; ei += 1) {
          var extra = item.extra[ei];
          if (!extra) continue;
          var label = extra.label != null ? String(extra.label) : "";
          if (!label) continue;
          var val = extra.value != null ? extra.value : 0;
          y = this.drawStatLine(label, val, y);
        }
      }

      if (item.description) {
        this.changeTextColor(this.textColor(8));
        this.drawText(String(item.description), 0, y, width);
        this.resetTextColor();
        y += this.lineHeight();
      }
    } else {
      this.drawText(String(item.name || ""), 0, y, width);
      y += this.lineHeight();
    }
    this.drawHotkeyHint();
  };

  Window_GamemoryDetail.prototype.drawStatLine = function (label, value, y) {
    var width = this.contentsWidth();
    this.changeTextColor(this.systemColor());
    this.drawText(label + ":", 0, y, width);
    this.resetTextColor();
    this.drawText(String(value), 0, y, width, "right");
    return y + this.lineHeight();
  };

  Window_GamemoryDetail.prototype.drawHotkeyHint = function () {
    if (!GM_DEBUG_ENABLED) return;
    var width = this.contentsWidth();
    var y = this.contentsHeight() - this.lineHeight();
    this.changeTextColor(this.textColor(8));
    var text = "PgUp/PgDn change category  |  Hotkey: " + GM_DEBUG_HOTKEY_LABEL;
    this.drawText(text, 0, y, width, "center");
    this.resetTextColor();
  };

  function Scene_GamemoryDebug() {
    this.initialize.apply(this, arguments);
  }

  Scene_GamemoryDebug.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_GamemoryDebug.prototype.constructor = Scene_GamemoryDebug;

  Scene_GamemoryDebug.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
    this._currentCategory = "maps";
    this._currentSubCategory = null;
  };

  Scene_GamemoryDebug.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.createCategoryWindow();
    this.createSubCategoryWindow();
    this.createListWindow();
    this.createDetailWindow();
    this._categoryWindow.select(0);
    this._currentCategory = this._categoryWindow.currentSymbol();
    this._categoryWindow.deactivate();
    this.refreshCategoryState();
    this._listWindow.activate();
    if (this._listWindow.maxItems() > 0) {
      this._listWindow.select(0);
    } else {
      this._listWindow.select(-1);
    }
  };

  Scene_GamemoryDebug.prototype.createCategoryWindow = function () {
    this._categoryWindow = new Window_GamemoryCategory(0, 0);
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
  };

  Scene_GamemoryDebug.prototype.createSubCategoryWindow = function () {
    var y = this._categoryWindow.height;
    this._subCategoryWindow = new Window_GamemorySubCategory(0, y);
    this._subCategoryWindow.setHandler("ok", this.onSubCategoryOk.bind(this));
    this._subCategoryWindow.setHandler("cancel", this.onSubCategoryCancel.bind(this));
    this._subCategoryWindow.hide();
    this._subCategoryWindow.deactivate();
    this._subCategoryWindow.deselect();
    this.addWindow(this._subCategoryWindow);
  };

  Scene_GamemoryDebug.prototype.createListWindow = function () {
    var y = this._categoryWindow.height + this._subCategoryWindow.height;
    var listWidth = Math.floor(Graphics.boxWidth * 0.7);
    var height = Graphics.boxHeight - y;
    this._listWindow = new Window_GamemoryList(0, y, listWidth, height);
    this._listWindow.setHandler("cancel", this.onListCancel.bind(this));
    this._listWindow.setHandler("pagedown", this.onListCategoryNext.bind(this));
    this._listWindow.setHandler("pageup", this.onListCategoryPrev.bind(this));
    this.addWindow(this._listWindow);
  };

  Scene_GamemoryDebug.prototype.createDetailWindow = function () {
    var y = this._categoryWindow.height + this._subCategoryWindow.height;
    var listWidth = Math.floor(Graphics.boxWidth * 0.7);
    var width = Graphics.boxWidth - listWidth;
    var height = Graphics.boxHeight - y;
    this._detailWindow = new Window_GamemoryDetail(listWidth, y, width, height);
    this.addWindow(this._detailWindow);
    this._listWindow.setDetailWindow(this._detailWindow);
  };

  Scene_GamemoryDebug.prototype.update = function () {
    Scene_MenuBase.prototype.update.call(this);
    var symbol = this._categoryWindow.currentSymbol();
    if (symbol && symbol !== this._currentCategory) {
      this._currentCategory = symbol;
      this.refreshCategoryState();
    }
    if (this._subCategoryWindow.visible) {
      var subSymbol = this._subCategoryWindow.currentSymbol();
      if (subSymbol && subSymbol !== this._currentSubCategory) {
        this._currentSubCategory = subSymbol;
        this._listWindow.setSubCategory(subSymbol);
      }
    }
    if (GM_DEBUG_KEY_STATE.trigger) {
      gmResetDebugHotkeyState();
      if (typeof SoundManager !== "undefined" && SoundManager.playCancel) {
        SoundManager.playCancel();
      }
      SceneManager.pop();
    }
  };

  Scene_GamemoryDebug.prototype.onCategoryOk = function () {
    this._currentCategory = this._categoryWindow.currentSymbol();
    this.refreshCategoryState();
    this._categoryWindow.deactivate();
    if (this._subCategoryWindow.visible) {
      this._subCategoryWindow.activate();
    } else {
      this._listWindow.activate();
      if (this._listWindow.maxItems() > 0) {
        this._listWindow.select(0);
      } else {
        this._listWindow.select(-1);
      }
    }
  };

  Scene_GamemoryDebug.prototype.onListCancel = function () {
    this._listWindow.deselect();
    this._listWindow.deactivate();
    if (this._subCategoryWindow.visible) {
      if (this._subCategoryWindow.selectSymbol) {
        this._subCategoryWindow.selectSymbol(
          this._currentSubCategory || this._subCategoryWindow.currentSymbol()
        );
      }
      this._subCategoryWindow.activate();
    } else {
      this._categoryWindow.activate();
      if (this._categoryWindow.selectSymbol) {
        this._categoryWindow.selectSymbol(this._currentCategory);
      }
    }
  };

  Scene_GamemoryDebug.prototype.onSubCategoryOk = function () {
    this._currentSubCategory = this._subCategoryWindow.currentSymbol();
    this._listWindow.setSubCategory(this._currentSubCategory);
    this._subCategoryWindow.deactivate();
    this._listWindow.activate();
    if (this._listWindow.maxItems() > 0) {
      this._listWindow.select(0);
    } else {
      this._listWindow.select(-1);
    }
  };

  Scene_GamemoryDebug.prototype.onSubCategoryCancel = function () {
    this._subCategoryWindow.deactivate();
    this._categoryWindow.activate();
    if (this._categoryWindow.selectSymbol) {
      this._categoryWindow.selectSymbol(this._currentCategory);
    }
  };


  Scene_GamemoryDebug.prototype.onListCategoryNext = function () {
    this.changeMainCategory(1);
  };

  Scene_GamemoryDebug.prototype.changeMainCategory = function (direction) {
    if (typeof SoundManager !== "undefined" && SoundManager.playCursor) {
      SoundManager.playCursor();
    }
    if (direction > 0) {
      this._categoryWindow.cursorRight();
    } else if (direction < 0) {
      this._categoryWindow.cursorLeft();
    }
    this._currentCategory = this._categoryWindow.currentSymbol();
    this.refreshCategoryState();
    this._listWindow.activate();
    if (this._listWindow.maxItems() > 0) {
      this._listWindow.select(0);
    } else {
      this._listWindow.select(-1);
    }
  };

  Scene_GamemoryDebug.prototype.refreshCategoryState = function () {
    var category = this._currentCategory || "maps";
    var hasSub = category === "enemies";
    if (hasSub) {
      this._subCategoryWindow.show();
      this.ensureSubCategorySelection();
      this._subCategoryWindow.deactivate();
      this._listWindow.setSubCategory(this._currentSubCategory);
    } else {
      this._currentSubCategory = null;
      this._subCategoryWindow.hide();
      this._subCategoryWindow.deactivate();
      this._subCategoryWindow.deselect();
      this._listWindow.setSubCategory(null);
    }
    this._listWindow.setCategory(category);
  };

  Scene_GamemoryDebug.prototype.ensureSubCategorySelection = function () {
    if (!GM_DEBUG_SUBCATEGORY_CONFIG.length) {
      this._currentSubCategory = null;
      this._subCategoryWindow.deselect();
      return;
    }
    if (!this._currentSubCategory) {
      this._currentSubCategory = GM_DEBUG_SUBCATEGORY_CONFIG[0].symbol;
    }
    var index =
      this._subCategoryWindow.findSymbol &&
      this._subCategoryWindow.findSymbol(this._currentSubCategory);
    if (index == null || index < 0) {
      index = 0;
      if (this._subCategoryWindow.commandSymbol) {
        this._currentSubCategory = this._subCategoryWindow.commandSymbol(0);
      } else {
        this._currentSubCategory = GM_DEBUG_SUBCATEGORY_CONFIG[0].symbol;
      }
    }
    if (this._subCategoryWindow.selectSymbol) {
      this._subCategoryWindow.selectSymbol(this._currentSubCategory);
    } else {
      this._subCategoryWindow.select(index);
    }
  };

  Scene_GamemoryDebug.prototype.onListCategoryPrev = function () {
    this.changeMainCategory(-1);
  };

  function gmOpenDebugWindow() {
    gmResetDebugHotkeyState();
    if (!GM_DEBUG_ENABLED) return false;
    if (typeof SceneManager === "undefined") return false;
    if (typeof Scene_GamemoryDebug === "undefined") return false;
    if (SceneManager.isSceneChanging && SceneManager.isSceneChanging())
      return false;
    var currentScene = SceneManager._scene;
    if (currentScene && currentScene.constructor === Scene_GamemoryDebug) {
      return false;
    }
    if (!window.$gameGamemory) return false;
    if (typeof Input !== "undefined" && Input.clear) {
      Input.clear();
    }
    if (typeof SoundManager !== "undefined" && SoundManager.playOk) {
      SoundManager.playOk();
    }
    if (window.Gamemory && window.Gamemory._log) {
      window.Gamemory._log(
        "Opening debug window (hotkey: " + GM_DEBUG_HOTKEY_LABEL + ")"
      );
    }
    SceneManager.push(Scene_GamemoryDebug);
    return true;
  }

  window.Gamemory.openDebugWindow = function () {
    return gmOpenDebugWindow();
  };

  if (GM_DEBUG_ENABLED) {
    var _Scene_Map_updateForGamemory = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
      if (GM_DEBUG_KEY_STATE.trigger) {
        if (gmOpenDebugWindow()) {
          return;
        }
      }
      _Scene_Map_updateForGamemory.call(this);
    };

    if (typeof Scene_Battle !== "undefined") {
      var _Scene_Battle_updateForGamemory = Scene_Battle.prototype.update;
      Scene_Battle.prototype.update = function () {
        if (GM_DEBUG_KEY_STATE.trigger) {
          if (gmOpenDebugWindow()) {
            return;
          }
        }
        _Scene_Battle_updateForGamemory.call(this);
      };
    }

    if (window.Gamemory && window.Gamemory._log) {
      window.Gamemory._log(
        "Debug window enabled (hotkey: " + GM_DEBUG_HOTKEY_LABEL + ")"
      );
    }
  }

  // Plugin Commandok (MV)
  // ------------------------------------------------------------------------------
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (!command) return;
    if (command.toUpperCase() !== "GAMEMORY") return;

    var sub = (args[0] || "").toUpperCase();

    function mapArg(idx) {
      var token = args[idx];
      if (!token) return 0;
      if (String(token).toUpperCase() === "CURRENT") return $gameMap.mapId();
      var n = Number(token);
      return isNaN(n) ? 0 : n;
    }
    function idArg(idx) {
      var n = Number(args[idx] || 0);
      return isNaN(n) ? 0 : Math.max(0, Math.floor(n));
    }
    function varArg(idx) {
      var vid = Number(args[idx] || 0);
      return isNaN(vid) ? 0 : Math.max(0, Math.floor(vid));
    }

    if (!$gameGamemory) return;

    switch (sub) {
      // MAP
      case "CHECK_VISITED": {
        var mapId1 = mapArg(1);
        var switchId = Number(args[2] || 0);
        var val = $gameGamemory.hasVisited(mapId1);
        if (switchId > 0) $gameSwitches.setValue(switchId, !!val);
        Gamemory._log(
          "CHECK_VISITED map #" +
            mapId1 +
            " -> " +
            val +
            " (switch " +
            switchId +
            ")"
        );
        break;
      }
      case "GET_COUNT": {
        var mapId2 = mapArg(1);
        var varId = varArg(2);
        var cnt = $gameGamemory.getVisitCount(mapId2);
        if (varId > 0) $gameVariables.setValue(varId, cnt);
        Gamemory._log(
          "GET_COUNT map #" + mapId2 + " -> " + cnt + " (var " + varId + ")"
        );
        break;
      }
      case "MARK_VISITED": {
        var mapId3 = mapArg(1);
        var after = $gameGamemory.markVisited(mapId3);
        Gamemory._log("MARK_VISITED map #" + mapId3 + " -> " + after);
        break;
      }
      case "RESET_MAP": {
        var mapId4 = mapArg(1);
        $gameGamemory.resetMap(mapId4);
        break;
      }

      // COMBAT QUERIES
      case "ENEMY_KILLS": {
        var enemyId = idArg(1);
        var varId2 = varArg(2);
        var v = $gameGamemory.getEnemyKillCount(enemyId);
        if (varId2 > 0) $gameVariables.setValue(varId2, v);
        Gamemory._log(
          "ENEMY_KILLS enemy #" + enemyId + " -> " + v + " (var " + varId2 + ")"
        );
        break;
      }
      case "TROOP_ENCOUNTERS": {
        var troopIdE = idArg(1);
        var varIdE = varArg(2);
        var ve = $gameGamemory.getTroopEncounterCount(troopIdE);
        if (varIdE > 0) $gameVariables.setValue(varIdE, ve);
        Gamemory._log(
          "TROOP_ENCOUNTERS troop #" +
            troopIdE +
            " -> " +
            ve +
            " (var " +
            varIdE +
            ")"
        );
        break;
      }
      case "TROOP_WINS": {
        var troopIdW = idArg(1);
        var varIdW = varArg(2);
        var vw = $gameGamemory.getTroopWinCount(troopIdW);
        if (varIdW > 0) $gameVariables.setValue(varIdW, vw);
        Gamemory._log(
          "TROOP_WINS troop #" +
            troopIdW +
            " -> " +
            vw +
            " (var " +
            varIdW +
            ")"
        );
        break;
      }
      case "TROOP_LOSSES": {
        var troopIdL = idArg(1);
        var varIdL = varArg(2);
        var vl = $gameGamemory.getTroopLossCount(troopIdL);
        if (varIdL > 0) $gameVariables.setValue(varIdL, vl);
        Gamemory._log(
          "TROOP_LOSSES troop #" +
            troopIdL +
            " -> " +
            vl +
            " (var " +
            varIdL +
            ")"
        );
        break;
      }
      case "TOTAL_VICTORIES": {
        var varTv = varArg(1);
        var tv = $gameGamemory.getTotalVictories();
        if (varTv > 0) $gameVariables.setValue(varTv, tv);
        Gamemory._log("TOTAL_VICTORIES -> " + tv + " (var " + varTv + ")");
        break;
      }
      case "TOTAL_GAMEOVERS": {
        var varTg = varArg(1);
        var tg = $gameGamemory.getTotalGameOvers();
        if (varTg > 0) $gameVariables.setValue(varTg, tg);
        Gamemory._log("TOTAL_GAMEOVERS -> " + tg + " (var " + varTg + ")");
        break;
      }
      case "TOTAL_MONSTER_KILLS": {
        var varTmk = varArg(1);
        var tmk = $gameGamemory.getTotalMonstersDefeated();
        if (varTmk > 0) $gameVariables.setValue(varTmk, tmk);
        Gamemory._log(
          "TOTAL_MONSTER_KILLS -> " + tmk + " (var " + varTmk + ")"
        );
        break;
      }

      // LOG
      case "LOG_BATTLE": {
        var tid =
          ($gameTroop && $gameTroop.troop && $gameTroop.troop().id) || 0;
        var enc = $gameGamemory.getTroopEncounterCount(tid);
        var win = $gameGamemory.getTroopWinCount(tid);
        var los = $gameGamemory.getTroopLossCount(tid);
        Gamemory._log(
          "LOG_BATTLE troop #" +
            tid +
            " -> encounters=" +
            enc +
            ", wins=" +
            win +
            ", losses=" +
            los
        );
        break;
      }
      case "LOG_ALL": {
        var all = {
          maps: $gameGamemory.getAll(),
          battle: $gameGamemory.getBattleStats(),
        };
        Gamemory._log("LOG_ALL -> " + JSON.stringify(all));
        break;
      }

      default:
        Gamemory._log("Unknown command: " + sub);
        break;
    }
  };
})();







/*:
 * @plugindesc InteractiveMapNpc – NPC/event ikonok, IME tagek és portré ablak az InteractiveRpgMap-hez
 * @target MV
 * @author  Soczó Kristóf
 * @version 1.0
 *
 * @param showNpcLabel
 * @text Show Event label
 * @type boolean
 * @on Mutasd
 * @off Rejtsd
 * @default true
 * @desc Enable or disable to show the event label under the event sprite in the map. You can overwrite in in the event note <IME NONAME>.
 *
 * @param npcIconWidth
 * @text Event Width (px)
 * @type number
 * @min 16
 * @default 96
 * @desc Global setting for the width of the event image (in px). You can overwrite in in the event note <IME H:96 W:96>
 *
 * @param npcIconHeight
 * @text Event Height (px)
 * @type number
 * @min 16
 * @default 96
 * @desc Global setting for the height of the event image (in px). You can overwrite in in the event note <IME H:96 W:96>
 *
 * @param npcLabelFontSize
 * @text Event label font size
 * @type number
 * @min 8
 * @default 18
 * @desc Event label font size
 * 
 * @param portraitBadgeFontSize
 * @text Portrait badge font size
 * @type number
 * @min 8
 * @default 16
 *
 * @param portraitNameFontSize
 * @text Portrait name font size
 * @type number
 * @min 8
 * @default 18
 *
 * @param portraitDescFontSize
 * @text Portrait description font size
 * @type number
 * @min 8
 * @default 16
 *
 *
 * @param portraitImgWinWidth
 * @text Portrait Img Window Width
 * @type number
 * @min 26
 * @default 240
 * @desc IMG Portrait window width (in px)
 *
 * @param portraitImgWinHeight
 * @text Portrait Img Window Height
 * @type number
 * @min 26
 * @default 240
 * @desc IMG Portrait window height (in px)
 *
 * @param portraitTextWinWidth
 * @text Portrait Text Window Weight
 * @type number
 * @min 26
 * @default 240
 *
 * @param portraitTextWinHeight
 * @text Portrait Text Window Height
 * @type number
 * @min 26
 * @default 240
 *
 * @param portraitWindowSkin
 * @text Portrait Window Skin
 * @type file
 * @dir img/system
 * @desc Leave empty to use the default System Window.
 *
 * @param faceImageDir
 * @text Custom Portrait IMg folder
 * @type text
 * @default img/imecustomfaces
 * @desc FACEIMG: File name.png is loaded from here (default: img/imecustomfaces)
 *
 * @help
 * USAGE
 * ------
 * Show any event on the Interactive Map by adding an IME tag in the Event page:s
 *
 *  <IME>
 *
 * Options:
 *  <IME NONAME>     → hides the label under the icon (the label = the event’s name by default)
 *  <IME H:96 W:96>  → overrides the icon’s size (in pixels) on the map overlay
 *
 * Notes:
 * - The event’s current character graphic is used as the icon. It live‑syncs while the event moves.
 * - Visibility also tracks the event (e.g. page changes / erased) on the player’s current map only.
 * - You can place *any* event on the map, not just character NPCs.
 * 
 * Portrait metadata (on the active page, in Comment commands)
 * -----------------------------------------------------------
 * Add comment lines to the event’s *active* page:
 *
 * IMENAME: Evelyn
 * IMEDESC: Multi-line\ndescription supported.
 * IMEFACEIMG: Actor1_3
 * IMEBADGE: resident
 *
 * Meaning:
 *- IMENAME    → display name (overrides the event name for the label)
 *- IMEDESC    → description text (supports \n or <br> line breaks)
 * - IMEFACEIMG → portrait image filename (loaded from the “faceImageDir” plugin param,
 *               default: img/imecustomfaces). Use filename without path; extension optional.
 * - IMEBADGE   → small text badge shown in the top-left of the portrait image window
 *
 * Behavior:
 * - If you provide IMENAME only, there is **no** portrait window on click (the label still shows IMENAME).
 * - A portrait window opens on click only if both a name and a description exist.
 * - The badge is drawn like a pill in the portrait’s top-left (no icon).
 *
 * Extra IME tag option
 * --------------------
 * <IME NOINT>  → the event remains visible but is **not** clickable on the map
 *               (no portrait window; also no “poi-click” emission).
 *
 *Integration & scope
 *-------------------
 *- On NPC click, the plugin emits: IRMap.emit("poi-click", { poi }) — useful for other plugins (e.g. router).
 *- Only events on the player’s **current** map are drawn (by design, for live sync).
 *
 * Tips
 * ----
 * - The label under the icon can be globally shown/hidden via plugin parameters.
 * - You can override icon size per-event via <IME H:.. W:..>.
 * - Portrait window skin, image/text window sizes, and font sizes are configurable via plugin params.

Learn more (plugin commands & details)
--------------------------------------
See: https://github.com/Lonsdale201/rpgmakermyplugins/wiki/Interactive-Map-Npc

 */
(() => {
  "use strict";

  const PLUGIN = "InteractiveMapNpc";
  const prm = PluginManager.parameters(PLUGIN);
  const P = (k) => prm[k];

  const SHOW_LABEL = P("showNpcLabel") !== "false";
  const ICON_W = +P("npcIconWidth") || 96;
  const ICON_H = +P("npcIconHeight") || 96;

  const LABEL_FONT = +P("npcLabelFontSize") || 18;
  const BADGE_FONT = +P("portraitBadgeFontSize") || 16;
  const NAME_FONT = +P("portraitNameFontSize") || 18;
  const DESC_FONT = +P("portraitDescFontSize") || 16;

  const IMG_W = +P("portraitImgWinWidth") || 240;
  const IMG_H = +P("portraitImgWinHeight") || 240;
  const TXT_W = +P("portraitTextWinWidth") || 260;
  const TXT_H = +P("portraitTextWinHeight") || 260;
  const PORTRAIT_SKIN = P("portraitWindowSkin") || "";
  const HIDDEN_NPCS = new Set();
  const FORCED_NPCS = new Set();
  const FACE_DIR = (P("faceImageDir") || "img/imecustomfaces").replace(
    /\/+$/,
    ""
  );

  // ──────────────────────────────────────────────────────────────────
  //  Címke és tagek (IME kompatibilitás)
  // ──────────────────────────────────────────────────────────────────
  const NAME_TAG = /\[IME([^\]]*)\]/i; // event name:   [IME NONAME]
  const NOTE_TAG = /<IME\b([^>]*)>/i; // note/comment: <IME NONAME>

  function parseImeArgs(argstr) {
    const tokens = String(argstr || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const res = {
      noname: false,
      noint: false, // <— új
      width: null,
      height: null,
    };
    for (const t of tokens) {
      if (/^noname$/i.test(t)) {
        res.noname = true;
      } else if (/^noint$/i.test(t)) {
        // <— új ág
        res.noint = true;
      } else if (/^W\s*:\s*(\d+)$/i.test(t)) {
        res.width = +t.match(/^W\s*:\s*(\d+)$/i)[1];
      } else if (/^H\s*:\s*(\d+)$/i.test(t)) {
        res.height = +t.match(/^H\s*:\s*(\d+)$/i)[1];
      }
    }
    return res;
  }

  function readPortraitMeta(ev) {
    const res = { name: "", desc: "", face: "", badge: "" };
    const page = ev.page && ev.page();
    if (!page || !page.list) return res;

    const normFace = (p) => {
      let v = String(p || "").trim();
      v = v.replace(/^img\//i, "");
      const parts = v.split(/[\/\\]/);
      return parts[parts.length - 1] || "";
    };

    for (let i = 0; i < page.list.length; i++) {
      const cmd = page.list[i];
      if (!cmd || (cmd.code !== 108 && cmd.code !== 408)) continue;
      const raw = String((cmd.parameters && cmd.parameters[0]) || "");
      const line = raw.trim();

      let m;
      if ((m = line.match(/^\s*IMENAME\s*:\s*(.*)$/i))) {
        res.name = m[1].trim();
      } else if ((m = line.match(/^\s*IMEDESC\s*:\s*(.*)$/i))) {
        res.desc = m[1].trim();
      } else if ((m = line.match(/^\s*IMEFACEIMG\s*:\s*(.*)$/i))) {
        res.face = normFace(m[1]);
      } else if ((m = line.match(/^\s*IMEBADGE\s*:\s*(.*)$/i))) {
        res.badge = (m[1] || "").trim();
      } else if ((m = line.match(/^\s*FACEIMG\s*:\s*(.*)$/i))) {
        res.face = normFace(m[1]);
        if (window.console && console.warn) {
          console.warn(
            "[InteractiveMapNpc] FACEIMG deprecated, használd az IMEFACEIMG kulcsszót!"
          );
        }
      }
    }
    return res;
  }

  function imeTagInfo(ev) {
    const data = ev && ev.event && ev.event();
    if (!data) {
      return {
        present: false,
        noname: false,
        noint: false,
        width: null,
        height: null,
      };
    }

    let present = false;
    let noname = false;
    let noint = false;
    let width = null;
    let height = null;

    // [IME …] tag in event name
    const nm = NAME_TAG.exec(data.name || "");
    if (nm) {
      present = true;
      const args = parseImeArgs(nm[1]);
      if (args.noname) noname = true;
      if (args.noint) noint = true;
      if (args.width != null) width = args.width;
      if (args.height != null) height = args.height;
    }

    // <IME …> tag in event note
    const nt = NOTE_TAG.exec(data.note || "");
    if (nt) {
      present = true;
      const args = parseImeArgs(nt[1]);
      if (args.noname) noname = true;
      if (args.noint) noint = true;
      if (args.width != null) width = args.width;
      if (args.height != null) height = args.height;
    }

    // also scan first few comment lines on the page
    const page = ev.page && ev.page();
    if (page && page.list) {
      for (let i = 0; i < page.list.length && i < 6; i++) {
        const cmd = page.list[i];
        if (!cmd) break;
        if (cmd.code === 108 || cmd.code === 408) {
          const line = (cmd.parameters && cmd.parameters[0]) || "";
          const m = NOTE_TAG.exec(line);
          if (m) {
            present = true;
            const args = parseImeArgs(m[1]);
            if (args.noname) noname = true;
            if (args.noint) noint = true;
            if (args.width != null) width = args.width;
            if (args.height != null) height = args.height;
          }
        } else if (cmd.code !== 408) {
          break;
        }
      }
    }

    return { present, noname, noint, width, height };
  }

  // ──────────────────────────────────────────────────────────────────
  //  UI – portré ablakok (függetlenül működik az Elements-től)
  // ──────────────────────────────────────────────────────────────────
  function applySkin(win) {
    if (!PORTRAIT_SKIN) return;
    win.windowskin = ImageManager.loadSystem(PORTRAIT_SKIN);
    if (win._refreshAllParts) win._refreshAllParts();
  }

  class NpcPortraitImg extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      Window_Base.prototype.initialize.call(this, x, y, IMG_W, IMG_H);
      this.opacity = 192;
      applySkin(this);
      this.refresh();
    }
    standardPadding() {
      return 2;
    }
    refresh() {
      this.contents.clear();
      if (!this._poi._evFace) return;
      const bmp = ImageManager.loadBitmap(
        FACE_DIR + "/",
        this._poi._evFace,
        0,
        true
      );
      bmp.addLoadListener(() => {
        drawCover(this.contents, bmp);
        if (this._poi.badge) {
          drawBadgePill(this.contents, String(this._poi.badge || ""));
        }
      });
    }
  }
  function drawCover(c, bmp) {
    const CW = c.width,
      CH = c.height;
    const s = Math.max(CW / bmp.width, CH / bmp.height);
    const sw = CW / s,
      sh = CH / s,
      sx = (bmp.width - sw) / 2,
      sy = (bmp.height - sh) / 2;
    c.blt(bmp, sx, sy, sw, sh, 0, 0, CW, CH);
  }

  function drawBadgePill(c, text) {
    text = (text || "").trim();
    if (!text) return;

    const padX = 6,
      padY = 4;
    const margin = 4;
    const oldSize = c.fontSize;
    const oldColor = c.textColor;
    const oldOutline = c.outlineColor;
    const oldOLW = c.outlineWidth;

    c.fontSize = BADGE_FONT;
    c.outlineWidth = 0;
    c.textColor = "#ffffff";

    // szélesség mérés
    const wText = c.measureTextWidth(text);
    const pillW = Math.min(c.width - margin * 2, wText + padX * 2);
    const pillH = c.fontSize + padY * 2;

    // háttér (lekerekített téglalap)
    const rx = margin,
      ry = margin;
    const rw = pillW,
      rh = pillH;
    const r = 8;

    // bitmapen nincs path, ezért egyszerű “kocka + körök” stílus (elég jó)
    // háttér téglalap
    c.fillRect(rx + r, ry, rw - 2 * r, rh, "#000000");
    c.fillRect(rx, ry + r, rw, rh - 2 * r, "#000000");
    // sarkok (körök)
    c.drawCircle(rx + r, ry + r, r, "#000000");
    c.drawCircle(rx + rw - r, ry + r, r, "#000000");
    c.drawCircle(rx + r, ry + rh - r, r, "#000000");
    c.drawCircle(rx + rw - r, ry + rh - r, r, "#000000");

    // átlátszóság trükk: Window_Base Bitmap nem támogat alfát per draw,
    // ezért használjunk sötétszürkét a fekete helyett, hogy “semi” hatású legyen.
    // Ha szeretnél erősebb áttetszést: állítsd #111, #222 stb.
    // (Ha van saját blit‑alpha helpered, cseréld arra.)

    // szöveg
    const tx = rx + (rw - wText) / 2;
    const ty = ry + (rh - c.fontSize) / 2 - 2; // apró optikai korrekció
    c.outlineWidth = 3;
    c.outlineColor = "rgba(0,0,0,0.5)";
    c.drawText(text, tx, ty, wText, c.fontSize + 2, "left");

    // visszaállítás
    c.fontSize = oldSize;
    c.textColor = oldColor;
    c.outlineColor = oldOutline;
    c.outlineWidth = oldOLW;
  }

  class NpcPortraitText extends Window_Base {
    constructor(poi, x, y) {
      super();
      this._poi = poi;
      Window_Base.prototype.initialize.call(this, x, y, TXT_W, TXT_H);
      this.opacity = 192;
      applySkin(this);
      this._scrollY = 0;
      this._maxScroll = 0;
      this._dragging = false;
      this._lastY = 0;
      this.createContents();
      this.refresh();
    }
    refresh() {
      const CW = this.contentsWidth(),
        TEMP_H = 5000;
      this.contents = new Bitmap(CW, TEMP_H);
      let y = 0,
        margin = 4;

      // Név
      this.contents.fontSize = NAME_FONT;
      const nameLH = this.contents.fontSize + 2;
      this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
      y += nameLH + margin + 5;

      // Leírás
      this.contents.fontSize = DESC_FONT;
      const lineH = this.contents.fontSize + 2;
      let desc = (this._poi.desc || "")
        .replace(/^"(.*)"$/s, "$1")
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();
      const paras = desc.split(/\r?\n/);
      for (const paragraph of paras) {
        if (!paragraph.trim()) {
          y += lineH;
          continue;
        }
        const words = paragraph.split(/\s+/);
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (this.contents.measureTextWidth(test) > CW && line) {
            this.contents.drawText(line, 0, y, CW, lineH, "left");
            y += lineH;
            line = word;
          } else line = test;
        }
        if (line) {
          this.contents.drawText(line, 0, y, CW, lineH, "left");
          y += lineH;
        }
        y += margin;
      }
      this._contentH = y;
      this._maxScroll = Math.max(0, this._contentH - this.contentsHeight());
    }
    update() {
      super.update();
      const wheel = TouchInput.wheelY;
      if (wheel !== 0 && this.isTouchedInsideFrame())
        this._scrollBy(wheel > 0 ? 24 : -24);
      if (TouchInput.isPressed() && this.isTouchedInsideFrame()) {
        const y = TouchInput.y;
        if (!this._dragging) {
          this._dragging = true;
          this._lastY = y;
        } else {
          const dy = this._lastY - y;
          if (Math.abs(dy) > 2) {
            this._scrollBy(dy);
            this._lastY = y;
          }
        }
      } else this._dragging = false;

      this.downArrowVisible = this._scrollY < this._maxScroll;
      this.upArrowVisible = this._scrollY > 0;
    }
    _scrollBy(dy) {
      this._scrollY = Math.max(
        0,
        Math.min(this._scrollY + dy, this._maxScroll)
      );
      this.origin.y = this._scrollY;
    }
    isTouchedInsideFrame() {
      const x = TouchInput.x,
        y = TouchInput.y;
      return (
        x >= this.x &&
        x < this.x + this.width &&
        y >= this.y &&
        y < this.y + this.height
      );
    }
  }

  // ──────────────────────────────────────────────────────────────────
  //  NPC Sprite (eventből) – karakter sheetből vágja a frame-et
  // ──────────────────────────────────────────────────────────────────
  function dirRow(d) {
    return d === 2 ? 0 : d === 4 ? 1 : d === 6 ? 2 : 3;
  }

  class NpcSprite extends Sprite {
    constructor(ev, scene, win, showLabel, maxW = ICON_W, maxH = ICON_H) {
      super();
      this._ev = ev;
      this._scene = scene;
      this._win = win;
      this._showLabel = showLabel;
      this._maxIconW = maxW;
      this._maxIconH = maxH;

      this._icon = new Sprite();
      this._icon.anchor.set(0.5, 0.5);
      this.addChild(this._icon);
      this.anchor.set(0.5, 0.5);

      this._state = {
        sheet: null,
        sheetName: "",
        idx: -1,
        big: false,
        pw: 0,
        ph: 0,
        baseX: 0,
        baseY: 0,
        dir: -1,
        pat: -1,
      };
      this._baseScale = 1;
      this._bottomPad = 0;

      this._initFromEvent(ev);

      if (this._showLabel) {
        const bm = new Bitmap(240, 24);
        bm.fontSize = LABEL_FONT;
        bm.textColor = "#fff";
        bm.outlineColor = "rgba(0,0,0,0.75)";
        bm.outlineWidth = 4;
        this._label = new Sprite(bm);
        this._label.anchor.set(0.5, 0);
        this._icon.addChild(this._label);
      }
    }

    _initFromEvent(ev) {
      const name = ev.characterName && ev.characterName();
      const tileId = ev.tileId ? ev.tileId() : 0;

      if (name) {
        // --- EREDETI character-sheet ág (marad) ---
        const sheet = ImageManager.loadCharacter(name);
        sheet.addLoadListener(() => {
          if (this._dead) return;
          IRMap.unregisterClickable(this);
          const big = ImageManager.isBigCharacter(name);
          const pw = sheet.width / (big ? 3 : 12);
          const ph = sheet.height / (big ? 4 : 8);
          const idx = ev.characterIndex ? ev.characterIndex() : 0;
          const baseX = (big ? 0 : (idx % 4) * 3) * pw;
          const baseY = (big ? 0 : Math.floor(idx / 4) * 4) * ph;

          this._state = {
            sheet,
            sheetName: name,
            idx,
            big,
            pw,
            ph,
            baseX,
            baseY,
            dir: -1,
            pat: -1,
          };
          this._icon.bitmap = new Bitmap(pw, ph);
          this._baseScale = Math.min(this._maxIconW / pw, this._maxIconH / ph);
          this.__npcRefreshFrame(true);
          this._bottomPad = 0;
        });
      } else if (tileId > 0) {
        this._initFromTile(ev, tileId);
      }
    }

    _initFromTile(ev, tileId) {
      const tw = $gameMap.tileWidth();
      const th = $gameMap.tileHeight();
      const tileset = $gameMap.tileset();
      if (!tileset || !tileset.tilesetNames) return;

      if (
        Tilemap.isTileA1(tileId) ||
        Tilemap.isTileA2(tileId) ||
        Tilemap.isTileA3(tileId) ||
        Tilemap.isTileA4(tileId)
      ) {
        console.warn(
          "[InteractiveMapNpc] Event image is an A1–A4 autotile – not supported on the overlay (yet). Use A5/B/C/D/E or a character sheet."
        );
        return;
      }

      let setIndex, sx, sy, srcName, srcBmp;

      if (Tilemap.isTileA5(tileId)) {
        const idx = tileId - Tilemap.TILE_ID_A5;
        setIndex = 4;
        sx = (idx % 8) * tw;
        sy = Math.floor(idx / 8) * th;
      } else {
        setIndex = 5 + Math.floor(tileId / 256);
        const idx = tileId % 256;
        sx = (idx % 8) * tw;
        sy = Math.floor(idx / 8) * th;
      }

      srcName = tileset.tilesetNames[setIndex];
      if (!srcName) return;

      srcBmp = ImageManager.loadTileset(srcName);
      srcBmp.addLoadListener(() => {
        this._icon.bitmap = new Bitmap(tw, th);
        this._icon.bitmap.blt(srcBmp, sx, sy, tw, th, 0, 0);
        this._baseScale = Math.min(this._maxIconW / tw, this._maxIconH / th);
      });

      this._state = {
        sheet: null,
        sheetName: srcName,
        idx: -1,
        big: false,
        pw: tw,
        ph: th,
        baseX: sx,
        baseY: sy,
        dir: -1,
        pat: -1,
      };
    }

    __npcRefreshFrame(force = false) {
      const s = this._state,
        ev = this._ev;
      if (!s.sheet) return;
      const dir = ev.direction ? ev.direction() : 2;
      const pat = ev.pattern ? ev.pattern() : 1;
      if (!force && dir === s.dir && pat === s.pat) return;

      const srcX = s.baseX + pat * s.pw,
        srcY = s.baseY + dirRow(dir) * s.ph;
      const dst = this._icon.bitmap;
      dst.clearRect(0, 0, dst.width, dst.height);
      dst.blt(s.sheet, srcX, srcY, s.pw, s.ph, 0, 0);
      s.dir = dir;
      s.pat = pat;
    }

    updateLayout(nameText) {
      const pos = IRMap.worldToImage(this._ev.x, this._ev.y) || {};
      const cam = this._win.cameraRect();
      const scale = this._win.coverScale();

      const imgX = pos.imgX != null ? pos.imgX : 0;
      const imgY = pos.imgY != null ? pos.imgY : 0;
      const rx = imgX - cam.x;
      const ry = imgY - cam.y;

      const inside = rx >= 0 && ry >= 0 && rx <= cam.w && ry <= cam.h;
      this.visible = inside;
      if (!inside) return;

      // ─── 2. Sprite pozíció + skála ──────────────────────────────────
      this.x = Math.round(rx * scale);
      this.y = Math.round(ry * scale);
      this._icon.scale.set(this._baseScale * scale);

      this.__npcRefreshFrame(false);

      // ─── 3. Címke pozícionálása ─────────────────────────────────────
      if (this._label) {
        const bm = this._label.bitmap;
        bm.clear();
        bm.drawText(nameText || "", 0, 0, bm.width, bm.height, "center");

        const iconH = this._icon.bitmap ? this._icon.bitmap.height : 0;
        const pad = this._icon._bottomPadPx || 0;
        const gap = 2;

        const localY = iconH / 2 - pad + gap;

        const sIcon = this._icon.scale.y;
        this._label.scale.set(1 / sIcon);
        this._label.x = 0;
        this._label.y = localY;
      }

      this.__npcRefreshFrame(false);
    }

    hitTest(scrX, scrY) {
      if (!this.visible) return false;
      const w = this._icon.bitmap ? this._icon.bitmap.width : 0;
      const h = this._icon.bitmap ? this._icon.bitmap.height : 0;
      const ax = this._icon.anchor.x,
        ay = this._icon.anchor.y;
      const tl = this._icon.toGlobal(new PIXI.Point(-ax * w, -ay * h));
      const br = this._icon.toGlobal(
        new PIXI.Point((1 - ax) * w, (1 - ay) * h)
      );
      return scrX >= tl.x && scrX <= br.x && scrY >= tl.y && scrY <= br.y;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  //  Overlay regisztráció (csak NPC/event) – JAVÍTOTT VERZIÓ
  // ──────────────────────────────────────────────────────────────────
  IRMap.registerOverlay((scene, win) => {
    scene._npcSprites = [];
    scene._npcActive = null;

    let lastDisplayedId = -1;

    function getDisplayedId() {
      const cfgNow = scene.mapConfig && scene.mapConfig();
      if (!cfgNow) return 0;
      if (cfgNow.mapId != null) return Number(cfgNow.mapId) || 0;
      if (cfgNow.editorMapName && IRMap.findMapIdByEditorName) {
        return IRMap.findMapIdByEditorName(String(cfgNow.editorMapName)) || 0;
      }
      return 0;
    }

    function ensureMask() {
      if (!win._poiMask) {
        const g = new PIXI.Graphics();
        g.beginFill(0xffffff);
        g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
        g.endFill();
        if (win._markerLayer) {
          win._markerLayer.addChildAt(g, 0);
          win._markerLayer.mask = g;
        }
        win._poiMask = g;
      } else {
        const g = win._poiMask;
        g.clear();
        g.beginFill(0xffffff);
        g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
        g.endFill();
        if (win._markerLayer && win._markerLayer.mask !== g) {
          win._markerLayer.mask = g;
        }
      }
    }

    function clearPortraitWindows() {
      if (scene._npcImgWin) {
        scene.removeChild(scene._npcImgWin);
        scene._npcImgWin = null;
      }
      if (scene._npcTxtWin) {
        scene.removeChild(scene._npcTxtWin);
        scene._npcTxtWin = null;
      }
      scene._npcActive = null;
    }

    function clearNpcSprites() {
      scene._npcSprites.forEach((sp) => {
        IRMap.unregisterClickable(sp);
        if (sp.parent) sp.parent.removeChild(sp);
      });
      scene._npcSprites = [];
    }

    function rebuild() {
      clearNpcSprites();
      clearPortraitWindows();
      ensureMask();

      const displayedId = getDisplayedId();
      const playerId = $gameMap.mapId();

      // jegyezzük fel az aktuális kijelzett mapot, hogy onTick ne rebuildeljen feleslegesen
      lastDisplayedId = displayedId;

      // csak akkor építünk, ha a kijelzett map == játékos valós pályája
      if (displayedId !== playerId) return;

      // jelöltek: IME tag alapján, + forced, - hidden
      const candidates = $gameMap
        .events()
        .map((ev) => ({ ev, info: imeTagInfo(ev) }))
        .filter(
          ({ ev, info }) =>
            (info.present || FORCED_NPCS.has(ev.eventId())) &&
            !HIDDEN_NPCS.has(ev.eventId())
        );

      for (const { ev, info } of candidates) {
        const meta = readPortraitMeta(ev);
        const customW = info.width > 0 ? info.width : ICON_W;
        const customH = info.height > 0 ? info.height : ICON_H;
        const nameRaw = ev.event().name || "";
        const dispName = (
          meta.name || nameRaw.replace(NAME_TAG, "").trim()
        ).trim();

        const sp = new NpcSprite(
          ev,
          scene,
          win,
          SHOW_LABEL && !info.noname,
          customW,
          customH
        );
        sp._poi = {
          name: dispName,
          desc: meta.desc || "",
          _evFace: meta.face || "",
          badge: meta.badge || "",
        };

        if (win._markerLayer) win._markerLayer.addChild(sp);
        else scene.addChild(sp);

        scene._npcSprites.push(sp);

        if (!info.noint) {
          IRMap.registerClickable(sp, () => onNpcClick(sp), { blink: true });
        }
      }
    }

    function onNpcClick(spr) {
      if (scene._poiImgWin) {
        scene.removeChild(scene._poiImgWin);
        scene._poiImgWin = null;
      }
      if (scene._poiTxtWin) {
        scene.removeChild(scene._poiTxtWin);
        scene._poiTxtWin = null;
      }
      clearPortraitWindows();

      if (!spr._poi.name || !spr._poi.desc) return;

      const baseX = win.x + win.padding;
      const baseY = win.y + win.padding;

      if (spr._poi._evFace) {
        scene._npcImgWin = new NpcPortraitImg(spr._poi, baseX, baseY);
        scene.addChild(scene._npcImgWin);
      }
      scene._npcTxtWin = new NpcPortraitText(
        spr._poi,
        baseX,
        baseY + (scene._npcImgWin ? IMG_H : 0)
      );
      scene.addChild(scene._npcTxtWin);

      scene._npcActive = spr;
      IRMap.emit("poi-click", { poi: spr._poi });
    }

    function onTick() {
      const displayedId = getDisplayedId();
      if (
        displayedId !== lastDisplayedId ||
        (!scene._npcSprites.length && displayedId === $gameMap.mapId())
      ) {
        rebuild();
      }

      scene._npcSprites.forEach((sp) =>
        sp.updateLayout(sp._poi && sp._poi.name)
      );
    }

    rebuild();
    const onBmp = ({ scene: sc2 }) => {
      if (sc2 === scene) rebuild();
    };
    const onSw = ({ scene: sc2 }) => {
      if (sc2 === scene) rebuild();
    };
    const onCam = ({ win: w }) => {
      if (w === win) ensureMask();
    };

    IRMap.on("update-tick", onTick);
    IRMap.on("bitmap-loaded", onBmp);
    IRMap.on("map-switched", onSw);
    IRMap.on("camera-changed", onCam);

    const onClose = ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", onTick);
      IRMap.off("bitmap-loaded", onBmp);
      IRMap.off("map-switched", onSw);
      IRMap.off("camera-changed", onCam);
      IRMap.off("scene-close", onClose);
      clearNpcSprites();
      clearPortraitWindows();
    };
    IRMap.on("scene-close", onClose);
  });

  const _NpcPortraitImg_update = NpcPortraitImg.prototype.update;
  NpcPortraitImg.prototype.update = function () {
    _NpcPortraitImg_update.call(this);
    if (TouchInput.isTriggered()) {
      const x = TouchInput.x,
        y = TouchInput.y;
      const inside =
        x >= this.x &&
        x < this.x + this.width &&
        y >= this.y &&
        y < this.y + this.height;
      if (inside) {
        TouchInput._triggered = false;
      }
    }
  };

  const _NpcPortraitText_update = NpcPortraitText.prototype.update;
  NpcPortraitText.prototype.update = function () {
    _NpcPortraitText_update.call(this);
    if (TouchInput.isTriggered()) {
      const x = TouchInput.x,
        y = TouchInput.y;
      const inside =
        x >= this.x &&
        x < this.x + this.width &&
        y >= this.y &&
        y < this.y + this.height;
      if (inside) {
        TouchInput._triggered = false;
      }
    }
  };

  // ─── 2) Game_System kibővítése, hogy mentse a két tömböt ────────────
  const _Npc_Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Npc_Game_System_initialize.call(this);
    this._hiddenNpcIds = this._hiddenNpcIds || [];
    this._forcedNpcIds = this._forcedNpcIds || [];
  };

  // ─── 3) GameObject-ok létrehozásakor szinkronizáljuk a Set-eket ───────
  const _Npc_DataManager_createGameObjects = DataManager.createGameObjects;
  DataManager.createGameObjects = function () {
    _Npc_DataManager_createGameObjects.apply(this, arguments);
    // ha már volt mentés:
    this._loadNpcPersistence();
  };
  DataManager._loadNpcPersistence = function () {
    const gs = $gameSystem;
    HIDDEN_NPCS.clear();
    FORCED_NPCS.clear();
    (gs._hiddenNpcIds || []).forEach((id) => HIDDEN_NPCS.add(id));
    (gs._forcedNpcIds || []).forEach((id) => FORCED_NPCS.add(id));
  };

  // ─── 4) SaveContents / ExtractContents: a két tömb mentése betöltése ──
  const _Npc_DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const contents = _Npc_DataManager_makeSaveContents.apply(this, arguments);
    contents.hiddenNpcIds = Array.from(HIDDEN_NPCS);
    contents.forcedNpcIds = Array.from(FORCED_NPCS);
    return contents;
  };
  const _Npc_DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _Npc_DataManager_extractSaveContents.apply(this, arguments);

    // elmentett tömbök átadása a Game_System-nek
    $gameSystem._hiddenNpcIds = contents.hiddenNpcIds || [];
    $gameSystem._forcedNpcIds = contents.forcedNpcIds || [];

    this._loadNpcPersistence();
  };

  const _Npc_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Npc_Interpreter_pluginCommand.apply(this, arguments);
    const cmd = command.toLowerCase();
    // ─ RemoveEventFromTheMap ────────────────────────────────────────────
    if (cmd === "removeeventfromthemap") {
      let id = args.length ? Number(args[0]) : null;
      if (!id) {
        const sc = IRMap.currentScene();
        const act = sc && sc._npcActive;
        id = act && act._ev && act._ev.eventId();
      }
      if (id != null) {
        HIDDEN_NPCS.add(id);
        $gameSystem._hiddenNpcIds = Array.from(HIDDEN_NPCS);
        const sc = IRMap.currentScene();
        sc &&
          sc._npcSprites.forEach((sp) => {
            if (sp._ev.eventId() === id) sp.visible = false;
          });
      }
    }
    // ─ AddEventToTheMap ─────────────────────────────────────────────────
    else if (cmd === "addeventtothemap") {
      let id = args.length ? Number(args[0]) : null;
      if (!id) {
        const sc = IRMap.currentScene();
        const act = sc && sc._npcActive;
        id = act && act._ev && act._ev.eventId();
      }
      if (id != null) {
        HIDDEN_NPCS.delete(id);
        FORCED_NPCS.add(id);
        $gameSystem._hiddenNpcIds = Array.from(HIDDEN_NPCS);
        $gameSystem._forcedNpcIds = Array.from(FORCED_NPCS);
        const sc = IRMap.currentScene();
        if (sc) {
          IRMap.emit("scene-close", { scene: sc });
          IRMap.emit("scene-open", { scene: sc });
        }
      }
    }
  };
})();

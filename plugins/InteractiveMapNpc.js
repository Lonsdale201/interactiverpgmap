/*:
 * @plugindesc InteractiveMapNpc – NPC/event ikonok, IME tagek és portré ablak az InteractiveRpgMap-hez
 * @target MV
 * @author  Soczó Kristóf
 * @version 0.1
 *
 * @param showNpcLabel
 * @text NPC címkék
 * @type boolean
 * @on Mutasd
 * @off Rejtsd
 * @default true
 *
 * @param npcIconWidth
 * @text Ikon max. szélesség (px)
 * @type number
 * @min 16
 * @default 96
 *
 * @param npcIconHeight
 * @text Ikon max. magasság (px)
 * @type number
 * @min 16
 * @default 96
 *
 * @param portraitImgWinWidth
 * @text Portré kép ablak szélesség
 * @type number
 * @min 120
 * @default 240
 *
 * @param portraitImgWinHeight
 * @text Portré kép ablak magasság
 * @type number
 * @min 120
 * @default 240
 *
 * @param portraitTextWinWidth
 * @text Portré szöveg ablak szélesség
 * @type number
 * @min 120
 * @default 260
 *
 * @param portraitTextWinHeight
 * @text Portré szöveg ablak magasság
 * @type number
 * @min 120
 * @default 260
 *
 * @param portraitWindowSkin
 * @text Portré ablak skinsheet
 * @type file
 * @dir img/system
 * @desc Ha megadod, a portré ablak ezt a skin-t használja.
 *
 * @param faceImageDir
 * @text Egyedi portré képek mappa
 * @type text
 * @default img/imecustomfaces
 * @desc A FACEIMG: Fajlnev.png innen töltődik (alapértelmezett: img/imecustomfaces)
 *
 * @help
 * Használat:
 *  - Event Note/Comment: <IME> használhatod így is <IME NONAME> -> ilyenkor a térképen nem lesz ott az event neve
 *  - Portré meta az aktív page Comment soraiban: (commentet használj hozzá a definíciókhoz)
 *      IMENAME: Npc neve
 *      IMEDESC: Többsoros\nleírás támogatott.
 *      FACEIMG: Valaki.png (img/imecustomfaces) -> hozd létre hozzá a imecustomfaces mappát közvetlenül az img belül
 * Csak a JELENLEGI pályán lévő eventeket rajzolja, és a térképen a
 * játékossal azonos pálya megnyitásakor.
 */
(() => {
  "use strict";

  const PLUGIN = "InteractiveMapNpc";
  const prm = PluginManager.parameters(PLUGIN);
  const P = (k) => prm[k];

  const SHOW_LABEL = P("showNpcLabel") !== "false";
  const ICON_W = +P("npcIconWidth") || 96;
  const ICON_H = +P("npcIconHeight") || 96;

  const IMG_W = +P("portraitImgWinWidth") || 240;
  const IMG_H = +P("portraitImgWinHeight") || 240;
  const TXT_W = +P("portraitTextWinWidth") || 260;
  const TXT_H = +P("portraitTextWinHeight") || 260;
  const PORTRAIT_SKIN = P("portraitWindowSkin") || "";
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
    return { noname: tokens.some((t) => /^noname$/i.test(t)) };
  }

  function readPortraitMeta(ev) {
    const res = { name: "", desc: "", face: "" };
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
      const line = String((cmd.parameters && cmd.parameters[0]) || "");
      let m;
      if ((m = line.match(/^\s*IMENAME\s*:\s*(.*)$/i))) {
        res.name = m[1].trim();
      } else if ((m = line.match(/^\s*IMEDESC\s*:\s*(.*)$/i))) {
        res.desc = m[1].trim();
      } else if ((m = line.match(/^\s*FACEIMG\s*:\s*(.*)$/i))) {
        res.face = normFace(m[1]);
      }
    }
    return res;
  }

  function imeTagInfo(ev) {
    const data = ev && ev.event && ev.event();
    if (!data) return { present: false, noname: false };

    let present = false,
      noname = false;

    const nm = NAME_TAG.exec(data.name || "");
    if (nm) {
      present = true;
      if (parseImeArgs(nm[1]).noname) noname = true;
    }

    const nt = NOTE_TAG.exec(data.note || "");
    if (nt) {
      present = true;
      if (parseImeArgs(nt[1]).noname) noname = true;
    }

    const page = ev.page && ev.page();
    if (page && page.list) {
      for (let i = 0; i < page.list.length && i < 6; i++) {
        const cmd = page.list[i];
        if (!cmd) break;
        if (cmd.code === 108 || cmd.code === 408) {
          const t = (cmd.parameters && cmd.parameters[0]) || "";
          const m = NOTE_TAG.exec(t);
          if (m) {
            present = true;
            if (parseImeArgs(m[1]).noname) noname = true;
          }
        } else if (cmd.code !== 408) break;
      }
    }
    return { present, noname };
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
      bmp.addLoadListener(() => drawCover(this.contents, bmp));
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
      this.contents.fontSize = 18;
      const nameLH = this.contents.fontSize + 2;
      this.contents.drawText(this._poi.name || "", 0, y, CW, nameLH, "center");
      y += nameLH + margin + 5;

      // Leírás
      this.contents.fontSize = 16;
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
    constructor(ev, scene, win, showLabel) {
      super();
      this._ev = ev;
      this._scene = scene;
      this._win = win;
      this._showLabel = showLabel;

      this._icon = new Sprite();
      this._icon.anchor.set(0.5, 1.0);
      this.addChild(this._icon);
      this.anchor.set(0.5, 1.0);

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
      this.__npcRefreshFrame(true);
      this._bottomPad = 0;

      this._initFromEvent(ev);
      if (this._showLabel) {
        const bm = new Bitmap(240, 24);
        bm.fontSize = 18;
        bm.textColor = "#fff";
        bm.outlineColor = "rgba(0,0,0,0.75)";
        bm.outlineWidth = 4;
        this._label = new Sprite(bm);
        this._label.anchor.set(0.5, 0);
        this._icon.addChild(this._label);
      } else this._label = null;
    }

    _initFromEvent(ev) {
      const name = ev.characterName && ev.characterName();
      if (!name) return;

      const sheet = ImageManager.loadCharacter(name);

      sheet.addLoadListener(() => {
        // ← arrow fn: helyes this
        if (this._dead) return;

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
        this._baseScale = Math.min(ICON_W / pw, ICON_H / ph, 1);

        this.__npcRefreshFrame(true); // ← új, ütközésmentes név
        this._bottomPad = 0;
      });
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
      // pozíciók
      const pos = IRMap.worldToImage(this._ev.x, this._ev.y) || {};
      const cam = this._win.cameraRect();
      const scale = this._win.coverScale();

      // nullish helyett undefined-ellenőrzés
      const imgXval = pos.imgX !== undefined ? pos.imgX : 0;
      const imgYval = pos.imgY !== undefined ? pos.imgY : 0;
      const rx = imgXval - cam.x;
      const ry = imgYval - cam.y;

      const inside = rx >= 0 && ry >= 0 && rx <= cam.w && ry <= cam.h;
      this.visible = inside;
      if (!inside) return;

      this.x = Math.round(rx * scale);
      this.y = Math.round(ry * scale);
      this._icon.scale.set(this._baseScale * scale);

      this.__npcRefreshFrame(false);

      if (this._label) {
        const bm = this._label.bitmap;
        bm.clear();
        bm.drawText(nameText || "", 0, 0, bm.width, bm.height, "center");
        const sIcon = this._icon.scale.y;
        const labelH = bm.height;
        let yLocal = -this._bottomPad;
        const innerTop = this._win.y + this._win.padding;
        const innerBottom = innerTop + this._win.contentsHeight();
        const labelTopScreenY = innerTop + this.y + yLocal * sIcon;
        if (labelTopScreenY + labelH > innerBottom) {
          yLocal = -this._bottomPad - labelH;
        }
        this._label.scale.set(1 / sIcon);
        this._label.x = 0;
        this._label.y = yLocal;
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
  //  Overlay regisztráció (csak NPC/event)
  // ──────────────────────────────────────────────────────────────────
  IRMap.registerOverlay((scene, win) => {
    const cfg = scene.mapConfig && scene.mapConfig();
    if (!cfg) return;

    // Csak akkor hozzuk az "élő" eventeket, ha a megnyitott szerkesztő‑map = $gameMap
    let sameMap = false;
    try {
      const overlayId =
        IRMap.findMapIdByEditorName(cfg.editorMapName || "") || 0;
      sameMap = overlayId > 0 && $gameMap && $gameMap.mapId() === overlayId;
    } catch (e) {}

    // Maszk (ha még nincs)
    if (!win._poiMask) {
      const g = new PIXI.Graphics();
      g.beginFill(0xffffff);
      g.drawRect(0, 0, win.contentsWidth(), win.contentsHeight());
      g.endFill();
      win._markerLayer.addChildAt(g, 0);
      win._markerLayer.mask = g;
      win._poiMask = g;
    }

    scene._npcSprites = [];
    scene._npcActive = null;

    function rebuild() {
      // törlés
      (scene._npcSprites || []).forEach(
        (sp) => sp.parent && sp.parent.removeChild(sp)
      );
      scene._npcSprites = [];

      if (!sameMap || !$gameMap) return;

      // csak azok az eventek, ahol [IME] vagy <IME> jelen van
      const candidates = $gameMap
        .events()
        .map((ev) => ({ ev, info: imeTagInfo(ev) }))
        .filter((x) => x.info.present);

      for (const { ev, info } of candidates) {
        const meta = readPortraitMeta(ev);
        const displayName = (
          meta.name || (ev.event().name || "").replace(NAME_TAG, "").trim()
        ).trim();
        const sp = new NpcSprite(ev, scene, win, SHOW_LABEL && !info.noname);
        sp._poi = {
          name: displayName,
          desc: meta.desc || "",
          _evFace: meta.face || "",
        };
        win._markerLayer.addChild(sp);
        scene._npcSprites.push(sp);
      }
    }

    rebuild();

    const onTick = () => {
      // ha közben térkép váltás történt ugyanebben a Scene‑ben, építsük újra
      const cfgNow = scene.mapConfig && scene.mapConfig();
      const overlayIdNow =
        IRMap.findMapIdByEditorName((cfgNow && cfgNow.editorMapName) || "") ||
        0;
      const sameNow =
        overlayIdNow > 0 && $gameMap && $gameMap.mapId() === overlayIdNow;
      if (sameNow !== sameMap) {
        sameMap = sameNow;
        rebuild();
      }

      // layout frissítés
      for (const sp of scene._npcSprites) {
        sp.updateLayout(sp._poi.name);
      }
    };

    const onClose = ({ scene: sc }) => {
      if (sc !== scene) return;
      IRMap.off("update-tick", onTick);
      IRMap.off("scene-close", onClose);
      // takarítás
      (scene._npcSprites || []).forEach(
        (sp) => sp.parent && sp.parent.removeChild(sp)
      );
      scene._npcSprites = [];
      if (scene._npcImgWin) {
        scene.removeChild(scene._npcImgWin);
        scene._npcImgWin = null;
      }
      if (scene._npcTxtWin) {
        scene.removeChild(scene._npcTxtWin);
        scene._npcTxtWin = null;
      }
      scene._npcActive = null;
    };

    IRMap.on("update-tick", onTick);
    IRMap.on("scene-close", onClose);

    // kattintás – csak NPC sprite‑okra
    IRMap.on("update-tick", () => {
      if (!TouchInput.isTriggered()) return;
      const sx = TouchInput.x,
        sy = TouchInput.y;
      const spr = (scene._npcSprites || []).find((sp) => sp.hitTest(sx, sy));
      if (!spr) return;

      // régi UI zárás
      if (scene._npcImgWin) {
        scene.removeChild(scene._npcImgWin);
        scene._npcImgWin = null;
      }
      if (scene._npcTxtWin) {
        scene.removeChild(scene._npcTxtWin);
        scene._npcTxtWin = null;
      }

      const baseX = win.x + win.padding,
        baseY = win.y + win.padding;

      // portré kép – ha van FACEIMG
      if (spr._poi._evFace) {
        scene._npcImgWin = new NpcPortraitImg(spr._poi, baseX, baseY);
        scene.addChild(scene._npcImgWin);
      }
      // név + leírás – ha bármi megjeleníthető
      if (spr._poi.name || spr._poi.desc) {
        scene._npcTxtWin = new NpcPortraitText(
          spr._poi,
          baseX,
          baseY + (scene._npcImgWin ? IMG_H : 0)
        );
        scene.addChild(scene._npcTxtWin);
      }

      scene._npcActive = spr; // (ha később akarsz villogást, ide illeszthető)
    });
  });
})();

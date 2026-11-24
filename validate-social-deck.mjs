#!/usr/bin/env node
/*
 * validate-social-deck.mjs
 *
 *   node validate-social-deck.mjs <task-dir|index.html>
 *
 * Checks each <section class="poster …">, <section class="card …">, or <section class="board …">
 * in the target HTML against the rules codified in SKILL.md / DESIGN-xhs.md / DESIGN-web.md /
 * references/web-seo-images.md / qa-checklist.md / components.md.
 * Exits 1 if any FAIL.
 *
 * Rules implemented:
 *   R1  overflow              scrollHeight > clientHeight on the poster/card/board
 *   R2  footer collision      .foot / .airmail is position:absolute AND text extends into its band
 *   R3  swiss bold display    .h-xl / .h-hero / .h-statement / .num-mega with computed weight >= 600
 *   R4  min readable font     body/lead/caption/label/meta below the mobile-safe floor
 *   R5  4-band density        on 3:4 boards: <75% filled OR any under-filled band > 216px
 *   R6  h-xl hard cap         display title lines/chars exceed the per-board cap
 *   R7  figure margin drift    browser-default <figure> margin offsets media alignment
 *   R8  visual bounds          measured top/bottom blank space and visual overflow
 *   R9  title gap              display title touches the next content block
 *   R10 花体字作用域/族名      data-title-font 生效时花体字只许出现在封面级显示标题上，
 *                              且 font-family 必须写 CSS 族名而不是中文字体名
 *   R11 花体字伪粗体防糊      单字重花体字（如仓耳周珂正大榜书/千图笔锋手写体/得意黑）computedWeight >= 600 会触发伪粗体糊字
 *   R12 小红书封箱专属守卫    拦截已否决的「上图+下满宽贴边死白底列表」封面，并对可选组件 .tally（「正」字）给出启用核对提醒
 *   R13 封面右上角 UI 禁区    拦截落入小红书发现页右上角 230×210px 播放标/多图角标区的封面文字与标注（视频封面 FAIL / 图文 WARN）
 *   R14 封面反剧透/反硬广/过载 拦截封面左上企业硬广标 (.brand-pill)、3 栏剧透回执 (.floating-slip .slip-grid) 及字数过载
 *   R15 封面/外显标题双轨校验  检查封面主钩子与 data-feed-title 的文字重合率，避免双列卡片浪费一半点击面积
 *   R16 官网尺寸/Discover/字号 校验官网配图严格对齐 lib/image-ratios.ts 尺寸、Hero 宽 ≥1200px、手机 340px 字号底线与得意黑防伪粗体
 *   R17 官网 SEO 元数据守卫    校验 data-seo-filename (kebab-case 唯一)、data-seo-alt、data-seo-caption、data-target-keyword 与内图 alt
 *   R18 官网实拍占比与禁令     校验 Photo-First 影像占比、破图/空状态、禁用装饰性 Unicode Emoji、禁用黑条压截图反模式
 *   R19 官网反文字墙与口径     校验单图可见字数上限（长正文留给 HTML 索引）、占位符残留与绝对化违规表述
 *   R20 官网截图与隐私脱敏     校验 W02/W05 object-fit:contain 防边缘裁切，以及 W05 敏感证明的不可逆像素马赛克核验标记
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const MACOS_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
async function launchChromium(extraArgs = []) {
  try {
    return await chromium.launch({ args: extraArgs });
  } catch (err) {
    if (fs.existsSync(MACOS_CHROME)) {
      return await chromium.launch({ executablePath: MACOS_CHROME, args: extraArgs });
    }
    throw err;
  }
}

const args = process.argv.slice(2);
let target = null;
let styleOverride = null;
for (const a of args) {
  if (a.startsWith("--style=")) styleOverride = a.slice(8);
  else if (!target) target = a;
}
if (!target) {
  console.error("usage: node validate-social-deck.mjs <task-dir|index.html> [--style=swiss|editorial|xhs|web]");
  process.exit(2);
}
const abs = path.resolve(target);
let htmlPath = abs;
if (fs.statSync(abs).isDirectory()) {
  htmlPath = path.join(abs, "index.html");
}
if (!fs.existsSync(htmlPath)) {
  console.error(`not found: ${htmlPath}`);
  process.exit(2);
}

const url = "file://" + htmlPath;
const browser = await launchChromium([
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
]);
const ctx = await browser.newContext({
  viewport: { width: 1700, height: 2500 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const style = styleOverride || await page.evaluate(() => {
  const html = document.documentElement;
  if (
    html.dataset.system === "web" ||
    document.querySelector('section.board[data-recipe^="W"], section.board[data-seo-filename]')
  ) return "web";
  if (html.dataset.theme) return "editorial";
  if (html.dataset.accent) return "swiss";
  if (document.querySelector("section.card") && (html.dataset.brand || document.querySelector(".tape"))) return "xhs";
  if (document.querySelector("section.board")) return "greenbook";
  // Fallback: any display class using a serif family = editorial; otherwise swiss.
  // Note: "sans-serif" generic name also contains the substring "serif", so we
  // match on serif-only families by token, not substring.
  const SERIF_TOKENS = ["noto serif", "playfair", "source serif", "songti", "stsong", "simsun", "serif sc", "kinfolk", "merriweather"];
  for (const n of document.querySelectorAll(".h-display, .h-xl, .h-hero, .pullquote, .h-statement")) {
    const ff = getComputedStyle(n).fontFamily.toLowerCase();
    if (SERIF_TOKENS.some(t => ff.includes(t))) return "editorial";
  }
  return "swiss";
});

const sections = await page.$$("section.poster, section.card, section.board");
const report = [];
const webFilenameSeen = new Map();

const WEB_RATIOS = {
  wide:     { w: 1600, h: 900 },
  standard: { w: 1600, h: 1200 },
  square:   { w: 1200, h: 1200 },
  tall:     { w: 1200, h: 2400 },
  og:       { w: 1200, h: 630 },
};

// "Obviously too small" floors — below these, text becomes unreadable at phone size.
// Seeds use 26-28px body, 30-32px lead — those are fine. Anything 4+px below is suspect.
const MIN_FONT = {
  body: 22,
  lead: 26,
  caption: 18,
  meta: 18,
  cellTitle: 20,
  numAnnotation: 20,
};

const HXL_CAPS = {
  xhs:    { maxLines: 2, maxChars: 8 },
  square: { maxLines: 2, maxChars: 7 },
  wide:   { maxLines: 1, maxChars: 14 },
};

const DISPLAY_CLASSES = ["h-xl", "h-hero", "h-statement", "h-display", "num-mega", "num-xl"];

// R10 需要知道花体字库的族名。注册表缺失时 R10 自动降级为"只查作用域"。
const SKILL_ROOT = path.dirname(fileURLToPath(import.meta.url));
let FONT_LIB = null;
try {
  FONT_LIB = JSON.parse(fs.readFileSync(path.join(SKILL_ROOT, "assets", "font-library.json"), "utf8"));
} catch { /* 花体字库未安装 —— R10 仍会检查 data-title-font 的作用域 */ }
const LIB_FAMILIES = FONT_LIB ? FONT_LIB.fonts.map(f => f.family) : [];
const LIB_BY_ZH = FONT_LIB ? new Map(FONT_LIB.fonts.map(f => [f.zh, f])) : new Map();
// 封面级显示标题：花体字唯一被允许出现的位置
const CARVE_OUT_ALLOWED = new Set(["h-display", "h-hero", "h-statement", "f-alt"]);

function overflowFix(px) {
  const n = Math.round(px);
  if (n <= 40) {
    return `only ${n}px over: nudge content up or tighten one gap/padding by 20-40px; do not delete content`;
  }
  if (n <= 90) {
    return `${n}px over: compact local gaps/padding and reduce one block height; avoid cutting copy`;
  }
  if (n <= 160) {
    return `${n}px over: reduce a display title slightly or compress one paragraph before deleting content`;
  }
  return `${n}px over: switch to a higher-capacity recipe or remove/merge content intentionally`;
}

for (const s of sections) {
  const meta = await s.evaluate((el, isFirst) => {
    const r = el.getBoundingClientRect();
    const w = el.clientWidth, h = el.clientHeight;
    const outerW = Math.round(r.width), outerH = Math.round(r.height);
    const dataRatio = (el.dataset.ratio || "").toLowerCase();
    let board = dataRatio
              || (el.classList.contains("xhs") ? "xhs"
              : el.classList.contains("standard") ? "standard"
              : el.classList.contains("tall") ? "tall"
              : el.classList.contains("og") ? "og"
              : el.classList.contains("square") ? "square"
              : el.classList.contains("wide") ? "wide" : null);
    if (!board) {
      const ratio = outerW / outerH;
      if (Math.abs(ratio - 0.75) < 0.02) board = "xhs";        // 3:4
      else if (Math.abs(ratio - 1.0) < 0.02) board = "square"; // 1:1
      else if (Math.abs(ratio - 16 / 9) < 0.03) board = "wide";
      else if (Math.abs(ratio - 4 / 3) < 0.03) board = "standard";
      else if (Math.abs(ratio - 1200 / 630) < 0.03) board = "og";
      else if (Math.abs(ratio - 0.5) < 0.03) board = "tall";
      else if (Math.abs(ratio - 7 / 3) < 0.05) board = "wide"; // 21:9
      else board = "unknown";
    }
    const recipe = (el.dataset.recipe || "").toUpperCase();
    const role = (el.dataset.role || "").toLowerCase();
    const surface = (el.dataset.surface || "photo").toLowerCase();
    const feedTitle = (el.dataset.feedTitle || "").trim();
    const ctrMode = el.dataset.ctrMode === "true" || document.documentElement.dataset.ctrMode === "true";
    const isCover =
      role === "cover" ||
      /^C0[1-9]$/.test(recipe) ||
      recipe === "X01" ||
      el.id === "xhs-01" ||
      (isFirst && board === "xhs" && !/^X0[2-9]$/.test(recipe));
    return {
      id: el.id || "(no-id)",
      dataId: el.dataset.id || "",
      board,
      ratio: dataRatio || board,
      recipe,
      surface,
      feedTitle,
      ctrMode,
      isCover,
      seoRole: (el.dataset.seoRole || "").toLowerCase(),
      seoFilename: (el.dataset.seoFilename || "").trim(),
      seoAlt: (el.dataset.seoAlt || "").trim(),
      seoCaption: (el.dataset.seoCaption || "").trim(),
      targetKeyword: (el.dataset.targetKeyword || "").trim(),
      schemaType: (el.dataset.schemaType || "").trim(),
      loading: (el.dataset.loading || "").toLowerCase(),
      privacy: (el.dataset.privacy || "").toLowerCase(),
      mosaicVerified: el.dataset.mosaicVerified === "true",
      isPlaceholder: el.dataset.placeholder === "true",
      clientH: h,
      scrollH: el.scrollHeight,
      clientW: w,
      outerW,
      outerH,
    };
  }, report.length === 0);
  const fails = [];
  const warns = [];

  // R1 overflow
  const overflow = meta.scrollH - meta.clientH;
  if (overflow > 4) {
    fails.push({ rule: "R1", msg: `overflow ${overflow}px (scrollH ${meta.scrollH} > clientH ${meta.clientH})`, fix: overflowFix(overflow) });
  }

  // R8 visual bounds — measures the true rendered content extent, not just scrollHeight.
  const visualBounds = await s.evaluate(el => {
    const er = el.getBoundingClientRect();
    const H = Math.round(er.height);
    const W = Math.round(er.width);
    const posterArea = H * W;
    const TRANSPARENT = /rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\s*\)|transparent/;
    const hasDirectText = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
      }
      return false;
    };
    const cssColorVisible = c => c && !TRANSPARENT.test(c);
    const meaningful = [];
    for (const n of el.querySelectorAll("*")) {
      if (n.closest("script, style")) continue;
      const tag = n.tagName;
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;
      if (n === el || n.classList.contains("content")) continue;
      if (cs.position === "absolute" && r.width * r.height >= posterArea * 0.85) continue;

      const isText = hasDirectText(n);
      const isMedia = tag === "IMG" || tag === "CANVAS" || tag === "SVG";
      const isRule = tag === "HR" || (r.height <= 4 && (
        parseFloat(cs.borderTopWidth) >= 1 ||
        parseFloat(cs.borderBottomWidth) >= 1 ||
        cssColorVisible(cs.backgroundColor)
      ));
      const beforeBg = getComputedStyle(n, "::before").backgroundColor;
      const hasBoxFill = (cssColorVisible(cs.backgroundColor) || cssColorVisible(beforeBg)) &&
        r.width * r.height >= 1600 &&
        !["MAIN", "SECTION"].includes(tag);
      const hasBorderBox = (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) +
        parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)) >= 1 &&
        r.width * r.height >= 1600;
      if (!isText && !isMedia && !isRule && !hasBoxFill && !hasBorderBox) continue;
      meaningful.push({
        top: r.top - er.top,
        bottom: r.bottom - er.top,
        left: r.left - er.left,
        right: r.right - er.left,
        cls: n.className ? "." + String(n.className).split(" ").filter(Boolean).join(".") : tag.toLowerCase(),
        text: n.textContent.trim().replace(/\s+/g, " ").slice(0, 32),
      });
    }
    if (meaningful.length === 0) return null;
    let top = Infinity, bottom = -Infinity;
    let topNode = null, bottomNode = null;
    for (const item of meaningful) {
      if (item.top < top) {
        top = item.top;
        topNode = item;
      }
      if (item.bottom > bottom) {
        bottom = item.bottom;
        bottomNode = item;
      }
    }
    return {
      top: Math.round(top),
      bottom: Math.round(bottom),
      activeHeight: Math.round(bottom - top),
      activeRatio: (bottom - top) / H,
      topGap: Math.max(0, Math.round(top)),
      bottomGap: Math.max(0, Math.round(H - bottom)),
      topOverflow: Math.max(0, Math.round(-top)),
      bottomOverflow: Math.max(0, Math.round(bottom - H)),
      topNode,
      bottomNode,
      count: meaningful.length,
    };
  });
  if (visualBounds) {
    if (visualBounds.bottomOverflow > 4) {
      fails.push({
        rule: "R8",
        msg: `visual bottom overflow ${visualBounds.bottomOverflow}px (lowest: ${visualBounds.bottomNode.cls}${visualBounds.bottomNode.text ? ` "${visualBounds.bottomNode.text}"` : ""})`,
        fix: overflowFix(visualBounds.bottomOverflow),
      });
    }
    if (visualBounds.topOverflow > 4) {
      fails.push({
        rule: "R8",
        msg: `visual top overflow ${visualBounds.topOverflow}px (highest: ${visualBounds.topNode.cls}${visualBounds.topNode.text ? ` "${visualBounds.topNode.text}"` : ""})`,
        fix: "move the content group down by the measured overflow plus 16-24px",
      });
    }
    const bottomGapLimit = meta.board === "wide" ? 130 : meta.board === "square" ? 160 : 190;
    if (visualBounds.bottomGap > bottomGapLimit && visualBounds.activeRatio < 0.78) {
      warns.push({
        rule: "R8",
        msg: `bottom whitespace ${visualBounds.bottomGap}px; active content height ${Math.round(visualBounds.activeRatio * 100)}%`,
        fix: "use the measured blank space to expand the last block or move the content down slightly; avoid over-tightening after an overflow fix",
      });
    }
  }

  // R2 footer collision — only flag leaf text or media nodes, not containers
  // whose bbox merely shares y-space with an absolute-positioned strip.
  const footIssue = await s.evaluate(el => {
    const foot = el.querySelector(".foot, .issue-strip, .magazine-foot, .airmail:not(.top), .airmail-edge.bottom, .airmail-edge.bot");
    if (!foot) return null;
    const cs = getComputedStyle(foot);
    if (cs.position !== "absolute") return null;
    const isAirmail = foot.matches(".airmail, .airmail-edge");
    const footTop = foot.offsetTop;
    const er = el.getBoundingClientRect();
    const hasOwnText = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
      }
      return false;
    };
    const isMedia = n => n.tagName === "IMG" || n.tagName === "CANVAS" || n.tagName === "SVG" || n.tagName === "FIGURE";
    let worstOverlap = 0;
    let worstSel = "";
    const posterArea = el.clientWidth * el.clientHeight;
    for (const node of el.querySelectorAll("*")) {
      if (node === foot || foot.contains(node)) continue;
      // On XHS cards, full-bleed background photos/wells intentionally run behind the 12px .airmail edge;
      // only check leaf text nodes against .airmail so text never collides with the bottom trim.
      if (isAirmail ? !hasOwnText(node) : (!hasOwnText(node) && !isMedia(node))) continue;
      const r = node.getBoundingClientRect();
      // Skip full-bleed background layers (>=95% of poster area + position:absolute).
      const ncs = getComputedStyle(node);
      if (ncs.position === "absolute" && r.width * r.height >= posterArea * 0.95) continue;
      const bottom = r.bottom - er.top;
      if (bottom > footTop + 2) {
        const overlap = bottom - footTop;
        if (overlap > worstOverlap) {
          worstOverlap = overlap;
          worstSel = node.className ? "." + String(node.className).split(" ").filter(Boolean).join(".") : node.tagName.toLowerCase();
        }
      }
    }
    return worstOverlap > 4 ? { overlap: Math.round(worstOverlap), sel: worstSel, footTop, isAirmail } : null;
  });
  if (footIssue) {
    fails.push({
      rule: "R2",
      msg: footIssue.isAirmail
        ? `${footIssue.sel} extends ${footIssue.overlap}px into bottom .airmail edge`
        : `.foot is position:absolute, ${footIssue.sel} extends ${footIssue.overlap}px past foot top`,
      fix: footIssue.isAirmail
        ? "increase bottom padding above .airmail (at least 36-48px) or compact vertical gaps"
        : "switch .foot to flex margin-top:auto (see style-system.md Anti-pattern C)",
    });
  }

  // R3 swiss bold display (exempt on high-CTR covers when data-ctr-mode="true")
  if (style === "swiss" && !(meta.isCover && meta.ctrMode)) {
    const bolds = await s.evaluate((el, cls) => {
      const out = [];
      for (const c of cls) {
        for (const n of el.querySelectorAll("." + c)) {
          const cs = getComputedStyle(n);
          const w = parseInt(cs.fontWeight, 10);
          const size = parseFloat(cs.fontSize);
          if (size >= 72 && w >= 600) {
            out.push({ cls: c, weight: w, size: Math.round(size), text: n.textContent.trim().slice(0, 20) });
          }
        }
      }
      return out;
    }, DISPLAY_CLASSES);
    for (const b of bolds) {
      fails.push({ rule: "R3", msg: `.${b.cls} "${b.text}" is ${b.size}px @ weight ${b.weight} — Swiss "larger = lighter" hard rule`, fix: "remove inline font-weight; use the typed class default (200-300)" });
    }
  }

  // R4 min readable font
  const textChecks = await s.evaluate((el, MIN) => {
    const out = [];
    const seen = new Set();
    const test = (selector, role, min, requireLeaf = true) => {
      for (const n of el.querySelectorAll(selector)) {
        if (seen.has(n)) continue;
        seen.add(n);
        // Skip containers — typography roles only apply to leaf text nodes.
        // A real `.lead` is a <p>; `.role-card.lead` is a container with children.
        if (requireLeaf && n.children.length > 0) continue;
        // Skip decorative chips inside map pins — labels are sized to fit on the map by design.
        if (n.closest(".map-pin .card")) continue;
        const cs = getComputedStyle(n);
        const size = parseFloat(cs.fontSize);
        const text = n.textContent.trim();
        if (!text) continue;
        if (size > 0 && size < min) {
          out.push({ role, selector, min, size: Math.round(size), text: text.slice(0, 30) });
        }
      }
    };
    test(".body, p.body, .why, .spec-desc", "body", MIN.body);
    test(".lead, .slip-title, .act, .act-main", "lead", MIN.lead);
    test(".kicker, .cap, .caption, .swiss-img-caption, .h-sub, .route-col .tip, .slip-item .sub", "caption", MIN.caption);
    test(".meta, .label, .mono, .mono-label, .spec-label, .pending", "meta", MIN.meta);
    test(".matrix-fill .cell-title, .brief-card .title, .char-grid .name, .route-col .way, .slip-item .main", "cellTitle", MIN.cellTitle);
    test(".stat-card .lbl, .ledger .sub, .num .sub", "numAnnotation", MIN.numAnnotation);
    return out;
  }, MIN_FONT);
  for (const t of textChecks) {
    warns.push({ rule: "R4", msg: `${t.role} "${t.text}" at ${t.size}px < ${t.min}px floor`, fix: "cut copy instead of shrinking type (components.md Minimum Readable Sizes)" });
  }

  // R7 figure margin drift — catches browser-default 40px figure margins on custom media blocks.
  const figureDrift = await s.evaluate(el => {
    const out = [];
    for (const fig of el.querySelectorAll("figure")) {
      const cs = getComputedStyle(fig);
      const ml = parseFloat(cs.marginLeft) || 0;
      const mr = parseFloat(cs.marginRight) || 0;
      if (ml >= 16 || mr >= 16) {
        const text = fig.textContent.trim().replace(/\s+/g, " ").slice(0, 32);
        out.push({
          cls: fig.className ? "." + fig.className.split(" ").filter(Boolean).join(".") : "figure",
          ml: Math.round(ml),
          mr: Math.round(mr),
          text,
        });
      }
    }
    return out;
  });
  for (const f of figureDrift) {
    warns.push({ rule: "R7", msg: `${f.cls} has horizontal figure margin ${f.ml}px / ${f.mr}px${f.text ? ` near "${f.text}"` : ""}`, fix: "reset figure margins in the seed or task CSS: .poster figure { margin: 0; }" });
  }

  // R5 4-band density (3:4 inner pages only; covers are exempt to protect 3-Element Rule & single visual focus)
  if (meta.board === "xhs" && !meta.isCover) {
    const bands = await s.evaluate(el => {
      const er = el.getBoundingClientRect();
      const H = el.clientHeight;
      // Pixel-row occupancy bitmap. Mark any row covered by a content element.
      const rows = new Uint8Array(H);
      const hasDirectText = n => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
        }
        return false;
      };
      for (const n of el.querySelectorAll("*")) {
        const r = n.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        const tag = n.tagName;
        const cs = getComputedStyle(n);
        const isText = hasDirectText(n);
        const isImg = tag === "IMG" || tag === "CANVAS" || tag === "SVG"
                    || (cs.backgroundImage && cs.backgroundImage !== "none");
        const isRule = tag === "HR" || (parseFloat(cs.borderTopWidth) >= 1 && r.height < 4);
        const beforeBg = getComputedStyle(n, "::before").backgroundColor;
        const isVisColor = c => c && !c.match(/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\s*\)/) && c !== "transparent";
        const hasFill = isVisColor(cs.backgroundColor) || isVisColor(beforeBg);
        if (!isText && !isImg && !isRule && !hasFill) continue;
        const top = Math.max(0, Math.floor(r.top - er.top));
        const bot = Math.min(H, Math.ceil(r.bottom - er.top));
        for (let y = top; y < bot; y++) rows[y] = 1;
      }
      const BAND = H / 4;
      const occ = [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) {
        let count = 0;
        const bTop = Math.floor(i * BAND), bBot = Math.floor((i + 1) * BAND);
        for (let y = bTop; y < bBot; y++) count += rows[y];
        occ[i] = count / (bBot - bTop);
      }
      return { H, BAND, occ };
    });
    const total = bands.occ.reduce((a, b) => a + b, 0) / 4;
    const pct = (o) => Math.round(o * 100) + "%";
    if (total < 0.745) {
      warns.push({ rule: "R5", msg: `density ${pct(total)} (bands ${bands.occ.map(pct).join(" / ")})`, fix: "expand copy or switch recipe — see qa-checklist.md 4-band density" });
    }
    for (let i = 0; i < 3; i++) {
      if (bands.occ[i] < 0.15 && bands.occ[i + 1] < 0.15) {
        warns.push({ rule: "R5", msg: `bands ${i + 1}+${i + 2} both under-filled (${pct(bands.occ[i])} / ${pct(bands.occ[i + 1])}) — >25% void mid-poster`, fix: "expand body content or insert a marginalia column" });
        break;
      }
    }
  }

  // R6 h-xl hard cap
  const cap = HXL_CAPS[meta.board];
  if (cap) {
    const titles = await s.evaluate(el => {
      const out = [];
      for (const n of el.querySelectorAll(".h-xl, .h-hero, .h-display, .h-statement")) {
        const cs = getComputedStyle(n);
        const size = parseFloat(cs.fontSize);
        const lineH = parseFloat(cs.lineHeight) || size * 1.2;
        const lines = Math.round(n.getBoundingClientRect().height / lineH);
        out.push({ cls: n.className.split(" ")[0], text: n.textContent.trim(), lines, size: Math.round(size) });
      }
      return out;
    });
    for (const t of titles) {
      const longestLine = t.text.split(/\s+/).reduce((m, w) => Math.max(m, w.length), t.text.length);
      if (t.lines > cap.maxLines) {
        warns.push({ rule: "R6", msg: `.${t.cls} "${t.text}" renders ${t.lines} lines (cap ${cap.maxLines} on ${meta.board})`, fix: "switch to S01/S05 cover recipes that allow taller titles, or trim copy" });
      } else if (longestLine > cap.maxChars + 2) {
        // soft warn only — wraps naturally
      }
    }
  }

  // R9 title gap — catches headings visually touching the next content block.
  const titleGaps = await s.evaluate((el, board) => {
    const er = el.getBoundingClientRect();
    const TRANSPARENT = /rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\s*\)|transparent/;
    const hasDirectText = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
      }
      return false;
    };
    const colorVisible = c => c && !TRANSPARENT.test(c);
    const isMeaningful = n => {
      const tag = n.tagName;
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) return false;
      if (n === el || n.classList.contains("content")) return false;
      if (hasDirectText(n)) return true;
      if (tag === "IMG" || tag === "CANVAS" || tag === "SVG" || tag === "HR") return true;
      if (colorVisible(cs.backgroundColor) && r.width * r.height >= 1600 && !["MAIN", "SECTION"].includes(tag)) return true;
      const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) +
        parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      return border >= 1 && r.width * r.height >= 1600;
    };
    const label = n => {
      const cls = n.className ? "." + String(n.className).split(" ").filter(Boolean).join(".") : n.tagName.toLowerCase();
      const text = n.textContent.trim().replace(/\s+/g, " ").slice(0, 30);
      return text ? `${cls} "${text}"` : cls;
    };
    const nodes = Array.from(el.querySelectorAll("*")).filter(isMeaningful);
    const titles = Array.from(el.querySelectorAll(".h-xl, .h-hero, .h-display, .h-statement, .h-md, .row-title, .step-title"));
    const out = [];
    for (const title of titles) {
      if (!title.textContent.trim()) continue;
      const tr = title.getBoundingClientRect();
      const isLocal = title.matches(".h-md, .row-title, .step-title");
      const minGap = isLocal ? 16 : board === "wide" ? 24 : 28;
      let nearest = null;
      let nearestGap = Infinity;
      for (const node of nodes) {
        if (node === title || title.contains(node) || node.contains(title)) continue;
        const nr = node.getBoundingClientRect();
        const gap = nr.top - tr.bottom;
        if (gap < -2) continue;
        const overlap = Math.max(0, Math.min(tr.right, nr.right) - Math.max(tr.left, nr.left));
        const overlapRatio = overlap / Math.min(tr.width, nr.width);
        if (overlapRatio < 0.12 && gap < 96) continue;
        if (gap < nearestGap) {
          nearestGap = gap;
          nearest = node;
        }
      }
      if (nearest && nearestGap < minGap) {
        out.push({
          title: label(title),
          next: label(nearest),
          gap: Math.round(nearestGap),
          minGap,
        });
      }
    }
    return out;
  }, meta.board);
  for (const g of titleGaps) {
    warns.push({
      rule: "R9",
      msg: `${g.title} has ${g.gap}px gap before ${g.next} (min ${g.minGap}px)`,
      fix: "add/restore measured spacing under the title before reducing copy or resizing the whole layout",
    });
  }

  // R12 小红书「封箱」专属守卫（可选组件 .tally 提醒 + 否决的满宽平切白底封面拦截）
  if (style === "xhs") {
    const xhsCheck = await s.evaluate((el, isCoverFlag) => {
      const er = el.getBoundingClientRect();
      const tallies = [...el.querySelectorAll(".tally")].filter(t => {
        const r = t.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(t).display !== "none" && getComputedStyle(t).visibility !== "hidden";
      });
      let vetoedFlatCover = false;
      const isCover = isCoverFlag;
      const isManifest = el.classList.contains("manifest") || el.dataset.recipe === "X03";
      const hasSeamTape = Boolean(el.querySelector(".seam-tape, .seam-tape-wrap")) || el.dataset.recipe === "X02";
      if (isCover && !isManifest && !hasSeamTape) {
        for (const n of el.children) {
          if (n.matches(".photo-well, .bg-vignette, .cover-scrim, .compare-stage, .vs-chip, .callout-flag, .airmail, .airmail-edge, .cover-shell, .c03-shell, .c05-shell, .hero-tape, .tape, .sticker, svg")) continue;
          const cs = getComputedStyle(n);
          const bg = cs.backgroundColor;
          const isOpaqueLight = bg && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\s*\)|transparent/.test(bg);
          const hasPerf = (cs.maskImage && cs.maskImage !== "none") || (cs.webkitMaskImage && cs.webkitMaskImage !== "none") || n.classList.contains("perf");
          const r = n.getBoundingClientRect();
          if (isOpaqueLight && !hasPerf && r.width >= el.clientWidth - 24 && (r.bottom - er.top) >= el.clientHeight - 24 && r.height >= 300 && r.height <= 760) {
            vetoedFlatCover = true;
            break;
          }
        }
      }
      return { hasTally: tallies.length > 0, vetoedFlatCover };
    }, meta.isCover);

    if (xhsCheck.hasTally) {
      warns.push({
        rule: "R12",
        msg: `检测到「正」字计数 (.tally) —— 该组件默认禁用，仅在用户明确要求写「数坑帖 / N个容易出错的点」时允许启用`,
        fix: "若非用户点名的数坑帖，请移除 .tally 标签块（见 DESIGN-xhs.md）",
      });
    }
    if (xhsCheck.vetoedFlatCover) {
      fails.push({
        rule: "R12",
        msg: `封面出现「上图 + 下满宽贴边平切白底块」（已否决的 SaaS/PPT 割裂列表风）`,
        fix: "封面请改用 X01 / C02 / C03 / C04 / C05 高 CTR 封面原型（见 DESIGN-xhs.md 与 references/xhs-cover-ctr.md）",
      });
    }
  }

  // R13–R15 小红书 3:4 封面首页 CTR 专项守卫（右上角 UI 禁区 / 反剧透反硬广字数过载 / 外显标题双轨不重复）
  if (meta.board === "xhs" && meta.isCover) {
    const ctr = await s.evaluate((el, recipe) => {
      const er = el.getBoundingClientRect();
      const DEAD_LEFT = 850; // 右上角 230×210px 播放标 / 多图角标禁区 (1080 - 230 = 850)
      const DEAD_BOTTOM = 210;
      const isVisible = n => {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) <= 0.05) return false;
        const r = n.getBoundingClientRect();
        return r.width > 4 && r.height > 4;
      };
      const hasOwnText = n => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
        }
        return false;
      };
      const stripPunct = s => s.replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "");

      // R13: 检查右上角 UI 禁区碰撞（对文字节点使用 Range 精确测真实字形外框，避免左对齐宽 <p> 误报）
      const deadZoneHits = [];
      const checkBox = (rect, sel, text) => {
        const left = rect.left - er.left;
        const right = rect.right - er.left;
        const top = rect.top - er.top;
        const bottom = rect.bottom - er.top;
        const ox = Math.min(right, er.width) - Math.max(left, DEAD_LEFT);
        const oy = Math.min(bottom, DEAD_BOTTOM) - Math.max(top, 0);
        if (ox >= 12 && oy >= 12) {
          deadZoneHits.push({ sel, text: text.slice(0, 20), x: Math.round(right), y: Math.round(top) });
        }
      };
      for (const n of el.querySelectorAll("*")) {
        if (n.closest(".well-note, .tape-print, .seam-note")) continue;
        if (!isVisible(n)) continue;
        const sel = n.className ? "." + String(n.className).split(" ").filter(Boolean).join(".") : n.tagName.toLowerCase();
        if (n.matches(".ring, .callout-flag, .tally, .target-pill, .compare-badge")) {
          checkBox(n.getBoundingClientRect(), sel, n.textContent.trim().replace(/\s+/g, " "));
          continue;
        }
        if (hasOwnText(n)) {
          for (const c of n.childNodes) {
            if (c.nodeType !== 3 || !c.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(c);
            for (const r of range.getClientRects()) {
              if (r.width > 4 && r.height > 4) checkBox(r, sel, c.textContent.trim().replace(/\s+/g, " "));
            }
          }
        }
      }

      // R14: 封面反硬广标 / 反 3 栏剧透 / 字数过载
      const hasBrandPill = [...el.querySelectorAll(".brand-pill")].some(isVisible);
      const hasSpoilerGrid = [...el.querySelectorAll(".floating-slip .slip-grid")].some(isVisible);

      let totalChars = 0;
      for (const n of el.querySelectorAll("*")) {
        if (n.closest(".well-note, .tape-print, .seam-note, .peek-row.tease, .peek-row.tease-deep")) continue;
        if (!isVisible(n) || !hasOwnText(n)) continue;
        for (const c of n.childNodes) {
          if (c.nodeType === 3) totalChars += stripPunct(c.textContent).length;
        }
      }

      const mainHeadNodes = [...el.querySelectorAll("h1, .tape-title, .ctr-title, .h-display, .h-hero")].filter(isVisible);
      const headlineRaw = mainHeadNodes.map(n => n.textContent.trim()).join(" ");
      const headlineChars = stripPunct(headlineRaw).length;

      const hookParts = [...el.querySelectorAll("h1, .tape-title, .ctr-title, .x01-setup, .ctr-kicker, .h-display, .h-hero")]
        .filter(isVisible)
        .map(n => n.textContent.trim())
        .join(" ");

      return {
        deadZoneHits: deadZoneHits.slice(0, 3),
        hasBrandPill,
        hasSpoilerGrid,
        totalChars,
        headlineRaw: headlineRaw.replace(/\s+/g, " ").slice(0, 32),
        headlineChars,
        hookParts,
        recipe,
      };
    }, meta.recipe);

    // R13 verdict
    for (const hit of ctr.deadZoneHits) {
      const item = {
        rule: "R13",
        msg: `${hit.sel}${hit.text ? ` "${hit.text}"` : ""} 闯入小红书右上角 UI 禁区（x≥850, y≤210；发现页播放标/多图角标遮挡位）`,
        fix: "将标题、角标或红圈左移至 x<850 或下移至 y>210 安全带（见 references/xhs-cover-ctr.md）",
      };
      if (meta.surface === "video") fails.push(item);
      else warns.push(item);
    }

    // R14 verdict
    if (ctr.hasBrandPill) {
      fails.push({
        rule: "R14",
        msg: `封面出现企业名硬广签 (.brand-pill) —— 蓝V硬标放封面左上角会在 0.3 秒触发广告防御，拉低首页点击率`,
        fix: "封面左上改用 .target-pill 纯用户靶子签（≤6字），品牌名留在图 2–N 内页与尾页",
      });
    }
    if (ctr.hasSpoilerGrid) {
      fails.push({
        rule: "R14",
        msg: `封面出现 3 栏答案剧透回执 (.floating-slip .slip-grid) —— 提前闭环答案会杀死好奇心缺口`,
        fix: "删除封面 3 栏答案，改用单行悬念条 (.hook-bar)，把 3 步答案放到图 2 (X02)",
      });
    }
    const strictCtrCover = style === "xhs" || meta.ctrMode || meta.surface === "video";
    if (ctr.headlineChars > 18) {
      const targetList = strictCtrCover ? fails : warns;
      targetList.push({
        rule: "R14",
        msg: `封面主标题 "${ctr.headlineRaw}" 达 ${ctr.headlineChars} 字（硬上限 18 字），180pt 双列缩略图无法 0.5 秒扫读`,
        fix: "压缩主钩子至 6–10 字，把场景补充挪到外显标题 data-feed-title",
      });
    } else if (ctr.headlineChars > 12) {
      warns.push({
        rule: "R14",
        msg: `封面主标题 "${ctr.headlineRaw}" 有 ${ctr.headlineChars} 字（建议 6–10 字以内以最大化 180pt 冲击力）`,
        fix: "精简修饰词，只留核心冲突 + 2–4 字撞色爆点",
      });
    }
    const maxWarn = meta.recipe === "C05" ? 78 : meta.recipe === "C02" ? 48 : 38;
    const maxFail = meta.recipe === "C05" ? 110 : meta.recipe === "C02" ? 68 : 56;
    if (ctr.totalChars > maxFail) {
      const targetList = strictCtrCover ? fails : warns;
      targetList.push({
        rule: "R14",
        msg: `封面可见总字数达 ${ctr.totalChars} 字（${meta.recipe || "COVER"} 上限 ${maxFail} 字），信息过载易拉低双列点击率`,
        fix: "遵循 3-Element Rule：只保留 1 主体 + 1 句核心大字 + 最多 1 条短悬念签，其余放进内页",
      });
    } else if (ctr.totalChars > maxWarn) {
      warns.push({
        rule: "R14",
        msg: `封面可见总字数 ${ctr.totalChars} 字（建议 ≤${maxWarn} 字），双列缩略图易显拥挤`,
        fix: "删减次要解释字句，让主体和爆点大字呼吸",
      });
    }

    // R15 verdict: 封面钩子 vs 外显标题双轨不重复检查
    if (!meta.feedTitle) {
      if (style === "xhs") {
        warns.push({
          rule: "R15",
          msg: `封面未声明配套外显标题 (data-feed-title) —— 易导致发布时直接照抄封面字，浪费一半点击面积`,
          fix: `在封面 <section> 添加互补的 data-feed-title="..."（封面抛冲突/反差，标题补搜索词/具体利益）`,
        });
      }
    } else {
      const norm = s => s.replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "").toLowerCase();
      const a = norm(ctr.hookParts);
      const b = norm(meta.feedTitle);
      const aUniq = [...new Set(a)];
      const bSet = new Set(b);
      const charOverlap = aUniq.length ? aUniq.filter(ch => bSet.has(ch)).length / aUniq.length : 0;
      const bigrams = s => {
        const set = new Set();
        for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
        return set;
      };
      const bgA = bigrams(a);
      const bgB = bigrams(b);
      let bgHit = 0;
      for (const g of bgA) if (bgB.has(g)) bgHit += 1;
      const bgOverlap = bgA.size ? bgHit / bgA.size : 0;
      if (charOverlap >= 0.55 || bgOverlap >= 0.40) {
        warns.push({
          rule: "R15",
          msg: `封面主字与外显标题重合过高（单字 ${Math.round(charOverlap * 100)}% / 词组 ${Math.round(bgOverlap * 100)}%）："${ctr.headlineRaw}" vs "${meta.feedTitle.slice(0, 26)}"`,
          fix: "改写为双轨互补：封面负责冲突/痛点/数字反差，外显标题负责场景关键词与方法承诺（目标重合 <35%）",
        });
      }
    }
  }

  // R16–R20 官网配图 SEO 专项守卫（尺寸比例与Discover / SEO元数据 / Photo-First与禁令 / 反文字墙与口径 / 截图防裁切与隐私脱敏）
  if (style === "web") {
    // R16: lib/image-ratios.ts 严格像素绑定 + Google Discover >= 1200px + 手机 340px 字号底线 + 得意黑单字重防糊
    const expected = WEB_RATIOS[meta.ratio];
    if (!expected) {
      fails.push({
        rule: "R16",
        msg: `未识别的官网配图比例 data-ratio="${meta.ratio}"（允许值：wide / standard / square / tall / og）`,
        fix: "在 <section class='board ...'> 上声明合法的 lib/image-ratios.ts 比例类与 data-ratio 属性（见 DESIGN-web.md）",
      });
    } else if (Math.abs(meta.outerW - expected.w) > 2 || Math.abs(meta.outerH - expected.h) > 2) {
      fails.push({
        rule: "R16",
        msg: `尺寸 ${meta.outerW}×${meta.outerH} 与 data-ratio="${meta.ratio}" 要求的 ${expected.w}×${expected.h} 不符（会导致官网 CLS 比例漂移）`,
        fix: `恢复 .board.${meta.ratio} 的固定像素尺寸为 ${expected.w}×${expected.h}（严格绑定 lib/image-ratios.ts）`,
      });
    }
    if ((meta.recipe === "W01" || meta.seoRole === "hero") && meta.outerW < 1200) {
      fails.push({
        rule: "R16",
        msg: `文章主封面 (${meta.recipe || "hero"}) 宽仅 ${meta.outerW}px，低于 Google Discover 硬门槛 1200px`,
        fix: "主封面默认采用 wide (1600×900) 以满足 Google Discover 大图展示与首屏清晰度",
      });
    }

    const webDom = await s.evaluate((el, recipe) => {
      const er = el.getBoundingClientRect();
      const isVisible = n => {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) <= 0.05) return false;
        const r = n.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      };
      const hasOwnText = n => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
        }
        return false;
      };

      // R16: 手机 340px 可读字号与得意黑防伪粗体
      const smallFonts = [];
      const smileyFauxBold = [];
      const checkMin = (selector, minPx, role) => {
        for (const n of el.querySelectorAll(selector)) {
          if (!isVisible(n) || !n.textContent.trim()) continue;
          const sz = parseFloat(getComputedStyle(n).fontSize);
          if (sz > 0 && sz < minPx) {
            smallFonts.push({ role, size: Math.round(sz), minPx, text: n.textContent.trim().slice(0, 24) });
          }
        }
      };
      checkMin(".header-title, .w01-heading, .w06-heading", 36, "display");
      checkMin(".split-tag .title, .w02-pill, .tri-title, .formula-eq", 19, "cardTitle");
      checkMin(".w01-bullet-item, .split-label-bar, .tri-footer-note, .w04-proof-cap, .w04-verdict-bar, .formula-note, .w06-sub, .route-table td", 17, "body");
      checkMin(".web-footer, .meta-badge, .brand-capsule", 14, "meta");

      for (const n of el.querySelectorAll("*")) {
        if (!isVisible(n) || !hasOwnText(n)) continue;
        const cs = getComputedStyle(n);
        const firstFam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase();
        if (firstFam.includes("smiley sans")) {
          const w = parseInt(cs.fontWeight, 10) || 400;
          if (w >= 600) {
            smileyFauxBold.push({
              sel: n.className ? "." + String(n.className).split(" ").filter(Boolean).join(".") : n.tagName.toLowerCase(),
              weight: w,
              text: n.textContent.trim().slice(0, 20),
            });
          }
        }
      }

      // R17: 内部 img alt 检查
      const missingImgAlts = [];
      const brokenImgs = [];
      for (const img of el.querySelectorAll("img")) {
        if (!isVisible(img)) continue;
        const alt = (img.getAttribute("alt") || "").trim();
        if (!alt || /^(image|photo|img|pic|placeholder|图片|配图)$/i.test(alt)) {
          missingImgAlts.push(img.getAttribute("src") || "(inline img)");
        }
        if (img.complete && img.naturalWidth === 0) {
          brokenImgs.push(img.getAttribute("src") || "(unknown src)");
        }
      }
      const emptySlots = [...el.querySelectorAll(".photo-slot.is-empty")].filter(isVisible).length;

      // R18: Photo-First 实拍影像面积占比 + 装饰性 Emoji + 黑条横压截图中心检查
      const stageNode = el.querySelector(".web-canvas, .w06-shell") || el;
      const stageRect = stageNode.getBoundingClientRect();
      const stageArea = Math.max(1, stageRect.width * stageRect.height);
      const mediaFrames = [...el.querySelectorAll(".photo-slot, .w01-photo-frame, .w02-screenshot-frame, .split-photo-frame, .w04-proof-photo, .tri-photo-frame, .w06-photo, .tall-photo-frame")]
        .filter(isVisible);
      const uniqueFrames = [...new Set(mediaFrames)];
      let mediaArea = 0;
      for (const f of uniqueFrames) {
        const r = f.getBoundingClientRect();
        mediaArea += r.width * r.height;
      }
      const mediaRatio = Math.min(1, mediaArea / stageArea);

      // 装饰性 Emoji 扫描（允许单色几何符号 ✓ ✕ △ → ·）
      const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u26A0\u26A1\u2705\u274C\u274E\u2757\u2753\u2B50\u23F0\u23F3]/gu;
      const rawVisibleTexts = [];
      for (const n of el.querySelectorAll("*")) {
        if (n.closest("script, style")) continue;
        if (!isVisible(n) || !hasOwnText(n)) continue;
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) rawVisibleTexts.push(c.textContent.trim());
        }
      }
      const allVisibleText = rawVisibleTexts.join(" ");
      const emojiHits = [...new Set(allVisibleText.match(EMOJI_RE) || [])];

      // 拦截深色半透明条横压在截图/实拍中心（放行 .pin-tag 与 .mosaic-layer）
      const centerOverlays = [];
      for (const frame of uniqueFrames) {
        const fr = frame.getBoundingClientRect();
        const midTop = fr.top + fr.height * 0.25;
        const midBot = fr.top + fr.height * 0.75;
        for (const n of frame.querySelectorAll("*")) {
          if (n.matches("img, .pin-box, .pin-tag, .mosaic-layer, .empty-tag, .empty-hint") || n.closest(".is-empty")) continue;
          if (!isVisible(n) || !n.textContent.trim()) continue;
          const nr = n.getBoundingClientRect();
          const cs = getComputedStyle(n);
          const m = cs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          const isDarkBg = m && (+m[1] < 80 && +m[2] < 80 && +m[3] < 80) && (m[4] === undefined || parseFloat(m[4]) >= 0.35);
          if (isDarkBg && nr.width >= fr.width * 0.55 && nr.bottom > midTop && nr.top < midBot) {
            centerOverlays.push(n.textContent.trim().slice(0, 24));
          }
        }
      }

      // R19: 反文字墙字数统计（按内容阅读单元计：1 汉字 = 1 单元，1 英文/数字词 = 1 单元；排除固定眉栏胶囊与底栏路由）+ 占位残留 + 绝对化违规词
      const contentTexts = [];
      for (const n of el.querySelectorAll("*")) {
        if (n.closest("script, style, .web-footer, .meta-badge, .brand-capsule, .w01-kicker, .w01-meta-bar, .w06-foot")) continue;
        if (!isVisible(n) || !hasOwnText(n)) continue;
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) contentTexts.push(c.textContent.trim());
        }
      }
      const contentJoined = contentTexts.join(" ");
      const cjkUnits = (contentJoined.match(/[\u4e00-\u9fff]/g) || []).length;
      const wordUnits = (contentJoined.match(/[A-Za-z0-9]+/g) || []).length;
      const strippedChars = cjkUnits + wordUnits;
      const placeholderHits = (allVisibleText.match(/\[必填\]|replace-with-[a-z0-9-]+/gi) || []);
      const forbiddenClaims = (allVisibleText.match(/绝对最便宜|全网最低|100%\s*包清关|100%\s*必过|永不被税|保证不丢件/g) || []);

      // R20: W02/W05 object-fit: contain 保护 + .mosaic-layer 检测
      const croppedScreenshots = [];
      if (recipe === "W02" || recipe === "W05") {
        for (const img of el.querySelectorAll(".w02-screenshot-frame img, .tri-photo-frame img")) {
          if (!isVisible(img)) continue;
          const fit = getComputedStyle(img).objectFit;
          if (fit !== "contain") {
            croppedScreenshots.push({ src: img.getAttribute("src") || "(img)", fit });
          }
        }
      }
      const activeCssMosaic = [...el.querySelectorAll(".mosaic-layer")].filter(isVisible).length;

      return {
        smallFonts: smallFonts.slice(0, 4),
        smileyFauxBold: smileyFauxBold.slice(0, 3),
        missingImgAlts,
        brokenImgs,
        emptySlots,
        mediaCount: uniqueFrames.length,
        mediaRatio,
        emojiHits,
        centerOverlays,
        strippedChars,
        placeholderHits,
        forbiddenClaims,
        croppedScreenshots,
        activeCssMosaic,
      };
    }, meta.recipe);

    for (const sf of webDom.smallFonts) {
      warns.push({
        rule: "R16",
        msg: `${sf.role} "${sf.text}" 字号 ${sf.size}px < 手机 340px 可读底线 ${sf.minPx}px`,
        fix: "精简图内文字并保持 1600px 母版字号不低于 DESIGN-web.md 阶梯，长正文放回 HTML/MDX",
      });
    }
    for (const fb of webDom.smileyFauxBold) {
      fails.push({
        rule: "R16",
        msg: `${fb.sel} "${fb.text}" 使用单字重得意黑 Smiley Sans Oblique 却设了 font-weight: ${fb.weight}（会触发伪粗体糊字）`,
        fix: "显式设置 font-weight: 400 !important; font-synthesis: none;（见 DESIGN-web.md）",
      });
    }

    // R17: SEO 元数据完整性校验
    const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+){1,9}$/;
    const genericSlugRe = /^(image|img|photo|pic|screenshot|screen|untitled|test|demo|card|web|banner|cover|replace-with)(-\d+)?$/i;
    if (!meta.seoFilename) {
      fails.push({
        rule: "R17",
        msg: `缺少 data-seo-filename —— 官网配图必须使用语义化英文 kebab-case 文件名`,
        fix: `在 <section> 上添加 data-seo-filename="topic-entity-role"（全小写英文短横线，3-7 词，不含扩展名）`,
      });
    } else if (!slugRe.test(meta.seoFilename) || meta.seoFilename.length > 65 || genericSlugRe.test(meta.seoFilename)) {
      fails.push({
        rule: "R17",
        msg: `data-seo-filename="${meta.seoFilename}" 不符合 SEO 语义命名规范（须为全小写英文 kebab-case、2-10 词、≤65 字符、非通用占位名）`,
        fix: `改为如 "taobao-pdd-warehouse-address-paste-steps" 的语义化英文短横线文件名（严禁中文/空格/image1）`,
      });
    } else if (webFilenameSeen.has(meta.seoFilename)) {
      fails.push({
        rule: "R17",
        msg: `data-seo-filename="${meta.seoFilename}" 与 #${webFilenameSeen.get(meta.seoFilename)} 重复，导出时会互相覆盖`,
        fix: "为每张官网配图分配唯一的语义化英文文件名",
      });
    } else {
      webFilenameSeen.set(meta.seoFilename, meta.id);
    }

    if (!meta.seoAlt || /\[必填\]|replace-with/i.test(meta.seoAlt)) {
      fails.push({
        rule: "R17",
        msg: `缺少有效的 data-seo-alt —— Google Images 与无障碍抓取必须提供真实语义 Alt 文本`,
        fix: `在 <section> 上补充 data-seo-alt="客观描述画面实证 + 自然融入 1 个目标词"（中文 18-55 字）`,
      });
    } else {
      if (/^(图片|配图|这是一张|一张关于|示意图|image of|picture of|photo of)/i.test(meta.seoAlt)) {
        fails.push({
          rule: "R17",
          msg: `data-seo-alt="${meta.seoAlt.slice(0, 28)}..." 以无意义前缀（图片/配图/这是一张等）开头`,
          fix: "直接描述图中核心实体与实证内容，去掉「图片/这是一张」等废话前缀",
        });
      }
      const cjkCount = (meta.seoAlt.match(/[\u4e00-\u9fff]/g) || []).length;
      const isCjk = cjkCount >= 6;
      if ((isCjk && meta.seoAlt.length < 10) || (!isCjk && meta.seoAlt.length < 20)) {
        fails.push({
          rule: "R17",
          msg: `data-seo-alt="${meta.seoAlt}" 过短（${meta.seoAlt.length} 字符），缺乏实体上下文`,
          fix: "扩展为包含主体对象 + 操作/对比实证 + 1 个目标词的完整描述（中文 18-55 字）",
        });
      } else if ((isCjk && meta.seoAlt.length > 80) || (!isCjk && meta.seoAlt.length > 150)) {
        warns.push({
          rule: "R17",
          msg: `data-seo-alt 偏长（${meta.seoAlt.length} 字符），易被截断或像关键词堆砌`,
          fix: "精简至中文 18-55 字（英文 60-125 字符），细节放到 data-seo-caption 或正文",
        });
      }
      const commaParts = meta.seoAlt.split(/[,，、|\/]/).filter(p => p.trim().length > 0);
      if (commaParts.length >= 5) {
        warns.push({
          rule: "R17",
          msg: `data-seo-alt 含 ${commaParts.length} 段分隔词，疑似关键词堆砌（Keyword Stuffing）`,
          fix: "改写为一句自然通顺的中文/英文描述句，仅自然融入 1 个目标搜索词",
        });
      }
    }

    if (!meta.seoCaption && meta.ratio !== "og") {
      warns.push({
        rule: "R17",
        msg: `未声明 data-seo-caption（MDX 图注）`,
        fix: "补充 1 句行动要点图注，与 data-seo-alt 互补而不机械照抄",
      });
    } else if (meta.seoCaption && meta.seoAlt && meta.seoCaption.replace(/^图[:：]\s*/, "") === meta.seoAlt) {
      warns.push({
        rule: "R17",
        msg: `data-seo-caption 与 data-seo-alt 完全相同，浪费一层语义互补位`,
        fix: "alt 客观描述画面证据，caption 补充读者操作提醒或核对结论",
      });
    }
    if (!meta.targetKeyword) {
      warns.push({
        rule: "R17",
        msg: `未声明 data-target-keyword（单图锚定搜索词）`,
        fix: `在 <section> 上标注该图服务的 1 个核心长尾搜索词，便于验收主题聚焦度`,
      });
    }
    for (const src of webDom.missingImgAlts) {
      fails.push({
        rule: "R17",
        msg: `内部 <img> (${src}) 缺少有意义的 alt 属性`,
        fix: "为每张实拍/截图 <img> 填写描述该局部素材的 alt 属性",
      });
    }

    // R18: Photo-First 实拍占比、破图与视觉禁令
    if (webDom.emptySlots > 0 || meta.isPlaceholder) {
      warns.push({
        rule: "R18",
        msg: `存在 ${Math.max(1, webDom.emptySlots)} 处实拍占位态（data-placeholder / .is-empty）—— 上线前须换为真实仓库或操作实拍`,
        fix: "放入真实照片/截图至 assets/ 并移除 .is-empty 与 data-placeholder（严禁用 AI 假人/假仓顶替）",
      });
    } else if (webDom.brokenImgs.length > 0) {
      fails.push({
        rule: "R18",
        msg: `检测到 ${webDom.brokenImgs.length} 张破图/未加载素材：${webDom.brokenImgs.join(", ")}`,
        fix: "确认 assets/ 下对应图片文件存在且路径正确；若暂缺实拍，请改用 .photo-slot.is-empty 并标 data-placeholder='true'",
      });
    }
    const minMediaRatio = ["W02", "W03", "W05"].includes(meta.recipe) ? 0.48 : 0.25;
    if (webDom.mediaCount === 0 || webDom.mediaRatio < minMediaRatio) {
      warns.push({
        rule: "R18",
        msg: `实拍/截图影像占比仅 ${Math.round(webDom.mediaRatio * 100)}%（${meta.recipe || "WEB"} 建议 ≥${Math.round(minMediaRatio * 100)}%），偏离 Photo-First / E-E-A-T 实证原则`,
        fix: "扩大真实照片或操作截图展示面积，删减多余文字框（见 DESIGN-web.md）",
      });
    }
    if (webDom.emojiHits.length > 0) {
      fails.push({
        rule: "R18",
        msg: `检测到装饰性 Unicode Emoji（${webDom.emojiHits.join(" ")}）—— 官网航单实证系统严禁使用 Emoji`,
        fix: "替换为单色几何符号（✓ / ✕ / △ / →）配合 .status-badge 语义底色",
      });
    }
    if (webDom.centerOverlays.length > 0) {
      fails.push({
        rule: "R18",
        msg: `检测到深色条横压在实拍/截图中心区域："${webDom.centerOverlays[0]}"`,
        fix: "把标题移回独立顶部眉栏 .web-header 或左侧文字卡，严禁遮挡截图与实拍主体",
      });
    }

    // R19: 反文字墙、占位残留与合规口径
    const charCaps = {
      W06: { warn: 55, fail: 85 },
      W01: { warn: 100, fail: 145 },
      W04: { warn: 175, fail: 245 },
    };
    const capCfg = charCaps[meta.recipe] || { warn: 115, fail: 165 };
    if (webDom.strippedChars > capCfg.fail) {
      fails.push({
        rule: "R19",
        msg: `单图正文可见词数达 ${webDom.strippedChars}（${meta.recipe || "WEB"} 上限 ${capCfg.fail}）—— 图片沦为文字墙，既伤手机 340px 可读性又损失 HTML 爬虫索引`,
        fix: "把长段解释移回文章 MDX 正文，图片只留标题 + 极简要点标签与一手实拍",
      });
    } else if (webDom.strippedChars > capCfg.warn) {
      warns.push({
        rule: "R19",
        msg: `单图正文可见词数 ${webDom.strippedChars}（建议 ≤${capCfg.warn}）`,
        fix: "精简次要修饰语，优先把信息增量交给实拍截图或 HTML 正文",
      });
    }
    if (webDom.placeholderHits.length > 0) {
      fails.push({
        rule: "R19",
        msg: `画面中残留未替换的模板占位文本：${[...new Set(webDom.placeholderHits)].join(", ")}`,
        fix: "替换为当前文章的真实实体标题与 URL 路径",
      });
    }
    if (webDom.forbiddenClaims.length > 0) {
      fails.push({
        rule: "R19",
        msg: `检测到绝对化/不可复算商业承诺词：${[...new Set(webDom.forbiddenClaims)].join(", ")}`,
        fix: "改为可核验的客观表述或使用 .pending 占位并注明以小程序实时试算为准（CLAUDE.md 交付纪律）",
      });
    }

    // R20: 截图防边缘裁切与敏感单据隐私打码守卫
    for (const c of webDom.croppedScreenshots) {
      fails.push({
        rule: "R20",
        msg: `${meta.recipe} 证据图 (${c.src}) 计算出 object-fit: ${c.fit} —— 手机截图与纸质证明必须使用 object-fit: contain 防左右文字裁切`,
        fix: "确保 .w02-screenshot-frame img 与 .tri-photo-frame img 保持 object-fit: contain",
      });
    }
    if (meta.recipe === "W05" || meta.privacy === "sensitive") {
      if (!meta.mosaicVerified) {
        warns.push({
          rule: "R20",
          msg: `敏感证明类配图未标注 data-mosaic-verified="true" —— 须确认所有姓名/证件/病名/电话/签章已在源图不可逆马赛克脱敏`,
          fix: `在源图片完成不可逆像素打码后，在 <section> 补充 data-mosaic-verified="true"`,
        });
      }
      if (webDom.activeCssMosaic > 0) {
        warns.push({
          rule: "R20",
          msg: `检测到 ${webDom.activeCssMosaic} 处 CSS 模拟马赛克层 (.mosaic-layer) —— 仅限草图定位，不能替代源图不可逆打码`,
          fix: "上线前务必把马赛克烘焙进源图片文件并移除 CSS .mosaic-layer，防止原图外泄",
        });
      }
    }
  }

  report.push({ meta, fails, warns });
}

// R10 花体字作用域 + 族名误用 & R11 花体字伪粗体防糊（整份文档只跑一次）
{
  const r10 = await page.evaluate(({ allowed, families }) => {
    const out = { enabled: false, scoped: [], mismatch: [], fauxBold: [], greenbook: false };
    const root = document.documentElement;
    out.greenbook = root.dataset.system !== "web" && document.querySelectorAll('[class~="board"]').length > 0;

    const libFams = new Set(families.map(f => f.family.toLowerCase()));
    const famMap = new Map(families.map(f => [f.family.toLowerCase(), f]));
    const readVar = n => getComputedStyle(root).getPropertyValue(n).trim();
    const pick = raw => {
      for (const part of raw.split(",")) {
        const f = part.replace(/["']/g, "").trim();
        if (f && libFams.has(f.toLowerCase())) return f;
      }
      return null;
    };
    const alt = pick(readVar("--display-alt")) || pick(readVar("--display-zh")) || "";
    if (root.hasAttribute("data-title-font") && alt) out.enabled = true;

    const posters = [...document.querySelectorAll('[class~="poster"]')];
    const allowedSet = new Set(allowed);
    if (out.enabled) {
      const altL = alt.toLowerCase();
      for (const n of document.querySelectorAll('[class~="poster"] *, [class~="board"] *')) {
        const fam = getComputedStyle(n).fontFamily.toLowerCase();
        if (!fam.includes(altL)) continue;
        const pFam = n.parentElement ? getComputedStyle(n.parentElement).fontFamily.toLowerCase() : "";
        if (pFam.includes(altL)) continue;
        const text = n.textContent.trim();
        if (!text) continue;
        const size = Math.round(parseFloat(getComputedStyle(n).fontSize));
        out.scoped.push({
          ok: [...n.classList].some(c => allowedSet.has(c)) && size >= 72,
          size,
          posterIdx: posters.findIndex(p => p.contains(n)),
          where: [...n.classList].join(".") || n.tagName.toLowerCase(),
          text: text.slice(0, 18),
        });
      }
    }

    // 族名误用 + R11 花体字伪粗体检查（覆盖 .poster / .board / .card）
    const zhSet = new Set(families.map(f => f.zh));
    const hasOwnText = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3 && c.textContent.trim().length > 0) return true;
      }
      return false;
    };
    for (const n of document.querySelectorAll('[class~="poster"] *, [class~="board"] *, [class~="card"] *')) {
      const cs = getComputedStyle(n);
      const first = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      if (zhSet.has(first) && !families.some(f => f.family.toLowerCase() === first.toLowerCase())) {
        out.mismatch.push({ where: [...n.classList].join(".") || n.tagName.toLowerCase(), name: first, text: n.textContent.trim().slice(0, 18) });
      }
      if (hasOwnText(n) && (famMap.has(first.toLowerCase()) || n.matches(".tape-title, .hand"))) {
        const w = parseInt(cs.fontWeight, 10) || 400;
        if (w >= 600) {
          const hit = famMap.get(first.toLowerCase());
          out.fauxBold.push({
            where: [...n.classList].join(".") || n.tagName.toLowerCase(),
            font: hit ? hit.zh : first,
            weight: w,
            text: n.textContent.trim().replace(/\s+/g, " ").slice(0, 18),
          });
        }
      }
    }
    return out;
  }, { allowed: [...CARVE_OUT_ALLOWED], families: FONT_LIB ? FONT_LIB.fonts : [] });

  const r10Fails = [];
  const seenMismatch = new Set();
  for (const m of r10.mismatch) {
    const k = m.where + "|" + m.name + "|" + m.text;
    if (seenMismatch.has(k)) continue;
    seenMismatch.add(k);
    const f = LIB_BY_ZH.get(m.name);
    r10Fails.push({
      rule: "R10",
      msg: m.where + ' "' + m.text + '" 的 font-family 写成了中文名「' + m.name + '」，webfont 实际族名是 "' + (f ? f.family : "?") + '"',
      fix: '改成 "' + (f ? f.family : "<css-family>") + '", "Noto Serif SC", serif —— 写中文名不会加载到字体，浏览器会静默回退',
    });
  }
  // Greenbook 的换装缝是全局 --display-zh（DESIGN.md 明确设计为整套卡统一换面），
  // 因此对它只查族名误用，不套用"仅限第一张封面"的 Editorial/Swiss 边界。
  if (!r10.greenbook) {
    for (const v of r10.scoped) {
      if (!v.ok) {
        r10Fails.push({
          rule: "R10",
          msg: v.where + ' "' + v.text + '" (' + v.size + 'px) 用了花体字，但它既不是 .h-display / .h-hero / .h-statement / .f-alt，也没到 72px 显示标题级',
          fix: "花体字只允许出现在封面级显示标题上，正文/lead/label/meta 一律回退到系统字体（references/font-library.md 第 0 节）",
        });
      } else if (style === "swiss" && v.posterIdx > 0) {
        r10Fails.push({
          rule: "R10",
          msg: v.where + ' "' + v.text + '" 用了花体字，但它在第 ' + (v.posterIdx + 1) + " 张 poster 上 —— Swiss 封面例外只覆盖第一张",
          fix: "把 data-title-font 收回到封面那一页，或在内容页改用 .h-xl + Inter（references/font-library.md 第 9 节）",
        });
      }
    }
  }
  if (r10Fails.length) {
    report.push({ meta: { id: "R10", dataId: "花体字", board: "document", doc: true }, fails: r10Fails, warns: [] });
  }

  const r11Fails = [];
  const seenFaux = new Set();
  for (const fb of r10.fauxBold) {
    const k = fb.where + "|" + fb.font + "|" + fb.text;
    if (seenFaux.has(k)) continue;
    seenFaux.add(k);
    r11Fails.push({
      rule: "R11",
      msg: `.${fb.where} "${fb.text}" 使用单字重花体字「${fb.font}」却计算出 font-weight: ${fb.weight}（触发浏览器伪粗体合成，导致笔画飞白糊死成白团）`,
      fix: "在标题/手写类上显式声明 font-weight: 400 !important; font-synthesis: none; 严禁继承 h1/h2/strong 的默认 700 粗体",
    });
  }
  if (r11Fails.length) {
    report.push({ meta: { id: "R11", dataId: "花体字防糊", board: "document", doc: true }, fails: r11Fails, warns: [] });
  }
}

await browser.close();

let totalFail = 0, totalWarn = 0;
const ruleCounts = new Map();
for (const { fails, warns } of report) {
  totalFail += fails.length;
  totalWarn += warns.length;
  for (const v of [...fails, ...warns]) ruleCounts.set(v.rule, (ruleCounts.get(v.rule) || 0) + 1);
}
const posterEntries = report.filter(r => !r.meta.doc);
const cleanCount = posterEntries.filter(r => r.fails.length === 0 && r.warns.length === 0).length;

const lines = [];
lines.push(`==== validate-social-deck ====`);
lines.push(`target:   ${path.relative(process.cwd(), htmlPath)}`);
lines.push(`style:    ${style}`);
lines.push(`sections: ${posterEntries.length}  ·  ${cleanCount} clean  ·  ${totalFail} fails  ·  ${totalWarn} warns`);
if (ruleCounts.size > 0) {
  const ruleSummary = [...ruleCounts.entries()].sort().map(([r, c]) => `${r}=${c}`).join("  ");
  lines.push(`rules:    ${ruleSummary}`);
}
lines.push("");

const fixCache = new Map();
for (const { meta, fails, warns } of report) {
  if (fails.length === 0 && warns.length === 0) {
    lines.push(`[PASS]  ${meta.id} ${meta.dataId ? ` · ${meta.dataId}` : ""} · ${meta.board}`);
    continue;
  }
  const tag = fails.length ? "[FAIL]" : "[WARN]";
  lines.push(`${tag}  ${meta.id} ${meta.dataId ? ` · ${meta.dataId}` : ""} · ${meta.board}`);
  for (const v of [...fails, ...warns]) {
    const sev = fails.includes(v) ? "FAIL" : "WARN";
    lines.push(`  ${sev} · ${v.rule}  ${v.msg}`);
    if (!fixCache.has(v.rule)) {
      lines.push(`         fix: ${v.fix}`);
      fixCache.set(v.rule, true);
    }
  }
}

lines.push("");
lines.push(`Legend: R1 overflow · R2 footer collision · R3 swiss bold display · R4 min font · R5 4-band density · R6 h-xl cap · R7 figure margin drift · R8 visual bounds · R9 title gap · R10 花体字作用域/族名 · R11 花体字防伪粗体糊字 · R12 小红书封箱守卫 · R13 封面右上角UI禁区 · R14 封面反剧透/反硬广/过载 · R15 封面与外显标题双轨校验 · R16 官网尺寸/Discover/字号/防糊 · R17 官网SEO元数据 · R18 官网实拍占比与禁令 · R19 官网反文字墙与口径 · R20 官网截图与隐私脱敏`);
lines.push(`Exit code 1 only on FAIL. Warnings are advisory.`);

console.log(lines.join("\n"));
process.exit(totalFail > 0 ? 1 : 0);

#!/usr/bin/env node
/*
 * validate-social-deck.mjs
 *
 *   node validate-social-deck.mjs <task-dir|index.html>
 *
 * Checks each <section class="poster …"> or <section class="card …"> in the target HTML
 * against the rules codified in SKILL.md / DESIGN-xhs.md / qa-checklist.md / components.md.
 * Exits 1 if any FAIL.
 *
 * Rules implemented:
 *   R1  overflow              scrollHeight > clientHeight on the poster/card
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
 *   R11 花体字伪粗体防糊      单字重花体字（如仓耳周珂正大榜书/千图笔锋手写体）computedWeight >= 600 会触发伪粗体糊字
 *   R12 小红书封箱专属守卫    拦截已否决的「上图+下满宽贴边死白底列表」封面，并对可选组件 .tally（「正」字）给出启用核对提醒
 *   R13 封面右上角 UI 禁区    拦截落入小红书发现页右上角 230×210px 播放标/多图角标区的封面文字与标注（视频封面 FAIL / 图文 WARN）
 *   R14 封面反剧透/反硬广/过载 拦截封面左上企业硬广标 (.brand-pill)、3 栏剧透回执 (.floating-slip .slip-grid) 及字数过载
 *   R15 封面/外显标题双轨校验  检查封面主钩子与 data-feed-title 的文字重合率，避免双列卡片浪费一半点击面积
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
  console.error("usage: node validate-social-deck.mjs <task-dir|index.html> [--style=swiss|editorial|xhs]");
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
  viewport: { width: 1400, height: 1700 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const style = styleOverride || await page.evaluate(() => {
  const html = document.documentElement;
  if (html.dataset.theme) return "editorial";
  if (html.dataset.accent) return "swiss";
  if (document.querySelector("section.card") && (html.dataset.brand || document.querySelector(".tape"))) return "xhs";
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

const sections = await page.$$("section.poster, section.card");
const report = [];

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
    const w = el.clientWidth, h = el.clientHeight;
    let board = el.classList.contains("xhs") ? "xhs"
              : el.classList.contains("square") ? "square"
              : el.classList.contains("wide") ? "wide" : null;
    if (!board) {
      const ratio = w / h;
      if (Math.abs(ratio - 0.75) < 0.02) board = "xhs";        // 3:4
      else if (Math.abs(ratio - 1.0) < 0.02) board = "square"; // 1:1
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
      recipe,
      surface,
      feedTitle,
      ctrMode,
      isCover,
      clientH: h,
      scrollH: el.scrollHeight,
      clientW: w,
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
    const H = el.clientHeight;
    const W = el.clientWidth;
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

  report.push({ meta, fails, warns });
}

// R10 花体字作用域 + 族名误用 & R11 花体字伪粗体防糊（整份文档只跑一次）
{
  const r10 = await page.evaluate(({ allowed, families }) => {
    const out = { enabled: false, scoped: [], mismatch: [], fauxBold: [], greenbook: false };
    const root = document.documentElement;
    out.greenbook = document.querySelectorAll('[class~="board"]').length > 0;

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
lines.push(`Legend: R1 overflow · R2 footer collision · R3 swiss bold display · R4 min font · R5 4-band density · R6 h-xl cap · R7 figure margin drift · R8 visual bounds · R9 title gap · R10 花体字作用域/族名 · R11 花体字防伪粗体糊字 · R12 小红书封箱守卫 · R13 封面右上角UI禁区 · R14 封面反剧透/反硬广/过载 · R15 封面与外显标题双轨校验`);
lines.push(`Exit code 1 only on FAIL. Warnings are advisory.`);

console.log(lines.join("\n"));
process.exit(totalFail > 0 ? 1 : 0);

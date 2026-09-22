#!/usr/bin/env node
/*
 * check-font-coverage.mjs — 花体字缺字检查
 *
 *   node scripts/check-font-coverage.mjs <task-dir|index.html> [--cache <dir>] [--text "任意文案"]
 *
 * 为什么需要它：花体字普遍只有 GB2312 级字表（约 6763 字）。标题里出现生僻字、
 * 异体字、人名地名用字时，Chromium 会静默地把那一个字回退到 fallback 字体，
 * 同一行标题里出现两种字形 —— 这是花体字最典型的翻车方式，肉眼看缩略图很难发现。
 *
 * 本脚本做两件事：
 *   1. 用 Chromium 读出每个标题节点「实际计算出的」字体族（不是猜模板里写了什么），
 *      再逐字对照该字体的 unicode-range 分片表，列出缺字。
 *   2. fallback 检查：花体字后面必须跟至少一个通用族，否则缺字时会回退到系统任意字体。
 *
 * 退出码 1 = 发现缺字或缺少 fallback。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(HERE, "..", "assets", "font-library.json");

const args = process.argv.slice(2);
let target = null;
let cacheDir = null;
let extraText = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--cache") cacheDir = args[++i];
  else if (args[i] === "--text") extraText = args[++i];
  else if (!target) target = args[i];
}
if (!target) {
  console.error('usage: node check-font-coverage.mjs <task-dir|index.html> [--cache <dir>] [--text "文案"]');
  process.exit(2);
}

const abs = path.resolve(target);
const htmlPath = fs.statSync(abs).isDirectory() ? path.join(abs, "index.html") : abs;
const html = fs.readFileSync(htmlPath, "utf8");
const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));

const DISPLAY = ["h-display", "h-hero", "h-statement", "h-xl", "h-md", "f-alt", "f-brush", "f-running", "f-kai", "f-sign", "f-hand"];

// ---------- 1. 用 Chromium 取每个标题节点的真实计算字体 ----------
let blocks = [];
let usedBrowser = true;
try {
  const pw = await import("playwright");
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto("file://" + htmlPath, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(async () => {
    const fams = [...new Set([...document.querySelectorAll(".poster *")].map(n => getComputedStyle(n).fontFamily))];
    for (const f of fams) {
      try { await document.fonts.load(`80px ${f}`, "缺字检查常用汉字生僻字测试"); } catch {}
    }
    await document.fonts.ready;
  });
  // 采集口径：既包括 DISPLAY 里的标题类，也包括任何「首个字体族命中本库」的元素。
  // 后者能抓到自定义类名（data-title-font 作用在非标准类上）以及把花体字误用到正文的情况。
  blocks = await page.evaluate(({ cls, families }) => {
    const lower = new Set(families.map(f => f.toLowerCase()));
    const out = [];
    const push = (n, cls2) => {
      const own = [...n.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join("").trim();
      const txt = own || (n.children.length === 0 ? n.textContent.trim() : "");
      if (!txt) return;
      out.push({
        cls: cls2 || [...n.classList].join(".") || n.tagName.toLowerCase(),
        txt: txt.replace(/\s+/g, " "),
        family: getComputedStyle(n).fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      });
    };
    for (const c of cls) for (const n of document.querySelectorAll("." + c)) push(n, c);
    for (const n of document.querySelectorAll(".poster *")) {
      const fam = getComputedStyle(n).fontFamily.split(",")[0].replace(/["']/g, "").trim();
      if (lower.has(fam.toLowerCase())) push(n);
    }
    return out;
  }, { cls: DISPLAY, families: reg.fonts.flatMap(f => [f.family, f.zh]) });
  await browser.close();
} catch (e) {
  usedBrowser = false;
  const classAlt = DISPLAY.join("|");
  const re = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*class="[^"]*\\b(?:${classAlt})\\b[^"]*"[^>]*>([\\s\\S]*?)</\\1>`, "g");
  for (const m of html.matchAll(re)) {
    const txt = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (txt) blocks.push({ cls: (m[0].match(/class="([^"]*)"/) || [, ""])[1], txt, family: null });
  }
}

// 去重：同一个元素可能同时命中多个 class
const seen = new Set();
blocks = blocks.filter(b => {
  const k = (b.family || "") + "|" + b.txt;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// 同时按 CSS 族名和中文名建索引：有人会误写中文字体名，那是真实存在的 bug
const byFamily = new Map(reg.fonts.map(f => [f.family.toLowerCase(), f]));
const byZh = new Map(reg.fonts.map(f => [f.zh, f]));
const hitsFont = fam => {
  if (!fam) return null;
  return byFamily.get(fam.toLowerCase()) || byZh.get(fam.trim()) || null;
};
// 写成中文名 → 该字体并不会真正加载，属于误用
const nameMismatch = [];
for (const b of blocks) {
  const key = (b.family || "").toLowerCase();
  const f = byFamily.get(key);
  const zhHit = byZh.get((b.family || "").trim());
  if (!f && zhHit) nameMismatch.push({ b, f: zhHit });
}
const usedFonts = [...new Set(blocks.map(b => hitsFont(b.family)).filter(Boolean).map(f => f.id))];

// --text：拿不到 DOM 时，用这套图里实际生效的那个花体字来核对文案
if (extraText) {
  const primary = blocks.map(b => hitsFont(b.family)).find(Boolean);
  blocks.push({ cls: "--text", txt: extraText, family: primary ? primary.family : null, forced: primary || null });
}


// ---------- 2. 取每个字体的 unicode-range 并集 ----------
function parseRanges(css) {
  const set = new Set();
  for (const m of css.matchAll(/unicode-range\s*:\s*([^;}]+)/g)) {
    for (const part of m[1].split(",")) {
      const mm = part.trim().match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
      if (!mm) continue;
      const lo = parseInt(mm[1], 16);
      const hi = mm[2] ? parseInt(mm[2], 16) : lo;
      for (let c = lo; c <= hi; c += 1) set.add(c);
    }
  }
  return set;
}

const coverage = new Map();
let fetchFailed = 0;
for (const id of usedFonts) {
  const f = reg.fonts.find(x => x.id === id);
  const lp = cacheDir ? path.join(cacheDir, id + ".css") : null;
  let css = null;
  if (lp && fs.existsSync(lp)) css = fs.readFileSync(lp, "utf8");
  if (!css) {
    try {
      const r = await fetch(f.css, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" } });
      css = r.ok ? await r.text() : null;
      if (css && lp) {
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(lp, css);
      }
    } catch { css = null; }
  }
  if (!css) { fetchFailed += 1; continue; }
  coverage.set(id, parseRanges(css));
}

// ---------- 3. fallback 检查（只看含花体字的 font-family 声明） ----------
const fallbackIssues = [];
for (const m of html.matchAll(/font-family\s*:\s*([^;}]+)[;}]/g)) {
  const decl = m[1].trim();
  const hit = reg.fonts.find(f => decl.includes(f.family));
  if (!hit) continue;
  const after = decl.slice(decl.indexOf(hit.family) + hit.family.length).replace(/["']/g, "").replace(/^[,\s]+/, "").trim();
  if (!after || /^!important/.test(after)) {
    fallbackIssues.push({ decl: decl.slice(0, 90), font: hit.zh, family: hit.family });
  }
}

// ---------- 4. 报告 ----------
const fails = [];
const lines = [];
lines.push(`目标：${path.relative(process.cwd(), htmlPath)}`);
lines.push(`取字体方式：${usedBrowser ? "Chromium 计算样式（准确）" : "正则回退（未装 Playwright，字体族为未知）"}`);
lines.push(`标题里用到的花体字：${usedFonts.map(id => reg.fonts.find(f => f.id === id).zh).join(" · ") || "（无）"}`);
lines.push("");

const mismatchKeys = new Set(nameMismatch.map(m => (m.b.family || "") + "|" + m.b.txt));
for (const nm of nameMismatch) {
  fails.push(nm);
  lines.push(`[FAIL] .${nm.b.cls}  “${nm.b.txt}”`);
  lines.push(`       font-family 写成了中文名“${nm.b.family}”，但 ${nm.f.zh} 的 webfont 族名是 “${nm.f.family}”`);
  lines.push(`       → 这样写不会加载到字体，浏览器会静默回退。改成 "${nm.f.family}", "Noto Serif SC", serif`);
}
lines.push("");

for (const b of blocks) {
  if (mismatchKeys.has((b.family || "") + "|" + b.txt)) continue;
  const f = hitsFont(b.family);
  if (!f) {
    lines.push(`[SKIP] ${b.cls}  “${b.txt}” —— 用的是“${b.family || "未知"}”，不是本库字体`);
    continue;
  }
  const cov = coverage.get(f.id);
  if (!cov) {
    lines.push(`[SKIP] ${b.cls}  “${b.txt}” —— ${f.zh} 的分片表拉取失败`);
    continue;
  }
  const missing = [...new Set([...b.txt])].filter(ch => {
    const cp = ch.codePointAt(0);
    if (cp < 128) return false;          // 西文/数字不判（多数中文字体都带基本拉丁）
    if (/[\s，。、；：！？""''（）《》—…·,.!?;:()[\]{}<>/\\|@#$%^&*+=~`-]/.test(ch)) return false;
    return !cov.has(cp);
  });
  if (missing.length) {
    fails.push({ b, missing, f });
    lines.push(`[FAIL] .${b.cls}  “${b.txt}”`);
    lines.push(`       字体：${f.zh}（${reg.coverageLegend[f.coverage]}，实测 ${f.cjkCount} 字）`);
    lines.push(`       缺字：${missing.join(" ")}`);
    lines.push(`       fix: 换字数更全的字体（yozai / xiaolai / qiji 为 GBK 级），或改掉这几个字`);
  } else {
    lines.push(`[PASS] .${b.cls}  “${b.txt}” —— ${f.zh} 字形齐全`);
  }
}

if (fetchFailed) {
  lines.push("");
  lines.push(`[WARN] ${fetchFailed} 款字体的 CSS 拉取失败（离线？）。可先缓存再复检：`);
  lines.push(`       node scripts/build-font-links.mjs fetch <目录> <字体…>`);
  lines.push(`       node scripts/check-font-coverage.mjs ${target} --cache <目录>`);
}
for (const fi of fallbackIssues) {
  fails.push(fi);
  lines.push(`[FAIL] fallback 缺失：font-family: ${fi.decl}`);
  lines.push(`       fix: 花体字后面必须跟通用族，例如 "${fi.family}", "Noto Serif SC", serif`);
}

lines.push("");
lines.push(`结论：${fails.length ? `${fails.length} 处需要修` : "全部通过"}`);
console.log(lines.join("\n"));
process.exit(fails.length ? 1 : 0);

#!/usr/bin/env node
/*
 * scripts/build-web-seo-pack.mjs
 *
 * 官网 SEO 配图一键渲染、WebP/OG 压缩打包、MDX/JSON-LD 元数据生成与多视图验图台。
 *
 * 用法：
 *   node scripts/build-web-seo-pack.mjs <task-dir> [--public-prefix=/images/blog/<slug>] [--webp-quality=82] [--out=web-seo-preview.html] [--screenshot]
 *
 * 产出目录（均位于 <task-dir>/ 内）：
 *   output/masters/<seo-filename>.png   无损高清母版
 *   output/web/<seo-filename>.webp      官网主力 WebP（按 Core Web Vitals 体积预算自动压优）
 *   output/web/<og-filename>.jpg        W06 OpenGraph 社媒爬虫通用 JPG（仅 og 板型）
 *   output/seo-manifest.json            全量 SEO 元数据与 CWV 体积体检清单
 *   output/mdx-snippets.md              可直接粘贴进 MDX 文章的 <Image /> 与 ImageObject JSON-LD 代码
 *   web-seo-preview.html                桌面 688px + 手机 340px + SERP/Discover/OG 交互式验图台
 *   output/web-seo-preview.png          加 --screenshot 时导出整页验图快照
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

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

function findBin(candidates) {
  for (const bin of candidates) {
    try {
      if (bin.startsWith("/")) {
        if (fs.existsSync(bin)) return bin;
      } else {
        const resolved = execFileSync("which", [bin], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        if (resolved) return resolved;
      }
    } catch { /* ignore */ }
  }
  return null;
}

const CWEBP_BIN = findBin(["/opt/homebrew/bin/cwebp", "/usr/local/bin/cwebp", "cwebp"]);
const SIPS_BIN = findBin(["/usr/bin/sips", "sips"]);

const args = process.argv.slice(2);
let taskDirArg = null;
let publicPrefixArg = null;
let webpQuality = 82;
let outPreviewName = "web-seo-preview.html";
let doScreenshot = false;

for (const a of args) {
  if (a.startsWith("--public-prefix=")) publicPrefixArg = a.slice(16).replace(/\/+$/, "");
  else if (a.startsWith("--webp-quality=")) webpQuality = Math.max(50, Math.min(95, parseInt(a.slice(15), 10) || 82));
  else if (a.startsWith("--out=")) outPreviewName = a.slice(6);
  else if (a === "--screenshot") doScreenshot = true;
  else if (!taskDirArg) taskDirArg = a;
}

if (!taskDirArg) {
  console.error("usage: node scripts/build-web-seo-pack.mjs <task-dir> [--public-prefix=/images/blog/<slug>] [--webp-quality=82] [--out=web-seo-preview.html] [--screenshot]");
  process.exit(2);
}

const taskDir = path.resolve(taskDirArg);
const indexPath = fs.statSync(taskDir).isDirectory() ? path.join(taskDir, "index.html") : taskDir;
const workDir = path.dirname(indexPath);

if (!fs.existsSync(indexPath)) {
  console.error(`not found: ${indexPath}`);
  process.exit(2);
}

const outputDir = path.join(workDir, "output");
const mastersDir = path.join(outputDir, "masters");
const webDir = path.join(outputDir, "web");
fs.mkdirSync(mastersDir, { recursive: true });
fs.mkdirSync(webDir, { recursive: true });

const CWV_BUDGET_KB = {
  hero: 150,
  og: 120,
  standard: 220,
  square: 140,
  default: 180,
};

function budgetFor(item) {
  if (item.ratio === "og" || item.recipe === "W06" || item.role === "og") return CWV_BUDGET_KB.og;
  if (item.recipe === "W01" || item.role === "hero") return CWV_BUDGET_KB.hero;
  if (item.ratio === "standard" || item.recipe === "W02") return CWV_BUDGET_KB.standard;
  if (item.ratio === "square") return CWV_BUDGET_KB.square;
  return CWV_BUDGET_KB.default;
}

function encodeWebp(pngPath, webpPath, initialQ, budgetKB) {
  if (!CWEBP_BIN) return { ok: false, quality: null, kb: null, note: "cwebp not installed" };
  const steps = [...new Set([initialQ, Math.min(initialQ, 76), Math.min(initialQ, 70), Math.min(initialQ, 64)])];
  let chosenQ = initialQ;
  let finalKB = 0;
  for (const q of steps) {
    execFileSync(CWEBP_BIN, ["-q", String(q), "-m", "6", "-mt", pngPath, "-o", webpPath], { stdio: "ignore" });
    finalKB = +(fs.statSync(webpPath).size / 1024).toFixed(1);
    chosenQ = q;
    if (finalKB <= budgetKB) break;
  }
  return { ok: true, quality: chosenQ, kb: finalKB, note: "" };
}

function encodeJpeg(pngPath, jpgPath, initialQ = 82, budgetKB = 120) {
  if (!SIPS_BIN) return { ok: false, kb: null, quality: null };
  const steps = [...new Set([initialQ, 74, 66, 58])];
  let chosenQ = initialQ;
  let finalKB = 0;
  for (const q of steps) {
    execFileSync(SIPS_BIN, ["-s", "format", "jpeg", "-s", "formatOptions", String(q), pngPath, "--out", jpgPath], { stdio: "ignore" });
    finalKB = +(fs.statSync(jpgPath).size / 1024).toFixed(1);
    chosenQ = q;
    if (finalKB <= budgetKB) break;
  }
  return { ok: true, kb: finalKB, quality: chosenQ };
}

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escMdxAttr(s) {
  return String(s || "").replace(/"/g, "&quot;").replace(/\r?\n/g, " ").trim();
}

const browser = await launchChromium([
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--disable-gpu",
]);

const ctx = await browser.newContext({
  viewport: { width: 1700, height: 2500 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto("file://" + indexPath, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(900);

const docMeta = await page.evaluate(() => {
  const html = document.documentElement;
  const loaded = new Set();
  for (const f of document.fonts) {
    if (f.status === "loaded") loaded.add(f.family.replace(/^["']|["']$/g, ""));
  }
  return {
    title: document.title || "",
    brand: html.dataset.brand || "meixipro",
    articleSlug: html.dataset.articleSlug || "article",
    pageUrl: html.dataset.pageUrl || "",
    loadedFonts: [...loaded],
  };
});

const publicPrefix = publicPrefixArg || `/images/blog/${docMeta.articleSlug}`;
const boards = await page.$$("section.board");

if (boards.length === 0) {
  await browser.close();
  console.error(`No <section class="board"> elements found in ${indexPath}`);
  process.exit(1);
}

const manifestItems = [];

for (let i = 0; i < boards.length; i += 1) {
  const el = boards[i];
  const info = await el.evaluate((node, idx) => {
    const r = node.getBoundingClientRect();
    const ratio = (node.dataset.ratio || (
      node.classList.contains("standard") ? "standard"
      : node.classList.contains("square") ? "square"
      : node.classList.contains("tall") ? "tall"
      : node.classList.contains("og") ? "og"
      : "wide"
    )).toLowerCase();
    const recipe = (node.dataset.recipe || `W0${idx + 1}`).toUpperCase();
    const role = (node.dataset.seoRole || (recipe === "W01" ? "hero" : recipe === "W06" ? "og" : "body")).toLowerCase();
    const filename = (node.dataset.seoFilename || node.id || `web-card-${idx + 1}`).trim();
    const h1 = node.querySelector(".header-title, .w01-heading, .w06-heading");
    return {
      id: node.id || `board-${idx + 1}`,
      recipe,
      ratio,
      role,
      filename,
      width: Math.round(r.width),
      height: Math.round(r.height),
      alt: (node.dataset.seoAlt || "").trim(),
      caption: (node.dataset.seoCaption || "").trim(),
      targetKeyword: (node.dataset.targetKeyword || "").trim(),
      schemaType: (node.dataset.schemaType || "Article").trim(),
      loading: (node.dataset.loading || (role === "hero" ? "eager" : "lazy")).toLowerCase(),
      privacy: (node.dataset.privacy || "").toLowerCase(),
      mosaicVerified: node.dataset.mosaicVerified === "true",
      headingText: h1 ? h1.textContent.trim().replace(/\s+/g, " ") : "",
    };
  }, i);

  const masterName = `${info.filename}.png`;
  const masterAbs = path.join(mastersDir, masterName);
  await el.screenshot({ path: masterAbs, type: "png" });
  const masterKB = +(fs.statSync(masterAbs).size / 1024).toFixed(1);

  const budgetKB = budgetFor(info);
  const webpName = `${info.filename}.webp`;
  const webpAbs = path.join(webDir, webpName);
  const webpRes = encodeWebp(masterAbs, webpAbs, webpQuality, budgetKB);

  let jpgName = null;
  let jpgKB = null;
  if (info.ratio === "og" || info.recipe === "W06" || info.role === "og") {
    jpgName = `${info.filename}.jpg`;
    const jpgAbs = path.join(webDir, jpgName);
    const jpgRes = encodeJpeg(masterAbs, jpgAbs, 82, budgetKB);
    if (jpgRes.ok) jpgKB = jpgRes.kb;
    else jpgName = null;
  }

  const effectiveWebFile = webpRes.ok ? webpName : masterName;
  const effectiveKB = webpRes.ok ? webpRes.kb : masterKB;
  const cwvPass = effectiveKB <= budgetKB;
  const discoverReady = info.width >= 1200;
  const fetchPriority = info.loading === "eager" || info.role === "hero" ? "high" : "auto";

  manifestItems.push({
    ...info,
    masterPng: `output/masters/${masterName}`,
    webpFile: webpRes.ok ? `output/web/${webpName}` : null,
    jpgFile: jpgName ? `output/web/${jpgName}` : null,
    publicUrl: `${publicPrefix}/${effectiveWebFile}`,
    ogPublicUrl: jpgName ? `${publicPrefix}/${jpgName}` : `${publicPrefix}/${effectiveWebFile}`,
    masterKB,
    webpKB: webpRes.kb,
    webpQuality: webpRes.quality,
    jpgKB,
    cwvBudgetKB: budgetKB,
    cwvPass,
    discoverReady,
    fetchPriority,
  });
}

const totalWebpKB = +(manifestItems.reduce((sum, it) => sum + (it.webpKB ?? it.masterKB), 0)).toFixed(1);
const budgetPassCount = manifestItems.filter(it => it.cwvPass).length;
const discoverReadyCount = manifestItems.filter(it => it.discoverReady).length;

const manifest = {
  generatedAt: new Date().toISOString(),
  brand: docMeta.brand,
  articleSlug: docMeta.articleSlug,
  pageUrl: docMeta.pageUrl,
  publicPrefix,
  loadedFonts: docMeta.loadedFonts,
  summary: {
    totalImages: manifestItems.length,
    totalWebpKB,
    budgetPassCount,
    budgetTotal: manifestItems.length,
    discoverReadyCount,
  },
  images: manifestItems,
};

const manifestPath = path.join(outputDir, "seo-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

// ---------- Generate MDX & JSON-LD snippets ----------
const heroItem = manifestItems.find(it => it.role === "hero" || it.recipe === "W01") || manifestItems[0];
const ogItem = manifestItems.find(it => it.role === "og" || it.ratio === "og" || it.recipe === "W06") || heroItem;
const baseOrigin = (() => {
  try {
    return docMeta.pageUrl ? new URL(docMeta.pageUrl).origin : "https://meixipro.com";
  } catch {
    return "https://meixipro.com";
  }
})();

const imageObjectsJsonLd = manifestItems
  .filter(it => it.role !== "og")
  .map(it => ({
    "@type": "ImageObject",
    url: `${baseOrigin}${it.publicUrl}`,
    contentUrl: `${baseOrigin}${it.publicUrl}`,
    width: it.width,
    height: it.height,
    caption: it.caption || it.alt,
    representativeOfPage: it === heroItem,
  }));

const mdxLines = [];
mdxLines.push(`# 官网配图 SEO 交付代码片段（${docMeta.articleSlug}）`);
mdxLines.push("");
mdxLines.push(`> 生成时间：${manifest.generatedAt} · 已加载字体：${docMeta.loadedFonts.join(", ") || "(未检测到自定义 Webfont)"}`);
mdxLines.push(`> 汇总：共 **${manifestItems.length}** 张配图 · WebP 总计 **${totalWebpKB} KB** · Core Web Vitals 体积预算通过 **${budgetPassCount}/${manifestItems.length}** · Google Discover (≥1200px) **${discoverReadyCount}/${manifestItems.length}**`);
mdxLines.push("");
mdxLines.push("## 1. 导出清单与体积体检");
mdxLines.push("");
mdxLines.push("| 配方 | 比例 | 像素 | SEO 文件名 | WebP 体积 | 预算 | 状态 | 锚定搜索词 |");
mdxLines.push("|---|---|---|---|---:|---:|---|---|");
for (const it of manifestItems) {
  const sizeStr = it.webpKB != null ? `${it.webpKB} KB (q${it.webpQuality})` : `${it.masterKB} KB (PNG)`;
  const ogExtra = it.jpgKB != null ? ` / JPG ${it.jpgKB} KB` : "";
  const statusStr = it.cwvPass ? "PASS" : "OVER BUDGET";
  mdxLines.push(`| ${it.recipe} | \`${it.ratio}\` | ${it.width}×${it.height} | \`${it.filename}\` | ${sizeStr}${ogExtra} | ≤${it.cwvBudgetKB} KB | **${statusStr}** | ${it.targetKeyword || "—"} |`);
}
mdxLines.push("");
mdxLines.push("## 2. Frontmatter 与 Google Discover 配置");
mdxLines.push("");
mdxLines.push("```yaml");
mdxLines.push(`coverImage: "${heroItem.publicUrl}"`);
mdxLines.push(`coverImageAlt: "${escMdxAttr(heroItem.alt)}"`);
mdxLines.push(`ogImage: "${ogItem.ogPublicUrl}"`);
mdxLines.push(`# Next.js metadata.robots 请确保开启 max-image-preview:large 以获得 Google Discover 大图资格`);
mdxLines.push("```");
mdxLines.push("");
mdxLines.push("## 3. MDX 正文 `<Image />` 粘贴块");
mdxLines.push("");
for (const it of manifestItems) {
  if (it.role === "og" || it.ratio === "og") continue;
  const isHero = it === heroItem;
  mdxLines.push(`### ${it.recipe} · ${it.headingText || it.id}（锚定词：${it.targetKeyword || "待补充"}）`);
  mdxLines.push("");
  mdxLines.push("```tsx");
  mdxLines.push("<Image");
  mdxLines.push(`  src="${it.publicUrl}"`);
  mdxLines.push(`  alt="${escMdxAttr(it.alt)}"`);
  mdxLines.push(`  ratio="${it.ratio}"`);
  mdxLines.push(`  width={${it.width}}`);
  mdxLines.push(`  height={${it.height}}`);
  if (it.caption) mdxLines.push(`  caption="${escMdxAttr(it.caption)}"`);
  if (isHero) {
    mdxLines.push(`  priority`);
    mdxLines.push(`  fetchPriority="high"`);
  } else {
    mdxLines.push(`  loading="lazy"`);
  }
  mdxLines.push("/>");
  mdxLines.push("```");
  mdxLines.push("");
}
mdxLines.push("## 4. `ImageObject` 结构化数据片段（JSON-LD）");
mdxLines.push("");
mdxLines.push("```json");
mdxLines.push(JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  mainEntityOfPage: docMeta.pageUrl || `${baseOrigin}/blog/${docMeta.articleSlug}/`,
  image: imageObjectsJsonLd,
}, null, 2));
mdxLines.push("```");
mdxLines.push("");

const mdxPath = path.join(outputDir, "mdx-snippets.md");
fs.writeFileSync(mdxPath, mdxLines.join("\n"), "utf8");

// ---------- Build interactive 4-context SEO & Mobile-340px Preview HTML ----------
const cardsHtml = manifestItems.map(it => {
  const imgRel = it.webpFile || it.masterPng;
  const cwvClass = it.cwvPass ? "ok" : "err";
  const cwvText = it.cwvPass
    ? `CWV PASS · ${it.webpKB ?? it.masterKB} KB / ≤${it.cwvBudgetKB} KB`
    : `CWV OVER · ${it.webpKB ?? it.masterKB} KB > ${it.cwvBudgetKB} KB`;
  const isOg = it.ratio === "og" || it.recipe === "W06";

  const serpBlock = isOg
    ? `<div class="og-preview-card">
         <div class="og-preview-img"><img src="${escHtml(imgRel)}" alt=""></div>
         <div class="og-preview-meta">
           <div class="og-host">MEIXIPRO.COM</div>
           <div class="og-title">${escHtml(it.headingText || docMeta.title)}</div>
           <div class="og-desc">${escHtml(it.alt)}</div>
         </div>
       </div>`
    : `<div class="serp-stack">
         <div class="serp-card">
           <div class="serp-label">Google SERP 120px 方形缩略图</div>
           <div class="serp-row">
             <div class="serp-copy">
               <div class="serp-site">meixipro.com › blog › ${escHtml(docMeta.articleSlug)}</div>
               <div class="serp-link">${escHtml(it.headingText || it.targetKeyword || it.id)}</div>
               <div class="serp-snip">${escHtml(it.caption || it.alt)}</div>
             </div>
             <div class="serp-thumb"><img src="${escHtml(imgRel)}" alt=""></div>
           </div>
         </div>
         <div class="discover-card">
           <div class="serp-label">${it === heroItem ? "Google Discover 大图流 (≥1200px)" : "Google Images 图片包卡片"}</div>
           <div class="discover-img"><img src="${escHtml(imgRel)}" alt=""></div>
           <div class="discover-title">${escHtml(it.headingText || it.alt)}</div>
         </div>
       </div>`;

  return `
  <article class="inspect-row">
    <div class="row-head">
      <div class="row-title">
        <span class="badge blue">${escHtml(it.recipe)}</span>
        <span class="badge mono">${escHtml(it.ratio)} · ${it.width}×${it.height}</span>
        <span class="badge ${cwvClass}">${escHtml(cwvText)}</span>
        ${it.discoverReady ? '<span class="badge ok">Discover ≥1200px</span>' : '<span class="badge warn">&lt;1200px</span>'}
        ${it.jpgFile ? `<span class="badge mono">OG JPG ${it.jpgKB} KB</span>` : ""}
      </div>
      <div class="row-slug">${escHtml(it.publicUrl)}</div>
    </div>

    <div class="surfaces">
      <div class="surface-desktop">
        <div class="surface-cap">1. 官网桌面正文实景（688px 宽 · 纯白 #FFFFFF 文章卡片内）</div>
        <div class="article-white-card">
          <div class="mock-h2">${escHtml(it.headingText || it.targetKeyword || it.id)}</div>
          <div class="desktop-img-wrap ratio-${escHtml(it.ratio)}">
            <img src="${escHtml(imgRel)}" alt="${escHtml(it.alt)}">
          </div>
          ${it.caption ? `<div class="mock-caption">${escHtml(it.caption)}</div>` : ""}
        </div>
      </div>

      <div class="surface-mobile">
        <div class="surface-cap">2. 手机 340px 移动优先实测（21% 缩放无放大可读性）</div>
        <div class="phone-frame">
          <div class="phone-bar">meixipro.com · Mobile 340px</div>
          <div class="phone-body">
            <div class="phone-img"><img src="${escHtml(imgRel)}" alt=""></div>
            <div class="phone-cap">${escHtml(it.caption || it.alt)}</div>
          </div>
        </div>
      </div>

      <div class="surface-serp">
        <div class="surface-cap">3. ${isOg ? "社交外链 OpenGraph 卡片预览" : "Google SERP / Discover / Image Pack 预览"}</div>
        ${serpBlock}
      </div>
    </div>

    <div class="seo-meta-grid">
      <div><span class="k">Target Keyword</span><span class="v">${escHtml(it.targetKeyword || "（未填）")}</span></div>
      <div><span class="k">Alt (${it.alt.length} chars)</span><span class="v">${escHtml(it.alt || "（未填）")}</span></div>
      <div><span class="k">Caption</span><span class="v">${escHtml(it.caption || "（未填）")}</span></div>
      <div><span class="k">Loading / Schema</span><span class="v mono">loading="${escHtml(it.loading)}" · fetchPriority="${escHtml(it.fetchPriority)}" · ${escHtml(it.schemaType)}</span></div>
    </div>
  </article>`;
}).join("\n");

const previewHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>官网配图 SEO &amp; 340px 验图台 · ${escHtml(docMeta.articleSlug)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F1F5F9; color: #0F172A; font-family: "Noto Sans SC", "PingFang SC", -apple-system, sans-serif; padding: 28px; }
  .wrap { max-width: 1540px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
  .topbar { background: #0F172A; color: #F8FAFC; border-radius: 14px; padding: 20px 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
  .topbar h1 { font-size: 22px; font-weight: 700; }
  .topbar .sub { font-size: 13px; color: #94A3B8; margin-top: 4px; font-family: ui-monospace, SFMono-Regular, monospace; }
  .kpis { display: flex; gap: 14px; flex-wrap: wrap; }
  .kpi { background: #1E293B; border: 1px solid #334155; border-radius: 10px; padding: 10px 16px; min-width: 130px; }
  .kpi .num { font-size: 20px; font-weight: 800; color: #38BDF8; font-family: ui-monospace, monospace; }
  .kpi .lbl { font-size: 12px; color: #CBD5E1; margin-top: 2px; }
  .inspect-row { background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 18px; }
  .row-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; }
  .row-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .row-slug { font-family: ui-monospace, monospace; font-size: 13px; color: #0060C9; font-weight: 600; }
  .badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
  .badge.blue { background: #EFF6FF; color: #0060C9; border: 1px solid #BFDBFE; }
  .badge.mono { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; font-family: ui-monospace, monospace; }
  .badge.ok { background: #ECFDF5; color: #064E3B; border: 1px solid #A7F3D0; }
  .badge.warn { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .badge.err { background: #FEF2F2; color: #7F1D1D; border: 1px solid #FECACA; }
  .surfaces { display: grid; grid-template-columns: 736px 368px 1fr; gap: 20px; align-items: start; }
  .surface-cap { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; }
  .article-white-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px 24px; box-shadow: 0 2px 10px rgba(15,23,42,.04); }
  .mock-h2 { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 14px; }
  .desktop-img-wrap { width: 688px; }
  .desktop-img-wrap.ratio-square { width: 420px; margin: 0 auto; }
  .desktop-img-wrap.ratio-tall { width: 320px; margin: 0 auto; }
  .desktop-img-wrap img { width: 100%; height: auto; display: block; border-radius: 8px; }
  .mock-caption { margin-top: 10px; font-size: 13px; color: #64748B; text-align: center; }
  .phone-frame { width: 368px; background: #F8FAFC; border: 2px solid #94A3B8; border-radius: 22px; overflow: hidden; }
  .phone-bar { background: #0F172A; color: #E2E8F0; font-size: 12px; font-family: ui-monospace, monospace; padding: 8px 14px; text-align: center; }
  .phone-body { background: #FFFFFF; padding: 12px; }
  .phone-img { width: 340px; }
  .phone-img img { width: 100%; height: auto; display: block; border-radius: 6px; }
  .phone-cap { margin-top: 8px; font-size: 12px; color: #64748B; line-height: 1.45; }
  .serp-stack { display: flex; flex-direction: column; gap: 14px; }
  .serp-card, .discover-card, .og-preview-card { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; padding: 12px; }
  .serp-label { font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 8px; }
  .serp-row { display: grid; grid-template-columns: 1fr 104px; gap: 12px; align-items: center; }
  .serp-site { font-size: 11px; color: #475569; margin-bottom: 3px; }
  .serp-link { font-size: 14px; font-weight: 700; color: #1A0DAB; line-height: 1.3; margin-bottom: 4px; }
  .serp-snip { font-size: 12px; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .serp-thumb { width: 104px; height: 104px; border-radius: 8px; overflow: hidden; border: 1px solid #CBD5E1; }
  .serp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .discover-img { width: 100%; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; border: 1px solid #CBD5E1; background: #FFFFFF; }
  .discover-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .discover-title { margin-top: 8px; font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.35; }
  .og-preview-card { padding: 0; overflow: hidden; }
  .og-preview-img { width: 100%; aspect-ratio: 1200/630; overflow: hidden; border-bottom: 1px solid #CBD5E1; }
  .og-preview-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .og-preview-meta { padding: 12px 14px; background: #FFFFFF; }
  .og-host { font-size: 11px; color: #64748B; font-family: ui-monospace, monospace; }
  .og-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 4px 0; }
  .og-desc { font-size: 12px; color: #475569; line-height: 1.4; }
  .seo-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 13px; }
  .seo-meta-grid .k { display: block; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 2px; }
  .seo-meta-grid .v { color: #0F172A; line-height: 1.4; }
  .seo-meta-grid .v.mono { font-family: ui-monospace, monospace; font-size: 12px; }
</style>
</head>
<body>
<div class="wrap">
  <header class="topbar">
    <div>
      <h1>官网配图 SEO &amp; 移动优先实测验图台</h1>
      <div class="sub">articleSlug=${escHtml(docMeta.articleSlug)} · prefix=${escHtml(publicPrefix)} · fonts=[${escHtml(docMeta.loadedFonts.join(", "))}]</div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="num">${manifestItems.length}</div><div class="lbl">配图总数</div></div>
      <div class="kpi"><div class="num">${totalWebpKB} KB</div><div class="lbl">WebP 总体积</div></div>
      <div class="kpi"><div class="num">${budgetPassCount}/${manifestItems.length}</div><div class="lbl">CWV 体积达标</div></div>
      <div class="kpi"><div class="num">${discoverReadyCount}/${manifestItems.length}</div><div class="lbl">Discover ≥1200px</div></div>
    </div>
  </header>

  ${cardsHtml}
</div>
</body>
</html>
`;

const previewHtmlPath = path.join(workDir, outPreviewName);
fs.writeFileSync(previewHtmlPath, previewHtml, "utf8");

let previewPngPath = null;
if (doScreenshot) {
  const prevCtx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
  });
  const prevPage = await prevCtx.newPage();
  await prevPage.goto("file://" + previewHtmlPath, { waitUntil: "networkidle" });
  await prevPage.waitForTimeout(600);
  previewPngPath = path.join(outputDir, "web-seo-preview.png");
  await prevPage.screenshot({ path: previewPngPath, fullPage: true });
  await prevCtx.close();
}

await browser.close();

console.log(`==== build-web-seo-pack ====`);
console.log(`target:    ${path.relative(process.cwd(), indexPath)}`);
console.log(`fonts:     ${docMeta.loadedFonts.join(", ") || "(none detected)"}`);
console.log(`cwebp:     ${CWEBP_BIN || "not found (kept PNG)"}`);
console.log(`images:    ${manifestItems.length}  ·  WebP total ${totalWebpKB} KB  ·  CWV ${budgetPassCount}/${manifestItems.length}  ·  Discover ${discoverReadyCount}/${manifestItems.length}`);
for (const it of manifestItems) {
  const sz = it.webpKB != null ? `${it.webpKB}KB webp(q${it.webpQuality})` : `${it.masterKB}KB png`;
  const jpgNote = it.jpgKB != null ? ` + ${it.jpgKB}KB jpg` : "";
  console.log(`  [${it.cwvPass ? "PASS" : "OVER"}] ${it.recipe} ${it.width}×${it.height}  ${it.filename}  (${sz}${jpgNote}, budget ≤${it.cwvBudgetKB}KB)`);
}
console.log(`manifest:  ${path.relative(process.cwd(), manifestPath)}`);
console.log(`snippets:  ${path.relative(process.cwd(), mdxPath)}`);
console.log(`preview:   ${path.relative(process.cwd(), previewHtmlPath)}`);
if (previewPngPath) console.log(`snapshot:  ${path.relative(process.cwd(), previewPngPath)}`);

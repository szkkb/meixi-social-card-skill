#!/usr/bin/env node
/*
 * scripts/build-feed-preview.mjs
 *
 * 生成「小红书真双列 180px 信息流验图台 + A/B 封面 PK 对比台」。
 *
 * 用法：
 *   node scripts/build-feed-preview.mjs <task-dir> [--out=feed-preview.html] [--screenshot]
 *
 * 功能：
 *   1. 自动解析 <task-dir>/index.html 里所有封面卡（data-role="cover" / X01 / C02-C05 / #xhs-01），
 *      读取其 data-recipe、data-surface（photo|video）、data-feed-title 以及 output/ 下的对应 PNG。
 *   2. 将你的候选封面混排进真实的 180px 双列小红书手机信息流（左右夹杂高饱和/高对比模拟邻卡），
 *      真实还原：右上角视频播放圆标 / 多图角标、底部 2 行外显标题、头像昵称点赞栏。
 *   3. 内置交互工具：
 *      - 图文模式 / 视频模式 / 自动模式切换（实时叠加右上角播放标）
 *      - 安全区 X 光透视（右上角 230×210 播放标禁区 + 1:1 个人主页裁切安全框 + 底部 120px 边缘缓冲）
 *      - 0.6 秒闪看测试（Paddy Galloway Glance Test）
 *      - 并排 360px PK 视图 + 封面字/外显标题重合度提示
 *   4. 加 --screenshot 时，调用 Playwright 导出 <task-dir>/output/feed-preview-180px.png 供模型或人直接验图。
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const MACOS_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = process.argv.slice(2);
let taskDirArg = null;
let outName = "feed-preview.html";
let doScreenshot = false;

for (const a of args) {
  if (a.startsWith("--out=")) outName = a.slice(6);
  else if (a === "--screenshot") doScreenshot = true;
  else if (!taskDirArg) taskDirArg = a;
}

if (!taskDirArg) {
  console.error("usage: node scripts/build-feed-preview.mjs <task-dir> [--out=feed-preview.html] [--screenshot]");
  process.exit(2);
}

const taskDir = path.resolve(taskDirArg);
const indexPath = path.join(taskDir, "index.html");
const outputDir = path.join(taskDir, "output");

if (!fs.existsSync(indexPath)) {
  console.error(`not found: ${indexPath}`);
  process.exit(2);
}

const htmlRaw = fs.readFileSync(indexPath, "utf8");

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(s) {
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normChars(s) {
  return String(s || "").replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "").toLowerCase();
}

function calcOverlap(coverText, feedTitle) {
  const a = [...new Set(normChars(coverText))];
  const bSet = new Set(normChars(feedTitle));
  if (!a.length || !bSet.size) return 0;
  let hits = 0;
  for (const ch of a) if (bSet.has(ch)) hits += 1;
  return Math.round((hits / a.length) * 100);
}

// Parse <section ...> blocks from index.html (ignoring HTML comments)
const htmlNoComments = htmlRaw.replace(/<!--[\s\S]*?-->/g, "");
const sectionRegex = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
const parsedSections = [];
let m;
while ((m = sectionRegex.exec(htmlNoComments)) !== null) {
  const attrs = m[1];
  const inner = m[2];
  const getAttr = (name) => {
    const r = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(attrs);
    return r ? r[1] : "";
  };
  const id = getAttr("id");
  const cls = getAttr("class");
  const recipe = getAttr("data-recipe");
  const role = getAttr("data-role");
  const surface = getAttr("data-surface") || "photo";
  const feedTitle = getAttr("data-feed-title");
  const isCardOrPoster = /\b(card|poster)\b/.test(cls);
  if (!isCardOrPoster) continue;
  const h1Match = /<(?:h1|h2)\b[^>]*>([\s\S]*?)<\/(?:h1|h2)>/i.exec(inner);
  const headline = h1Match ? stripTags(h1Match[1]) : "";
  const isCover =
    role === "cover" ||
    /^C0[1-9]$/i.test(recipe) ||
    recipe === "X01" ||
    id === "xhs-01" ||
    (parsedSections.length === 0 && /\bxhs\b/.test(cls));
  parsedSections.push({ id, cls, recipe, role, surface, feedTitle, headline, isCover });
}

const covers = parsedSections.filter((s) => s.isCover);
const pngFiles = fs.existsSync(outputDir)
  ? fs.readdirSync(outputDir).filter((f) => /\.png$/i.test(f) && !f.startsWith("feed-preview")).sort()
  : [];

function findPngForCover(cover, idx) {
  if (!pngFiles.length) return null;
  const idLow = (cover.id || "").toLowerCase();
  const recLow = (cover.recipe || "").toLowerCase();
  // 1. Exact id match
  let hit = pngFiles.find((f) => f.toLowerCase() === `${idLow}.png`);
  // 2. Starts with id
  if (!hit && idLow) hit = pngFiles.find((f) => f.toLowerCase().startsWith(idLow));
  // 3. Contains recipe code (e.g. c02, x01)
  if (!hit && recLow) hit = pngFiles.find((f) => f.toLowerCase().includes(recLow));
  // 4. Fallback by order for cover files
  if (!hit) {
    const coverFiles = pngFiles.filter((f) => /cover|xhs-01|c0[1-9]/i.test(f));
    if (coverFiles[idx]) hit = coverFiles[idx];
  }
  if (!hit && pngFiles[idx]) hit = pngFiles[idx];
  return hit ? `output/${hit}` : null;
}

const coverItems = covers.map((c, idx) => {
  const imgRel = findPngForCover(c, idx);
  const feedTitle = c.feedTitle || "（未填写 data-feed-title：请补充与封面字互补的外显标题）";
  const overlapPct = c.feedTitle ? calcOverlap(c.headline, c.feedTitle) : null;
  return {
    ...c,
    label: `方案 ${String.fromCharCode(65 + idx)} · ${c.recipe || c.id || `#${idx + 1}`}`,
    imgRel,
    feedTitle,
    overlapPct,
  };
});

// Realistic noisy Xiaohongshu neighbor cards to stress-test visual pop at 180px
const NEIGHBORS = [
  {
    bg: "linear-gradient(155deg,#2b1c14 0%,#7a4a2b 58%,#1d130d 100%)",
    pill: "家居爆改",
    headline: "5万装出<br><span style='color:#FFE45E'>原木奶油风</span>",
    title: "被邻居问爆的客厅布局，小户型显大一倍的3个尺寸秘密",
    author: "阿宁住新家",
    likes: "1.2万",
    video: false,
  },
  {
    bg: "linear-gradient(160deg,#16272e 0%,#2e5e56 54%,#0e191d 100%)",
    pill: "北美留学",
    headline: "落地第一周<br><span style='color:#C6FF5E'>省下$800</span>",
    title: "新生别乱买！在美国沃尔玛和Costco这样配清单最省钱",
    author: "Mia在加州",
    likes: "4829",
    video: true,
  },
  {
    bg: "linear-gradient(150deg,#3d1018 0%,#9b2232 55%,#1f080d 100%)",
    pill: "避坑实测",
    headline: "花3千买教训<br><span style='color:#FFD54F'>千万别踩！</span>",
    title: "买了6款网红收纳箱全部实测，只有第2款真的能承重不塌",
    author: "居家测评局",
    likes: "8631",
    video: true,
  },
  {
    bg: "linear-gradient(155deg,#232635 0%,#4e5879 58%,#141620 100%)",
    pill: "搬家整理",
    headline: "28寸行李箱<br><span style='color:#93C5FD'>塞下四季衣</span>",
    title: "留学生跨国打包封神技巧，抽真空这样叠一点不超重",
    author: "小周去纽约",
    likes: "3190",
    video: false,
  },
];

function renderNeighborCard(n) {
  const badgeHtml = n.video
    ? `<span class="xhs-badge video" title="视频播放标"><svg viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" fill="#fff"/></svg></span>`
    : `<span class="xhs-badge photo">1/6</span>`;
  return `
    <article class="feed-card neighbor">
      <div class="thumb" style="background:${n.bg}">
        <div class="n-inner">
          <span class="n-pill">${n.pill}</span>
          <div class="n-title">${n.headline}</div>
        </div>
        ${badgeHtml}
      </div>
      <div class="feed-meta">
        <p class="feed-title">${escHtml(n.title)}</p>
        <div class="feed-foot">
          <span class="author"><i class="ava"></i>${escHtml(n.author)}</span>
          <span class="likes">♡ ${n.likes}</span>
        </div>
      </div>
    </article>`;
}

function renderCandidateCard(item, idx, isPk = false) {
  const isVideo = item.surface === "video";
  const surfaceAttr = isVideo ? "video" : "photo";
  const overlapClass = item.overlapPct === null ? "warn" : item.overlapPct >= 50 ? "bad" : item.overlapPct >= 35 ? "warn" : "ok";
  const overlapLabel =
    item.overlapPct === null
      ? "缺外显标题"
      : `封面/标题重合 ${item.overlapPct}%`;

  const imgHtml = item.imgRel
    ? `<img src="${escHtml(item.imgRel)}" alt="${escHtml(item.label)}">`
    : `<div class="missing-img">未找到输出 PNG<br>请先渲染 #${escHtml(item.id)}</div>`;

  const badgeHtml = `
    <span class="xhs-badge video" title="视频播放标"><svg viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" fill="#fff"/></svg></span>
    <span class="xhs-badge photo" title="多图角标">1/6</span>`;

  const overlayHtml = `
    <div class="safe-overlay">
      <div class="zone-tr"><span>UI 禁区<br>230×210</span></div>
      <div class="zone-1x1"><span>1:1 主页安全框</span></div>
      <div class="zone-bot"><span>底边缓冲 120px</span></div>
    </div>`;

  if (isPk) {
    return `
      <article class="pk-card" data-surface="${surfaceAttr}">
        <div class="pk-head">
          <span class="pk-tag">${escHtml(item.label)}</span>
          <span class="pk-chip ${surfaceAttr}">${isVideo ? "视频封面" : "图文封面"}</span>
          <span class="pk-chip ${overlapClass}">${overlapLabel}</span>
        </div>
        <div class="thumb pk-thumb">
          ${imgHtml}
          ${badgeHtml}
          ${overlayHtml}
        </div>
        <div class="pk-info">
          <div class="pk-row"><strong>封面大字：</strong>${escHtml(item.headline || "（无 h1/h2）")}</div>
          <div class="pk-row"><strong>外显标题：</strong>${escHtml(item.feedTitle)}</div>
        </div>
      </article>`;
  }

  return `
    <article class="feed-card candidate" data-surface="${surfaceAttr}">
      <div class="cand-ribbon">${escHtml(item.label)}</div>
      <div class="thumb">
        ${imgHtml}
        ${badgeHtml}
        ${overlayHtml}
      </div>
      <div class="feed-meta">
        <p class="feed-title">${escHtml(item.feedTitle)}</p>
        <div class="feed-foot">
          <span class="author"><i class="ava brand"></i>杨美西转运</span>
          <span class="likes">♡ 268</span>
        </div>
      </div>
    </article>`;
}

// Interleave candidates into 2 realistic mobile columns (left / right)
const leftCol = [];
const rightCol = [];
const stream = [];
coverItems.forEach((item, i) => {
  if (i === 0) stream.push({ type: "neighbor", data: NEIGHBORS[0] });
  stream.push({ type: "cand", data: item, idx: i });
  if (NEIGHBORS[i + 1]) stream.push({ type: "neighbor", data: NEIGHBORS[i + 1] });
});
if (stream.length === 0) {
  NEIGHBORS.forEach((n) => stream.push({ type: "neighbor", data: n }));
}
stream.forEach((entry, i) => {
  const html = entry.type === "cand" ? renderCandidateCard(entry.data, entry.idx, false) : renderNeighborCard(entry.data);
  if (i % 2 === 0) leftCol.push(html);
  else rightCol.push(html);
});

const pkCardsHtml = coverItems.map((item, i) => renderCandidateCard(item, i, true)).join("\n");

const outHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>小红书 180px 真双列信息流验图台 · ${escHtml(path.basename(taskDir))}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root {
    --bg: #F3F2EE;
    --panel: #FFFFFF;
    --ink: #1A1D26;
    --muted: #646B7A;
    --blue: #0060C9;
    --red: #E53935;
    --border: #E2E0D8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", sans-serif;
    padding: 24px 28px 60px;
  }
  header {
    max-width: 1480px;
    margin: 0 auto 22px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  h1 { font-size: 20px; font-weight: 800; }
  .sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; }
  .btn {
    border: 1.5px solid var(--border);
    background: var(--panel);
    color: var(--ink);
    padding: 8px 13px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }
  .btn.danger { border-color: #FCA5A5; color: #B91C1C; }
  .btn.danger.active { background: var(--red); border-color: var(--red); color: #fff; }

  .workspace {
    max-width: 1480px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 410px 1fr;
    gap: 28px;
    align-items: start;
  }
  @media (max-width: 1020px) {
    .workspace { grid-template-columns: 1fr; }
  }

  /* 真实 390px iPhone 小红书发现页双列容器（每列精确 180px） */
  .phone-wrap {
    background: #14161D;
    border-radius: 34px;
    padding: 12px;
    box-shadow: 0 22px 50px rgba(0,0,0,.22);
    width: 410px;
  }
  .phone-screen {
    background: #F6F6F6;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
  }
  .xhs-nav {
    background: #FFFFFF;
    padding: 14px 16px 10px;
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 15px;
    font-weight: 600;
    color: #999;
    border-bottom: 1px solid #EFEFEF;
  }
  .xhs-nav .on {
    color: #1A1A1A;
    font-weight: 800;
    position: relative;
  }
  .xhs-nav .on::after {
    content: "";
    position: absolute;
    left: 20%;
    right: 20%;
    bottom: -6px;
    height: 2.5px;
    background: #FF2442;
    border-radius: 2px;
  }
  .feed-grid {
    display: grid;
    grid-template-columns: 180px 180px;
    gap: 8px;
    padding: 8px 9px 18px;
    justify-content: center;
  }
  .feed-col { display: flex; flex-direction: column; gap: 10px; }

  .feed-card {
    background: #FFFFFF;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
  }
  .feed-card.candidate {
    outline: 2px solid var(--blue);
    outline-offset: -1px;
  }
  .cand-ribbon {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 20;
    background: var(--blue);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    border-bottom-right-radius: 6px;
    opacity: 0.92;
  }
  body.clean-feed .feed-card.candidate { outline: none; }
  body.clean-feed .cand-ribbon { display: none; }

  .thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: #DDD;
  }
  .thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .missing-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 12px;
    font-size: 12px;
    color: #666;
    background: #ECEAE3;
  }

  /* 模拟邻卡视觉 */
  .n-inner {
    position: absolute;
    inset: 0;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .n-pill {
    align-self: flex-start;
    background: rgba(0,0,0,.52);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 4px;
  }
  .n-title {
    color: #fff;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.15;
    text-shadow: 0 2px 8px rgba(0,0,0,.55);
  }

  /* 小红书右上角真实 UI 角标（视频播放标 / 多图角标） */
  .xhs-badge {
    position: absolute;
    right: 8px;
    top: 8px;
    z-index: 12;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .xhs-badge.video {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.45);
  }
  .xhs-badge.video svg { width: 12px; height: 12px; margin-left: 1px; }
  .xhs-badge.photo {
    padding: 2px 6px;
    border-radius: 99px;
    background: rgba(0, 0, 0, 0.42);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
  }
  /* 默认按卡片自身 data-surface 渲染；可通过 body class 强制全视频 / 全图文压测 */
  .feed-card[data-surface="video"] .xhs-badge.video,
  .pk-card[data-surface="video"] .xhs-badge.video { display: inline-flex; }
  .feed-card[data-surface="photo"] .xhs-badge.photo,
  .pk-card[data-surface="photo"] .xhs-badge.photo { display: inline-flex; }
  .neighbor .xhs-badge { display: inline-flex; }

  body.force-video .xhs-badge.video { display: inline-flex !important; }
  body.force-video .xhs-badge.photo { display: none !important; }
  body.force-photo .xhs-badge.photo { display: inline-flex !important; }
  body.force-photo .xhs-badge.video { display: none !important; }

  /* 安全区 X 光透视层：默认只在右侧 PK 台开启，左侧 180px 真机保持纯净观感（点按钮可全开/全关） */
  .safe-overlay {
    position: absolute;
    inset: 0;
    z-index: 15;
    pointer-events: none;
    display: none;
  }
  body.safe-pk .pk-panel .safe-overlay { display: block; }
  body.safe-all .safe-overlay { display: block; }
  .zone-tr {
    position: absolute;
    right: 0;
    top: 0;
    width: 21.3%;   /* 230 / 1080 */
    height: 14.6%;  /* 210 / 1440 */
    background: rgba(229, 57, 53, 0.42);
    border-left: 1.5px dashed #FF2442;
    border-bottom: 1.5px dashed #FF2442;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #fff;
    font-size: 9px;
    font-weight: 800;
    line-height: 1.15;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
  }
  .zone-1x1 {
    position: absolute;
    left: 0;
    right: 0;
    top: 12.5%;     /* 180 / 1440 */
    bottom: 12.5%;  /* 180 / 1440 */
    border-top: 1.5px dashed rgba(0, 96, 201, 0.92);
    border-bottom: 1.5px dashed rgba(0, 96, 201, 0.92);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 3px 6px;
  }
  .zone-1x1 span {
    background: rgba(0, 96, 201, 0.84);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
  }
  .zone-bot {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 8.33%;  /* 120 / 1440 */
    background: rgba(245, 158, 11, 0.34);
    border-top: 1px dashed #F59E0B;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 9px;
    font-weight: 800;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
  }

  .feed-meta { padding: 7px 8px 9px; }
  .feed-title {
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.35;
    color: #1E1E1E;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 33px;
  }
  .feed-foot {
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10.5px;
    color: #777;
  }
  .author { display: inline-flex; align-items: center; gap: 4px; }
  .ava {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #CBD5E1;
    display: inline-block;
  }
  .ava.brand { background: var(--blue); }

  /* 0.6s 闪看遮罩 */
  .glance-veil {
    position: absolute;
    inset: 0;
    z-index: 30;
    background: #FFFFFF;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 24px;
  }
  .glance-veil.on { display: flex; }
  .glance-veil h3 { font-size: 17px; }
  .glance-veil p { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* 右侧：PK 大图审阅与双轨检查台 */
  .pk-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
  }
  .pk-panel h2 { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
  .pk-panel .hint { font-size: 12.5px; color: var(--muted); margin-bottom: 16px; }
  .pk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
  .pk-card {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: #FAFAF8;
  }
  .pk-head {
    padding: 10px 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid var(--border);
    background: #fff;
  }
  .pk-tag { font-size: 12px; font-weight: 800; color: var(--ink); margin-right: auto; }
  .pk-chip {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
  }
  .pk-chip.video { background: #FEE2E2; color: #B91C1C; }
  .pk-chip.photo { background: #E0F2FE; color: #0369A1; }
  .pk-chip.ok { background: #DCFCE7; color: #166534; }
  .pk-chip.warn { background: #FEF3C7; color: #92400E; }
  .pk-chip.bad { background: #FEE2E2; color: #991B1B; }
  .pk-thumb .xhs-badge.video { width: 34px; height: 34px; right: 12px; top: 12px; }
  .pk-thumb .xhs-badge.video svg { width: 17px; height: 17px; }
  .pk-thumb .xhs-badge.photo { font-size: 12px; padding: 3px 9px; right: 12px; top: 12px; }
  .pk-thumb .zone-tr, .pk-thumb .zone-1x1 span, .pk-thumb .zone-bot { font-size: 11px; }
  .pk-info { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 6px; font-size: 12px; line-height: 1.45; }
  .pk-row strong { color: var(--muted); }
</style>
</head>
<body class="safe-pk">
  <header>
    <div>
      <h1>小红书 180px 真双列信息流验图台 · ${escHtml(path.basename(taskDir))}</h1>
      <p class="sub">共载入 ${coverItems.length} 套候选封面 · 左侧严格按 iPhone 双列 180px 纯净真机观感混排邻卡，右侧叠加安全区透视与封面/外显标题双轨校验</p>
    </div>
    <div class="toolbar">
      <button class="btn active" id="btnAuto" onclick="setSurface('auto')">按卡片默认（图文/视频）</button>
      <button class="btn" id="btnVideo" onclick="setSurface('video')">全切视频播放标压测</button>
      <button class="btn" id="btnPhoto" onclick="setSurface('photo')">全切图文角标</button>
      <button class="btn danger active" id="btnSafe" onclick="cycleSafe()">安全区透视：仅 PK 台</button>
      <button class="btn" id="btnClean" onclick="toggleClean()">隐藏蓝框纯净看</button>
      <button class="btn" onclick="runGlanceTest()">⚡ 0.6 秒闪看测试</button>
    </div>
  </header>

  <main class="workspace">
    <section class="phone-wrap">
      <div class="phone-screen">
        <div class="xhs-nav">
          <span>关注</span>
          <span class="on">发现</span>
          <span>附近</span>
        </div>
        <div class="feed-grid">
          <div class="feed-col">${leftCol.join("")}</div>
          <div class="feed-col">${rightCol.join("")}</div>
        </div>
        <div class="glance-veil" id="glanceVeil">
          <h3>0.6 秒闪看结束</h3>
          <p>刚才第一眼你记住的是哪张封面？<br>如果看不清主钩子或被邻卡盖住，说明冲击力还不够。</p>
          <button class="btn active" onclick="document.getElementById('glanceVeil').classList.remove('on')">恢复画面</button>
        </div>
      </div>
    </section>

    <section class="pk-panel">
      <h2>A/B 候选封面 PK 台（安全区 + 双轨标题核对）</h2>
      <p class="hint">可直接把优胜的 2–3 版 PNG 上传小红书创作服务平台「封面测试 / 封面 PK」，让真实小流量投票选最高 CTR。</p>
      <div class="pk-grid">
        ${pkCardsHtml || "<p>未在 index.html 中找到标记为封面的 section。</p>"}
      </div>
    </section>
  </main>

<script>
  function setSurface(mode) {
    document.body.classList.remove('force-video', 'force-photo');
    ['btnAuto', 'btnVideo', 'btnPhoto'].forEach(id => document.getElementById(id).classList.remove('active'));
    if (mode === 'video') {
      document.body.classList.add('force-video');
      document.getElementById('btnVideo').classList.add('active');
    } else if (mode === 'photo') {
      document.body.classList.add('force-photo');
      document.getElementById('btnPhoto').classList.add('active');
    } else {
      document.getElementById('btnAuto').classList.add('active');
    }
  }
  let safeState = 'pk'; // pk -> all -> off
  function cycleSafe() {
    document.body.classList.remove('safe-pk', 'safe-all');
    const btn = document.getElementById('btnSafe');
    if (safeState === 'pk') {
      safeState = 'all';
      document.body.classList.add('safe-all');
      btn.classList.add('active');
      btn.textContent = '安全区透视：全开';
    } else if (safeState === 'all') {
      safeState = 'off';
      btn.classList.remove('active');
      btn.textContent = '安全区透视：关闭';
    } else {
      safeState = 'pk';
      document.body.classList.add('safe-pk');
      btn.classList.add('active');
      btn.textContent = '安全区透视：仅 PK 台';
    }
  }
  function toggleClean() {
    document.body.classList.toggle('clean-feed');
    document.getElementById('btnClean').classList.toggle('active');
  }
  function runGlanceTest() {
    const veil = document.getElementById('glanceVeil');
    veil.classList.remove('on');
    setTimeout(() => veil.classList.add('on'), 600);
  }
</script>
</body>
</html>
`;

const outHtmlPath = path.join(taskDir, outName);
fs.writeFileSync(outHtmlPath, outHtml, "utf8");
console.log(`Generated feed preview: ${outHtmlPath} (${coverItems.length} covers)`);

if (doScreenshot) {
  fs.mkdirSync(outputDir, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    browser = await chromium.launch({ executablePath: MACOS_CHROME });
  }
  const ctx = await browser.newContext({ viewport: { width: 1520, height: 1120 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("file://" + outHtmlPath, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const shotPath = path.join(outputDir, "feed-preview-180px.png");
  await page.screenshot({ path: shotPath, fullPage: true });
  await browser.close();
  console.log(`Saved feed preview screenshot: ${shotPath}`);
}

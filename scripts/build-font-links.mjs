#!/usr/bin/env node
/*
 * build-font-links.mjs — 花体字库的取用工具
 *
 *   node scripts/build-font-links.mjs list [--group brush|running|kai|sign|hand]

 *   node scripts/build-font-links.mjs links <选择器…>      # 输出可粘贴的 <link> 标签
 *   node scripts/build-font-links.mjs css   <选择器…>      # 输出含 --f-* 令牌与工具类的 <style> 块
 *   node scripts/build-font-links.mjs fetch <目录> <选择器…> # 下载 woff2 分片到本地（离线兜底）
 *   node scripts/build-font-links.mjs specimen <输出.html>   # 生成选字样张（同句横向对比）
 *
 * 选择器可以是字体 id、分组名，或 all / featured。
 *
 * 字体注册表真源：assets/font-library.json
 * 说明与选字规则：references/font-library.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(HERE, "..", "assets", "font-library.json");

function die(msg) {
  console.error(msg);
  process.exit(2);
}

const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
const byId = new Map(reg.fonts.map(f => [f.id, f]));
const FEATURED = reg.featured || [];
const TOKEN = Object.fromEntries(Object.keys(reg.groups).map(g => [g, g]));

function resolve(selectors) {
  const out = [];
  const seen = new Set();
  const push = f => {
    if (!seen.has(f.id)) {
      seen.add(f.id);
      out.push(f);
    }
  };
  for (const sel of selectors) {
    if (sel === "all") reg.fonts.forEach(push);
    else if (sel === "featured") FEATURED.forEach(id => byId.has(id) && push(byId.get(id)));
    else if (reg.groups[sel]) reg.fonts.filter(f => f.group === sel).forEach(push);
    else if (byId.has(sel)) push(byId.get(sel));
    else {
      const hit = reg.fonts.filter(f => f.zh.includes(sel) || f.family.toLowerCase() === sel.toLowerCase());
      if (!hit.length) die(`未知选择器：${sel}\n可用分组：${Object.keys(reg.groups).join(" / ")}，或字体 id（见 list），或 all / featured`);
      hit.forEach(push);
    }
  }
  return out;
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd) die("usage: build-font-links.mjs <list|links|css|fetch> …");

if (cmd === "list") {
  const gi = rest.indexOf("--group");
  const only = gi >= 0 ? rest[gi + 1] : null;
  for (const [g, meta] of Object.entries(reg.groups)) {
    if (only && only !== g) continue;
    const items = reg.fonts.filter(f => f.group === g);
    console.log(`\n## ${g} — ${meta.title} (${items.length})`);
    for (const f of items) {
      const star = FEATURED.includes(f.id) ? "★" : " ";
      console.log(`  ${star} ${f.id.padEnd(26)} ${f.zh.padEnd(14)} ${f.family.padEnd(34)} ${f.coverage} · ${f.license.name}`);
    }
  }
  console.log(`\n(${reg.fonts.length} 款，★ = 已默认内置于种子模板)`);
  process.exit(0);
}

if (cmd === "links") {
  if (!rest.length) die("usage: build-font-links.mjs links <选择器…>");
  const fonts = resolve(rest);
  console.log(`  <!-- 花体字库 · ${fonts.map(f => f.zh).join(" / ")} -->`);
  for (const f of fonts) {
    console.log(`  <link rel="stylesheet" href="${f.css}">`);
  }
  process.exit(0);
}

if (cmd === "css") {
  if (!rest.length) die("usage: build-font-links.mjs css <选择器…>");
  const fonts = resolve(rest);
  const lines = [];
  lines.push("  <!-- 花体字库 · 由 scripts/build-font-links.mjs 生成 -->");
  for (const f of fonts) lines.push(`  <link rel="stylesheet" href="${f.css}">`);
  lines.push("  <style>");
  lines.push("    :root {");
  const groupsUsed = [...new Set(fonts.map(f => f.group))];
  const defaults = reg.groupDefaults || {};
  for (const g of groupsUsed) {
    const f = byId.get(defaults[g]) || fonts.find(x => x.group === g);
    lines.push(`      --f-${TOKEN[g]}: "${f.family}", "Noto Serif SC", serif;`);
  }
  lines.push("      /* data-title-font 指向的封面用字，由 <html data-title-font=\"…\"> 消费 */");
  lines.push(`      --display-alt: var(--f-${TOKEN[groupsUsed[0]]});   /* 由 <html data-title-font="…"> 覆写 */`);
  lines.push("    }");
  for (const g of groupsUsed) lines.push(`    .f-${TOKEN[g]} { font-family: var(--f-${TOKEN[g]}); }`);
  lines.push("    .f-alt { font-family: var(--display-alt); }");
  lines.push("  </style>");
  console.log(lines.join("\n"));
  process.exit(0);
}

if (cmd === "specimen") {
  const outp = rest[0];
  if (!outp) die("usage: build-font-links.mjs specimen <输出.html>");
  const BIG = "春风得意";
  const SMALL = "人间值得，未来可期";
  const rows = Object.entries(reg.groups).map(([g, meta]) => {
    const items = reg.fonts.filter(f => f.group === g);
    const cards = items.map(f => `
    <div class="row">
      <div class="side">
        <div class="zh">${f.zh}</div>
        <div class="src">${f.source} · ${f.license.grade} · ${f.cjkCount} 字</div>
      </div>
      <div class="big" style="font-family:'${f.family}',serif">${BIG}</div>
      <div class="small" style="font-family:'${f.family}',serif">${SMALL}</div>
    </div>`).join("");
    return `
  <section class="group">
    <header><h2>${meta.title}<span class="n">${items.length}</span></h2><p>${meta.desc}</p></header>
    ${cards}
  </section>`;
  }).join("");
  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>花体字库样张 · ${reg.counts.total} 款</title>
${reg.fonts.map(f => `  <link rel="stylesheet" href="${f.css}">`).join("\n")}
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f4f1ea;color:#1c1a17;padding:56px 64px 72px;
       font-family:"PingFang SC","Noto Sans SC",-apple-system,sans-serif}
  .head{border-bottom:3px solid #1c1a17;padding-bottom:22px}
  .head h1{margin:0;font-size:44px}
  .head p{margin:10px 0 0;font-size:19px;color:#5c574e}
  .group{margin-top:54px}
  .group header{border-bottom:1px solid #c9c2b4;padding-bottom:12px;margin-bottom:6px}
  .group h2{margin:0;font-size:26px;display:flex;gap:14px;align-items:baseline}
  .group h2 .n{font-size:16px;color:#8a8377;font-weight:400}
  .group header p{margin:6px 0 0;font-size:15px;color:#6b6559}
  .row{display:grid;grid-template-columns:230px 1fr 470px;align-items:center;gap:32px;
       padding:20px 0;border-bottom:1px solid #e2ddd2}
  .side .zh{font-size:21px;font-weight:600;line-height:1.25}
  .side .src{font-size:13px;color:#8a8377;margin-top:5px}
  .big{font-size:82px;line-height:1.06;white-space:nowrap}
  .small{font-size:34px;line-height:1.2;color:#3d3931;white-space:nowrap}
</style></head><body>
<div class="head"><h1>花体字库样张 · Guizang Social Card</h1>
<p>${reg.counts.total} 款免费商用中文花体字 · 同句横向对比 · 大字 82px「${BIG}」· 小字 34px「${SMALL}」</p></div>
${rows}
</body></html>`;
  fs.writeFileSync(outp, html);
  console.log(`样张已写入 ${outp}（${reg.counts.total} 款）。用 Playwright 截图即可得到对比图。`);
  process.exit(0);
}

if (cmd === "fetch") {
  const dir = rest.shift();
  if (!dir || !rest.length) die("usage: build-font-links.mjs fetch <目录> <选择器…>");
  const fonts = resolve(rest);
  fs.mkdirSync(dir, { recursive: true });
  const manifest = [];
  for (const f of fonts) {
    // Google Fonts 的 CSS 只有在带浏览器 UA 时才返回按 unicode-range 分片的 woff2；
    // 不带 UA 会退化成单个大文件，离线包就失去"按需加载"的意义。
    const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
    const res = await fetch(f.css, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error(`  跳过 ${f.zh}：CSS ${res.status}`);
      continue;
    }
    let css = await res.text();
    const seen = new Map();
    const urls = [...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map(m => m[2]);
    // 分片地址可能是绝对 URL（Google Fonts）也可能是相对路径（中文网字计划的 result.css）。
    // 相对路径必须按 CSS 自身的地址解析，否则会全部 404 → 0 个分片。
    const jobs = [];
    let i = 0;
    for (const raw of new Set(urls)) {
      let u;
      try { u = new URL(raw, f.css).href; } catch { continue; }
      if (!/^https?:/.test(u)) continue;
      i += 1;
      const ext = (u.match(/\.(woff2?|ttf|otf)(\?|$)/) || [, "woff2"])[1];
      jobs.push({ raw, u, local: `${f.id}-${String(i).padStart(3, "0")}.${ext}` });
    }
    // 一个 CJK 字体有 100-600 个分片，串行下载要几分钟；并发 12 路把它压到可接受范围。
    const CONCURRENCY = 12;
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        try {
          const bin = await fetch(job.u, { headers: { "User-Agent": UA } });
          if (!bin.ok) continue;
          fs.writeFileSync(path.join(dir, job.local), Buffer.from(await bin.arrayBuffer()));
          seen.set(job.raw, job.local);
        } catch { /* 单块失败不整体失败，缺块会在渲染时表现为回退 */ }
      }
    }));
    for (const [remote, local] of seen) css = css.split(remote).join(`./${local}`);
    fs.writeFileSync(path.join(dir, `${f.id}.css`), css);
    manifest.push({ id: f.id, zh: f.zh, family: f.family, css: `${f.id}.css`, slices: seen.size });
    console.log(`  ✓ ${f.zh.padEnd(14)} ${seen.size} 个分片`);
  }
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ fonts: manifest }, null, 2) + "\n");
  console.log(`\n离线字体已写入 ${dir}（${manifest.length} 款，共 ${[...manifest].reduce((n, m) => n + m.slices, 0)} 个分片）。`);
  console.log(`在 index.html 里改用本地路径（把 ${dir} 放在任务目录下，路径相对 index.html）：`);
  for (const m of manifest) console.log(`  <link rel="stylesheet" href="${dir}/${m.css}">`);
  console.log(`\n注意：把字体文件随成品一起交付属于"再分发字体软件"。OFL 字体需随附版权行与 OFL.txt 全文，`);
  console.log(`      授权核验记录见 references/font-license-audit.md。`);
  process.exit(0);
}

die(`未知子命令：${cmd}`);

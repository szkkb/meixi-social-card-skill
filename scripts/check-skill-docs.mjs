#!/usr/bin/env node
import fs from "node:fs";

const checks = [];

function fileText(file) {
  return fs.readFileSync(file, "utf8");
}

function mustInclude(file, needle, label) {
  checks.push(() => {
    const ok = fileText(file).includes(needle);
    return {
      ok,
      label,
      detail: ok ? `${file} includes "${needle}"` : `${file} must include "${needle}"`,
    };
  });
}

function mustNotMatch(file, pattern, label) {
  checks.push(() => {
    const ok = !pattern.test(fileText(file));
    return {
      ok,
      label,
      detail: ok ? `${file} does not match ${pattern}` : `${file} must not match ${pattern}`,
    };
  });
}

mustInclude(
  "SKILL.md",
  "Generated work must live in a task folder, not in the skill root.",
  "root output guardrail in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "local-tests/<slug>/",
  "default task folder in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "Triple Live Photo",
  "triple Live Photo capability in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "material-first Live Photo puzzle layouts",
  "material-first puzzle capability in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "use the M16 Image-Led Cover / text-on-image rules",
  "single-video text uses M16 overlay rules",
);
mustInclude(
  "SKILL.md",
  "Do not invent extra kicker, meta, hairlines",
  "single-video text must not invent extra overlay copy",
);
mustInclude(
  "SKILL.md",
  "platform limits (`5s` Xiaohongshu, `3s` WeChat Official Account)",
  "platform publishing reminder in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "Audience-facing copy must describe the user's actual scene",
  "audience-facing copy guardrail in SKILL.md",
);
mustInclude(
  "SKILL.md",
  "Do not add non-template ornaments just to satisfy an automated density warning",
  "non-template ornament guardrail in SKILL.md",
);
mustNotMatch(
  "SKILL.md",
  /Create a task folder in the current workspace/,
  "no root-level task-folder instruction in SKILL.md",
);

mustInclude(
  "references/production-workflow.md",
  "Create a task folder under `local-tests/` by default",
  "production workflow uses local-tests",
);
mustInclude(
  "references/production-workflow.md",
  "Do not create generated task folders or rendered assets in the skill root",
  "production workflow forbids skill-root outputs",
);

mustInclude(
  "references/live-photo-production.md",
  "## Live Photo Information Budget",
  "Live Photo information budget section",
);
mustInclude(
  "references/live-photo-production.md",
  "## Triple Live Photo Collage",
  "triple collage section",
);
mustInclude(
  "references/live-photo-production.md",
  "## Material-First Puzzle Layouts",
  "material-first puzzle section",
);
mustInclude(
  "references/live-photo-production.md",
  "Do not render single-video text as generic subtitles.",
  "single-video text is not subtitle-style",
);
mustInclude(
  "references/live-photo-production.md",
  "Do not invent extra kicker, meta, hairlines",
  "single-video overlay must not invent extra copy",
);
mustInclude(
  "references/live-photo-production.md",
  "Four-grid",
  "four-grid puzzle guidance",
);
mustInclude(
  "references/live-photo-production.md",
  "## Long Video Intake",
  "long video intake section",
);
mustInclude(
  "references/live-photo-production.md",
  "Web-sourced free videos are only for making our own demo/promo cases",
  "user-supplied video is the normal path",
);
mustInclude(
  "references/live-photo-production.md",
  "Audience-facing copy should name the real scene in the video.",
  "Live Photo visible-copy guardrail",
);

mustInclude(
  "references/category-cookbook.md",
  "## Live Photo Scene Library",
  "category scene library section",
);
mustInclude(
  "references/category-cookbook.md",
  "This is not a fixed template list.",
  "category library stays heuristic",
);

mustInclude(
  "PRODUCT.md",
  "## 10. Live Photo 复盘（2026-07-01）",
  "product doc records Live Photo retrospective",
);
mustInclude(
  "PRODUCT.md",
  "把内部制作要求写成观众可见文案",
  "product doc records visible-copy failure mode",
);
mustInclude(
  "HANDOFF.md",
  "### v0.15 · 2026-07-01",
  "handoff records Live Photo version history",
);
mustInclude(
  "HANDOFF.md",
  "不要把制作要求当成观众可见内容",
  "handoff records Live Photo execution pitfall",
);

mustInclude(
  "DESIGN-xhs.md",
  "X01 真仓大片",
  "DESIGN-xhs defines X01 full-bleed cover as default",
);
mustInclude(
  "DESIGN-xhs.md",
  "X02 骑缝封箱",
  "DESIGN-xhs defines X02 seam-taped comparison recipe",
);
mustInclude(
  "DESIGN-xhs.md",
  "X03 国际提单",
  "DESIGN-xhs defines X03 freight manifest recipe",
);
mustInclude(
  "DESIGN-xhs.md",
  "X04 实物批注",
  "DESIGN-xhs defines X04 detail callout recipe",
);
mustInclude(
  "DESIGN-xhs.md",
  "X05 核对清单",
  "DESIGN-xhs defines X05 checklist recipe",
);
mustInclude(
  "DESIGN-xhs.md",
  "defaultEnabled: false",
  "DESIGN-xhs disables .tally by default",
);
mustInclude(
  "DESIGN-xhs.md",
  "font-synthesis: none",
  "DESIGN-xhs enforces calligraphy anti-blur font-synthesis rule",
);
mustInclude(
  "DESIGN-xhs.md",
  "禁止把封面切成「上半照片 + 下半满宽贴边死白底",
  "DESIGN-xhs documents vetoed flat-bottom split-card cover anti-pattern",
);
mustInclude(
  "SKILL.md",
  "Use the 封箱 (Taped Shut) template (`X01`–`X05`)",
  "SKILL.md routes Meixi XHS notes to X01-X05 recipes",
);
mustInclude(
  "SKILL.md",
  "Do NOT render `.tally`（「正」字）unless the user explicitly requests a pitfall-counting",
  "SKILL.md guards .tally as explicit opt-in only",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="X01"',
  "XHS seed template includes X01",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="X02"',
  "XHS seed template includes X02",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="X03"',
  "XHS seed template includes X03",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="X04"',
  "XHS seed template includes X04",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="X05"',
  "XHS seed template includes X05",
);
mustInclude(
  "assets/template-xhs-card.html",
  "font-synthesis: none",
  "XHS seed template prevents calligraphy faux-bold synthesis",
);
mustInclude(
  "references/xhs-cover-ctr.md",
  "180pt",
  "XHS CTR spec defines 180pt dual-column glance standard",
);
mustInclude(
  "references/xhs-cover-ctr.md",
  "data-feed-title",
  "XHS CTR spec requires dual-track cover and feed title pairing",
);
mustInclude(
  "references/xhs-cover-ctr.md",
  "make-video-contact-sheet.py",
  "XHS CTR spec wires video contact-sheet frame picking for video covers",
);
mustInclude(
  "SKILL.md",
  "references/xhs-cover-ctr.md",
  "SKILL.md references XHS cover CTR playbook",
);
mustInclude(
  "SKILL.md",
  "scripts/build-feed-preview.mjs",
  "SKILL.md wires 180px dual-column feed simulator",
);
mustInclude(
  "SKILL.md",
  "scripts/lift-subject.swift",
  "SKILL.md surfaces local subject cutout script for human covers",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="C02"',
  "XHS seed template includes C02 compare cover",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="C03"',
  "XHS seed template includes C03 human-emotion video cover",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="C04"',
  "XHS seed template includes C04 proof red-ring cover",
);
mustInclude(
  "assets/template-xhs-card.html",
  'data-recipe="C05"',
  "XHS seed template includes C05 half-revealed checklist cover",
);
mustInclude(
  "validate-social-deck.mjs",
  'rule: "R13"',
  "validator enforces R13 top-right UI dead-zone check",
);
mustInclude(
  "validate-social-deck.mjs",
  'rule: "R14"',
  "validator enforces R14 anti-ad / anti-spoiler / word-cap check",
);
mustInclude(
  "validate-social-deck.mjs",
  'rule: "R15"',
  "validator enforces R15 cover vs feed-title overlap check",
);
checks.push(() => {
  const activeHtml = fileText("assets/template-xhs-card.html").replace(/<!--[\s\S]*?-->/g, "");
  const ok = !/<svg[^>]*class="[^"]*\btally\b/.test(activeHtml);
  return {
    ok,
    label: "XHS seed template has no active .tally SVG by default",
    detail: ok
      ? "assets/template-xhs-card.html keeps .tally commented out by default"
      : "assets/template-xhs-card.html must not contain active <svg class=\"tally\"> by default",
  };
});

let failed = 0;
for (const run of checks) {
  const result = run();
  const marker = result.ok ? "PASS" : "FAIL";
  console.log(`${marker} ${result.label}`);
  if (!result.ok) {
    failed += 1;
    console.log(`  ${result.detail}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} skill doc check(s) failed.`);
  process.exit(1);
}

console.log(`\n${checks.length} skill doc checks passed.`);

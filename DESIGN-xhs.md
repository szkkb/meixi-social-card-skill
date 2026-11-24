---
# gstack: design-md-format=spec
name: 封箱 Taped Shut (杨美西转运 · 小红书图文与视频封面系统 v3 CTR 优先版)
description: 封面与内页彻底解耦：封面（X01 / C02–C05）专攻发现页双列 180pt 0.5 秒点击率（反剧透、去硬广标、关键词撞色、避右上角播放标）；内页（X02–X05）用真仓实拍 + 品牌蓝胶带 + 提单/批注/清单承接品牌信任与收藏转化。
colors:
  primary: "#0060C9"        # --tape · 胶带蓝 = 租户色。主载体是封箱胶带与内页高亮
  on-primary: "#FFFFFF"     # --tape-ink · 胶带白字 · 5.98:1
  punch: "#FFE14D"          # --punch · 封面爆点黄（仅用于封面核心 2–4 字关键词高亮；on scrim 15.1:1，大字 on tape 4.68:1）
  punch-ink: "#11141C"      # --punch-ink · 黄底黑字 · 14.9:1
  alert: "#E53935"          # --alert · 封面警示红块 / 对比踩坑标 / 强红圈
  scrim-dark: "#0B1220"     # --scrim-dark · 封面底部冷深蓝黑柔梯（替代死黑，与品牌蓝呼应）
  surface: "#FFFAF1"        # --paper · 面单纸，与 DESIGN.md 的 --paper 同值
  surface-soft: "#F4ECDE"   # --paper-soft · 提单参数次级底色
  surface-ground: "#B98E5E" # --kraft · 没有仓库照片时的兜底底色
  text: "#1A1D26"           # --ink · 面单正文 · 14.1:1
  text-muted: "#7C5922"     # --warm · 标签 / 待补位 · 6.05:1
  accent: "#D0433B"         # --marker · 记号红 = 航空红。4.44:1，仅 ≥24px 圈注与笔画
  pencil: "#BDB6A8"         # --pencil · 可选「正」字里还没走到的笔画，不承载文字
  edge-blue: "#2E5FA3"      # --edge-blue · 航空蓝，仅底边斜纹
  sticker: "#FFFFFF"        # 模切白边
  success: "#D0433B"        # 内页不设交通灯语义色：打勾也是记号红
  warning: "#D0433B"
  error: "#D0433B"
typography:
  display:
    fontFamily: TsangerZhoukeZhengdabangshu
    fontWeight: 400
    fontSynthesis: none
    fontSize: 108px
    letterSpacing: 0.02em
  ctr-sans:
    fontFamily: Noto Sans SC
    fontWeight: 900
    fontSize: 116px
    lineHeight: 1.08
  hand:
    fontFamily: qiantubifengshouxieti
    fontWeight: 400
    fontSynthesis: none
    fontSize: 44px
  body:
    fontFamily: Noto Sans SC
    fontWeight: 500
    fontSize: 32px
    lineHeight: 1.55
  label:
    fontFamily: Martian Mono
    fontWeight: 500
    fontSize: 21px
    letterSpacing: 0.12em
  mono:
    fontFamily: Martian Mono
    fontFeature: tnum
rounded:
  sm: 0px
  md: 0px
  lg: 0px
  full: 0px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  2xl: 64px
components:
  card:
    width: 1080px
    height: 1440px
    backgroundColor: "{colors.surface-ground}"
    rounded: "{rounded.sm}"
  safe-zone-top-right:
    x: "850px..1080px"
    y: "0px..210px"
    note: "发现页视频播放图标/多图角标禁区，封面核心文字、数字与人眼严禁进入"
  safe-zone-profile-1x1:
    y: "180px..1260px"
    note: "个人主页 1:1 裁切安全带，封面主标题与人像核心尽量落在此区域"
  tape:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rotate: -2.4deg
    tornEdge: 22px
  target-pill:
    backgroundColor: "{colors.scrim-dark}"
    textColor: "{colors.on-primary}"
    borderLeftWidth: 10px
    borderLeftColor: "{colors.punch}"
  hook-bar:
    backgroundColor: "{colors.surface}"
    borderLeftWidth: 12px
    borderLeftColor: "{colors.primary}"
  label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  sticker:
    outlineWidth: 16px
    outlineColor: "{colors.sticker}"
  tally-optional:
    strokeWidth: 17px
    onColor: "{colors.accent}"
    offColor: "{colors.pencil}"
    defaultEnabled: false
  pending:
    textColor: "{colors.text-muted}"
    borderColor: "{colors.text-muted}"
  airmail-edge:
    height: 12px
    stripeWidth: 22px
    angle: -45deg
---

# 封箱 · 杨美西转运小红书图文与视频封面系统（v3 CTR 优先版）

适用范围：杨美西转运小红书号的 **3:4 图文笔记封面、3:4 视频独立封面、一题多封 A/B PK 候选集**，以及 **4–8 张图文内页**。
公众号图片消息（小绿书 / 贴图号）不走这里，走根目录 `DESIGN.md` 的 Greenbook「算式」系统；通用 Editorial / Swiss 走 `references/style-system.md`。
**开始设计任何小红书封面之前，必读 `references/xhs-cover-ctr.md`。**

## Overview

**Creative North Star（v3 核心升级）：**
- **封面只管首页点击率（CTR）**：在双列 180pt 信息流里 0.5 秒拦手——**单一强冲突/真人/物证主体 + 6–10 字撞色爆点大字 + 反剧透悬念**。不印企业名广告框、不塞三栏答案回执、不撞右上角播放标。
- **内页管信任、收藏与转化**：进入图 2 以后，用仓库真仓实拍、品牌蓝胶带、骑缝对照、国际提单、红圈批注与核对清单把规则讲透，并用品牌抬头与末页收藏卡自然承接「杨美西转运」信任心智。

**Product context:** 杨美西转运（深圳云广度科技，蓝 V 企业号，原美西转运小程序团队），国际快递与海运集运，小红书号主打**中国 → 海外**（美国洛杉矶、纽约、英国等），涵盖大件海运、家具家电及药品食品等敏感货线路。路线按每篇选题写，不照抄 `references/brand-presets/meixipro.md` 的「美国西岸 → 中国大陆」（那是公众号侧口径）。

**Mode per surface:**
- **Hook & Click（封面原型 `X01` / `C02` / `C03` / `C04` / `C05`，图文封面与视频封面通用）**：遵循 3-Element Rule 与好奇心缺口。**同一选题默认并行出 2–3 套高差异封面**（例如悬念大片 + 真人情绪 / 双图对比）并绑定互补外显标题 `data-feed-title`，送入 180px 双列模拟台验图或直接投小红书官方「封面 PK」。
- **Operate（图文内页 `X02` / `X03` / `X04` / `X05`）**：答案与干货从图 2 开始展开——方案分流走骑缝对照（`X02`），计费公式与时效走国际提单看板（`X03`），箱面细节指认走实物圈注（`X04`），末页收藏与品牌承接走核对清单（`X05`）。

**Key characteristics（v3 硬规则）：**
- **封面去硬广标**：封面左上角**严禁**放「杨美西转运」大块企业名广告签，改放 ≤6 字的纯用户视角人群靶子签（如 `洛杉矶大件海运`、`北美留学生`），或不放角标让主体占满。品牌名留在内页抬头（`X02`–`X05`）与尾页。
- **封面反剧透**：**严禁在封面上放 3 栏答案回执或完整 01/02/03 步骤列表**（旧版 `X01` 的 `.floating-slip .slip-grid` 已废弃并由校验器 R14 拦截）。封面只放「问题/冲突/反差」与最多 1 条单行悬念签（`.hook-bar`），把 3 步答案交还给图 2。
- **封面撞色爆点**：主标题必须有主次层次——小字定场景/人群 + **核心 2–4 字爆点词用亮黄 `#FFE14D`（`.punch` / `.punch-block`）或警示红 `#E53935`（`.alert-block`）拉高字号与反差**，拒绝整句单色平铺。
- **严守右上角 UI 禁区（`x: 850–1080px, y: 0–210px`）**：无论图文还是视频封面，主标题、数字、人眼和红圈全部避开右上角播放标/多图标区（校验器 R13 自动检测；视频封面 `data-surface="video"` 触碰即 FAIL）。
- **真人实拍与本地抠图优先**：口播视频与真实仓库实拍优先用近景/半身人物情绪帧（用 `scripts/make-video-contact-sheet.py` 抽联系表挑帧），需要前景压字或模切人像贴纸时直接调用 `scripts/lift-subject.swift`；禁止使用 AI 假仓库或 AI 假出镜人。
- **「正」字计数（`.tally`）继续默认禁用**：且即使在用户点名“数坑帖”启用时，也严禁放在封面右上角播放标禁区内（可改放内页右上角或封面左侧安全位）。
- **未确认商业数字一律用 `.pending` 虚线框**，宁可留待确认也不编造商业承诺。

## Colors

**Strategy:** 高对比实物拼贴 + 封面强爆点双层配色。

| 组合 | 比值 | 用途 |
|---|---|---|
| `--punch` (`#FFE14D`) on `--scrim-dark` (`#0B1220`) | 15.1:1 | 视频/实拍封面暗色柔梯上的核心爆点大字（最高 180pt 穿透力） |
| `--punch-ink` (`#11141C`) on `--punch` (`#FFE14D`) | 14.9:1 | 封面反白高亮块（`.punch-block`） |
| white (`#FFFFFF`) on `--scrim-dark` (`#0B1220`) | 18.6:1 | 封面主标题常规字、暗底靶子签 |
| white (`#FFFFFF`) on `--tape` (`#0060C9`) | 5.98:1 | 品牌蓝胶带标题；胶带内核心 2–4 字用 `--punch` (`#FFE14D`，4.68:1 大字级强跳出) |
| white (`#FFFFFF`) on `--alert` (`#E53935`) | 4.56:1 | 封面踩坑/对比/警示红块（仅大字/粗标签） |
| `--ink` (`#1A1D26`) on `--paper` (`#FFFAF1`) | 14.1:1 | 内页面单正文、悬念条、结论句 |
| `--warm` (`#7C5922`) on `--paper` (`#FFFAF1`) | 6.05:1 | 内页航线标签、编号前缀、待补位 |
| `--marker` (`#D0433B`) on `--paper` (`#FFFAF1`) | 4.44:1 | **仅大图形/大字**：红圈、勾号、≥36px 手写签 |

## Typography & 花体字防糊硬规则

- **胶带书法主标题（`X01` / `C05` / 内页胶带）：仓耳周珂正大榜书（`TsangerZhoukeZhengdabangshu`）**，授权核验 #1，官方免费商用。封面爆点行 `96–116px`，支持局部 `<span class="punch">` 亮黄高亮。
- **高 CTR 超粗黑主标题（`C02` 对比 / `C03` 视频口播 / `C04` 物证红圈）：`Noto Sans SC 900`**，字号 `104–124px`，紧行距 `1.06–1.10`，配合 `.punch` / `.punch-block` / `.alert-block`，保证手机双列 180pt 下 0.5 秒无障碍扫读。
- **手写签注（仅纸面局部点缀）：千图笔锋手写体（`qiantubifengshouxieti`）**，授权核验 #33。只允许写在暖白纸签或高对比标签块上（≥36px，≤6 字），禁止加白色多向描边直接叠在杂乱照片上。
- **正文与数据**：`Noto Sans SC 500 / 700 / 900` + `Martian Mono 400 / 500 / 700`。

### ★ 花体字防糊三条铁律（必守）

1. **严禁伪粗体（Faux-Bold Smearing）**：`仓耳周珂正大榜书` 与 `千图笔锋手写体` 只有 `400` 单一字重，CSS 必须强制写死：
   ```css
   .tape-title, .hand {
     font-weight: 400 !important;
     font-synthesis: none;
     -webkit-font-smoothing: antialiased;
     text-rendering: geometricPrecision;
   }
   ```
   校验器 **R11** 会自动拦截任何 `computedWeight >= 600` 的花体字节点。
2. **胶带锯齿裁切与文字分层**：蓝色背景与 `clip-path` 锯齿写在 `.tape::before` 伪元素上，投影由外层 `filter: drop-shadow(...)` 承载，`.tape-title` 保持纯净矢量文本层。
3. **2× 超采样导出（Supersampling）**：Playwright 以 `deviceScaleFactor: 2` 渲染，需要严格交付 `1080×1440` 时用 `sips -z 1440 1080` 回缩。

## Layout & 配方体系：五大高 CTR 封面原型 + 四大内页主力

**唯一板型 `1080×1440`（3:4）。**
封面必须在 **180px 真实双列信息流模拟台**（`node scripts/build-feed-preview.mjs <task-dir>`）下通过 0.6 秒闪看测试，且主标题与脸部避开右上角 `230×210px` 禁区。

### A. 五大高 CTR 封面原型（图 1 / 视频独立封面，按选题轮换 + 一题多封 PK）

| 配方 | 适用形态 | 适用选题 | 结构与 CTR 机制 |
|---|---|---|---|
| **X01 真仓大片**<br>（默认悬念封面） | 图文 / 视频 | 常规攻略、省钱选型、封箱实拍 | 满版真仓/人物动作实拍铺底（上半 55% 完整呼吸，避开箱面大字抢戏）；左上仅放 ≤6 字纯用户靶子签（**无企业广告框**）；中下安全带（`y ≈ 780–1220px`，100% 避右上角且落入 1:1 框）斜贴品牌蓝撕口胶带 + 亮黄爆点主标题（6–10 字）；底部只留 1 条单行悬念签 `.hook-bar`（**严禁 3 栏剧透答案**）。 |
| **C02 双图强对比**<br>（Before / After） | 图文 / 视频 | 拆盒减重、裸寄破损 vs 木架加固、国内堆山 vs 海外拆箱、渠道运费反差 | 全幅左右（或上下）双实拍分屏 + 中央强对比 `VS` 锚点 + 避开右上角禁区的红/蓝实拍角标（`❌ 原箱/踩坑` vs `✓ 实测/省钱`）+ 底部暗色柔梯超粗双层爆点大字。天然自带视觉冲突，CTR 极稳。 |
| **C03 真人情绪口播**<br>（**视频封面主力**） | **视频首选** / 图文 | 9:16 口播抽帧、老板/仓管真人出镜避坑、行业真话吐槽 | 人物近景/半身情绪帧（脸占 30–45% 高度，眼部落在中上安全区；支持 `lift-subject.swift` 抠图叠加）+ 左上极简主题角标 + 底部冷深蓝黑柔梯 + `116px` 超粗黑体双层大字与亮黄反白块（`.punch-block`）。右上角 100% 留净给视频播放按钮。 |
| **C04 物证红圈悬念**<br>（特写实证型） | 图文 / 视频 | 电子秤重量特写、运费/海关单据打码特写、违禁品/箱角隐患暴露 | 满版高清晰物证特写 + 醒目双层白底大红圈 `.ring` 精准套住异常点 + 圈旁高对比短标（≤6 字，如 `多算18kg!`）+ 底部或左上避让区超粗痛点大字。利用知觉好奇强拉点击。 |
| **C05 半露清单诱饵**<br>（收藏向封面） | 图文首选 | 敏感货能寄清单、美国各州时效表、寄前自查表 | 牛皮纸或实拍底 + 下沉至 `y ≥ 225px` 避开右上角的品牌蓝胶带大标题 + 中下部微倾齿孔面单**故意只露前 2–3 条高价值条目** + 底部纸面渐隐与悬念签（`完整 15 类对照在图 2 →`），同时拉高点击率与收藏率。 |

### B. 四大内页主力配方（图 2–N：承接干货、品牌信任与收藏转化）

| 配方 | 角色 | 适用题型 | 结构说明 |
|---|---|---|---|
| **X02 骑缝封箱** | 图 2 结论承接主力 | 方案分流（自提 / 卡派 / 拼邮）、立式大箱实拍 | 上半实拍零遮挡 + 左上品牌抬头 `.corner-manifest`（从内页起自然露出「杨美西转运」）+ 骑缝蓝胶带 + 下半 3 行「条件 → 行动」对照块。**承接旧版 X01 封面里删掉的 3 步答案。** |
| **X03 国际提单** | 计费 / 时效 / 参数看板 | 体积重公式、船期时效、多渠道横评 | `#FFFAF1` 航空提单满底 + 实拍证据窗 + `Martian Mono` 硬指标大字卡 + 底段 3 栏横评格。 |
| **X04 实物批注** | 细节指认内页 | 箱标尺寸、面单填写、护角打木架步骤 | 上实拍红圈指认 + 左上短胶带 + 下半齿孔面单（看哪里 → 怎么做 → `.pending` 口径）。 |
| **X05 核对清单** | 末页收藏与品牌收口 | 寄出前自查清单、收藏引导 | 顶部蓝胶带 + 齿孔大面单 4–5 条勾选清单 + 底部「收藏这张 · 杨美西转运」引导签与可选出镜人贴纸。 |

## Do's and Don'ts

- **Do（封面铁律）：** 每篇小红书图文或视频封面，同步在 `<section>` 写明 `data-role="cover"`、`data-surface="photo|video"`、`data-feed-title="互补外显标题"`，并默认产出 **2–3 套高差异封面候选**做 180px 信息流 PK。
- **Do：** 封面主标题控制在 **6–10 字**，必须用 `.punch` / `.punch-block` / `.alert-block` 标出 2–4 字核心爆点词；底图优先选有人物情绪、前后对比或物证特写的真实实拍。
- **Do：** 视频封面必须先用 `scripts/make-video-contact-sheet.py` 抽帧挑高情绪瞬间，近景裁剪，严守右上角 `230×210px` 播放标禁区。
- **Do：** 内页所有未获运营确认的价格、时效、计泡数字一律放进 `.pending` 虚线框。
- **Don't（否决方向，严禁）：** **禁止把封面切成「上半照片 + 下半满宽贴边死白底 `01/02/03` 列表块」**（SaaS/PPT 割裂列表风，R12 拦截）。
- **Don't（v3 新增红线）：** **禁止在封面上放 3 栏答案回执卡剧透结论，禁止在封面左上角放「杨美西转运」大块硬广企业名标**（R14 拦截）。
- **Don't：** **禁止在视频封面右上角 `230×210px` 禁区内放主标题、数字或关键视觉**（R13 拦截）。
- **Don't：** **禁止在未获明确“数坑帖”指令时渲染「正」字（`.tally`）**，且严禁让 `.tape-title` 或 `.hand` 继承 `700` 伪粗体（R11 拦截）。
- **Don't：** 不要用 AI 生成的假仓库/假出镜人，不要让背景纸箱上自带的「轻拿轻放」等印刷大字抢走封面中心视线。

## Motion

- **静态图文封面 & 视频独立封面：** 默认静态高清 PNG（`1080×1440`，`deviceScaleFactor: 2` 超采样渲染后按需 `sips -z 1440 1080` 输出）。
- **Live Photo：** 若制作小红书 `5s` 实况卡（见 `references/live-photo-production.md`），可将 `X01` / `C02` / `X02` 照片槽替换为仓库真实封箱/对比实拍视频流，首帧同样须通过 180px 信息流验图与 R13/R14 检查。

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-24 | 建立小红书卡系统「封箱」，独立成 `DESIGN-xhs.md` | 与公众号 Greenbook「算式」区分 |
| 2026-11-04 | 确立 `X01`–`X05` 多题型流式配方与花体字防糊三铁律 | 解决单一模板与伪粗体/旋转光栅化糊字问题 |
| 2026-11-25 | **v3 CTR 优先重构**：封面与内页彻底解耦；`X01` 砍掉左上企业硬广标与底部 3 栏剧透回执，胶带下移避开右上角播放标并引入 `#FFE14D` 亮黄爆点；新增 `C02` 双图对比、`C03` 真人情绪视频封面、`C04` 物证红圈悬念、`C05` 半露清单诱饵 | 审计发现旧版封面因提前剧透答案、左上硬广感强、右上撞视频播放标、无关键词撞色且无视频封面体系，导致首页双列 180pt 缩略图 CTR 总差临门一脚；v3 将封面彻底转向 0.5 秒点击转化，把品牌与完整答案交由 `X02–X05` 内页承接 |

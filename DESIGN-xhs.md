---
# gstack: design-md-format=spec
name: 封箱 Taped Shut (杨美西转运 · 小红书图文卡)
description: 仓库打包台上的拼贴：出镜人是模切贴纸，标题印在品牌蓝封箱胶带上，正文写在面单纸上，红记号笔一笔一笔数出错点。
colors:
  primary: "#0060C9"        # --tape · 胶带蓝 = 租户色。只以胶带这个实物出现
  on-primary: "#FFFFFF"     # --tape-ink · 胶带上的字 · 5.98:1
  surface: "#FFFAF1"        # --paper · 面单纸，与 DESIGN.md 的 --paper 同值
  surface-ground: "#B98E5E" # --kraft · 没有仓库照片时的兜底底色
  text: "#1A1D26"           # --ink · 面单正文 · 14.1:1
  text-muted: "#7C5922"     # --warm · 标签 / 待补位 · 6.05:1
  accent: "#D0433B"         # --marker · 记号红 = 航空红。4.44:1，仅 ≥24px 手写与笔画
  pencil: "#BDB6A8"         # --pencil · 「正」里还没走到的笔画，不承载文字
  edge-blue: "#2E5FA3"      # --edge-blue · 航空蓝，仅底边斜纹
  sticker: "#FFFFFF"        # 模切白边
  success: "#D0433B"        # 本系统没有交通灯语义色：打勾也是记号红
  warning: "#D0433B"
  error: "#D0433B"
typography:
  display:
    fontFamily: TsangerZhoukeZhengdabangshu
    fontWeight: 400
    fontSize: 104px
    letterSpacing: 0.02em
  hand:
    fontFamily: qiantubifengshouxieti
    fontSize: 46px
  body:
    fontFamily: Noto Sans SC
    fontWeight: 500
    fontSize: 34px
    lineHeight: 1.6
  label:
    fontFamily: Martian Mono
    fontWeight: 500
    fontSize: 22px
    letterSpacing: 0.14em
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
  tape:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rotate: -6deg
    tornEdge: 22px
  tape-print:
    fontFamily: "{typography.mono.fontFamily}"
    fontSize: 17px
    opacity: 0.62
  label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  sticker:
    outlineWidth: 16px
    outlineColor: "{colors.sticker}"
  tally:
    strokeWidth: 17px
    onColor: "{colors.accent}"
    offColor: "{colors.pencil}"
  pending:
    textColor: "{colors.text-muted}"
    borderColor: "{colors.text-muted}"
  airmail-edge:
    height: 12px
    stripeWidth: 22px
    angle: -45deg
---

# 封箱 · 杨美西转运小红书卡

适用范围：杨美西转运小红书号的 3:4 图文笔记卡组（封面 + 4–8 张内容页）。
公众号图片消息（小绿书 / 贴图号）不走这里，走根目录 `DESIGN.md` 的 Greenbook「算式」系统；
Editorial 与 Swiss 两个通用模式走 `references/style-system.md`。三套系统不混排。

## Overview

**Creative North Star:** 卡上每样东西都是他亲手贴上去的。

**Product context:** 杨美西转运（深圳云广度科技，蓝 V 企业号，原美西转运小程序团队），
国际快递集运，小红书号主打**中国 → 海外**（美国、英国……），以药品、食品等敏感货线路见长。
路线按每篇选题写，不照抄 `references/brand-presets/meixipro.md` 的「美国西岸 → 中国大陆」
（那是公众号侧口径，两者的差异待业务方统一，见 Decisions Log）。
读者多半是已经在淘宝 / 京东下了单、准备把包裹寄出去的人，离成单最近。

**号的现状（2026-09 截图）：** 每篇换一套模板（粉格子、墨绿衬线、黑底 DHL、白网格、红框手写），
唯一不变的是穿灰围裙的出镜人加一个大标题。浏览最高的三篇是墨绿衬线（12645）、
红框手写清单（9073）、白网格（3731）。没有系列识别，logo 几乎不出现。

**记住的那一件事：** 真人在仓库亲手打包。

**Mode per surface:**
- Persuade（封面 X01）：在双列信息流里靠三个形状拦住手指：一条蓝胶带、一个人、一个红「正」。
- Operate（出错点 X02、清单 X03）：读者在对照自己的包裹，一页只讲一个坑、一个动作。
- Read：不单列。长解释放笔记正文，不上卡。
- Experience：不适用，静态图。

**Key characteristics:**
- 背景是仓库实拍，满版铺开，不设计卡片底。
- 品牌蓝只以胶带这个实物出现，刷到第二篇就能认出同一卷胶带。
- 出镜人永远是模切贴纸：白边把 iPhone 抠图的毛边变成风格。
- 「正」字计数：第 N 个坑写 N 笔红，最后一页写满，对应「正确」。
- 没有运营口径的数字一律是虚线待补框。

## Colors

**Strategy:** Committed，但承载者是实物而不是版面：胶带蓝、面单纸、记号红三样东西各占一种颜色，
中性色来自照片本身。

**Light or dark:** 不设深色。使用场景是白天刷手机的小红书双列信息流；
底色来自仓库照片，明暗随照片走，卡面元素（纸、胶带、贴纸）在任何照片上都自带底，不依赖版面明暗。

- **胶带蓝** 是租户色（`config/tenants/meixipro.json` 的 `brand.primaryColor`，不是 `#037EF3`）。
  它不做底色、边框、标题字色，只做胶带。一旦扩散，「看到这卷胶带就是这个号」的机制就失效。
- **记号红** 沿用 `$airmail-red`。对面单纸 4.44:1，没过正文 AA，所以只写 ≥24px 的手写字、
  圈、箭头、勾和「正」的笔画。落在照片上时必须带白色描边（`.hand.halo`），照片明暗不可控。
- **铅笔灰** 只画「正」里还没走到的笔画，是图形不是文字，不参与对比度要求。
- **牛皮纸** 是兜底，不是主角。有照片就用照片；没照片时它让卡面仍然像在仓库里，
  但真实感会打折，交付时要说明。
- **航空斜纹** 只在底边 12px 出现，`--edge-blue` 不许进版心。

对比度实测（面单纸 `#FFFAF1` 为底，胶带字以 `#0060C9` 为底）：

| 组合 | 比值 | 用途 |
|---|---|---|
| `--ink` on paper | 14.1:1 | 面单正文、动作句、勾选框 |
| `--warm` on paper | 6.05:1 | 标签、待补位 |
| white on `--tape` | 5.98:1 | 胶带标题、胶带印字（印字 62% 透明，是纹理不是信息） |
| `--marker` on paper | 4.44:1 | **仅大字**：≥24px 手写、笔画 |

## Typography

四个面各管一件事，不交叉。两款花体字都在 `references/font-license-audit.md` 里核过：
仓耳周珂正大榜书（#1，官方，免费商用）、千图笔锋手写体（#33，官方公益字体，全渠道商用），
成品图都不需要署名。走中文网字计划 CDN 分片加载，不随包分发字体文件。

- **胶带标题：仓耳周珂正大榜书。每篇固定，不按选题换。** 系列识别靠的就是「同一卷胶带、同一种字」。
  选它是因为：笔画粗、字腔开，缩到 360px 缩略图还能读；榜书的力度对得上「封箱」这个动作；
  GB2312 全覆盖（6763 字），集运选题里的字不会缺。
  字号：封面 104px（≤8 字 × 2 行），坑页 72px（≤7 字 × 1 行），清单页 84px（≤8 字 × 1 行）。
  完整长标题写在笔记标题栏，胶带上只放短版，按 `references/title-shortener.md` 缩。
- **红笔批注：千图笔锋手写体。** 硬笔带笔锋，像他拿记号笔随手写的。每处 ≤8 字，≥36px，只用记号红。
  这是对号上 9073 浏览那篇红框手写清单的继承。
- **正文：Noto Sans SC 500 / 700。** 「错在哪」34px/500，「这样做」44px/700，清单条目 32px/700。
  授权理由同 `DESIGN.md`：OFL，可随技能离线渲染。
- **编号 / 标签 / 待补位：Martian Mono 400 / 500。** 「坑 03」「03 / 05」「淘宝 → 美国」、胶带边缘印字。
  和公众号 Greenbook 共用这一面，两个平台放在一起时有一条共同的线。

花体字只上胶带和红笔批注。面单正文、标签、数字一律不用花体字（理由见 `references/font-library.md` 第 0 节）。
换胶带字体需要项目负责人决定，并在 Decisions Log 记一行：换了它，系列识别就断了。

## Layout

**唯一板型 1080×1440（3:4）。** 侧边安全距 64–72px，上下 44–72px。小红书双列信息流展示完整 3:4，
没有公众号那样的 16:9 裁切带，但**封面必须在 1/6 缩放（180pt）下成立**：
缩略图里只认得出形状，所以封面只许有三个主形状，即胶带、人、「正」标签。

**三个配方**，模板 `assets/template-xhs-card.html` 里各有一份：

| 配方 | 用途 | 结构 |
|---|---|---|
| X01 封面 | 第 1 张 | 满版仓库照片；左上品牌小标签；胶带 −6° 横穿上 1/3，左端撕口、右端出血；左下面单小签写满「正」+ 手写一句；右下出镜人贴纸，出血到底边 |
| X02 出错点 | 每个坑一张 | 上 840px 是这个坑对应的实物照片，红笔直接圈在照片上；胶带（−3°，两端撕口）写「坑 0N」+ 短标题；右上面单小签是「正」的进度（N 红 / 5−N 灰）+「0N / 05」；下半是带齿孔的面单：错在哪 → 这样做（勾选框 + 一句动作）→ 待补数字；出镜人贴纸骑在照片与面单的接缝上 |
| X03 清单 | 倒数第 1–2 张，收藏页 | 胶带「寄出前核对这 5 件」；右上满格「正」+「全勾上」；左侧大面单上 5 条勾选项，每条一行动作 + 一个待补位；右下出镜人；左下一张小签写收藏引导 |

**人不压字，字不压脸。** 贴纸只压照片和面单边缘，不压胶带标题、不压勾选项；
红笔圈和批注只落在照片或纸上，不落在人身上。

**一页一坑。** 选题的出错点不是 5 个时：3 个或 4 个照样用「正」（写到第 N 笔为止，清单页不写满，
改写「N 处全勾上」）；超过 5 个用两个「正」。不为凑「正」改内容。

**间距** 8px 基数：8 / 16 / 24 / 32 / 48 / 64。面单内纵向节奏 34–40px，清单条目间 34px。

## Elevation & Depth

深度来自实物的叠放，所以这里**有**阴影，而且只有偏移阴影：胶带 `0 10px 18px`、面单 `0 8px 18px`、
贴纸 `0 14px 22px`，黑色 18–26% 透明度。没有零偏移发光，没有毛玻璃，没有卡片套卡片。
叠放顺序固定：照片 < 面单 < 胶带 < 贴纸 < 手写批注 < 底边斜纹。

## Shapes

**圆角一律 0。** 面单、胶带、标签都是方角裁纸。唯一的「不规则」来自实物本身：
胶带两端 22px 锯齿撕口、面单顶边齿孔（半径 8px，间距 28px）、贴纸沿人物轮廓的模切白边。

## Components

- **`.card`** 1080×1440，`overflow:hidden`。有照片时放 `<img class="photo">` 满版，
  没照片时退回 `.kraft` 牛皮纸底并保留 `.photo-well` 的虚线说明框（说明该放什么照片）。
- **`.tape`** 胶带。`.tape` 左撕右出血（封面），`.tape.both` 两端撕口（内页）。
  封面胶带上下各一行 `.tape-print` 印字「杨美西转运 · 亲手打包 · YANG MEIXI」，62% 白，是纹理不是信息。
  每张卡最多一条胶带，角度 −3° 到 −6°。
- **`.sticker`** 出镜人贴纸。放 iPhone 抠图 PNG（透明底）；模切白边由 SVG 滤镜 `#die-cut`
  现场生成（`feMorphology dilate` 16px），不手工描。白底 JPG 先用 `scripts/lift-subject.swift`
  抠成透明 PNG（macOS Vision，和 iPhone 长按抠图同一套技术）。
- **`.label`** 面单纸。`.label.perf` 带顶边齿孔。小签（品牌、「正」、收藏引导）旋转 ±1–4°。
- **`.tally`** 「正」字计数。5 条手抖路径按笔顺排（一、丨、一、丨、一），
  `data-n="0..5"` 决定前几笔是记号红，其余铅笔灰。
- **`.hand`** 红笔批注；落在照片上加 `.halo` 白描边。
- **`.box`** 勾选框（3.5px 墨线，−2°）。已勾的放 `.box.on`，红勾是 SVG 路径。
- **`.pending`** 待补位：虚线框 + 暖灰等宽字。运营口径没到位的数字一律放这里，宁可空着也不编。
- **`.airmail`** 底边 12px 航空斜纹。

状态态（hover / focus / disabled）不适用：交付物是静态图。空状态有设计：
没有照片 → 牛皮纸 + 虚线说明框；没有人像 → `.sticker.empty` 虚线人形位；没有数字 → `.pending`。

## Do's and Don'ts

- Do: 封面定稿前按 1/6 缩放看一眼，胶带、人、「正」三样都要认得出。
- Do: 每个坑配一张对应的仓库实拍（箱标、面单、秤、禁限品），红笔圈在照片上指出错的地方。
- Do: 胶带只放 ≤8 字的短标题，完整标题写在笔记标题栏。
- Do: 卡上每一个时效、规则、费用数字都来自运营确认的口径；没有就用 `.pending`。
- Do: 路线标签按选题写（这篇是「淘宝 → 美国」）。
- Don't: 不要把胶带蓝用在底色、边框、标题字色上。它只是胶带。
- Don't: 不要在出镜人脸上压字、压圈、压胶带。
- Don't: 不要画图标、不要用 emoji 当装饰、不要加渐变和光效。卡上只有照片、贴纸、胶带、面单、记号笔。
- Don't: 本类目反模式一个都不要：蓝色渐变、货机、地球、虚线航弧地图、集装箱剪影、
  居中粗体「专业 / 可靠 / 安全」。
- Don't: 不要按选题换胶带字体，也不要每篇换一套模板。系列识别就是靠「不换」。
- Don't: 不要用 AI 生成出镜人或仓库照片。这套系统的全部说服力来自「真人真仓」。

## Motion

- **Approach:** 静态 PNG。
- **The one authored moment:** 如果以后做 Live Photo（`references/live-photo-production.md`，小红书 5s），
  唯一值得动的是「胶带被拉开、贴上封面」那 2 秒，而且应该是仓库里真拍的，不是 CSS 动画。

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-24 | 建立小红书卡系统「封箱」，独立成 `DESIGN-xhs.md` | 由 /design-consultation 产出。小红书卡的主角是真人与仓库照片，与 Greenbook「数字最大、暖纸、无阴影」的规则多处相反；共享品牌层（胶带蓝 = `--verify`、航空红蓝、面单纸、Martian Mono、Noto Sans SC）即可，版式分开 |
| 2026-09-24 | 记忆点定为「真人在仓库亲手打包」 | 项目负责人指定。号上浏览最高的几篇都靠出镜人，这是唯一稳定的识别资产 |
| 2026-09-24 | 胶带标题固定仓耳周珂正大榜书，批注用千图笔锋手写体 | 两款均为官方免费商用（font-license-audit #1 / #33）；榜书在 360px 缩略图可读；手写继承号上 9073 浏览的红框手写清单 |
| 2026-09-24 | 「正」字计数 | 来自 Claude 独立设计声音。小红书读者一眼就懂，末页写满对应「正确」，同行难以照搬 |
| 2026-09-24 | 预览不用 AI 生成效果图，用 HTML 实排 + Vision 抠图替身 | AI 会编造出镜人与仓库，违背「真人真仓」与不编造原则 |
| 2026-09-24 | 小红书路线按选题写，品牌预设的「美国西岸 → 中国大陆」暂不改 | 小红书号与本篇选题都是中国 → 海外；两个平台口径的统一待业务方确认 |
| 2026-09-24 | Codex 独立提案缺席 | Codex CLI 0.147.0 调用 `gpt-6-astra` 返回 400（要求更新 CLI）。未以其他模型顶替，外部覆盖记为 unavailable |

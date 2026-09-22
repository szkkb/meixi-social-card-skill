---
# gstack: design-md-format=spec
name: Greenbook Card System (贴图号 / 小绿书 图片消息卡)
description: 航空运单纸上一道摊开给你看的加法题：暖纸、等宽数字、红蓝航空边饰，安静但要求你自己复算。
colors:
  primary: "#0060C9"        # --verify · 租户色，唯一可变项。只标合计线与合计数
  on-primary: "#fffaf1"
  surface: "#fffaf1"        # --paper · 卡面底
  surface-rule: "#f4ecde"   # --paper-rule · 发丝规线 / 次级面
  page: "#f5ede1"           # --paper-page · 预览页底，不进导出
  text: "#1A1D26"           # 正文 · 14.1:1
  text-muted: "#7c5922"     # --text-warm · 6.05:1。注意：不是 $text-muted #CACCD1
  ink: "#102546"            # --ink · 中文 display + 算式数字 · 14.7:1
  ink-soft: "#27466d"       # --ink-soft · 次级正文 · 9.25:1
  accent: "#d0433b"         # --annotate · 航空红。4.44:1，仅 ≥24px 粗体数字与划线
  edge-blue: "#2e5fa3"      # --edge-blue · 航空蓝。仅 .airmail-edge，禁止进版心
  success: "#0060C9"        # 本系统无交通灯语义色，成功态复用合计蓝
  warning: "#d0433b"        # 同上，警示复用航空红
  error: "#d0433b"
typography:
  display:
    fontFamily: Smiley Sans Oblique
    fontWeight: 500
    fontSize: 118px
    letterSpacing: 0.01em
  body:
    fontFamily: Noto Sans SC
    fontSize: 30px
    lineHeight: 1.72
  label:
    fontFamily: Martian Mono
    fontSize: 26px
    letterSpacing: 0.16em
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
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  board:
    width: 1080px
    height: 1440px
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  zone-band:
    top: 416px
    height: 608px
  airmail-edge:
    height: 14px
    stripeWidth: 22px
    angle: 45deg
  rule-total:
    height: 4px
    backgroundColor: "{colors.primary}"
  rule-hair:
    height: 1px
    backgroundColor: "{colors.text-muted}"
    opacity: 0.38
  ledger-value:
    fontFamily: "{typography.mono.fontFamily}"
    fontSize: 44px
    textColor: "{colors.ink}"
  total-value:
    fontFamily: "{typography.mono.fontFamily}"
    fontSize: 96px
    textColor: "{colors.primary}"
  pen-strike:
    fontSize: 52px
    textColor: "{colors.text-muted}"
    strikeColor: "{colors.accent}"
    strikeHeight: 5px
    strikeAngle: -7deg
  waybill:
    borderTopColor: "{colors.ink}"
    borderBottomColor: "{colors.text-muted}"
---

# Greenbook Card System

适用范围：微信公众号「图片消息」（小绿书 / 2026 年后官方称贴图号）的 3:4 图文卡组。
不适用于本技能既有的 Editorial（杂志电子墨水）与 Swiss International 两个模式，也不适用于
公众号 21:9 + 1:1 封面对（那条走 `references/title-shortener.md`）。

## Overview

**Creative North Star:** 把计算器转过来推到对方面前 —— 用可复算的算术换信任，而不是用形容词换信任。

**Product context:** 美西转运（MeixiPro），美国西岸到中国大陆的跨境集运，多租户物流 SaaS 上的一个租户。
用户在服务商之间真正比较的只有三件事：一磅多少钱、几天到、丢了怎么赔。
同类目公众号高度同质：蓝色渐变、货机、地球、虚线航弧，加上居中的粗体「专业 / 可靠 / 安全」。
它们都在卖抽象物，而用户在比数字。

**Mode per surface:**
- Persuade（首图 G01/G02）：在滑动流里争取一次停留，靠数字本身而非形容词。
- Operate（拆账页 G03/G04/G05）：读者在核对一笔账，版式服务于对齐与可复算。
- Read（FAQ / 说明页 G06）：段落节奏优先，字号不低于 30px。
- Experience：不适用。这是静态图，没有沉浸面。

**记住的那一件事：** 账算得清，不坑人。

**Key characteristics:**
- 暖纸底，在全白 feed 里像一张实体单据而不是又一块屏幕。
- 最大的字是数字，中文退为注解。这是对类目习惯的反转。
- 红笔批改每套卡只出现一次，那一次就是记忆点。
- 45° 红白蓝航空边饰是品类符号，跨租户恒定。
- 构图从裁切反推：论点必须活在 y416–1024 那条带里。

## Colors

**Strategy:** Committed。暖纸拥有整张卡，中性色从纸派生，品牌色稀缺到只做一件事。

**Light or dark:** 固定浅色。使用场景是白天、手机、微信白底信息流；暖纸相对纯白 feed 已经形成分离，
再上深色只会变成类目里另一种噪音。此判断随使用场景变，不随流行变。

色分两层。**租户层**只有 `--verify` 一个变量，换租户改它即可；它的职责被压缩到极小：
只染合计线（`.rule-total`）和合计数（`.tv`）。于是版面上唯一的彩色终点就是「算出来的那个数」，
视线自然落在结论上，品牌色和论点合而为一。

**跨租户恒定层**是 `--annotate` 与 `--edge-blue`，来自 `apps/miniapp/src/styles/variables.scss`
的 `$airmail-red` / `$airmail-blue`。那两个 token 在源仓里带着注释「国际航空信封边饰：红/白/蓝/白
45° 斜纹，不随租户主色变」，本来就不是某一家的颜色，而是「国际邮件」这个品类的颜色。
本系统把它们从只用过一次的状态展开为整套卡的识别装置。

中性色全部落在暖底上，对比度逐个实测（白底数值不适用，暖底更亮）：

| Token | 值 | 对 `#fffaf1` | 判定 |
|---|---|---|---|
| `--ink` | `#102546` | 14.7:1 | AAA |
| `--text` | `#1A1D26` | 14.1:1 | AAA |
| `--ink-soft` | `#27466d` | 9.25:1 | AAA |
| `--text-warm` | `#7c5922` | 6.05:1 | AA（正文亦可） |
| `--verify` | `#0060C9` | 5.74:1 | AA |
| `--annotate` | `#d0433b` | **4.44:1** | **未过正文 AA，仅大字** |

深色模式不做。不是"以后再说"，是这个表面不存在深色场景。

## Typography

五个面，各有不可替代的职责。交付形态是截图（HTML 渲成 PNG 再上传），
**没有加载时间预算**，所以可以自托管多套、可以堆字重，选面只看合不合适，不看体积。

**得意黑 Smiley Sans**（SIL OFL 1.1，ZeoSeven CDN id 92，或自托管）承担全部中文 display。
选它有三个具体理由：字身窄，在 608px 的安全带里每行多塞约 25% 汉字；全局右倾 9.4°，
倾斜本身就是「加急」的形，不必再画箭头；只有一个字重，反而堵死了"用字重凑层级"的退路。
中文 display 永不低于 500 —— 这是本系统对宿主技能「越大越轻」的公开违反，理由见下。

**Martian Mono**（SIL OFL 1.1，Google Fonts，wght + wdth 双可变轴）承担数字、标签与元信息。
它是真正的主角：等宽定宽步进让加法列天然对齐小数点，而**对齐本身就是「算得清」的视觉证明**。
Width 轴让长数字在安全带内还能再放大一档，不必换字号。

**Noto Sans SC**（SIL OFL，Google Fonts）承担中文与拉丁正文。选它而不是 MiSans L3，
是因为 MiSans 的授权要求使用方「特别注明使用了 MiSans 字体」且禁止修改与二次分发字体文件 ——
一个要随技能打包、离线渲染的模板背不起这个条件。这是授权判定，不是审美判定。

**Cabinet Grotesk**（Fontshare 免费商用）只做拉丁字标与域名。得意黑的拉丁字形脾气太大，
`MeixiPro` / `meixipro.com` 需要一个端正的面。

**LXGW WenKai 霞鹜文楷**（SIL OFL，ZeoSeven CDN id 292）只做红笔批改，**每套卡至多一次**。
几何面染成红色不像手写，这个像。用第二次就不再是批注，只是另一种红字。

### 「越大越轻」为什么在这里不成立

宿主技能的通则是字越大字重越轻。那条规则是在拉丁语境下成立的：
拉丁字母笔画少，超细字重放大后仍然清晰。中文不是 —— 200–300 字重的汉字放大到 100px 以上，
在手机屏幕缩放后笔画会粘连成一团。

本系统的解法不是废掉这条规则，是**重新分配它**：轻交给拉丁数字（Martian Mono 300），
重留给中文（得意黑单字重，视觉约 500）。规则的精神（大字要透气）被保住，
而汉字的可读性没有被牺牲。

### 换装缝（花体字预留）

`--display-zh` 是一等公民。要把中文 display 换成其他面（例如后续选定的免费商用花体字），
只改这一行，模板结构与其余四个面全部不动：

```css
:root { --display-zh: "你的花体字", "Smiley Sans Oblique", "Noto Sans SC", sans-serif; }
```

换装前必须验三件事，缺一不换：授权允许商业使用且允许随包分发；覆盖到你实际要排的汉字
（很多花体字只覆盖常用 3500 字，缺字会静默回退到下一个面，肉眼很难发现）；
在 88–118px 下笔画不粘连。

## Layout

**唯一板型 1080×1440（3:4）。** 平台只吃这一个比例，不为它准备第二种板。

**三竖区制度**，由模板强制而非靠自觉：

| 区 | 范围 | 可否被裁 | 放什么 |
|---|---|---|---|
| `.zone-head` | y 0–416 | **可裁** | 字标、路线、运单抬头（Service / Sheet） |
| `.zone-band` | y 416–1024 | **不可裁** | 论点：标签、数字、合计线、合计数 |
| `.zone-foot` | y 1024–1440 | **可裁** | 附注、CTA、小程序码 |

安全带 608px 是算出来的，不是拍的：微信常读列表把首图裁成 16:9，
1080 × 9/16 = 607.5 → 608，居中则 (1440 − 608) / 2 = 416。
**判定一张首图合格的唯一标准：把它裁成 y416–1024 那条带，论点是否还完整。**
模板内置 `body[data-guides="on"]` 参考层可以直接看这个结果。

**跨卡锁定基线。** 前三张图会在消息列表里并排成一条 2.35:1 缩略条
（每格宽高比 2.35/3 ≈ 1:1.277，比源图 3:4 略宽，上下各只切约 30px —— 裁切不是问题，
**并排才是**）。所以前三张必须共享标签基线与数字基线，横读成一行账：
`12.80 元/磅 · 8–12 天 · 100%`。构图单位是三张卡，不是一张卡。

**间距阶梯**沿用 Swiss 模板同一条（8/12/16/24/32/40/48/64/80/96/160），不另立一套，
以便两个模式在同一次交付里混排时节奏一致。侧边距固定 96px。

**竖版填充**遵循 `references/portrait-fill.md`：下 25% 空白是要改的味道。
本系统的解法是给可裁区填上天然属于那里的单据内容（抬头、凭据条），
而不是把内容硬塞进安全带 —— 塞进去会让安全带过载，反而伤论点。

## Elevation & Depth

没有阴影，没有卡片，没有毛玻璃。深度全部由纸面层次表达：
`--paper` 是纸，`--paper-rule` 是印在纸上的规线，`--ink` 是墨。
一张单据不需要浮起来。

## Shapes

**圆角一律 0。** 方角是单据的形，圆角是 App 的形。这不是一个可调参数。
唯一的例外是小程序码占位框，它是外部资产的容器，边框 2px 实线，同样方角。

## Components

- **`.board`** 1080×1440，`--paper` 底，`overflow:hidden`，`isolation:isolate`。
- **`.airmail-edge`** 45° `repeating-linear-gradient`，红 22px / 纸 22px / 蓝 22px / 纸 22px，
  上下各 14px 高。**这是 `--edge-blue` 唯一允许出现的地方。**
- **`.rules`** 64px 步进的发丝横线，`opacity:.55`。纸的物质感由它承担，不加任何装饰形状。
- **`.waybill`** 两栏运单抬头（Service / Sheet），上边框 2px `--ink`，下边框 1px `--text-warm`。
- **`.ledger`** 账目表。标签左、数值右、`tabular-nums`、`white-space:nowrap`。
  值列 44px，标签列 32px，注解 26px `--text-warm`。
- **`.rule-total`** 4px `--verify` 实线。全卡唯一的品牌色横线，它标记「下面这个数是结论」。
- **`.total-row` / `.tv`** 合计行。`.tv` 96px `--verify`。
- **`.pen-strike`** 划掉的对照数字：文字 `--text-warm`，斜线 5px `--annotate` 旋转 −7°。
- **`.pen-note`** 手写批注，`--hand` 面，44px `--annotate`，旋转 −4°。**每套卡至多一次。**
- **`.stub`** 底部凭据条：附注 + CTA + 小程序码占位框（132×132，2px `--ink` 边）。
- **`.crop-guide` / `.guide-tag`** 裁切参考层。由 `body[data-guides]` 开关，**导出前必须 off**。

状态态（hover / focus / disabled）不适用：交付物是静态图片，没有交互态。

## Do's and Don'ts

- Do: 首图定稿前先开 `data-guides="on"`，确认裁成 y416–1024 后论点完整。
- Do: 前三张共享标签基线与数字基线，横读成一条账。
- Do: 数字一律 `tabular-nums` + `white-space:nowrap`，单位不许折行。
- Do: 换租户只改 `--verify` 与三个品牌字符串，其余一律不动。
- Do: 卡上每一个数字都要能在小程序里被复算出来；做不到就不要印在卡上。
- Don't: **不要用 `$text-muted #CACCD1`。** 它在 `#fffaf1` 上只有 1.55:1，等于看不见。
  暖底上的弱化文字一律走 `--text-warm #7c5922`。
- Don't: 不要让 `--annotate` 承载正文。4.44:1 未过正文 AA，只许 ≥24px 粗体数字与划线。
- Don't: 不要让 `--edge-blue` 离开 `.airmail-edge`。它一进版心就和 `--verify` 抢蓝。
- Don't: 不要用第二次红笔。第二次起它就不是批注了。
- Don't: 本类目专属反模式一个都不要 —— 蓝色渐变底、货机、地球、虚线航弧世界地图、
  居中粗体的「专业 / 可靠 / 安全」、集装箱剪影、以及把中文标题放到最大而把价格缩成小字。
- Don't: 不要加圆角、阴影、卡中卡、图标圆形底托、emoji 当装饰元素。
- Don't: 不要把示例数字当真实报价发出去。

## Motion

- **Approach:** 不适用。交付物是静态 PNG。
- **The one authored moment:** 唯一可能的动效是 Live Photo 变体（走
  `references/live-photo-production.md`）：秤上读数跳动到定格的那 2 秒。
  动的必须是「被称量」这个动作本身，不是装饰性的镜头运动。

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-22 | 建立 Greenbook 卡系统，方向定为「算式」Worked Arithmetic | 由 /design-consultation 产出。北极星「账算得清，不坑人」由项目负责人指定 |
| 2026-09-22 | 主色取 `#0060C9` 而非 `#037EF3` | `config/tenants/meixipro.json` 为租户身份真源；`docs/TENANT_PROFILES.md` 明确警告 `#037EF3` 是兼容档案值，非生产身份 |
| 2026-09-22 | 展开 `$airmail-red` / `$airmail-blue` 为品类识别装置 | 该 token 对在 variables.scss 中被注释为跨租户恒定的「国际航空信封边饰」，全仓仅用过一次。差异化资产已存在，无需发明 |
| 2026-09-22 | 中文 display 选得意黑，公开违反宿主「越大越轻」 | 中文超细字重在手机端笔画粘连；改为「轻交给拉丁数字，重留给中文」，保住规则精神 |
| 2026-09-22 | 正文选 Noto Sans SC，否决 MiSans L3 | MiSans 授权要求署名且禁止二次分发字体文件，与"随技能打包离线渲染"冲突。授权判定非审美判定 |
| 2026-09-22 | 禁用 `$text-muted #CACCD1` | 实测对 `#fffaf1` 仅 1.55:1。由 Claude 独立设计声音提出，本文档补上实测值 |
| 2026-09-22 | 安全带定为 y416–1024，前三张锁基线 | 微信常读列表 16:9 裁切与消息列表 2.35:1 三图条的实际行为（多来源二手一致，官方文档未直接公开）。跨卡构图思路来自 Claude 独立设计声音 |
| 2026-09-22 | Codex 独立提案缺席 | 配置模型 `gpt-6-astra` 要求更高版本 Codex CLI（当前 v0.147.0），返回 400。未以其他模型顶替，外部覆盖记为 unavailable |

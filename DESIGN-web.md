---
# gstack: design-md-format=spec
name: 航单实证 Waybill Evidence (美西转运 · 官网 SEO 文章与教程配图系统 v2)
description: 围绕 Organic SEO / Google Discover / Image Pack / AI Overviews 与 Core Web Vitals 打造的官网纯白正文配图系统：#F8FAFC 有界清冷底台、#0060C9 租户正蓝、#D97706 琥珀金锚点、独立眉栏、零遮挡一手实拍与可复算等宽算式，兼顾手机 340px 可读性与高 E-E-A-T 信息增益。
colors:
  primary: "#0060C9"        # --verify · 租户正蓝（config/tenants/meixipro.json 真源，跨小程序/公众号/小红书/官网统一）
  primary-web: "#0E6EB8"    # --brand-primary · 官网 globals.css 协同主蓝
  on-primary: "#FFFFFF"
  surface: "#F8FAFC"        # --stage · 清冷航单灰底台（与官网 #FFFFFF 纯白文章卡片拉开清晰边界）
  surface-card: "#FFFFFF"   # --card · 配图内部单据/对比子卡
  surface-muted: "#F1F5F9"  # --muted · 底部凭据条与次级参数底
  border: "#CBD5E1"         # --border · 2px 画布外框与 1px 内部发丝分隔线
  border-sub: "#E2E8F0"     # --border-sub · 次级分隔线与截图内框
  text: "#0F172A"           # --ink · 航单深墨主标题与核心结论（对 #F8FAFC 对比度 15.4:1，AAA）
  text-body: "#334155"      # --body · 卡片正文与步骤说明（对比度 9.6:1，AAA）
  text-muted: "#64748B"     # --sub · 眉栏编号、英文元信息与页脚（对比度 4.76:1，AA）
  accent: "#D97706"         # --amber · 琥珀金边框/高亮色块（同 globals.css --brand-accent）
  accent-text: "#92400E"    # --amber-text · 琥珀浅底 #FEF3C7 上的深琥珀文字（对比度 7.1:1，AAA）
  success: "#059669"        # --ok · 正确示范/推荐方案绿（配 #ECFDF5 浅底与 #064E3B 深绿字，11.2:1）
  warning: "#D97706"        # --warn · 注意/转寄/两段运费提醒（配 #FEF3C7 浅底与 #92400E 深琥珀字）
  error: "#D0433B"          # --marker · 记号批注红（沿用 $airmail-red，配 #FEF2F2 浅底与 #7F1D1D 深红字，用于 ✕ 常见踩坑与截图红框）
typography:
  display:
    fontFamily: "Smiley Sans Oblique, Noto Sans SC, PingFang SC, sans-serif"
    fontWeight: 400
    fontSynthesis: none
    fontSize: 52px
    letterSpacing: 0.01em
  body:
    fontFamily: "Noto Sans SC, PingFang SC, Hiragino Sans GB, sans-serif"
    fontWeight: 500
    fontSize: 24px
    lineHeight: 1.5
  label:
    fontFamily: "Martian Mono, JetBrains Mono, SF Mono, monospace"
    fontWeight: 700
    fontSize: 18px
    letterSpacing: 0.06em
  mono:
    fontFamily: "Martian Mono, JetBrains Mono, SF Mono, monospace"
    fontFeature: tnum
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  board-wide:
    width: 1600px
    height: 900px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    seoTarget: "Article Hero (Google Discover ≥1200px) / W01 / W03 / W04 / W05"
  board-standard:
    width: 1600px
    height: 1200px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    seoTarget: "HowTo 多步手机截图实证 (W02)"
  board-square:
    width: 1200px
    height: 1200px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    seoTarget: "单点计费公式 / 参数聚焦卡 (W04 square)"
  board-tall:
    width: 1200px
    height: 2400px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    seoTarget: "单张竖屏仓库电子秤/箱体尺码实拍特写"
  board-og:
    width: 1200px
    height: 630px
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    seoTarget: "OpenGraph / Twitter / 微信外链分享卡 (W06)"
  airmail-top-bar:
    height: 10px
    stripeWidth: 18px
    angle: -45deg
  card-verify:
    backgroundColor: "#ECFDF5"
    borderColor: "{colors.success}"
    rounded: "{rounded.md}"
  card-error:
    backgroundColor: "#FEF2F2"
    borderColor: "{colors.error}"
    rounded: "{rounded.md}"
---

# 航单实证 · 美西转运官网 SEO 配图视觉系统（`DESIGN-web.md`）

适用范围：`meixipro.com` 官网（`/blog/*`、`/guides/*`、`/services/*`、`/destinations/*`、`/faq/*`）及美西货运小程序内嵌指南的文章配图、教程实证图与 OpenGraph 分享图。
**开始制作任何官网配图之前，必须先读配套 SEO 实战专规 `references/web-seo-images.md`。**

与本技能库中另外两套品牌卡系统分工明确、互不混排：
- 微信公众号「图片消息 / 小绿书 / 贴图号」（`3:4` `1080×1440`）→ `DESIGN.md`（Greenbook「算式」暖纸系统）
- 杨美西转运小红书号（`3:4` `1080×1440`）→ `DESIGN-xhs.md`（Taped Shut「封箱」真仓胶带 CTR 系统）
- **美西转运官网 SEO 文章与教程配图（`16:9` / `4:3` / `1:1` / `9:16` / `1.91:1`）→ 本文件 `DESIGN-web.md`（Waybill Evidence「航单实证」清冷灰台 SEO 系统）**

---

## Overview

**Creative North Star:** 在官网纯白正文卡片里立起一块**边界分明、零遮挡、经得起 Google Discover 与手机 340px 放大检验的「航单实证台」**——标题归独立眉栏，实拍/截图归证据窗，正误归双色对照，算式归等宽单据，一切视觉结构服务于搜索意图解答与 E-E-A-T 一手信任。

**SEO & Product Context:**
- 美西转运（`meixipro.com`），面向美国、加拿大、英国、澳洲等地海外华人与留学生的中国跨境集运转运服务。
- 官网文章页（`app/blog/[slug]/page.tsx`）采用浅灰底（`#F8FAFC`）套纯白正文卡片（`#FFFFFF`，桌面阅读宽 `768px`，图片实际渲染宽约 `688px`；手机端渲染宽约 `340px`）。
- 官网配图不是装饰背景，而是 **Organic SEO + Google Discover + Google Images + AI Overviews (GEO)** 的核心竞争资产：
  1. 用**一手实拍与实操截图**提供竞品复制不了的 Information Gain（信息增益）；
  2. 用**轻文字 + 强结构**辅助读者扫读，同时把长段正文留在 HTML/MDX 让搜索引擎完整索引；
  3. 用**严格比例锁定 + WebP 体积预算**保护 Core Web Vitals（LCP / CLS）；
  4. 根治过往旧配图的三大顽疾：① 半透明灰黑条横压在计算器截图中央遮挡界面文字；② 截图间叠放巨大彩色 Emoji（`✅`/`❌`/`VS`）；③ 手机长截屏未裁掉键盘与瀑布流广告，塞进横图后关键按钮字小如蚁。

**记住的那一件事：** 照着图里的红框、单号与算式核对，3 分钟看懂操作、算清运费、一次不踩坑。

**Mode per SEO Surface:**
- **Discover & SERP Hero（`W01` 文章主封面 / `W06` OG 分享卡）**：一眼锚定核心搜索实体与文章价值，满足 Google Discover `≥1200px` 宽与 `16:9` / `4:3` / `1:1` 安全裁切，同时把 WebP 体积压进首屏 LCP 预算。
- **HowTo & Evidence Operate（`W02` 操作截图实证、`W03` 双栏实拍对照、`W04` 计费算式与路线看板、`W05` 合规与隐私打码证明）**：读者边看边在淘宝/拼多多/小程序操作或核算费用，版式服务于「找准入口、看清对比、复算公式、核对合规」。

---

## Colors

**Strategy:** Committed + Semantic Contrast（清冷航单灰底台 + 租户正蓝主轴 + 琥珀金关键锚点 + 绿/红语义分流）。

**Light or dark:** 固定浅色（`#F8FAFC` 底台）。官网正文容器恒为 `#FFFFFF` 纯白底，配图采用 `#F8FAFC` 底台 + `2px solid #CBD5E1` 外框 + 顶部 `10px` 红蓝航空斜纹封边，在纯白文章中不靠沉重阴影就能稳稳立住，在 Google Images 浅色结果流里同样自带家族识别边界。

| Token | CSS 变量 | Hex | 实测对比度 | 唯一职责 |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `--verify` | `#0060C9` | `5.98:1` on `#FFFFFF` (AA) | 品牌徽标、步骤序号徽章、主推结论数值、主强调线（与 `config/tenants/meixipro.json` 一致，**严禁用旧色 `#037EF3`**） |
| `primary-web` | `--verify-web` | `#0E6EB8` | `5.32:1` on `#FFFFFF` (AA) | 与官网 `app/globals.css` `--brand-primary` 保持视觉一致 |
| `surface` | `--stage` | `#F8FAFC` | — | 画布底台，与官网 `#FFFFFF` 正文卡片形成干净边界 |
| `surface-card` | `--card` | `#FFFFFF` | — | 内部单据卡、截图承载框、算式面板底 |
| `surface-muted` | `--muted` | `#F1F5F9` | — | 底部凭据条、次级说明条与标签胶囊底 |
| `text` | `--ink` | `#0F172A` | `15.4:1` on `#F8FAFC` (AAA) | 配图主标题、子卡片标题、核心结论文字 |
| `text-body` | `--body` | `#334155` | `9.6:1` on `#F8FAFC` (AAA) | 步骤说明、对比要点、算式解释 |
| `text-muted` | `--sub` | `#64748B` | `4.76:1` on `#F8FAFC` (AA) | 顶部英文航单眉栏、来源路由、底部备注 |
| `accent` / `accent-text` | `--amber` / `--amber-text` | `#D97706` / `#92400E` | `#92400E` on `#FEF3C7` **`7.1:1` (AAA)** | **专属锚点**：高亮会员号规则、注意事项、两段运费提醒（文字一律用 `--amber-text`，不用浅琥珀直接当小字） |
| `success` | `--ok` / `--ok-text` | `#059669` / `#064E3B` | `#064E3B` on `#ECFDF5` **`11.2:1` (AAA)** | `W03` / `W04` 推荐方案、`✓ 正确示范`、省钱实测结论 |
| `error` | `--marker` / `--marker-text` | `#D0433B` / `#7F1D1D` | `#7F1D1D` on `#FEF2F2` **`10.8:1` (AAA)** | `W03` `✕ 常见漏填/踩坑`、`W02` 截图重点红框 `.pin-box`、顶部航空红斜纹 |

---

## Typography

所有字体均选自仓库已核验免费商用字库（见 `DESIGN.md` 与 `references/font-license-audit.md`），零版权风险：

1. **Display（配图主标题）**：`Smiley Sans Oblique`（得意黑，SIL OFL 1.1，ZeoSeven CDN id 92），fallback `Noto Sans SC`。
   - **单字重防糊铁律**：得意黑只有单一字重，**必须显式设置 `font-weight: 400; font-synthesis: none;`**，严禁写 `font-weight: 700/800` 触发浏览器伪粗体合成（校验器 **R16** 拦截）。
   - 字号阶梯：
     - `W01` 文章封面大标题：`48–56px`（`line-height: 1.15`）
     - `W06` OG 分享卡大标题：`48–54px`（`line-height: 1.15`，缩到 `300px` 社媒预览宽仍一眼可读）
     - `W02`–`W05` 顶栏主标题：`.header-title` `38–42px`（单行不换行，≤20 字）
   - **零压图铁律**：主标题永远待在独立顶部眉栏或左侧文字卡，**严禁**压在任何 UI 截图或实拍主体文字之上。
2. **Body（卡片标题与极简说明）**：`Noto Sans SC` `500 / 700`（SIL OFL）。
   - **移动优先字号底线**：Google 按移动优先抓取；手机文章渲染宽约 `340px`（`1600px` 母版的 `21.25%`），桌面宽 `688px`（`43%`）。
   - 因此 `1600px` 母版上：卡片小标题/步骤胶囊 `≥ 20–22px`，说明条/列表正文 `≥ 19–22px`，页脚元信息 `≥ 16px`。绝不靠把字缩到 12–14px 来硬塞长段落——长文请移回 MDX 正文。
3. **Mono（单号、公式、步骤号、路线参数）**：`Martian Mono`（SIL OFL 1.1，开启 `font-variant-numeric: tabular-nums`）。
   - 用于步骤序号 `01`–`04`、配方徽标 `W01`–`W06`、会员号占位 `GMX-XXXX`、体积重算式 `L×W×H ÷ 6000`、重量与时效列。

---

## Layout & 官网原始尺寸规范（严格绑定 `lib/image-ratios.ts`）

所有官网配图母版像素严格对齐 `lib/image-ratios.ts` 中的 `RATIO_REFERENCE` 与 `IMAGE_RATIOS`，在 MDX 中通过 `<Image ratio="..." />` 渲染，确保 **零 CLS（Cumulative Layout Shift）**：

| MDX `ratio` | 宽高比 | 母版导出像素 | 前端容器表现 (`lib/image-ratios.ts`) | WebP 体积预算 | 绑定配方与 SEO 用途 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `wide`（**默认**） | `16:9` | **`1600 × 900`** | `aspect-[16/9] w-full` | Hero `≤150KB` / 内文 `≤180KB` | **占全站配图 70%+**：文章主封面 (`W01`，满足 Google Discover `≥1200px`)、双栏对照 (`W03`)、费用算式看板 (`W04`)、资质打码实拍 (`W05`)。 |
| `standard` | `4:3` | **`1600 × 1200`** | `aspect-[4/3] w-full` | `≤220KB` | **多列手机截图实证专用 (`W02`)**：并排展示 2–4 张完整竖屏手机截图（如淘宝/拼多多/小程序操作步骤），纵向高度充足、零裁切。 |
| `square` | `1:1` | **`1200 × 1200`** | `aspect-[1/1] w-2/3 sm:max-w-md mx-auto` | `≤140KB` | 单点聚焦卡：单条体积重公式卡（`W04` 方版）、单条客服/查询指引卡。 |
| `tall` | `9:16` (`1:2`) | **`1200 × 2400`** | `aspect-[9/16] w-1/2 sm:max-w-sm mx-auto` | `≤180KB` | 单张竖屏仓库实拍特写（如电子秤称重读数 + 纸箱三边尺码实拍）。 |
| `og` | `1.91:1` | **`1200 × 630`** | `aspect-[1.91/1] w-full` | `≤120KB` (JPG+WebP) | **社交与外链 OpenGraph 卡片 (`W06`)**：同步导出 `.jpg` 与 `.webp`，供 `og:image` / `twitter:image` 使用。 |

---

## 六大标准 SEO 配图配方（`W01`–`W06`）

> **核心构图铁律（Photo-First + SEO Information Gain）**：
> 1. **实拍与实证占主角**：以真实仓库作业图、真实 App 截图、可复算单据算式与脱敏证明文件为核心，绝不用纯文字大字报或 AI 假图充数。
> 2. **文字克制、把长正文留给 HTML**：顶部 1 行独立标题栏 + 卡片内极简要点/步骤标签 + 底部 1 行凭据提示；所有 200 字以上的详细解释留给文章 HTML/MDX 让搜索引擎直接抓取索引。
> 3. **每张图必带完整 SEO 元数据属性**：`<section>` 上必须写全 `data-recipe`、`data-ratio`、`data-seo-filename`、`data-seo-alt`、`data-seo-caption`、`data-target-keyword`、`data-schema-type`、`data-loading`。

1. **`W01` 文章 SEO 封面 & Discover Hero（`wide` `1600×900`）**
   - **结构**：顶部红蓝航空条 + 独立眉栏（配方签 + 主题实体标题 + `MEIXIPRO.COM` 胶囊）→ 左栏精炼价值卡（核心大标题 + ≤3 条高信息密度收获点，总字数克制）+ 右栏 ≥55% 面积的真实仓库/包裹/作业实拍窗（`object-fit: cover`，无任何遮罩文字横压）→ 底部来源路径与核心规则锚点条。
   - **SEO 职责**：首屏 LCP（`loading="eager" fetchPriority="high"`）、Google Discover 主图（`1600px ≥ 1200px`）、SERP 缩略图。
2. **`W02` 多步操作截图实证 / HowTo 证据卡（`standard` `1600×1200` 默认；2–3 步可选 `wide`）**
   - **结构**：独立眉栏 + 右上「完整截图 · 零边缘裁切」提示胶囊 → 下方 4 列（或 2–3 列）并排手机/网页截图卡片，每列仅配 1 行步骤胶囊（`1. …` 至 `4. …`）+ `object-fit: contain` 完整截图框（100% 保留左右文字边缘）+ 高对比红框 `.pin-box` 精准圈注按钮/输入框。
   - **SEO 职责**：对齐 `HowTo` Schema 步骤与操作型长尾词（`怎么填` / `怎么预报` / `设置教程`）。
3. **`W03` 双栏实拍对照 / 正误对比卡（`wide` `1600×900`）**
   - **结构**：独立眉栏 → 左右双栏巨幅实拍或截图对照卡，每栏含 1 行小标题 + 单色几何状态徽标（`.status-badge.ok` `✓` / `.status-badge.err` `✕` / `.status-badge.warn` `△`）+ 大面积实拍展示窗 + 底部 1 行极简对比结论条。
   - **适用范围（统一所有双栏对比意图）**：到仓拆包拍照 vs 抽真空压缩合箱、电商直寄仓库 vs 亲友代收转寄、正确填法 `✓` vs 常见漏填 `✕`、加固打包前后对比等一切 `vs / 对比 / 避坑` 搜索词。
4. **`W04` 计费算式 / 时效路线决策看板卡（`wide` `1600×900` 或 `square` `1200×1200`）**
   - **结构**：独立眉栏 → 左栏清晰单据算式/路线参数对照卡（Martian Mono `tabular-nums` 等宽数字，公式一眼可复算，未确认报价/时效标 `.pending` 占位）+ 右栏真实仓库电子秤/测量箱体/面单实拍证据窗（方版 `square` 可单栏聚焦核心公式 + 实拍缩略）。
   - **SEO 职责**：专攻高商业意图词（`运费多少钱` / `体积重怎么算` / `空运 vs 海运` / `几天到美国`），最易获得 Google Images 排名与 AI Overviews 引用。
5. **`W05` 资质合规 / 敏感货与处方证明打码实拍卡（`wide` `1600×900`）**
   - **结构**：独立眉栏 → 3 列完整实拍卡（例：1. 实物原包装清点、2. 中文证明/处方、3. 英文翻译件与签章页），全部强制 `object-fit: contain` 保留纸张边缘 + 顶部脱敏状态标签 + 底部 1 行合规提示，页脚声明合规红线。
   - **隐私打码铁律**：所有患者/客户姓名、护照号、身份证、病名、电话、邮箱、地址、医生姓名与公章，**必须在源图片文件上进行不可逆像素马赛克处理**后置入，并在 `<section>` 标记 `data-privacy="sensitive" data-mosaic-verified="true"`。
6. **`W06` 社交分享与外链预览 OpenGraph 卡（`og` `1200×630`）**
   - **结构**：顶部红蓝航空条 + 四周安全留白 → 左栏精炼大标题（`48–54px`，≤18 字）+ 1 行核心利益副标 + 底部 `MEIXIPRO.COM` 品牌识别条；右栏高辨识度真实实拍图（占宽 ~42%）。
   - **SEO 职责**：`og:image` / `twitter:image`，打包脚本同步输出 `.jpg`（社媒爬虫兼容）与 `.webp`。

---

## Empty States（缺素材时的诚实占位）

真实实拍或截图未到齐前，**严禁**用 AI 生成假仓库/假人像顶替，也**严禁**留下难看的纯黑破图框：
- 为尚未替换的图位加上 `.is-empty` 类并在对应 `<section>` 标注 `data-placeholder="true"`；
- 画面显示干净的清冷网格虚线槽位与「待替换为真实实拍 / 截图（附建议拍摄内容）」提示；
- 校验器 **R18** 会明确提示哪些卡仍处于占位态，防止半成品误发上线。

---

## Do's and Don'ts

- **Do:** 以一手真实照片、实操截图与可复算单据为主角，文字极简说清即可，长段落留给 HTML/MDX 正文索引。
- **Do:** 手机截图（`W02`）与纸质证明（`W05`）强制 `object-fit: contain`，100% 保留左右边缘文字与红框批注。
- **Do:** 导出前必跑 `node validate-social-deck.mjs <task-dir>`（过 R16–R20）与 `node scripts/build-web-seo-pack.mjs <task-dir> --screenshot`（验 WebP 体积预算、手机 `340px` 可读性与 Discover/SERP 缩略图）。
- **Do:** 卡面价格、时效、省钱比例与联系方式默认为占位示例（`.pending`），正式投放前换为运营确认且可在小程序复算的真实口径。
- **Don't（严禁）：** 禁止把标题做成半透明黑条横压在截图或实拍正中间导致重叠。
- **Don't（严禁）：** 禁止在配图中使用任何装饰性 Unicode Emoji（`⚠`、`⚡`、`✅`、`❌`、`🔥` 等）；状态徽标统一用等宽单色符号 `✓` / `✕` / `△`。
- **Don't（严禁）：** 禁止给单字重得意黑 `Smiley Sans Oblique` 设置 `font-weight: 700/800` 触发伪粗体糊字。
- **Don't（严禁）：** 禁止输出中文文件名、通用编号文件名（`image1.png`）或缺失 `alt` / `caption` 的裸图。
- **Don't（严禁）：** 禁止使用纯文字大卡片代替真实实拍，禁止满屏重复水印。

---

## Decisions Log

| Date | Decision | Rationale |
| :--- | :--- | :--- |
| 2026-11-07 | 建立官网配图系统方案 A（清冷航单灰 `#F8FAFC` + 租户正蓝 `#0060C9` + 琥珀金 `#D97706`） | 结合 `meixipro.com` `app/globals.css`、`lib/image-ratios.ts` 与既有品牌主色 `#0060C9`，在纯白文章卡片中建立清晰有界容器 |
| 2026-11-07 | 确立 Photo-First 实拍优先铁律与隐私马赛克脱敏规则 | 杜绝纯文字假图与敏感信息泄露，强化一手操作与仓储实证感 |
| 2026-11-25 | 全面升级为 **SEO-First v2**（扩展 `W01`–`W06` 通用搜索意图配方、新增 `references/web-seo-images.md`、落地 `validate-social-deck.mjs` R16–R20 与 `scripts/build-web-seo-pack.mjs` WebP/OG/Manifest/340px 验图管线） | 修正初稿中 `W03`–`W05` 定义冲突、得意黑 `800` 伪粗体、模板内残余 Emoji 与未核实商业承诺数字；让从选题到 WebP/MDX/JSON-LD 上线的每一步全部围绕 SEO 指标可验证、可交付 |

# 官网文章与教程配图 SEO 实战专规（Website Image SEO Playbook）

> **最高北极星**：官网配图不为「看起来像海报」服务，只为一个目标服务——**让页面在 Google Organic SERP、Google Images、Google Discover 与 AI Overviews（GEO）中拿到更高排名、更高点击率与更强转化信任，同时不拖慢 Core Web Vitals（LCP / CLS）。**
>
> 小红书封面拼 0.5 秒双列 CTR（见 `references/xhs-cover-ctr.md`）；公众号贴图号拼 3:4 微信裁切算式（见 `references/greenbook-specs.md`）；**官网配图拼的是「搜索意图匹配 + E-E-A-T 一手实证 + 机器可索引元数据 + 极速 WebP 加载 + 手机 340px 可读性」**。三套系统目标不同，绝不可混用。

---

## 一、 官网 SEO 配图 vs 社媒配图：核心规则解耦

| 维度 | 官网配图（Waybill Evidence `W01`–`W06`） | 小红书封箱（`X01` / `C02`–`C05`） | 公众号小绿书（Greenbook `G01`–`G07`） |
|---|---|---|---|
| **核心指标** | **Organic SEO / Discover / Image Pack / GEO 引用 / LCP & CLS / 停留转化** | 180pt 发现页双列 0.5s 点击率（CTR） | 微信消息流 16:9 / 2.35:1 裁切可读性 |
| **信息策略** | **图文互补 + 一手实证（Information Gain）**：长正文留给 HTML/MDX 让爬虫索引，配图承担实拍证据、步骤指引、可复算公式与对比结论 | 封面反剧透开环、内页闭环 | 可复算账本算式，数字即论点 |
| **画布比例** | 严格绑定 `lib/image-ratios.ts`：`16:9` (`1600×900`) / `4:3` (`1600×1200`) / `1:1` (`1200×1200`) / `9:16` (`1200×2400`) / `og` (`1200×630`) | 固定 `3:4` (`1080×1440`) | 固定 `3:4` (`1080×1440`) |
| **文件交付** | **WebP 主力**（CWV 体积预算内）+ **OG 同步输出 JPG** + `seo-manifest.json` + `mdx-snippets.md`（含 `alt` / `caption` / `ImageObject` JSON-LD） | PNG（无严苛体积预算） | PNG |
| **命名规范** | **强约束**：全小写英文 `kebab-case` 实体短语（如 `taobao-pdd-address-paste-steps.webp`） | 序顺命名（`xhs-01-cover.png`） | 序顺命名 |
| **可读性基线** | Google 移动优先索引：手机正文宽 **`340px`**（`1600px` 母版缩至 `21.25%`）+ 桌面 `688px` + SERP `120px` 缩略图 | 180pt 双列信息流 | 微信 16:9 安全带 `y416–1024` |

---

## 二、 官网配图服务的四大 SEO 战场

1. **Google Organic SERP & Image Pack（自然搜索 + 图片包）**
   - 语义化 `kebab-case` 文件名 + 精准 `alt` + `<figcaption>` + 邻近 H2/正文实体共同决定图片在 Google Images 与 SERP 图片包中的相关性。
   - **视觉辨识度**：在纯白 SERP 与竞品图里，清冷航单灰底台（`#F8FAFC`）+ 顶部红蓝航空斜纹 + 租户正蓝（`#0060C9`）+ 零遮挡实拍图能一眼建立「专业跨境转运实证」心智，拉高点击率。
2. **Google Discover（高流量推荐流）**
   - Google 官方门槛：封面主图宽度 **必须 `≥ 1200px`**（本系统默认 `1600×900` `16:9`），且页面配合 `<meta name="robots" content="max-image-preview:large">`。
   - **禁止满屏斜纹水印、禁止低质网图拼贴、禁止标题黑条横压主体**——这些都会显著降低 Discover 展示率。
3. **AI Overviews & GEO（生成式搜索引用）**
   - 多模态搜索模型与 AI Overviews 偏爱**「信息增益高（Information Gain）」**的一手证据：真实仓库作业实拍、未裁切 App 操作步骤红框图、清晰对照表、可复算体积重算式与脱敏清关凭证。
   - 图内核心标签与标题使用**标准实体词**（如「体积重公式」「东莞转运仓」「淘宝收货地址粘贴」「个人自用处方证明」），便于多模态 OCR 精准抽取并关联到页面主题。
4. **Core Web Vitals（LCP + CLS）与用户行为信号（Dwell Time）**
   - **LCP**：首屏 Hero (`W01`) 导出 WebP 控制在 **`≤ 150KB`**（理想 `≤ 100KB`），并在 MDX/HTML 中标 `loading="eager" fetchPriority="high"`；其余正文图全部 `loading="lazy"`。
   - **CLS**：每张图必须严格匹配 `lib/image-ratios.ts` 锁定比例并在标签输出精确 `width` / `height`，杜绝页面跳动。
   - **停留与转化**：读者扫图即可看懂步骤与算式，大幅降低跳出率、提升小程序询价/试算转化。

---

## 三、 搜索意图 → 六大 SEO 配图配方路由（`W01`–`W06`）

不要按个人喜好选版式，**按文章的搜索意图（Search Intent）与对应 H2 段落职责选配方**。全部 6 套配方均已内置在 `assets/template-web-card.html`：

| 配方 ID | 名称 | 默认板型 (`ratio`) | 对应搜索意图 / H2 场景 | 对应 Schema / SEO 作用 |
|---|---|---|---|---|
| **`W01`** | **文章 SEO 封面 / Discover Hero** | `wide` (`1600×900`) | `/blog/*`、`/guides/*`、`/services/*`、`/destinations/*` 文章首图 | **Google Discover (`≥1200px`) + 首屏 LCP + SERP 缩略图**。左栏核心实体大标题 + ≤3 条高信息密度收获，右栏 ≥55% 真实仓拍/实证图，绝不拿黑条压图。 |
| **`W02`** | **多步操作截图实证卡** | `standard` (`1600×1200`)（2–3 图可选 `wide`） | `怎么填 / 怎么寄 / 怎么预报 / 淘宝拼多多设置地址` 等操作教程 | **HowTo Schema 步骤实证 + Image Pack**。2–4 列完整手机/网页截图（强制 `object-fit: contain` 保留左右边缘），每列 1 行步骤胶囊 + 红框 `.pin-box` 精准圈注入口。 |
| **`W03`** | **双栏实拍对照 / 正误对比卡** | `wide` (`1600×900`) | `A vs B / 拆包抽真空前后 / 正确填法 vs 常见漏填 / 电商直寄 vs 亲友转寄` | **最高 Information Gain（信息增益）**。左右双栏巨幅实拍或截图 + 语义徽标（`✓` 绿 / `✕` 红 / `△` 琥珀，**严禁 Emoji**）+ 底部单行对比结论。 |
| **`W04`** | **费用算式 / 时效路线决策看板** | `wide` (`1600×900`) 或 `square` (`1200×1200`) | `多少钱 / 体积重怎么算 / 空运 vs 海运 / 几天到 / 泡重减免` | **最高商业转化词 + AI Overview / Image Pack 引用磁铁**。左栏 Martian Mono `tabular-nums` 可复算公式或路线决策表（未确认口径标 `.pending`），右栏配真实电子秤/纸箱测量/航单实拍做 E-E-A-T 佐证。 |
| **`W05`** | **合规资质 / 敏感货打码证明卡** | `wide` (`1600×900`) | `药品怎么寄 / 敏感货清单 / 医生处方中英文证明 / 清关合规` | **YMYL 级 E-E-A-T 强信任信号**。3 列完整实拍（实物清点 + 中文证明 + 英文翻译/签章页，`object-fit: contain` 不裁纸边），所有个人隐私必须不可逆像素马赛克脱敏 + 底部合规红线。 |
| **`W06`** | **OpenGraph 社交与外链分享卡** | `og` (`1200×630`) | `og:image` / `twitter:image` / 微信、Reddit、一亩三分地、Discord 链接预览 | **外链与社媒转发点击率（Referral CTR）**。60px 四周安全留白，超清晰 48–56px 大标题 + 1 句价值锚点 + 右侧实拍缩略窗 + `meixipro.com` 品牌尾标；**同步输出 `.jpg`（爬虫最稳）+ `.webp`**。 |

> **补充板型**：单张竖屏仓库特写（如电子秤读数 + 箱体尺码实拍）可使用 `tall`（`1200×2400`，`aspect-[9/16]`）；单条计费公式或核心参数卡可使用 `square`（`1200×1200`，`aspect-[1/1]`）。

---

## 四、 官网配图 SEO 十大硬规范

### 1. 严格绑定 `lib/image-ratios.ts` 与 Google Discover 分辨率门槛
- 尺寸只能从以下 5 档中选（验证器 **R16** 强制拦截尺寸漂移）：
  - `wide`: **`1600 × 900`**（`16:9`，默认主力，占全站配图 70%+）
  - `standard`: **`1600 × 1200`**（`4:3`，多列手机截图拼图专用）
  - `square`: **`1200 × 1200`**（`1:1`，单点公式/参数聚焦卡）
  - `tall`: **`1200 × 2400`**（`9:16` 工程比例 `1:2`，单张竖屏实拍特写）
  - `og`: **`1200 × 630`**（`1.91:1`，OpenGraph 分享卡）
- **Discover 硬门槛**：文章主封面（`W01`）宽度 **必须 `≥ 1200px`**（`1600×900` 自动满足）。
- **多比例裁切安全带**：Google `Article` 结构化数据建议支持 `16:9`、`4:3`、`1:1` 展示；`W01` 封面与 `W06` OG 图的核心视觉主体和核心标题须避免紧贴最边缘 `48px` 内。

### 2. Core Web Vitals 体积预算与现代格式
- **主力格式**：全部官网正文与封面配图导出 **WebP**（`scripts/build-web-seo-pack.mjs` 自动调用 `cwebp` 压缩，并保留高清 PNG 母版于 `output/masters/` 供二次编辑）。
- **OG 特殊兼容**：`W06` (`og` `1200×630`) **同时导出 `.jpg` 与 `.webp`**，页面 `<meta property="og:image">` 优先指向 `.jpg`（微信、X、LinkedIn 等爬虫对 JPG 兼容性最稳）。
- **单图文件体积硬预算（WebP）**：
  - `W01` 文章首屏 Hero（影响 LCP）：**`≤ 150 KB`**（理想 `≤ 100 KB`）
  - `W03` / `W04` / `W05` 正文双栏/三栏/看板图：**`≤ 180 KB`**
  - `W02` 四列密集手机截图（`1600×1200`）：**`≤ 220 KB`**
  - `W06` OpenGraph 分享图（`.jpg` / `.webp`）：**`≤ 120 KB`**
- **加载策略**：仅文章首张 Hero（`W01`）使用 `loading="eager" fetchPriority="high"`（Next.js `<Image priority />`）；其余正文内图一律 `loading="lazy"`。

### 3. 语义化英文 `kebab-case` 文件名（验证器 R17 强制）
- 文件名是 Google Image Search 排名强信号。
- **格式**：`<核心主题实体>-<画面内容>-<配图角色>`，全小写 ASCII 字母 + 数字 + 短横线，**3–7 个英文词，总长 ≤ 65 字符**（不含扩展名）。
- ✅ **正确示例**：
  - `taobao-to-usa-warehouse-address-guide-hero.webp`
  - `taobao-pdd-address-paste-steps.webp`
  - `warehouse-unpacking-vacuum-compression-compare.webp`
  - `volumetric-weight-formula-air-vs-sea-usa.webp`
  - `prescription-medicine-china-to-usa-docs-redacted.webp`
  - `taobao-to-usa-warehouse-address-og.jpg`
- ❌ **严禁**：中文文件名（`淘宝地址.webp`）、空格、大写驼峰、哈希乱码、`image1.webp` / `pic-02.png` / `IMG_4821.jpg` / `untitled.webp`、以及重复堆砌关键词（如 `usa-shipping-cheap-usa-shipping-taobao-usa-shipping.webp`）。

### 4. `alt`、`caption` 与正文三层互补规范（验证器 R17 强制）
每张官网配图 `<section>` 必须在 HTML 属性上完整声明 SEO 元数据，由打包脚本自动导出 `seo-manifest.json` 和 `mdx-snippets.md`：
- **`data-seo-alt`（给搜索引擎与视障读屏器）**：
  - 客观描述「图中看到了什么实证」，并自然融入 **1 个**当前段落的目标关键词。
  - 长度：中文建议 **`18–55` 字**（英文 `60–125` 字符）。
  - ❌ 严禁以「图片」「配图」「一张关于……」「这是……」开头。
  - ❌ 严禁逗号罗列关键词堆砌（如 `美西转运,集运美国,淘宝集运,美国转运,省钱攻略`）。
  - ✅ 示例：`淘宝与拼多多收货地址一键粘贴美西东莞转运仓并保留GMX会员号的4步手机操作实拍截图`
- **`data-seo-caption`（给读者扫读 + 爬虫语义强化）**：
  - 用 1 句凝练结论解释读者从这张图里应执行的动作或核对的规则，**不要机械复制 `alt`**。
  - ✅ 示例：`图：在淘宝和拼多多粘贴仓库地址后，务必确认收件人或街道末尾保留专属 GMX 会员号再保存。`
- **`data-target-keyword`（单图锚定的核心搜索词）**：明确标注该图服务的 1 个核心长尾词，避免同一篇文章里 5 张图互相争抢完全相同的锚定词。

### 5. 结构化数据与页面上下文联动
- `scripts/build-web-seo-pack.mjs` 会为整套配图自动生成 `ImageObject` JSON-LD 与 MDX `<Image />` 代码块：
  - `W01` → 绑定 `Article.image` 与 Frontmatter `coverImage`
  - `W02` → 绑定 `HowTo.step[].image`
  - `W06` → 绑定 `og:image` / `twitter:image`
- 每张图必须紧贴其对应的 `H2` / `H3` 段落放置，且图内主标题与所在 `H2` 实体一致但不机械逐字照抄。

### 6. 移动优先可读性与「拒绝把文章塞进图片」（验证器 R16 / R19）
- Google 采用 **Mobile-First Indexing**。官网正文卡片桌面宽 `768px`（图渲染宽约 `688px`，母版 `43%`），**手机端渲染宽仅约 `340px`（`1600px` 母版缩至 `21.25%`）**。
- **字号硬底线（`1600px` 母版）**：
  - 顶栏主标题 `.header-title`：`36–44px`；封面大标题 `.w01-heading` / `.w06-heading`：`48–56px`
  - 卡片小标题 / 步骤胶囊：`≥ 20–24px`
  - 正文说明 / 底部标签条：`≥ 19–22px`
  - 页脚凭证 / 英文眉栏：`≥ 16px`
- **反文字墙（Anti-Wall-of-Text）**：长段解释必须写在 HTML/MDX 正文里让爬虫直接索引，严禁把 300 字教程塞进一张图片。单图可见字数建议上限：`W01 ≤ 110`、`W06 ≤ 65`、`W02/W03/W05 ≤ 150`、`W04 ≤ 220`（超出由 **R19** 提醒/拦截）。

### 7. E-E-A-T 一手实拍铁律（Photo-First）
- 优先使用真实仓库作业照、真实电子秤与尺码测量照、真实淘宝/拼多多/小程序操作截图、脱敏后的真实证明文件。
- **严禁**用 AI 生成假仓库、假客服人物或纯文字大字报充当实证图；若素材尚未到齐，必须使用模板自带的 `.photo-slot.is-empty` 占位状态并标注 `data-placeholder="true"`，等运营补齐实拍后再发布。
- 手机截图与纸质证明（`W02` / `W05`）强制 `object-fit: contain`，100% 保留左右文字边缘与红框标注，严禁裁掉首尾字符（验证器 **R20**）。

### 8. 隐私不可逆像素打码红线（验证器 R20）
- 凡涉及客户运单条码/识别码、收件人姓名、手机号、邮箱、医院名称、诊断病名、护照/身份证号、医生姓名与签章的实拍（尤其是 `W05`）：
  - **必须在源图片文件上完成不可逆像素马赛克（Mosaic Pixelation）处理**后再放入 `assets/`，并在 `<section>` 标记 `data-privacy="sensitive" data-mosaic-verified="true"`。
  - CSS `.mosaic-layer` 仅用于排版草图预览定位，**绝不能当作最终隐私保护手段**（防止未脱敏原图误上传或被裁切泄露）。

### 9. 零遮挡、零 Emoji、零满屏水印（验证器 R18）
- **严禁**把标题放在半透明黑条上横压在 UI 截图或实拍图中央导致文字打架。
- **严禁**在官网配图内使用任何装饰性 Unicode Emoji（如 `⚠`、`⚡`、`✅`、`❌`、`🔥`、`👉`、`💡`、`📌`）；状态标记统一使用等宽单色几何符号（`✓`、`✕`、`△`、`→`）配语义徽标底色。
- **严禁**满屏斜纹半透明水印；品牌归属统一落在右上角胶囊（`MEIXIPRO.COM`）与底部凭据条。

### 10. 商业口径非承诺与单字重防糊纪律（验证器 R16 / R19）
- 卡面上的运费价格、时效天数、省钱比例、客服联系方式在未经运营确认前一律作为占位示例（用 `.pending` 样式或标明「示例口径 · 以小程序实时试算为准」），**禁止编造**「立省 30%-50%」「绝对最便宜」「100% 包清关」等不可复算或违规绝对化表述。
- **得意黑 `Smiley Sans Oblique` 单字重防糊**：必须显式声明 `font-weight: 400; font-synthesis: none;`（验证器 **R16** 拦截 `weight >= 600` 的伪粗体合成）。

---

## 五、 官网配图 5 步标准 SEO 生产工作流

1. **Step 1 · SEO 需求拆解（Intake）**
   - 收集：文章主题与主关键词、目标 URL slug（如 `taobao-to-usa-warehouse-address`）、文章 `H2` 段落结构、真实照片/截图素材目录。
   - 若用户只给了文章草稿或关键词，先按第三节路由表列出「配图 SEO 规划表」（每张图的配方 `W01–W06`、比例 `ratio`、`kebab-case` 文件名、锚定长尾词、所需实拍素材）。
2. **Step 2 · 拷贝种子并填入 SEO 属性**
   - 拷贝 `assets/template-web-card.html` 至 `local-tests/<slug>/index.html`。
   - 在 `<html>` 设置 `data-brand="meixipro" data-system="web" data-article-slug="<slug>" data-page-url="https://meixipro.com/blog/<slug>/"`。
   - 为每张 `<section class="board ...">` 写全 `data-recipe`、`data-ratio`、`data-seo-filename`、`data-seo-alt`、`data-seo-caption`、`data-target-keyword`、`data-schema-type`、`data-loading`。
3. **Step 3 · 跑 SEO 与排版自动校验（R1 / R7 / R8 / R16–R20）**
   ```bash
   node validate-social-deck.mjs local-tests/<slug>
   ```
   修复全部 `FAIL`，逐条核对 `WARN`（特别是 R16 尺寸/字号/防糊、R17 文件名与 alt、R18 破图与 Emoji、R19 字数墙、R20 截图裁切与隐私打码）。
4. **Step 4 · 一键渲染 WebP + OG JPG + SEO 清单 + 340px/SERP 验图台**
   ```bash
   node scripts/build-web-seo-pack.mjs local-tests/<slug> --screenshot
   ```
   自动产出：
   - `output/web/<seo-filename>.webp`（官网直用，已按 CWV 体积预算压优）
   - `output/web/<og-filename>.jpg`（`W06` OG 爬虫兼容版）
   - `output/masters/<seo-filename>.png`（无损母版）
   - `output/seo-manifest.json`（全量尺寸 / KB / CWV 状态 / alt / caption / schema 元数据）
   - `output/mdx-snippets.md`（一键粘贴进 MDX 文章的 `<Image />` 与 `ImageObject` JSON-LD 代码）
   - `web-seo-preview.html` 与 `output/web-seo-preview.png`（桌面 `688px` + 手机 `340px` + Google Discover / SERP `120px` + OG 四视图实测验图台）
5. **Step 5 · 视觉与 SEO 联合验收交付**
   - 用 Read 工具查看 `output/web-seo-preview.png` 与关键成品图：确认在手机 `340px` 下无需放大即可读懂标题与步骤、在纯白桌面正文卡片中边界清晰、Google Discover/SERP 缩略图无裁切且抓眼。
   - 交付给用户：成品目录路径、WebP 体积汇总、以及 `output/mdx-snippets.md` 中可直接粘贴的 MDX 代码与注意事项。

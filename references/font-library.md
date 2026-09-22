# 花体字库 · Font Library

社交卡的封面标题是整张图唯一的"钩子"。正文用 Noto Serif / Noto Sans 是对的——它们要中性、要好读；但如果封面标题也是中性字体，缩略图信息流里就没有任何东西能把手指停下来。

这个文件是 **52 款免费商用中文花体字**的注册表与取用规则，覆盖毛笔榜书、行书、楷书、招牌装饰、手写可爱五档气质。选它而不是"下载几个 TTF 扔进仓库"的原因：本 skill 的产出方式是 HTML → Chromium 截图，只有能被浏览器真正加载的字体才会出现在成品上。

> 注册表真源：`assets/font-library.json`。**这个文件由它生成**；改字体请改 JSON，再跑 `scripts/build-font-links.mjs`。
> 授权核验记录：`references/font-license-audit.md`（逐款一手来源核查，含证据强度披露）。

## 0. 一句话规则

**花体字只用在封面主标题与 hero statement。正文、lead、label、meta、图表数字一律不动。**

原因不是审美洁癖，是三条硬约束：

1. **可读性**：花体字的笔画细节在 360px 宽的缩略图里会糊成一团。标题只有 4-10 个字，糊得起；正文糊不起。
2. **字数覆盖**：花体字大多只有 GB2312 级字表（约 6763 字）。标题短，撞生僻字的概率低；正文长，撞上就是同一行里两种字形。
3. **系统一致性**：Editorial 靠衬线正文承载"杂志感"，Swiss 靠 Inter 承载"工程感"。花体字是**标题层的例外**，不是新的正文层。

## 1. 上游来源

| 来源 | 性质 | 说明 |
| --- | --- | --- |
| [中文网字计划 chinese-free-web-font-storage (v6)](https://github.com/KonghaYao/chinese-free-web-font-storage) | 上游 | 只收录免费商用中文字体，用 cn-font-split 切成按需加载的 woff2 分片，可直接引 result.css。 |
| [Google Fonts](https://fonts.google.com/) | 上游 | OFL 开源字体，Google 官方托管并做 unicode-range 分片，稳定性最好。 |
| [wc-ex/cn-fontsource](https://github.com/wc-ex/cn-fontsource) | 上游 | 同一批免费商用字体的另一套网页化索引，附带 fontClass 分类与字数统计。 |
| [猫啃网 maoken.com](https://www.maoken.com/) | 上游 | 中文免费商用字体的授权聚合站；本表用它作为作者声明的二手出处，非官方授权文件。 |

`wordshub/free-font` 和 `dengcao/free-fonts` 是 TTF 下载合集，收录的正是上面这几家字库的作品。它们不提供网页字体，所以本库走的是"同一批免费商用字体"的**网页可用版本**（woff2 按 unicode-range 分片）。需要从那两个仓库拿原始 TTF 时，见第 10 节。

## 2. 取用方式

字体注册表在 `assets/font-library.json`，取用工具是 `scripts/build-font-links.mjs`：

```sh
# 看全库（★ = 种子模板已内置）
node scripts/build-font-links.mjs list
node scripts/build-font-links.mjs list --group sign

# 生成要粘进 index.html 的 <link> 标签
node scripts/build-font-links.mjs links sucaijishi-shehui jiangxi-zhuokai
node scripts/build-font-links.mjs links sign          # 整个分组
node scripts/build-font-links.mjs links all           # 全部 52 款

# 生成 <link> + --f-* 令牌 + .f-* 工具类的完整块
node scripts/build-font-links.mjs css brush

# 离线兜底：把 woff2 分片下载到任务目录，之后的渲染不依赖网络
node scripts/build-font-links.mjs fetch local-tests/<slug>/fonts qiji ma-shan-zheng
```

选择器可以写字体 id、分组名（`brush` / `running` / `kai` / `sign` / `hand`）、`featured`、`all`，也可以直接写中文字体名。

## 3. 种子模板已内置的 14 款

两个种子模板（`assets/template-editorial-card.html` / `assets/template-swiss-card.html`）的 `<head>` 里已经写好了这 14 款的 `<link>`（**优先挑授权最干净、字形最通用的**），并定义了五个令牌与对应的 `.f-*` 工具类。开箱即用，不用再拉字体。

| id | 字体 | 气质 | 授权 |
| --- | --- | --- | --- |
| `ma-shan-zheng` | **马善政毛笔楷书** | 毛笔 / 榜书 / 大字 | OFL · ✅ 免费商用 |
| `chill-bangshu` | **仓耳周珂正大榜书** | 毛笔 / 榜书 / 大字 | 官方 · ✅ 免费商用 |
| `liu-jian-mao-cao` | **刘建毛草** | 毛笔 / 榜书 / 大字 | OFL · ✅ 免费商用 |
| `zhi-mang-xing` | **钟齐志莽行书** | 行书 / 行草 | OFL · ✅ 免费商用 |
| `suifeng` | **随峰体** | 行书 / 行草 | 官方 · ✅ 免费商用 |
| `jiangxi-zhuokai` | **江西拙楷** | 楷书 / 拙楷 | 二手 · ✅ 免费商用 |
| `moon-stars-kai` | **月星楷** | 楷书 / 拙楷 | OFL · ✅ 免费商用 |
| `xuandong-kai` | **玄冬楷书** | 楷书 / 拙楷 | 官方 · ✅ 免费商用 |
| `qiji` | **黄令东齐伋体** | 招牌 / 古风装饰 | OFL · ✅ 免费商用 |
| `tiejili` | **铁蒺藜体** | 招牌 / 古风装饰 | OFL · ✅ 免费商用 |
| `sucaijishi-shehui` | **素材集市社会体** | 招牌 / 古风装饰 | OFL · ✅ 免费商用 |
| `qiantu-bifeng` | **千图笔锋手写体** | 手写 / 可爱 / 马克笔 | 官方 · ✅ 免费商用 |
| `zcool-kuaile` | **站酷快乐体** | 手写 / 可爱 / 马克笔 | OFL · ✅ 免费商用 |
| `yozai` | **悠哉字体** | 手写 / 可爱 / 马克笔 | OFL · ✅ 免费商用 |

`<html data-title-font="…">` 的五个取值各自落到哪一款：

| data-title-font | 默认字体 | CSS family |
| --- | --- | --- |
| `brush` | **马善政毛笔楷书** | `Ma Shan Zheng` |
| `running` | **钟齐志莽行书** | `Zhi Mang Xing` |
| `kai` | **江西拙楷** | `jiangxizhuokai` |
| `sign` | **素材集市社会体** | `SuCaiJiShi-SheHuiTi` |
| `hand` | **千图笔锋手写体** | `qiantubifengshouxieti` |

其余 38 款按需加载：跑 `build-font-links.mjs links <id>`，把输出粘到模板的 `<!-- FONT_LIBRARY_EXTRA -->` 标记处。

## 4. 完整字库（52 款）

"字数"列是**实测值**：把该字体所有 woff2 分片的 `unicode-range` 取并集，数落在 U+4E00–U+9FFF 的码点数量。不是字库宣传语。

### 毛笔 / 榜书 / 大字（6 款）

Brush display — 封面主标题冲击力最强的一档

| id | 字体 | CSS family | 字数 | 商用 | 授权等级 | 适合 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `chill-bangshu` | **仓耳周珂正大榜书** | `TsangerZhoukeZhengdabangshu` | 6-10 千（6763） | ✅ 免费商用 | 官方 | 4-6 字封面主标题，力度最强；适合国风、节气、文化、旅行大字 | 字体文件（含修改版及独立构件）不得单独销售 |
| `ma-shan-zheng` | **马善政毛笔楷书** | `Ma Shan Zheng` | 1-2 万（12258） | ✅ 免费商用 | OFL | 毛笔楷书，最通用的一款；文化、书单、节气、国风封面 | OFL 1.1；不得单独出售字体文件 |
| `alimama-dongfang-dakai` | **阿里妈妈东方大楷** | `Alimama DongFangDaKai` | 6-10 千（9121） | ✅ 免费商用 | 官方 | 颜真卿多宝塔碑算法生成，正大气象；品牌、年度总结、大事件封面 | 未经阿里授权不得上传/发布/转载字体文件；不得用于商标注册；不得二次创作 |
| `liu-jian-mao-cao` | **刘建毛草** | `Liu Jian Mao Cao` | 1-2 万（12258） | ✅ 免费商用 | OFL | 狂草，辨识度低但气势足；适合 2-4 字极短封面钩子 | OFL 1.1；不得单独出售字体文件 |
| `long-cang` | **有字库龙藏体** | `Long Cang` | 6-10 千（6763） | ✅ 免费商用 | OFL | 清瘦行草，文人气；书评、影评、夜读、茶事 | 以 Google 分发版为准（OFL）；有字库原始中文条款未取得。Google 版非全字符集 |
| `yishanbei-zhuan` | **峄山碑篆体** | `峄山碑篆体` | 不足 6 千（3754） | ❌ 未核实 | 二手 | 小篆，图形感极强；2-4 字短标题、章节题、印章式点缀 | 无一手声明；商标/嵌入/出版三条边界三源冲突 |

### 行书 / 行草（5 款）

Running script — 有笔势，比楷书快，适合标题与引言

| id | 字体 | CSS family | 字数 | 商用 | 授权等级 | 适合 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `honglei-xingshu` | **鸿雷行书简体** | `hongleixingshu` | 6-10 千（6799） | ✅ 免费商用 | 作者声明 | 笔势连贯的行书；标题、引言、金句，比草书好读 | 作者原文仅「已登记版权，全渠道免费商用」；「不得修改/出售」系猫啃整理 |
| `zhi-mang-xing` | **钟齐志莽行书** | `Zhi Mang Xing` | 6-10 千（6763） | ✅ 免费商用 | OFL | 行草，节奏感强；情绪化标题、歌词、诗句 | OFL 1.1；不得单独出售字体文件 |
| `suifeng` | **随峰体** | `The Peak Font 隨峰體 Beta` | 不足 6 千（5879） | ✅ 免费商用 | 官方 | 瘦硬行书，骨感明显；户外、徒步、极简封面 | OFL 1.1（作者明示）；仓库无随附 OFL.txt |
| `ruimeijia-yingbi` | **瑞美加张清平硬笔行书** | `瑞美加张清平硬笔行书` | 6-10 千（6763） | ✅ 免费商用 | 二手 | 硬笔行书，细而清晰；长标题也能用，文艺但不高调 | 不可修改/衍生；不可用于商标、转售品、嵌入式用途 |
| `runzhijia-zouzhang` | **润植家如印奏章楷** | `nzgrRuYinZouZhangKai` | 6-10 千（6334） | ⚠️ 有条件 | 二手 | 奏章楷，端正里带书写感；历史、档案、公文梗、考据向 | 商用前提：关注「润植家艺术工作室」公众号；且只对最新版本承诺 |

### 楷书 / 拙楷（6 款）

Kai — 端庄可读，长标题也不吃力

| id | 字体 | CSS family | 字数 | 商用 | 授权等级 | 适合 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `jiangxi-zhuokai` | **江西拙楷** | `jiangxizhuokai` | 6-10 千（6055） | ✅ 免费商用 | 二手 | 拙朴手写楷，全场最百搭的一款；长标题、清单、正文标题都行 | 作者＝黄煜臣；原文仅「免费提供…任何传播渠道」 |
| `chengrong-guangke` | **程荣光刻楷** | `chengrongguangke` | 6-10 千（6769） | ✅ 免费商用 | 官方 | 带刻版味的楷书，厚重稳定；历史、匠人、手作、器物 | 不可用于商标、转售品、嵌入式用途；转载字体文件须标注出处 |
| `xuandong-kai` | **玄冬楷书** | `XuandongKaishu` | 6-10 千（6775） | ✅ 免费商用 | 官方 | 清秀楷书，笔画干净；书摘、课程、知识卡片 | OFL 1.1 + 不得变相收费；衍生名不得用「玄冬/Xuandong」；仓库无 LICENSE 文件 |
| `yanshi-youran` | **演示悠然小楷** | `slideyouran` | 6-10 千（6766） | ✅ 免费商用 | 二手 | 小楷，安静克制；长文标题、诗笺、日签 | 不可修改/衍生；不可用于商标、转售品、嵌入式用途 |
| `yanshi-qiuhong` | **演示秋鸿楷** | `Slideqiuhong` | 6-10 千（9119） | ✅ 免费商用 | 二手 | 半手工楷，介于楷与宋之间；教程、笔记、科普 | 同演示字体授权文本；全媒体免费可商用 |
| `moon-stars-kai` | **月星楷** | `Moon Stars Kai` | 1-2 万（15518） | ✅ 免费商用 | OFL | 带毛笔味的楷书，比拙楷更规整；正式但不僵 | OFL 1.1；不得单独出售 |

### 招牌 / 古风装饰（13 款）

Sign & decorative — 字形本身即设计，最接近剪映「花体字」

| id | 字体 | CSS family | 字数 | 商用 | 授权等级 | 适合 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `huangyinqi-zhaopai` | **黄引齐招牌体** | `huangyinqi zhaopai` | 6-10 千（6763） | ⚠️ 有条件 | 二手 | 老招牌字，最接近剪映「花体字」气质；餐饮、小店、探店、年货 | 官网只承诺「个人免费商用」，企业授权仅有截图；官网 2013 年后不可达 |
| `qiji` | **黄令东齐伋体** | `QIJIFALLBACK` | 约 2 万（20970） | ✅ 免费商用 | OFL | 康熙字典木刻风，古书气极强；古籍、中医、茶道、国风封面 | OFL 1.1，Reserved Font Name = QIJI（修改版禁用该名） |
| `pingfang-langya` | **平方赖江湖琅琊体** | `平方赖江湖琅琊体` | 6-10 千（6763） | ✅ 免费商用 | 二手 | 江湖气花体，笔画外扩；武侠、游戏、江湖叙事、热血管 | 不允许修改/衍生；禁止出售字库；商标/嵌入两源冲突 |
| `pingfang-feiyang` | **平方赖江湖飞扬体** | `平方赖江湖飞扬体` | 6-10 千（6763） | ✅ 免费商用 | 二手 | 飞扬体，比琅琊体更飘逸；国潮、节庆、新品发布 | 同平方赖江湖系条款 |
| `runzhijia-kangxi` | **润植家康熙字典美化体** | `nzgrKangxi` | 6-10 千（6931） | ⚠️ 有条件 | 二手 | 康熙字典字形，笔画瘦挺；文博、典籍、书法教学 | 商用前提：关注公众号；仅最新版（Ver 1.36）在承诺内 |
| `feihua-song` | **飞花宋体** | `FlyFlowerSong` | 1-2 万（10211） | ✅ 免费商用 | 官方 | 带装饰笔锋的宋体；文艺标题、影评、乐评、散文 | 非 OFL 自定义条款；禁变相收费；衍生名不得含「飞花/FlyFlower」；仓库无 LICENSE |
| `zihun-biantaoti` | **字魂扁桃体** | `zihunbiantaoti` | 6-10 千（6766） | ✅ 免费商用 | OFL | 圆胖粗标题，亲和又有力；美食、萌宠、生活方式 | 得意黑二创，官方称开源免费商用；官网通用弹窗仍写「禁止商用」 |
| `kuaikan-shijie` | **快看世界体** | `快看世界体` | 6-10 千（6765） | ✅ 免费商用 | 官方 | 漫画感粗标题；二次元、游戏、追番、年轻向 | 不可转让；不得上传转载字库文件；不得单独出售/出租/转授权 |
| `tiejili` | **铁蒺藜体** | `Tiejili` | 1-2 万（11200） | ✅ 免费商用 | OFL | 瘦长带刺的装饰体；先锋、设计、潮流、艺术展 | OFL 1.1；不得单独出售 |
| `sucaijishi-shehui` | **素材集市社会体** | `SuCaiJiShi-SheHuiTi` | 6-10 千（6763） | ✅ 免费商用 | OFL | 复古标语体；怀旧、年代感、老广告、市井叙事 | OFL 1.1（思源黑体衍生），个人企业均可自由商用 |
| `zhulang-mengya` | **逐浪萌芽字** | `ZoomlaMengyas-A080` | 6-10 千（7171） | ✅ 免费商用 | OFL | 方头卡通体；母婴、手作、萌系、日常分享 | OFL 1.1（逐浪官方仓库明示） |
| `jingnan-junjun` | **荆南俊俊体** | `荆南俊俊体` | 6-10 千（6865） | ❌ 未核实 | 二手 | 粗犷有力，笔画方正；国潮、运动、街头、话题封面 | 无任何正式许可证文本；仅猫啃「作者声明」标签 |
| `douyu-zhuiguang` | **斗鱼追光体** | `DOUYU Font` | 6-10 千（6883） | ✅ 免费商用 | 官方 | 重黑带斜切，比赛/直播感；电竞、直播、赛事、活动 | 允许个人企业免费商用；禁止用于商标注册 |

### 手写 / 可爱 / 马克笔（22 款）

Handwriting — 亲和、日常、生活流

| id | 字体 | CSS family | 字数 | 商用 | 授权等级 | 适合 | 已知限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `qiantu-bifeng` | **千图笔锋手写体** | `qiantubifengshouxieti` | 6-10 千（6763） | ✅ 免费商用 | 官方 | 硬笔带笔锋，日常手写感最强；Vlog、日常、随手记、日记 | 千图公益字体，全渠道商用；不得出售使用权或改字牟利 |
| `bailu-bangbang` | **白路棒棒手写体** | `bailubangbangshouxieti` | 6-10 千（6770） | ✅ 免费商用 | 作者声明 | 圆头马克笔手写；学生、手账、贴纸感、可爱日常 | 站酷「新媒体授权」不得用于商品包装/外观标识 |
| `honglei-zhuoshu` | **鸿雷拙书** | `HongLeiZhuoShu` | 6-10 千（9588） | ✅ 免费商用 | 二手 | 拙趣手写，笔画粗细自然；随笔、读后感、慢生活 | 作者原文：「任何途径免费商用，禁止第三方转售或盈利」 |
| `yanshi-foxi` | **演示佛系体** | `Slidefu` | 6-10 千（9116） | ✅ 免费商用 | 二手 | 极细单线手写，安静；治愈、冥想、深夜、情绪文案 | 商标/嵌入式两源冲突（100font 称不可，猫啃称可） |
| `zizhiqu-smile` | **字制区喜脉喜欢体** | `FontQu Smile 常规` | 6-10 千（7374） | ✅ 免费商用 | 二手 | 轻盈手写体；情绪文案、恋爱、日常碎碎念 | 不可修改/衍生；不可用于商标、转售品、嵌入式用途 |
| `zcool-kuaile` | **站酷快乐体** | `ZCOOL KuaiLe` | 1-2 万（12258） | ✅ 免费商用 | OFL | 经典可爱粗体；美食、探店、育儿、萌系 | 须用 Google OFL 版；站酷原版声明不得改名/转售牟利 |
| `zcool-qingke` | **站酷庆科黄油体** | `ZCOOL QingKe HuangYou` | 1-2 万（12258） | ✅ 免费商用 | OFL | 圆润黄油感，粗而软；美食、奶茶、甜点、促销 | 须用 Google OFL 版；站酷原版不得改名/转售牟利 |
| `zcool-xiaowei` | **站酷小薇体** | `ZCOOL XiaoWei` | 1-2 万（12258） | ✅ 免费商用 | OFL | 纤细优雅的手写宋；女性、时尚、美妆、生活方式 | 须用 Google OFL 版；站酷侧无该字体独立页 |
| `zcool-xiaowei-logo` | **站酷小薇 LOGO 体** | `xiaowei` | 6-10 千（6763） | ✅ 免费商用 | 官方 | 小薇体的 LOGO 变体，字面更紧；品牌名、栏目名、小标题 | 站酷免费授权全社会使用（含商用）；不得改名；不得转售牟利 |
| `maoken-zhuyuan` | **猫啃珠圆体** | `MaokenZhuyuanTi` | 1-2 万（10600） | ✅ 免费商用 | OFL | 珠圆玉润的圆体；可爱、萌宠、甜品、儿童 | OFL 1.1（标小智龙珠体衍生）；未声明 Reserved Font Name |
| `rii-tegaki-fude` | **理衣手写体** | `RiiTegakiFude` | 1-2 万（10992） | ✅ 免费商用 | 官方 | 复古钢笔手写，日系杂货感；手作、文具、咖啡、旅行 | 禁转载/再分发/销售/改変字体文件；不可用于商标・意匠登录 |
| `rii-popkaku` | **梨沙 POP 体** | `RiiPopkaku-R` | 1-2 万（10992） | ✅ 免费商用 | 官方 | 日系 POP 手写；杂货、市集、小店铺、活动海报 | 同作者同一规约；禁转载/再分发/销售/改変字体文件 |
| `hanazome` | **花中字体** | `HanazomeFont` | 1-2 万（15791） | ✅ 免费商用 | 官方 | 圆润可爱手写，字面饱满；美食、萌系、节日、亲子 | 禁改変字体数据；禁 LINE 絵文字；禁「以文字为主体的制作物」的配布・販売 |
| `mdmd-wufeng` | **明达无锋体** | `MDMD-WuFengTi` | 6-10 千（9119） | ✅ 免费商用 | OFL | 无锋钝笔手写，毛边感；文艺、散文、生活记录 | 官方明示 SIL OFL 1.1，可直接用于个人和商业用途 |
| `yozai` | **悠哉字体** | `Yozai` | 1-2 万（17629） | ✅ 免费商用 | OFL | 基于 Y.OzFont 的手写体，字形齐全（20905 字）；长文标题也安全 | OFL 1.1，Reserved Font Name = Y.Oz / YOz |
| `xiaolai` | **小赖体** | `Xiaolai SC` | 约 2 万（20949） | ✅ 免费商用 | OFL | 濑户字体简体化，圆润手写，字数最全（44246）；生僻字安全牌 | OFL 1.1；上游瀬户字体亦为 OFL-1.1，无继承冲突 |
| `write-right` | **就是不错字** | `The Write Right Font` | 6-10 千（9494） | ✅ 免费商用 | OFL | 随手写字迹，真实感强；个人化、聊天记录、手写批注 | OFL 1.1（justfont 官方）；不可将字体作为产品贩卖 |
| `yefont-xiaoshitou` | **也字工厂小石头** | `YEFONTXiaoShiTou` | 6-10 千（9169） | ✅ 免费商用 | 二手 | 圆胖可爱；儿童、萌宠、萌系插画配字 | 不可修改/衍生；不可用于商标、转售品、嵌入式用途 |
| `baiwuchang-keke` | **白无常可可体** | `BWCKKT` | 6-10 千（6763） | ❌ 未核实 | 二手 | 圆润俏皮，三字重可选（Light/Regular/Bold）；可爱但不幼稚 | 官方原文不可读；「商用后向支付宝公益捐 1 元」是否强制不明；另有冲突声明称仅限个人学习 |
| `youqu` | **游趣体** | `Child Fun Sans Demo` | 6-10 千（8209） | ✅ 免费商用 | OFL | 手写趣味体；游戏、休闲、轻科普、轻松话题 | OFL 1.1，Reserved Font Name = 游趣体 / 遊趣體 / Child Fun Sans |
| `pingfang-mengmengda` | **平方萌萌哒** | `PING FANG MENG MNEG DA` | 6-10 千（6766） | ✅ 免费商用 | 二手 | 萌系圆体；母婴、宠物、甜品、少女向 | 同平方系条款；官方站不可访问 |
| `pingfang-gongzi` | **平方公子体** | `PING FANG GONG ZI TI` | 6-10 千（6765） | ❌ 未核实 | 二手 | 文艺手写带设计感；旅行、咖啡、书单、生活方式 | 猫啃该页「授权出处」只写猫啃网自身，无可核官方链接 |

## 5. 授权：先读这一节再选字

```
✅ 免费商用 45 款   ⚠️ 有条件 3 款   ❌ 未核实 4 款
```

### 需要你判断的 7 款

| 字体 | 状态 | 问题 |
| --- | --- | --- |
| **峄山碑篆体** | ❌ 未核实 | 无一手声明；商标/嵌入/出版三条边界三源冲突 |
| **润植家如印奏章楷** | ⚠️ 有条件 | 商用前提：关注「润植家艺术工作室」公众号；且只对最新版本承诺 |
| **黄引齐招牌体** | ⚠️ 有条件 | 官网只承诺「个人免费商用」，企业授权仅有截图；官网 2013 年后不可达 |
| **润植家康熙字典美化体** | ⚠️ 有条件 | 商用前提：关注公众号；仅最新版（Ver 1.36）在承诺内 |
| **荆南俊俊体** | ❌ 未核实 | 无任何正式许可证文本；仅猫啃「作者声明」标签 |
| **白无常可可体** | ❌ 未核实 | 官方原文不可读；「商用后向支付宝公益捐 1 元」是否强制不明；另有冲突声明称仅限个人学习 |
| **平方公子体** | ❌ 未核实 | 猫啃该页「授权出处」只写猫啃网自身，无可核官方链接 |

### 已整款移出字体库

- 版权存疑：作者归属被误标为「一点字坊」（实为刻石录/內木一郎），底字王漢宗顏體 GPL2.0+ 与文鼎存在未决版权争议，猫啃网标注「不建议商用」。为避免把风险带进字体库，已整款移出。

### 三件容易搞混的事

**（a）"出图"和"分发字体文件"是两件事。** 本 skill 默认走 CDN：Chromium 在渲染时按需拉 woff2 分片，生成的是一张 PNG。**我们不分发字体文件**，所以"禁止再分发 / 禁止嵌入式用途"这类条款默认不触发。但如果你用了 `build-font-links.mjs fetch` 把字体下载进任务目录并随成品一起交付，就变成"再分发字体软件"，OFL 条款要求随附版权行与 `OFL.txt` 全文——这时请把对应字体的授权文件一并放进交付目录。

**（b）OFL 不要求成品署名。** OFL 1.1 对文档/图片成品不具传染性，不需要在卡片上标注字体作者。署名义务只在你**再分发字体文件**时产生。

**（c）商标风险独立于版权。** 多款字体（阿里妈妈东方大楷、程荣光刻楷、斗鱼追光体、白路棒棒手写体等）明确禁止把字形用于商标注册；"ZCOOL / 站酷"本身是注册商标。拿卡片上的字去做商标、或把字体名放进产品 UI，都要单独评估。

## 6. 缺字检查（必做）

花体字最典型的翻车方式：标题里有一个 GB2312 之外的字，Chromium 静默地把这一个字回退到 fallback 字体，同一行标题出现两种字形——缩略图里几乎看不出来。

```sh
node scripts/check-font-coverage.mjs local-tests/<slug>
node scripts/check-font-coverage.mjs local-tests/<slug> --text "额外要核对的文案"
```

脚本用 Chromium 读出每个标题节点**实际计算出的**字体族，逐字对照该字体的分片表，报告缺字；同时检查每处 `font-family` 声明后面是否跟了通用族，以及有没有把中文字体名当成 CSS 族名写（那样写根本不会加载到 webfont）。

**字数不够时的处理顺序**：换一款字数更全的字体 → 改掉那几个字 → 才考虑换字体气质。兜底可用 `xiaolai`（20949 字）、`qiji`（20970 字）、`yozai`（17629 字），都是 GBK 级。

## 7. fallback 规则

花体字后面**必须**跟至少一个通用族，永远不要单写：

```css
/* ✗ 缺字时浏览器会回退到系统任意字体 */
font-family: "jiangxizhuokai";

/* ✓ 缺字时回退到 Noto Serif SC，字形不同但气质不断裂 */
font-family: "jiangxizhuokai", "Noto Serif SC", serif;
```

模板里的 `--f-*` 令牌已经带好了 fallback。手写 `font-family` 时不要漏。

## 8. Editorial 模式里怎么用

Editorial 本来就是"衬线标题 + 静默正文"，花体字是这条路的自然延伸。

```html
<html lang="zh-CN" data-theme="ink-classic" data-title-font="sign">
```

`data-title-font` 取 `brush` / `running` / `kai` / `sign` / `hand` 之一，它把 `--display-alt` 指向对应的 `--f-*` 令牌，并自动作用到 `.h-display`。渲染时会：

- 把 `font-weight` 归一到 400（花体字多是单字重，"larger = lighter" 在这里不适用）
- 把 `letter-spacing` 归零（书法字自带字距，再加 tracking 会散）

只改封面那一页，其他页的 `.h-xl` 保持衬线。需要手动指定别的节点时用 `.f-alt`（**字号必须 ≥72px**，否则 validate 的 R10 会拦下）：

```html
<h1 class="h-display f-alt">山野来信</h1>
```

## 9. Swiss 模式里怎么用（封面例外）

Swiss 有一条硬规则：**不加载衬线/书法字体**（`style-system.md` 的 Style Identity Test 第 2 条）。花体字是这条规则唯一的、**被明确批准的例外**，边界如下：

- ✅ 只用在该套图**第一张封面**的主标题（`.h-hero` / `.h-statement`）
- ✅ 只在用户**明确要求**花体字 / 毛笔字 / 书法感时才启用
- ❌ 用在任何内容页
- ❌ 用在 `.h-xl` 及以下
- ❌ 用在正文、lead、label、meta、数字

启用步骤（**两步都要做**）：

1. 打开 `index.html`，删掉 `FONT_LIBRARY_SWISS_CARVE_OUT` 区块的**两行注释标记**——就是 `<!-- FONT_LIBRARY_SWISS_CARVE_OUT` 那一行，和它后面独立成行的 `-->`。中间的 14 个 `<link>` 随即生效。想用别的款就先删这两行，再用 `build-font-links.mjs links <id>` 追加。
2. 在 `<html>` 上加 `data-title-font="brush|running|kai|sign|hand"`。

这样默认情况下 Swiss 文档里仍然没有任何书法字体的引用，Identity Test 依旧成立；开了例外也能一眼看出来（`grep FONT_LIBRARY_SWISS_CARVE_OUT`）。

`validate-social-deck.mjs` 的 **R10** 会强制这个边界：一旦 `data-title-font` 生效，任何"引入了花体字、但不是 72px 以上的 `.h-display` / `.h-hero` / `.h-statement` / `.f-alt`"的节点一律 FAIL；Swiss 下还会额外要求它只出现在第一张 poster 里。

## 10. 自备字体（wordshub / dengcao 路线）

想用本库没收录的字体（比如从 `wordshub/free-font`、`dengcao/free-fonts` 下载的 TTF），把文件放进任务目录的 `assets/fonts/`，用相对路径声明：

```html
<style>
  @font-face {
    font-family: "MyDisplay";
    src: url("./assets/fonts/MyFont.ttf") format("truetype");
    font-display: swap;
  }
  .h-display { font-family: "MyDisplay", "Noto Serif SC", serif; }
</style>
```

两条要求：

1. **先确认字数够**。TTF 没有 unicode-range 分片表，`check-font-coverage.mjs` 查不了，只能靠渲染结果判断——标题里出现"一个字长得不一样"就是缺字。
2. **自己确认授权**。这两个仓库的收录标准不如中文网字计划严（后者只收免费商用），且大量字体只有"作者声明"级别的出处。本文件第 5 节列的三种授权形态，在这里同样适用。

## 11. 新增一款字体到本库

1. 在 `assets/font-library.json` 的 `fonts` 数组里加一条（照着现有条目的字段填：`id` / `zh` / `family` / `group` / `source` / `css` / `license` / `coverage` / `cjkCount` / `use` / `avoid`）。
2. 跑一次覆盖率实测，把 `cjkCount` 与 `coverage` 填准。
3. **授权必须留一手来源 URL**（官方页 / GitHub LICENSE / OFL.txt）。只有聚合站（猫啃、100font）能佐证的，`license.commercial` 至少标 `conditional`，并把限制写进 `license.note`。
4. 确认 `css` 字段是能被浏览器直接引用的 CSS（不是 TTF 直链）。
5. 跑一次样张渲染确认字形没错位，再更新本文件。

## 12. 目前的空白

- **英文花体（script / blackletter）不在本库范围**。现在的 52 款都是中文字体，英文部分只能用它们自带的西文，字形质量参差。需要西文花体时另外接 Google Fonts 的 script 系。
- **日系三款**（理衣手写体、梨沙 POP 体、花中字体）是日文字库，简体字形以日文汉字字形为准，个别字（如"骨""直""画"）会和大陆标准字形有细微差别。标题够用，正式出版物留意。花中字体另有一条特殊限制：禁止"以文字为主体的制作物"的配布与贩卖——如果整套卡片会被当成字体样张，先回去看它的规约。
- **字重普遍单一**。花体字很少有多字重，别指望用 `font-weight` 做层级——层级要靠字号和颜色。
- **存疑款与"仅个人商用"款在内嵌场景需要补证**。见第 5 节。

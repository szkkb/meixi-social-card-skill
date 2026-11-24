# Content Planning

## Compression Ladder

Start from the user's original text and compress in layers:

1. Core claim: one sentence.
2. Viewer promise: what the reader gets from swiping.
3. Section map: 4-8 ideas.
4. Page hooks: short, concrete, not abstract.
5. Body fragments: only the words needed to explain the visual.

Do not put the full article on images. The image set is a visual outline that makes the user want to read the caption/body.

## Rednote Page Plan Template (CTR-First)

```text
Topic & Audience Target (人群靶子):
Surface: photo carousel | video cover (3:4 for 9:16 video)
Style: 封箱 (XHS) | Editorial | Swiss

Cover PK Candidates (默认 2–3 版高差异封面，绑定互补外显标题，重合 <35%):
- Cover A (Archetype X01/C03/C02/...):
  - Cover Hook (6–10 字 + 标出 2–4 字撞色爆点):
  - Complementary Feed Title (外显标题 15–20 字，补场景+搜索词):
  - Visual Anchor (真人情绪/前后对比/物证特写):
  - Single Tension Line (反剧透悬念，不写答案):
- Cover B (...):

02 Page (承接答案闭环与品牌抬头)
- Point:
- Copy:
- Visual:
- Layout:

...
```

## Good Page Roles

Use varied roles instead of repeating the same card page:

- Hook cover.
- Problem scene.
- Misconception vs reality.
- Checklist.
- Comparison.
- Product screenshot evidence.
- One big quote or conclusion.
- Step-by-step flow.
- Gear list or buying guide.
- Summary page with "remember these three".

## Copy Rules

- Titles should be plain and sharp.
- Avoid abstract labels like "背景介绍" unless the page is actually context.
- Use verbs and consequences: "高帮鞋会让脚更闷" is better than "鞋子选择".
- For product updates, lead with the user-facing change, then add the feature name.
- For outdoor posts, lead with the embodied problem: hot, wet, slippery, heavy, exposed, lost, cold.
- For AI/tool posts, lead with workflow change: faster capture, less manual work, cross-app automation, editable output.

## Cover Hook Patterns (High-CTR Engineering)

Full rules live in `references/xhs-cover-ctr.md`. Never put the full answer on the cover — **open a curiosity gap on Page 1, close it on Page 2**.

Use one of these 6 proven Xiaohongshu high-CTR patterns (6–10 chars, always mark the 2–4 char punch phrase for color/size contrast):

- **Loss aversion / counter-intuitive warning**: `寄大件去LA` / **`别先问单价！`** · `合箱漏看这步` / **`多付三成泡重`**
- **Quantified contrast**: `同样 100kg` / **`运费差一半？`** · `拆掉12个鞋盒` / **`立省6公斤`**
- **Audience call-out**: `洛杉矶搬家党` / **`家具海运避坑`** · `留学生寄零食` / **`哪些直接扣？`**
- **Before / After visual clash**: left/right split photo + **`体积少一半`**
- **Proof-object red-ring suspense**: scale/bill close-up + red circle + **`多算18kg？`**
- **Half-revealed checklist bait**: show rows 1–3 only + `完整15类对照在图2 →`

**Dual-Track Pairing (Mandatory):**
Always output a paired **外显笔记标题 (`data-feed-title`)** whose literal overlap with the cover hook is **< 35%**:
- Cover hook = conflict / emotion / bold number / curiosity gap.
- Feed title = concrete scenario + search SEO keywords + clear takeaway promise.

Avoid:
- Putting the 3-step conclusion or full checklist on the cover (kills Curiosity Gap).
- Copying the cover headline verbatim into the post title (wastes half the click real estate).
- Placing corporate brand pills / logos in the top-left of the cover (triggers ad-defense in 0.3s).
- Flat Baidu-style question sentences (`大件运洛杉矶怎么最省钱`) with zero tension or highlight.
- Multiple unrelated claims on one cover (>3 visual elements).

## WeChat Square Title Compression

When producing a WeChat `1:1` cover, derive a short title from the long `21:9` title.

Rules:

- Preserve the core object and the strongest action.
- Use 4-10 Chinese characters when possible.
- Use 2 short lines if one line becomes too cramped.
- Remove explanations, clauses, and long modifiers.
- Do not use the full long title in the square.

Examples:

```text
开源了一个 Skill，让 AI 接管你屏幕边那张便签纸
=> AI 接管便签纸
```

```text
Codex 史诗级更新，体验爆炸提升
=> Codex 大更新
```

## Image-Led Sequence (lifestyle, image-heavy content)

When the user has multiple good lifestyle photos (旅行 / 户外 / 自家成菜 / 家居 / 真实情感场景), front-load the strongest photo on page 1 and let pages 2-3 carry the text/data. Do not bury great photos.

Pattern:

```
P1   M16 Image-Led Cover    ← single best photo, full bleed, restrained title
P2   S11 / M05 / M10         ← text-heavy: ledger / checklist / mini-data — eye rests
P3   M02 Field-Note Photo    ← second-best photo, in a frame, with caption
P4-N M02 / M11               ← more field notes or marginalia essays
P_last  M07 / M04            ← closing note or pull quote
```

Hard rule: **never two M16 in a row**. After a full-bleed cover the eye needs to settle on text before another big image. Two image-led covers back-to-back read as "we couldn't decide which photo to use."

When this pattern does NOT apply:

- News / tutorial / data / review posts — the cover is a hook line, not a photo. Use M01 or S01.
- Posts with one good photo only — use M16 for P1, then M02 once on P3-4 with that same photo or a different angle. Do not pad.
- Swiss-mode product/release posts — photos in Swiss are product renders or UI screenshots, not lifestyle. Use S08 Image Hero, not M16.

For the cover title placement and typography on a great photo, see `references/layout-recipes.md` M16 (4 modes: 顶压底沉 / 侧栏立柱 / 角落徽章 / 下沉条带) and `references/image-overlay.md` (subject map + localized tint fallback).

## Page Count Guidance

- 600-1000 Chinese characters: 5-7 images.
- 1000-1800 Chinese characters: 7-9 images.
- Very long source: compress to 8-10 images and put the rest in caption/body.
- If several pages have large empty lower areas, merge adjacent ideas.

## Matching Visuals To Content

Use visuals only when they support the point:

- Screenshot: proof of a product feature or UI.
- Photo: scene, object, person, outdoor atmosphere.
- Generated image: missing scene, conceptual hero, stylized product/lifestyle illustration.
- Diagram: flow, cross-app chain, checklist, system relation.

Generated image prompts should be short and role-specific:

```text
Editorial documentary photo for a Rednote hiking gear guide, summer mountain trail, lightweight long-sleeve outfit, natural sunlight, clean composition, no text, no logo, 3:4.
```

```text
Swiss style conceptual product image, Android home screen widgets generated by natural language, clean off-white background, one IKB blue accent, no text, no logo, 3:4.
```

## Captions And Metadata

Small recurring elements help the set feel designed:

- Category row: `AI TOOL / UPDATE / 2026`
- Issue row: `SUMMER HIKING / BEGINNER GUIDE`
- Page number: `03 / 08`
- Compact labels: `DO`, `DON'T`, `WHY`, `NOTE`

Keep these consistent. They should support orientation, not become decoration.

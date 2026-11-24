# QA Checklist

Run this before final delivery.

## Dimensions

- Rednote images are `1080 x 1440`.
- WeChat 21:9 cover is `2100 x 900`.
- WeChat 1:1 cover is `1080 x 1080`.
- WeChat pair preview exists in the same HTML when WeChat covers are requested.
- File names are stable and ordered.

## Text

- No text overflows or touches the edge.
- No content collides with `.foot` / `.issue-strip`. If body copy or a closing line is overlapping the page footer, the footer is probably `position: absolute` while content above grew. Switch to flex `margin-top: auto` (see Anti-pattern C in `style-system.md`).
- Cover title is readable on a phone at thumbnail size.
- Body text is not smaller than it needs to be.
- Chinese line breaks are intentional.
- **花体字封面标题没有缺字。** 跑 `node scripts/check-font-coverage.mjs <task-dir>`；标题里出现"某个字长得和旁边不一样"就是缺字回退。花体字多为 GB2312 级字表，这一条不能靠肉眼在缩略图上判断。
- **花体字只出现在封面级标题上。** `validate-social-deck.mjs` 的 R10 会拦：正文/lead/label/meta 用花体、`.f-alt` 挂在 72px 以下的节点、Swiss 里花体跑到第二张之后的 poster，都会 FAIL。
- Important product names, English terms, and code snippets are spelled correctly.
- Captions match the source text; no invented facts.

## Layout

- Each page has one clear focal point.
- Pages do not all use the same structure.
- Lower empty space is either intentional or fixed.
- Images and screenshots align to the grid.
- Screenshot pages give the screenshot enough area.
- 1:1 WeChat cover uses a simplified short title and is composed separately, not blindly cropped.
- If a page overflows, measure the overflow before editing. Do not remove content until the measured overflow requires it.
- Titles need visible breathing room before the next content block. Main display titles should usually keep at least 28px below; local headings should keep at least 16px.

### Overflow Correction Ladder

Use validator output before changing the layout:

- `1-40px` over: nudge the content group up or tighten one gap/padding by 20-40px. Do not delete content.
- `40-90px` over: compact local gaps/padding and reduce one block height. Avoid cutting copy.
- `90-160px` over: reduce a display title slightly or compress one paragraph before deleting content.
- `160px+` over: switch to a higher-capacity recipe, merge modules, or remove content intentionally.

After fixing overflow, check for over-correction:

- If `R8` reports large bottom whitespace, restore some spacing, move the content down slightly, or expand the final block.
- Do not accept a fix that turns a small overflow into a large empty lower band.
- Prefer one measured adjustment per render pass, then re-run validation.

### 4-band Density Check (3:4 inner pages only — covers exempt)

Run this on **Pages 2–N (inner content cards)**. **Covers (`data-role="cover"`, `#xhs-01`, `X01`, `C02–C05`) are exempt** — never pack extra text boxes onto a cover just to satisfy 75% fill; covers follow `references/xhs-cover-ctr.md` (3-Element Rule & single visual focus).

Open the rendered inner-page PNG. Mentally divide it into 4 horizontal bands of 360px each (0-25%, 25-50%, 50-75%, 75-100%). For each band, classify as:

- **Filled** — contains text, image, data, or rule.
- **Justified empty** — empty for a stated reason: hero-image breathing (M01/M16), single-sentence statement (M04/M13), leading/trailing margin (top 8% / bottom 8%).
- **Under-filled** — empty with no reason. **Any single under-filled band > 15% canvas height (>216px) is a fail.**

A poster passes when:

1. Total Filled + Justified empty ≥ 100%.
2. Filled bands cover ≥ 75% canvas height (≥ 1080px of 1440px).
3. No two adjacent bands are both "justified empty" — that creates a >25% void mid-poster.

If failing: don't shrink the canvas, don't add decorative blobs. Either expand copy (more ledger items, longer paragraphs, supporting evidence row, marginalia column) or switch recipe (M07 → M04 for genuinely-short content; M03 → M11 to add a marginal column; thin ledger → M08 Tall Ledger with bigger rows).

### Xiaohongshu Cover CTR Gate (Mandatory for Page 1 & Video Covers)

Before delivering any Xiaohongshu photo cover or independent video cover (`references/xhs-cover-ctr.md`):

- [ ] **180px Real Feed Glance Test**: generated `feed-preview.html` / `output/feed-preview-180px.png` via `node scripts/build-feed-preview.mjs <task-dir> --screenshot`; cover jumps out next to noisy neighbor cards and reads in **0.5 seconds** at `180px` width.
- [ ] **Top-Right UI Dead Zone (`R13`)**: no headline text, numbers, faces, or red rings inside `x: 850–1080px, y: 0–210px` (video play icon / multi-photo badge zone). Verified under Video Play Icon mode.
- [ ] **1:1 Profile Safe Band**: core headline and primary face stay inside `y: 180–1260px` with `≥64px` side padding.
- [ ] **Anti-Spoiler & Anti-Ad (`R14`)**: no top-left corporate `.brand-pill` ad badge, no 3-column answer spoiler slip (`.floating-slip .slip-grid`), and total visible cover copy obeys the word cap.
- [ ] **Dual-Track Title Pairing (`R15`)**: every cover declares a complementary `data-feed-title` with `<35%` overlap (cover = conflict/hook; feed title = scenario/SEO/benefit).
- [ ] **Punch Contrast**: main hook is `6–10` chars with `2–4` kill words highlighted by punch color/block or scale contrast.
- [ ] **A/B Cover PK Ready**: unless the user explicitly requested only 1 cover, delivered `2–3` genuinely distinct cover candidates ready for Xiaohongshu's official「封面测试 / PK」.

### Website SEO Image Gate (Mandatory for `meixipro.com` / Blog / Guide / OG Images)

Before delivering any website SEO image pack (`references/web-seo-images.md` & `DESIGN-web.md`):

- [ ] **Exact Ratio & Discover Gate (`R16`)**: every `.board` matches `lib/image-ratios.ts` (`wide` `1600×900`, `standard` `1600×1200`, `square` `1200×1200`, `tall` `1200×2400`, `og` `1200×630`); `W01` hero width `≥1200px`; `Smiley Sans Oblique` stays at `font-weight: 400; font-synthesis: none` (zero faux-bold).
- [ ] **SEO Metadata Complete (`R17`)**: unique lowercase ASCII `kebab-case` `data-seo-filename` (no Chinese/generic `image1`), descriptive non-stuffed `data-seo-alt` (no「图片/配图/这是一张」filler), complementary `data-seo-caption`, `data-target-keyword`, and non-empty `alt` on every inner `<img>`.
- [ ] **Photo-First & Visual Hygiene (`R18`)**: real photos/screenshots dominate (`Photo-First`); zero broken images (or explicit `.is-empty` + `data-placeholder="true"` flagged to user); **zero decorative Unicode Emoji** (`⚠⚡✅❌🔥`); zero dark semi-transparent bar overlaying center of screenshots.
- [ ] **Anti-Wall-of-Text & Non-Commitment (`R19`)**: image copy stays concise (long prose remains indexable in HTML/MDX); zero leftover `[必填]` / `replace-with` placeholders; zero unverified commercial claims (`.pending` used for unconfirmed rates/timelines).
- [ ] **Zero-Clip Screenshots & Privacy Mosaic (`R20`)**: `W02` / `W05` images use `object-fit: contain` (100% left/right edge preservation); any `W05` / `data-privacy="sensitive"` photo has irreversible pixel mosaic baked into the source file (`data-mosaic-verified="true"`, no reliance on CSS `.mosaic-layer`).
- [ ] **Core Web Vitals & Multi-Surface Preview**: ran `node scripts/build-web-seo-pack.mjs <task-dir> --screenshot`; WebP sizes pass CWV budgets (Hero `≤150KB`, body `≤180KB`, 4-col screenshots `≤220KB`, OG `≤120KB` JPG+WebP); inspected `output/web-seo-preview.png` to verify clarity at `340px` mobile width, `688px` white article card border separation, and `120px` SERP / Discover / OG preview; delivered `output/mdx-snippets.md`.

### Programmatic Layout Checks

`validate-social-deck.mjs` reports:

- `R1` / `R8`: DOM overflow and visual overflow, including measured pixel amount and the lowest overflowing element.
- `R8`: bottom whitespace and active content height, which catches "fixed too much" layouts.
- `R9`: title-to-content gap, which catches titles visually touching the next block.
- `R13` / `R14` / `R15`: Xiaohongshu cover CTR guardrails — top-right `230×210px` UI dead zone (`R13`), anti-ad / anti-spoiler / word-overload (`R14`), and cover vs `data-feed-title` overlap (`R15`).
- `R16` / `R17` / `R18` / `R19` / `R20`: Website SEO guardrails — exact `lib/image-ratios.ts` dimensions + Google Discover `≥1200px` + mobile `340px` font floor + Smiley Sans anti-blur (`R16`), SEO filename/alt/caption/keyword integrity (`R17`), Photo-First media share / broken images / zero Emoji / no center overlay (`R18`), anti-wall-of-text cap / placeholder / non-commitment claims (`R19`), and `W02`/`W05` `object-fit: contain` + irreversible privacy mosaic verification (`R20`).

Use these numbers as the first diagnosis. Multimodal inspection is still useful for taste, but overflow, empty lower bands, title gaps, and cover CTR violations should be handled from measured output first.

## Style

- Package uses one visual system.
- Swiss identity test passes for every Swiss poster (see `style-system.md` "Style Identity Test"). In particular: every display title >=72px uses a typed class with weight <=300; no serif font is loaded; only one accent color is used. A bold 90px headline is not Swiss.
- Editorial identity test passes for every Editorial poster: at least one atmosphere layer beyond a flat fill (paper grain / ink wash / WebGL); serif display family on the title; at least one of large photo well, serif pull quote, marginalia column, or true ledger structure. A flat paper with serif title + mono pills everywhere is Swiss-in-disguise.
- Swiss uses one accent color only.
- Magazine style uses restrained paper/ink tones.
- No random SVG blobs, ovals, drops, circles, stickers, or decorative gradients.
- No nested cards.
- No excessive rounded corners.

## Images

- Supplied images are not distorted.
- Faces, hardware, product UI, and key text are not accidentally cropped.
- Screenshots remain readable.
- Generated images do not contain unwanted text, logos, page numbers, or poster borders.
- Photo crops feel intentional.
- For any image fetched from the web (Pexels / Unsplash / Flickr CC / Wallhaven / direct search): the source URL is recorded in `assets/SOURCES.md`, and the user has been asked whether to add an in-image attribution caption. The user's answer is honored. Flickr CC attribution preserves the author name when the user opts in.

## Text-On-Image (when applicable)

Run these only for posters where text touches a photo (full-bleed cover, large image well, generated overlay). See `references/image-overlay.md`.

- Image area ≥60% of canvas → the photo passes the quiet-zone + light tests; no-mask composition was tried first; any tint is localized, image-toned, and only used if the thumbnail check fails.
- Subject map is documented as an HTML comment next to the hero block (face / focal feature location + safe zones).
- No display title (≥72 px) overlaps a face, hand, or key product feature.
- `object-position` was chosen from the subject-location table, not left at default for face shots.
- Thumbnail test: downscale the rendered cover PNG to `180 px` wide (or inspect `output/feed-preview-180px.png` from `scripts/build-feed-preview.mjs`) and confirm the title is legible in 0.5 seconds without strain.

## Final Response

- Include the output path.
- Show the main cover inline when useful.
- Mention verification performed.
- Mention any limitations, such as low-resolution source assets.

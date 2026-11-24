# Platform Specs

Use high-resolution exports. The user can downsample later.

## Xiaohongshu / Rednote

Default size:

- `1080 x 1440`
- Ratio: `3:4`
- Export: PNG for text-heavy images, JPEG only when photo-only and file size matters.

Safe area:

- Side margin: 72-96px.
- Top margin: 72-112px.
- Bottom margin: 80-120px.
- Keep all text and key objects inside the safe area.

Recommended set:

- 1 cover.
- 4-8 content pages.
- 1 summary or checklist page if the article benefits from it.
- Optional Live Photo card for motion-heavy evidence. Use `references/live-photo-production.md` when making `.pvt` packages for AirDrop and iPhone testing.

Live Photo:

- Duration: up to `5s`.
- Keep the same `1080 x 1440` / `3:4` canvas and safe area as static Rednote cards.
- Use Live Photo when motion is the evidence: fast generation, before/after UI, product interaction, app/game demo, scroll reveal, or process-to-result comparison.
- Package as `.pvt` for iPhone/AirDrop testing. Loose JPG/MOV pairs often import as separate assets.
- Publish path: AirDrop the `.pvt` package as one item to iPhone, then publish from the Xiaohongshu app. Desktop/web upload cannot be treated as the primary Live Photo publishing path.

Naming:

```text
output/xhs-01-cover.png
output/xhs-02-<topic>.png
output/xhs-03-<topic>.png
...
```

Cover structure (CTR-First — see `references/xhs-cover-ctr.md`):

- **≤ 3 visual elements**: one vivid subject (human emotion close-up / before-after split / proof close-up), one `6–10` char high-contrast hook with a `2–4` char punch highlight, and at most one micro target tag or single-line tension bar.
- **Anti-spoiler (Curiosity Gap)**: do NOT put 3–5 answer bullet points or a 3-column summary on the cover — move those to Page 2.
- **Dual-track pairing**: every cover must declare a complementary `data-feed-title` (`<35%` overlap with cover text).
- **UI dead zone & dual safe zones (`1080×1440`)**:
  - Top-right `230×210px` (`x: 850–1080, y: 0–210`): **strictly clear** of headline text, numbers, faces, and rings (discover-feed video play icon / multi-photo badge sits here).
  - Profile `1:1` center band (`y: 180–1260`, left/right margin `≥64px`): keep primary face and core hook inside so profile square crop never slices them.
  - Bottom `120px` (`y: 1320–1440`): no tiny critical text (feed rounded corners + title sit immediately below).
- **A/B Cover PK**: default to generating `2–3` distinct cover variants (`output/xhs-cover-a.png`, `xhs-cover-b.png`, ...) and inspect them via `node scripts/build-feed-preview.mjs <task-dir> --screenshot` at true `180px` double-column feed width.

### Xiaohongshu Video Cover (Independent `3:4` Cover for `9:16` Videos)

- Video body stays `9:16` (`1080×1920`), **independent cover MUST be `3:4` (`1080×1440`)** to avoid unpredictable feed cropping.
- Never use a random first frame. Extract a contact sheet (`python3 scripts/make-video-contact-sheet.py source.mp4 assets/video-frames.jpg --frames 12 --cols 4`), select the strongest facial-expression or physical-action frame, crop chest-up so emotion reads at `180pt`, and optionally run `swift scripts/lift-subject.swift` for crisp foreground separation.
- Mark `<section data-role="cover" data-surface="video" data-feed-title="...">`. Top-right `230×210px` play-icon dead zone is a **hard FAIL** (R13) on video covers.
- Preferred cover archetype: `C03` (human-emotion talking-head cover), `C02` (before/after split), `C04` (proof red-ring), or `X01` (warehouse action suspense).

Content page structure:

- One idea per page.
- 12-30 Chinese characters for the title when possible.
- 2-4 short bullet fragments or one concise paragraph.
- If a page has a screenshot, reduce the text and give the screenshot enough area.
- If lower space is empty across pages, combine pages or add a functional element such as checklist, comparison row, quote, or image evidence.

## WeChat Official Account Cover Pair

Generate a pair: one `21:9` main cover and one `1:1` square cover. Build both in the same HTML file, and include a combined preview section that places them together for visual checking.

### 21:9 Main Cover

Default size:

- `2100 x 900`
- Ratio: `21:9`

Use:

- Main article cover.
- Full or near-full headline, subtitle, and visual evidence.
- Keep title readable near center-left or within a clear safe band.
- Avoid an empty middle. Increase title scale, image scale, or spacing if the center feels hollow.

### 1:1 Cover

Default size:

- `1080 x 1080`
- Ratio: `1:1`

Default style:

- Short title only, simplified from the long title.
- Big type, center aligned.
- No image unless the user explicitly asks for one.
- No subtitle by default.
- Strong contrast and enough breathing room.

Short-title rule:

- Extract the core object and action from the long title.
- Keep it to roughly 4-10 Chinese characters, or 2 short lines when needed.
- Do not squeeze the full `21:9` title into the square.

Example:

```text
Long: 开源了一个 Skill，让 AI 接管你屏幕边那张便签纸
Square: AI 接管便签纸
```

Naming:

```text
output/wechat-21x9-cover.png
output/wechat-1x1-cover.png
output/wechat-cover-pair-preview.png
```

## WeChat Official Account Article Live Photo

截至 2026-07 实测，Live Photo 支持与上传路径相关：

- iPhone 端上传可在公众号文章编辑中保留 Live Photo。
- 网页端上传没有对应的 Live Photo 入口。
- Keep Live Photo duration at or below `3s`.
- Publish path: AirDrop the `.pvt` package as one item to iPhone, then upload from the iPhone Official Account article editing path.

Use the same `3:4` card standard as Rednote when the user wants a WeChat article body card. If the publisher must use the desktop/web path, export a GIF or short video fallback instead of promising Live Photo support.

## Screenshot And Photo Placement

For supplied screenshots/photos:

- Put originals in `assets/`.
- Use CSS `object-fit:cover` only when cropping is safe.
- Use CSS `object-fit:contain` for UI screenshots, dense text, code, tables, or app windows.
- Set `object-position` deliberately: top for long UI when top matters, center for objects, 35%-45% vertical for portraits.
- Do not pin images to the canvas edge unless the design intentionally uses bleed.

## Final Response Media

In Codex desktop, local media can be shown with absolute paths:

```markdown
![cover](/absolute/path/to/output/xhs-01-cover.png)
```

Do this for the most important images, especially the cover and any pages the user asked to inspect.

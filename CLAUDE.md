# meixi-social-card-skill — 改这个仓之前必读

本仓是 `op7418/guizang-social-card-skill`（AGPL-3.0）的衍生，远端
`szkkb/meixi-social-card-skill`。**2026-10-12 起是公开仓库**，按 AGPL-3.0 分发：
拿到本仓的人都可以在同样以 AGPL-3.0 开源的前提下使用、改造、再分发；想要非 AGPL
条款的走上游 `COMMERCIAL_LICENSING.md`。上游署名（LICENSE / README / AGENT.md）
一律保留，不得删改。

## 这个仓被六个宿主共用

`~/.kiro`、`~/.hermes`、`~/.qwen` 整目录软链到本仓；`~/.claude`、`~/.agents`
是真实目录但里面逐文件软链回本仓；`~/.grok` 是指向本仓路径的 bridge。
**工作区就是线上技能。** 所以：

- 本仓的 `main` 必须等于线上状态，改动不能只留在 feature 分支。
- 新增顶层文件后，`~/.claude` 和 `~/.agents` 不会自动出现该文件
  （它们的软链是安装时快照的），必须手工补链，否则那两个宿主读不到。

## ★ 提交之后必须推进 hermes 登记表的 ref

`hermes_codex_install_pack_optimized/external-skills.json` 按**固定 SHA**
登记本仓。只要本仓有了新提交而登记表没跟上，别人跑
`setup_external_skills.sh --update-refs` 就会把本仓 checkout 回旧 SHA，
六个宿主的工作区同时丢掉新内容。

提交后两步收尾，缺一不可：

```bash
git push
cd ~/hermes_codex_install_pack_optimized \
  && ./scripts/setup_external_skills.sh --bump-ref=meixi-social-card-skill \
  && git add external-skills.json \
  && git commit -m "chore: bump meixi-social-card-skill ref" && git push
```

`--bump-ref` 会一次改掉 `ref`、`ref_date`、`last_updated` 三处，
并在工作区脏或有未推送提交时拒绝执行。**不要手抄 SHA。**

仓内 `post-commit` hook 会在每次提交后提醒这件事（`core.hooksPath=.githooks`）。
新机器由 `setup_external_skills.sh` 自动启用；手工克隆的话自己跑一次
`git config core.hooksPath .githooks`。

## 不要在游离头指针上提交

`setup_external_skills.sh` 历史上用 `git checkout FETCH_HEAD` 装配，会留下
detached HEAD。在那上面提交，内容不属于任何分支，下次对齐就变成不可达对象，
只能靠 reflog 或 `git fsck --lost-found` 在 gc 之前捞。
脚本现在对 `full_clone` 条目会自动收回到 `main`，但动手前先确认：

```bash
git symbolic-ref -q HEAD || echo "⚠ detached HEAD，先 git checkout -B main"
```

## 视觉改动先读 DESIGN.md

根目录 `DESIGN.md` 是 Greenbook 卡系统（公众号图片消息 / 小绿书 / 贴图号）的
设计真源：字体与授权、暖底实测对比度、三竖区制度、裁切安全带、反模式清单。
`assets/template-greenbook-card.html` 的任何改动都必须与它一致。
Editorial 与 Swiss 两个既有模式不受它约束，走 `references/style-system.md`。

杨美西转运**小红书号**的卡走另一份真源 `DESIGN-xhs.md`（「封箱」：胶带、贴纸、面单、红笔「正」字计数），
`assets/template-xhs-card.html` 的任何改动都必须与它一致。两套系统共享品牌层，版式不共用，不混排。
出镜人与仓库照片只用真实素材，不用 AI 生成顶替。

字体只用 `references/font-license-audit.md` 里核验过的；换 display 面走
`--display-zh` 换装缝，换之前必须验授权、汉字覆盖、88–118px 下不粘连三项。

## 交付纪律

卡面上的价格、时效、赔付数字一律是占位示例，**不生产商业承诺**。
投放前必须换成运营确认的真实口径，且每个数字都要能在小程序里被用户自己复算。

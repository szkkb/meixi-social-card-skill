# Brand Preset · 美西转运 MeixiPro

Greenbook 卡系统的租户预设。系统设计见根目录 `DESIGN.md`，平台规格见 `../greenbook-specs.md`。

## 身份

| 项 | 值 | 真源 |
|---|---|---|
| 中文名 | 美西转运 | `config/tenants/meixipro.json` → `brand.displayName` |
| 英文名 | MeixiPro | 同上 `brand.nameEn` |
| 主色 | **`#0060C9`** | 同上 `brand.primaryColor` |
| 域名 | meixipro.com | 同上 `runtime.webDomains[0]` |
| Logo | `/static/brand/meixipro-logo.png` | 同上 `brand.logoRef` |
| 主线 | 美国西岸 → 中国大陆，集运转运 | — |

> ⚠ **不要用 `#037EF3`。** 那个值出现在若干旧文档里，是 main 分支缺省调色板 /
> 兼容档案值，不是美西转运的生产身份。`docs/TENANT_PROFILES.md` 对此有红字警告。
> 生产主色 2026-08-01 已批准为 `#0060C9`。

## 预设块

```css
[data-brand="meixipro"] {
  --verify:     #0060C9;
  --brand-name: "美西转运";
  --brand-en:   "MeixiPro";
  --brand-host: "meixipro.com";
}
```

`--verify` 的职责被刻意压缩到最小：只染合计线（`.rule-total`）与合计数（`.tv`）。
不要把它扩散到标题、边框或底色 —— 一旦扩散，「版面上唯一的彩色终点就是结论」这个机制就失效了。

## 加一个租户要改什么

1. 在模板第 1 节复制一个 `[data-brand="<code>"]` 块，填 4 个值（色 + 3 个字符串）。
   色值取 `config/tenants/<code>.json` 的 `brand.primaryColor`，**不要从设计稿取色**。
2. `<html data-brand="<code>">` 改过去。
3. 检查该色对 `#fffaf1` 的对比度 ≥ 4.5:1。`#003666` 是 11.2:1，`#0060C9` 是 5.74:1，
   都过；更浅的蓝要重新算。

**不跟着租户变的东西**：`--annotate` / `--edge-blue`（航空邮件红蓝，品类符号，
跨租户恒定，这是 `variables.scss` 原本的设计意图）、全部中性色、全部字体、全部间距与版式。

## 既有租户

| code | 名称 | `--verify` | 对暖底对比度 |
|---|---|---|---|
| `meixipro` | 美西转运 | `#0060C9` | 5.74:1 |
| `bjd` | 宝嘉达国际物流 | `#003666` | 11.2:1 |
| `jy` | 萧船长集运（演示） | `#003666` | 11.2:1 |

## 内容边界

本预设只提供身份与色板。**卡面上的价格、时效、赔付口径不在这里，也不由技能生成。**
模板里的数字全是占位示例。投放前必须替换为运营方确认的真实报价口径，
并确保每个数字都能在小程序里被用户自己复算出来 —— 这是整套设计的前提，
一旦数字不可复算，「算式」这个方向就失去了它全部的说服力。

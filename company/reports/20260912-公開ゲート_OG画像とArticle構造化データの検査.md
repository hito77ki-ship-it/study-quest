# 実施報告：公開ゲートのOG画像・Twitterカード・Article構造化データ検査

**実施日：** 2026年9月12日
**対象：** `scripts/audits/run-content-quality-gate.mjs`、`boki2-shogyo-enshu.html`
**対応した稟議：** `company/decisions/20260912-公開ゲート_OG画像とArticle構造化データの検査.md`

## 実施内容

1. 公開ゲートに、記事の `og:image` と `twitter:card` の検査を追加した。
2. Article / BlogPosting / NewsArticle の JSON-LD から、`headline` / `image` / `datePublished` / `author` / `publisher` を確認するようにした。
3. `boki2-shogyo-enshu.html` が既に参照している `images/article-thumbnails/boki2-shogyo-enshu.jpg` を、OG画像と Article JSON-LD でも参照するようにした。

本文・タイトル・記事の更新日3面は変更していない。画像参照の補完のみであり、実質的な記事更新ではないためである。

## 根拠

- [Google Search Central: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)（2026年9月12日確認）

## 検証結果

- `test -f images/article-thumbnails/boki2-shogyo-enshu.jpg`：成功（40,333 bytes）
- `node scripts/audits/run-content-quality-gate.mjs --strict --no-write`：`Structural=0, links=0, dates=0, themeCandidates=0, metricCandidates=0`
- `git diff --check`：成功

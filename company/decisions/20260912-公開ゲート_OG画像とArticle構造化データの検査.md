# 稟議書：公開ゲートにOG画像・Twitterカード・Article構造化データを追加する

**起案日：** 2026年9月12日
**起案者：** CEO ジョブズ
**種別：** 公開品質の技術是正
**ステータス：** **承認済み（2026年9月12日、取締役指示「全部やってみよっか」）**

## 背景

`boki2-shogyo-enshu.html` は既存サムネイルを記事カードで使っている一方、記事の `og:image` と Article JSON-LD の `image` を欠いていた。既存の公開ゲートは JSON-LD の構文だけを確認し、`headline`・`image`・`datePublished`・`author`・`publisher` の値を確認していなかった。

## ファクトチェック

Google の [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) では `image` は必須ではなく推奨プロパティとされる。ただし、画像検索でのリッチリザルト対象には画像が必要である。したがって、Google の必須要件違反とは表現せず、Study Quest の公開品質基準として、画像を持つ記事が参照を欠かないよう検査する。

## 実施範囲

1. `run-content-quality-gate.mjs` が、Article / BlogPosting / NewsArticle の JSON-LD に `headline` / `image` / `datePublished` / `author` / `publisher` があることを検査する。
2. 記事ページの `og:image` と `twitter:card` を検査する。
3. 既存サムネイルがある `boki2-shogyo-enshu.html` に `og:image` と JSON-LD `image` を追加する。

本文・タイトル・表示更新日・サイトマップは変更しない。画像参照の補完は実質的な本文更新ではないため、記事の更新日3面は動かさない。

## 検証

- サイト全体の公開ゲートを strict モードで実行する。
- `git diff --check` を実行する。
- 既存サムネイルの実在を確認する。

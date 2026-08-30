# Article JSON-LD推奨`image`プロパティ補完 — 2026年8月30日

**対応稟議：** [`20260830-Article_JSON-LD推奨imageプロパティ4件の補完.md`](../decisions/20260830-Article_JSON-LD推奨imageプロパティ4件の補完.md)
**実行範囲：** `boki-benkyo-basho.html`、`boki-note-sekkei.html`、`boki-net-test-mac-ipad.html`、`boki2-3kyu-fukushu.html` のArticle JSON-LDのみ。

## 実施結果

- 4記事に既存の`og:image`と同じ`image` URLを追加した。
- Article 205本をJSONとして再検査し、`image`欠落は4件から0件になった。
- 参照する画像4件はすべてローカルに存在し、幅は1200px以上だった。
- 本文、画面表示、OGタグ、画像資産、`dateModified`、本文表示更新日、`sitemap.xml`は変更していない。本文を更新していないため、更新日3面を新しい日付に偽装しない判断とした。

## 検証

- `git diff --check`：成功
- 4対象のJSON-LD構文：成功
- `image`と`og:image`の一致：4/4
- Article JSON-LDの`image`欠落：0件

## 公開手順

隔離cloneの単独ブランチからPRを作成し、必須検証の成功・差分の独立性・mainとの競合なしを確認できた場合のみ自動マージする。

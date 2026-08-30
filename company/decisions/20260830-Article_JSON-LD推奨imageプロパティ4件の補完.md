# 実行記録：Article JSON-LDの推奨`image`プロパティ4件を補完

**起案・実行日：** 2026年8月30日（`git log -1 --date=iso` で確認）
**起案・実行者：** CEO ジョブズ／Codex
**ステータス：** 実行完了
**種別：** 構造化データの低リスク是正（本文・UI非変更）

> ## 本記録の指摘は4件である
>
> 追跡済みmainにあるArticle 205本をJSONとして検査した結果、`image` を持たないArticleが4本あった。本文・画面表示・画像ファイルを変更するものではない。

## 根拠

2026年8月30日に実際に開いたGoogle Search Centralの[Article構造化データのドキュメント](https://developers.google.com/search/docs/appearance/structured-data/article)では、`image` を記事を表す画像のURLとして案内している。同ページはArticleに必須プロパティはないと明記しているため、本対応は「必須項目の修正」ではなく、ページに適用できる推奨プロパティの補完として扱う。

各対象は既存の`og:image`と同じ公開URLを使用する。参照先はローカルに実在し、いずれも1200px幅以上であることを確認した。

| 対象 | 追加する`image` | 既存OG画像の確認 |
|---|---|---|
| `boki-benkyo-basho.html` | `https://study-quest.net/screenshots/ogp_logo.png` | 1200×630 PNG |
| `boki-note-sekkei.html` | `https://study-quest.net/images/study-quest-boki-category.webp` | 1200×675 WebP |
| `boki-net-test-mac-ipad.html` | `https://study-quest.net/images/study-quest-boki-category.webp` | 1200×675 WebP |
| `boki2-3kyu-fukushu.html` | `https://study-quest.net/images/study-quest-boki-category.webp` | 1200×675 WebP |

## 実行範囲

4ファイルのArticle JSON-LDに`image`キーを1つずつ追加する。本文、HTML表示、OGタグ、画像資産、`dateModified`、本文表示更新日、`sitemap.xml`は変更しない。今回の変更は実質的な記事本文更新ではないため、鮮度シグナルを更新して読者に誤った本文更新日を示さない。

## 検証条件

1. 4つのJSON-LDが有効なJSONで、`image`が同一ファイルの`og:image`と一致すること。
2. `image`の公開URLに対応するローカル画像ファイルが存在し、幅が1200px以上であること。
3. サイト内のArticleすべてで`image`欠落が0件になること。
4. `git diff --check`が成功し、差分が上記4HTMLと本記録・実行レポート・決定一覧だけであること。

## ジョブズの所見

検索結果に必ず特別表示されることを約束するものではない。それでも、既に各記事に適切なOG画像があり、4つの構造化データだけがその情報を渡していないなら、欠落を放置する理由はない。画像生成や見た目の変更を足さず、既存資産の意味を一貫させる最小の是正である。

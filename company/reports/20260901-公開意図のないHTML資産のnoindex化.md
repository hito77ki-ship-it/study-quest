# 公開意図のないHTML資産の noindex 化

**実施日:** 2026年9月1日
**対応稟議:** `company/decisions/20260831-社内資産10ページの公開状態とAdSense審査リスク.md`

## 実施内容

公開用の記事ではない次の10ファイルの `<head>` に、`<meta name="robots" content="noindex,nofollow">` を追加した。

- `company/assets/coconala/service-images/` 配下のCoconala用画像生成HTML 7件
- `apple-lp/` 配下のカードショップLP・試作HTML 3件

## 判断と範囲

- 既存URLの共有・確認用途を損なわないよう、削除・移設は行わない。
- `robots.txt` の `Disallow` は追加しない。検索エンジンがnoindexを読み取れる状態を保ち、後日のインデックス状況確認後に必要性を判断する。
- Study Questの記事、サイトマップ、広告タグ、本文には変更を加えない。

## 検証

- 対象10ファイルすべてに `noindex,nofollow` のrobotsメタタグが1件ずつ存在することを機械確認する。
- 各HTMLのタグ対応と `git diff --check` を確認する。

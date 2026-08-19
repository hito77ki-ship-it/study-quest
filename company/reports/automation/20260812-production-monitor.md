# 本番サイト表示監視（20260812）

## 監視対象

- /
- boki.html
- boki1.html
- boki2.html
- boki3-progress.html
- fp3.html
- shihoshoshi.html
- app.html

## 判定

- ページ確認: 8件
- ページ要確認: **0件**
- 画像確認: 37件
- 画像404・取得失敗: **0件**
- 自動修正: なし

## ページ結果

| URL | HTTP | title | canonical | og:image | JSON-LD |
|---|---:|---|---|---|---|
| / | 200 | あり | あり | あり | 1件 / エラー0 |
| boki.html | 200 | あり | あり | あり | 2件 / エラー0 |
| boki1.html | 200 | あり | あり | あり | 2件 / エラー0 |
| boki2.html | 200 | あり | あり | あり | 2件 / エラー0 |
| boki3-progress.html | 200 | あり | あり | あり | 2件 / エラー0 |
| fp3.html | 200 | あり | あり | あり | 2件 / エラー0 |
| shihoshoshi.html | 200 | あり | あり | あり | 2件 / エラー0 |
| app.html | 200 | あり | あり | あり | 0件 / エラー0 |

## 要確認ページ

なし

## 要確認画像

なし

## 次の判断

HTTPエラー、canonical欠落、JSON-LD構文エラー、画像取得失敗は本番事故として優先確認する。タイトルやOGPの内容変更は自動で行わず、差分と確認結果を報告する。

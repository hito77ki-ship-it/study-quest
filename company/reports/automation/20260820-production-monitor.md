# 本番サイト表示監視（20260820）

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
- ページ要確認: **8件**
- 画像確認: 0件
- 画像404・取得失敗: **0件**
- 自動修正: なし

## ページ結果

| URL | HTTP | title | canonical | og:image | JSON-LD |
|---|---:|---|---|---|---|
| / | 失敗 | なし | なし | なし | 0件 / エラー0 |
| boki.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| boki1.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| boki2.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| boki3-progress.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| fp3.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| shihoshoshi.html | 失敗 | なし | なし | なし | 0件 / エラー0 |
| app.html | 失敗 | なし | なし | なし | 0件 / エラー0 |

## 要確認ページ

- /: HTTP=失敗 / fetch failed
- boki.html: HTTP=失敗 / fetch failed
- boki1.html: HTTP=失敗 / fetch failed
- boki2.html: HTTP=失敗 / fetch failed
- boki3-progress.html: HTTP=失敗 / fetch failed
- fp3.html: HTTP=失敗 / fetch failed
- shihoshoshi.html: HTTP=失敗 / fetch failed
- app.html: HTTP=失敗 / fetch failed

## 要確認画像

なし

## 次の判断

HTTPエラー、canonical欠落、JSON-LD構文エラー、画像取得失敗は本番事故として優先確認する。タイトルやOGPの内容変更は自動で行わず、差分と確認結果を報告する。

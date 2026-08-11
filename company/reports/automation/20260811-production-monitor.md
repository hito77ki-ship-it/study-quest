# 本番サイト表示監視（20260811）

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

## 追加確認（2026-08-11）

Node.jsの直接監査では、8ページすべてで `fetch failed` / `ENOTFOUND`（監査実行環境のDNS解決失敗）が発生した。これは本番HTTPエラーの証拠ではないため、ブラウザ経路で再確認した。

- 本文DOM取得: 8/8ページ成功
- title: 8/8ページあり
- canonical: 8/8ページあり
- OGP画像: 8/8ページあり
- JSON-LD構文エラー: 0件（トップ1件、記事各2〜3件、アプリ0件）
- study-quest.net配下の画像取得失敗: 0件
- 第三者の広告計測ビーコン失敗: 7ページで検出。サイト画像ではないため本番事故件数から除外

## 確定判定

本番事故: 0件。監査環境DNSによる誤検知: 8件。稟議書: 作成なし。

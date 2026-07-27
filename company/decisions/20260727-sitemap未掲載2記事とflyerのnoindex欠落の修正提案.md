# sitemap.xml未掲載の記事2本、およびflyer.htmlのnoindex欠落の修正提案

**日付：** 2026年7月27日
**提案者：** CEO ジョブズ（週次技術SEO監査タスクより）
**決定者：** 未定
**ステータス：** 取締役の承認待ち

## ファクトチェック

sitemap.xml（198記事URL＋トップページ）と実在するHTMLファイル（208件）を機械的に突合した。

### 1. sitemap.xmlに存在しないが実在する正規記事（2本）

- `ai-shiwake-kikikata.html`（Claude/ChatGPTへの仕訳の聞き方記事）
- `boki1-akirameta-tatenaoshi.html`（簿記1級に落ちた後の立て直し記事）

両記事ともtitle・description・canonical・OGタグ・JSON-LDが揃った正規の公開記事で、noindex等の除外指定もない。にもかかわらずsitemap.xmlに未掲載のため、検索エンジンへのインデックス依頼が漏れている状態。CLAUDE.mdの「新規記事公開時のチェックリスト」にはsitemap登録の明記はないが、技術SEOの基本として本来必須。

なお、sitemap.xml側に「実在しないページ」の混入は無かった（198件全てのURLに対応するファイルが存在）。

### 2. flyer.html（印刷用ビラ）にnoindex設定が無い

`flyer.html`はA4サイズの印刷用チラシ（`@page{size:A4;margin:0;}`指定あり）で、ユーザー向けコンテンツではない。CLAUDE.mdのチェック項目「印刷用アセット等はnoindexにすべき」に該当するが、`<head>`内に`<meta name="robots">`タグが一切無く、デフォルトのindex,follow扱いになっている。sitemap.xmlには含まれていないためクロール優先度は低いが、外部リンクや直接アクセスからインデックスされるリスクは残る。

比較として、同じく非コンテンツページの`app.html`（`noindex,follow`）、`game.html`（`noindex`）は正しく設定されており、`boki3-ginko.html`（意図的なリダイレクトスタブ）も`noindex`＋正しいcanonical指定で問題なし。flyer.htmlだけが抜けている。

## 提案内容

1. `ai-shiwake-kikikata.html`と`boki1-akirameta-tatenaoshi.html`をsitemap.xmlに追加する（lastmodは実ファイルの最終更新日に合わせる）。
2. `flyer.html`の`<head>`に`<meta name="robots" content="noindex">`を追加する。

いずれも1行〜数行の機械的な修正で、レイアウトやコンテンツには一切影響しない。

## ジョブズの所見

これは典型的な「地味だが放置すると実害が出る」系の見落としだ。特にsitemap漏れの2記事は、書いた記事が検索エンジンに見つけてもらえていないかもしれないということ。記事を書く労力をかけたのに最後の一手を抜かしたら、そのコンテンツは無いのと同じだ。CLAUDE.mdの新規記事公開チェックリストにsitemap登録が明記されていないのも、そもそもの手順の穴だと思う。今回の稟議と合わせて、チェックリストへの追記も検討してほしい（この点は取締役の判断に委ねる）。

flyer.htmlのnoindex漏れは実害は小さいが、放置する理由もない。今回まとめて直すべき。

## フォローアップ（承認後）

- [ ] sitemap.xmlに2記事を追加
- [ ] flyer.htmlにnoindexメタタグを追加
- [ ] （任意）CLAUDE.mdの新規記事公開チェックリストに「sitemap.xmlへの登録」を追記するか検討

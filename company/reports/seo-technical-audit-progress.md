# 技術SEO監査 進捗トラッカー

週次で全記事（200件超）をローテーションして技術面（メタタグ／sitemap／noindex／JSON-LD／内部リンク）を確認する。
1回あたり15〜20ページを目安に消化する。全ファイル・全リンクを対象にした機械的な突合チェック（sitemap整合性、内部リンク切れ、JSON-LD構文）は毎回サイト全体に対して実施し、メタタグの目視確認のみローテーションする。

## 監査済みページ一覧（実施日順）

### 2026-07-27（初回）
サイト全体対象の機械チェック（sitemap.xml整合性、robots.txt、内部リンク404、JSON-LD構文・imageプロパティ）を実施。加えて以下の記事を個別に目視・詳細確認：

- ai-shiwake-kikikata.html
- boki1-akirameta-tatenaoshi.html
- boki2-cvp.html
- boki2-hyojun-genka.html
- boki2-kobetsu-genka.html
- boki3-genka.html
- boki3-ginko.html（リダイレクトスタブ・正常確認）
- eiken3-grammar.html
- eiken4.html
- fp3-inheritance.html
- fp3-realestate.html
- shihoshoshi-roniten.html
- shihoshoshi-start.html
- cpa-yobikou.html
- toeic-900.html
- univ-boki-units.html
- shikaku-list.html
- index.html（更新情報・記事一覧の内部リンクhealth）
- app.html / game.html（noindex確認のみ・正常）
- flyer.html（noindex確認のみ・要修正発見）

### 次回（2026-08-03予定）着手候補
- boki1-*.html群を中心にメタタグ目視チェック
- cpa-*.html群
- daigakusei-*.html群
- article-widgets.jsのARTICLES一覧に未登録の56記事（内部リンクネットワークの観点、既存の内部リンク施策と連携して扱う）

## 既知の継続課題（稟議書作成済み・対応待ち）
- flyer.html: noindexメタタグ欠落（`20260727-sitemap未掲載2記事とflyerのnoindex欠落の修正提案.md`）
- ai-shiwake-kikikata.html, boki1-akirameta-tatenaoshi.html: sitemap.xml未掲載（同上）
- JSON-LD Articleスキーマの"image"プロパティが196記事中195記事で欠落（`20260727-JSON-LD構造化データのimageプロパティ欠落一括修正提案.md`）

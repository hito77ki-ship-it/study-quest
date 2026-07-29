# 技術SEO監査 進捗トラッカー

週次で全記事（200件超）をローテーションして技術面（メタタグ／sitemap／noindex／JSON-LD／内部リンク）を確認する。
1回あたり15〜20ページを目安に消化する。全ファイル・全リンクを対象にした機械的な突合チェック（sitemap整合性、内部リンク切れ、JSON-LD構文）は毎回サイト全体に対して実施し、メタタグの目視確認のみローテーションする。

**チェック項目7（llms.txt）・8（robots.txtのAIクローラー許可状況）はローテーション対象外。サイト全体で1ファイルずつのチェックのため毎回確認する。**

---

## 監査済みページ一覧（実施日順）

### 2026-07-27（第1回）
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

### 2026-07-29（第2回）
サイト全体対象の機械チェックを**全206 HTMLファイル**に拡張して実施（第1回は記事ファイル中心だったため、固定ページを取りこぼしていた反省を反映）。

**今回から恒久化した全体チェック：**
- sitemap ⇄ 実ファイルの**双方向**突合（デッドエントリ／未掲載の両方向。固定ページを含む）
- noindexページのsitemap掲載チェック（矛盾シグナルの検出）
- JSON-LD必須プロパティ5種（headline / image / datePublished / author / publisher）＋ FAQPage構造 ＋ 日付の逆転
- og:image参照先の画像ファイル実在チェック
- title / description の文字数分布
- h1個数・lang属性・viewportの基本チェック
- 静的被リンク数（孤立記事・低被リンク記事の検出）

**ローテーションでメタタグ目視した28本（boki1-* / cpa-* / daigakusei-* 群）：**
- boki1-11month-strategy.html
- boki1-akirameta-tatenaoshi.html
- boki1-asshuku-kicho-chokusetsu-vs-tsumitatekin.html
- boki1-kawase-yoyaku-furiate-vs-dokuritsu.html
- boki1-kigyoketsugo-vs-renketsu.html
- boki1-next-exam.html
- boki1-renketsu-seika.html
- boki1-shasai-teigaku-vs-risokuho.html
- boki1-sogo-vs-kobetsu-shokyaku.html
- boki1-taishoku-kanbenho-vs-gensokuho.html
- boki1-yobikou.html
- boki1.html
- cpa-akirameta-boki1.html
- cpa-akirameta-shinro.html
- cpa-akirameta-shukatsu.html
- cpa-akirameta-zeirishi-boki1.html
- cpa-daigakusei-kakugo.html
- cpa-dokugaku.html
- cpa-kigyoho-kikansekkei.html
- cpa-subjects.html
- cpa-yobikou.html
- cpa.html
- daigakusei-keizai-shikaku.html
- daigakusei-keizoku.html
- daigakusei-kojin-jigyo-fuyo.html
- daigakusei-nenkin.html
- daigakusei-shikaku-heiyou.html
- daigakusei-zeikin-yougo.html

**固定ページを個別確認（今回の主要な発見箇所）：**
- about.html（sitemap未掲載・OGタグ欠落）
- contact.html（sitemap未掲載・OGタグ欠落）
- privacy.html（description・canonical・OGタグ欠落）
- terms.html（同上）
- tokusho.html（description・OGタグ欠落）

**新規記事4本の公開チェックリスト遵守を確認（すべて正常）：**
- boki2-oyoryoku-kabe.html / boki-careless-miss.html / boki-zasetsu-type.html / ai-shiwake-kikikata.html

### 次回（2026-08-05予定）着手候補
- boki2-*.html 群を中心にメタタグ目視チェック（未着手が最も多い）
- eiken-* / toeic-* / fp3-* 群
- 静的被リンクが1件のみの28記事について、内部リンク施策と連携して扱う
- 項目7・8（llms.txt・robots.txt）は毎回確認

---

## 既知の継続課題

### 稟議書作成済み・取締役の承認待ち（2026-07-29時点）
- **about.html / contact.html のsitemap未掲載、boki3-ginko.html（noindex）のsitemap掲載、boki2-ochita.html の lastmod未追随** → `20260729-sitemap整合性修正_about-contact追加とリダイレクトスタブ除去.md`
- **llms.txt が不在（GEO対策）** → `20260729-llms.txt新規設置提案_GEO対策.md`
- **固定ページ5本のメタタグ欠落、twitter:card が169ページで欠落** → `20260729-固定ページのメタタグ整備とtwitter-card一括追加.md`

### 対応完了（2026-07-27の稟議・実行済みを2026-07-29に確認）
- ~~flyer.html: noindexメタタグ欠落~~ → ✅ 設置済み
- ~~ai-shiwake-kikikata.html, boki1-akirameta-tatenaoshi.html: sitemap.xml未掲載~~ → ✅ 掲載済み
- ~~JSON-LD Articleスキーマの image プロパティが195記事で欠落~~ → ✅ Articleスキーマ199件すべてに設定済み

### 稟議を起こさず記録のみ（判断済み）
- **title長：205ページ中199ページが32字超、うち59ページが50字超。** キーワードは前方配置されており切れるのは主に末尾のブランド名のため実害は限定的。全記事の一括機械修正が不可能で投資対効果が読めないため、GSCで「表示回数が多くCTRが低い」ページを特定してから対象を絞って着手する方針（2026-07-29決定）。
- **article-widgets.js のARTICLES未登録記事：56本 → 37本に減少。** 既存の内部リンク施策の中で継続対応。
- **静的被リンクが1件のみの記事が28本**（被リンク0件の孤立記事は無し）。関連記事はJSで描画されるためGoogleは第2波レンダリングで拾うが、静的リンクの方が確実。次回の内部リンク施策で優先対象とする。
- **特定商取引法に基づく表記ページが未設置。** 無料サービスのため法的義務は無いと解釈。AdSense審査上の要否は別途検討。

---

## 監査手法のメモ

- 外部サイトのfetch（本番study-quest.netへの直接アクセス）は社サンドボックスのallowlist制限により実行できない。監査はGitHub Pagesのデプロイ元であるローカルリポジトリに対して実施している。リポジトリとデプロイ内容が一致している前提で判断していることを明記しておく。
- 内部リンク切れの機械検出では、JSテンプレートリテラル（`${a.f}`、`${item.url}` 等）が誤検出として7件程度混入する。これらは実害なしとして除外してよい。
- 7/26のペルソナ統一、7/27のJSON-LD一括修正のような機械的置換では大量のファイルのタイムスタンプが動くが、sitemapのlastmodは更新すべきではない（Googleは実質的更新のみの反映を推奨）。lastmodの追随チェックは、git logで実質的なコンテンツ追加があったファイルに限定して行うこと。
- sitemap突合は必ず**双方向**で行う。第1回で「デッドエントリ0件」だけを確認して未掲載ページの検出を怠り、about.html / contact.html の漏れを見逃した。

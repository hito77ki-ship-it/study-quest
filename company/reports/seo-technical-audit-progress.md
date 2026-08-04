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

### 2026-08-04（第3回）
全213 HTMLに対しサイト全体の機械チェックを実施。**7/29に起票した稟議3件がすべて実行済みであることを確認**（sitemap未掲載3件・twitter:card 169件欠落・固定ページのメタタグ欠落・llms.txt不在・ARTICLES未登録37本・更新日不整合73件 → すべて0件）。

**ローテーションでメタタグ目視した42本（boki2-* 群を全数）：**
boki2-arai-kirihanashi / boki2-bumonbetsu / boki2-cbt-vs-paper / boki2-chokusetsu-genka / boki2-cvp / boki2-gaika / boki2-ginko-chosei / boki2-hikiatekin / boki2-hojinzei-shohizei / boki2-hyojun-genka / boki2-hyojun-vs-jissai / boki2-junshisan / boki2-keihi / boki2-kessan / boki2-kobetsu-genka / boki2-kogyo-enshu / boki2-kogyo / boki2-kotei-betsu-genka / boki2-kotei-shisan-why / boki2-kotei-shisan / boki2-kurinobe-shisan-vs-fusai / boki2-lease / boki2-moshi-honban / boki2-net-test / boki2-next-exam / boki2-noren-vs-fu-no-noren / boki2-ochita / boki2-oyoryoku-kabe / boki2-progress / boki2-renketsu-suteru / boki2-renketsu / boki2-roumuhi / boki2-seizo-genka-hokokusho / boki2-seizo-kansetsuhi / boki2-shasai / boki2-shohin-baibai / boki2-software / boki2-sogo-genka / boki2-yukashoken / boki2-zairyouhi / boki2-zeikouka / boki2

**今回から恒久化した全体チェック（第2回に追加）：**
- canonical の自己参照チェック（リダイレクトスタブは例外扱い）
- article-widgets.js の ARTICLES ⇄ *_FILES 配列の双方向突合＋ゴースト登録検出
- meta description の文字数（120字超／60字未満）

### 次回（2026-08-11予定）着手候補
- **title の「約束表現」自動スクリーニング**（「〜との違い」「〜の比較」「〜受験方法」「〜合格率」等を title から抽出し、対応する h2 の有無を機械判定する一次スクリーニング）。boki2-* 42本の目視だけで2件出たため、残り約170本にも同種があると考えるのが妥当
- boki3-* / shihoshoshi-* 群のメタタグ目視（未着手が最も多い）
- eiken-* / toeic-* / fp3-* 群
- 項目7・8（llms.txt・robots.txt）は毎回確認

---

## 既知の継続課題

### 稟議書作成済み・取締役の承認待ち（2026-08-04時点）
- **boki2-ochita.html の title が約束した「再受験までの期間」に対応する h2 が本文に無い**（該当記述はFAQ内1問のみ／h1もtitleと別の約束）→ `20260804-boki2-ochita_titleと本文の不整合是正.md`
- **llms.txt の代表記事選定が収益導線を反映していない**（`boki1-yobikou.html` `ai-shiwake-kikikata.html` `boki-vs-fp.html` 等8本が未掲載）→ `20260804-llms.txt鮮度更新_未掲載記事の追加.md`

### 対応完了
- ~~flyer.html: noindexメタタグ欠落~~ → ✅（2026-07-29確認）
- ~~ai-shiwake-kikikata.html, boki1-akirameta-tatenaoshi.html: sitemap.xml未掲載~~ → ✅（2026-07-29確認）
- ~~JSON-LD Articleスキーマの image プロパティが195記事で欠落~~ → ✅ Article 201件すべて必須5プロパティ充足（2026-08-04確認）
- ~~about.html / contact.html のsitemap未掲載、boki3-ginko.html（noindex）のsitemap掲載~~ → ✅ sitemap双方向突合で不整合0件（2026-08-04確認）
- ~~llms.txt が不在~~ → ✅ 7/29設置・コミット済み。参照62URLに404 0件（2026-08-04確認）
- ~~固定ページ5本のメタタグ欠落、twitter:card が169ページで欠落~~ → ✅ 全記事に設置済み（2026-08-04確認）
- ~~article-widgets.js の ARTICLES未登録37本~~ → ✅ 配列93件すべて登録済み・ゴースト0（2026-08-04確認）
- ~~JSON-LD dateModified と本文更新日表示の不一致73件~~ → ✅ 不一致0件（2026-08-04確認）

### 稟議を起こさず記録のみ（判断済み）
- **title長：212ページ中200ページが32字超、うち58ページが50字超、4ページが60字超。** キーワードは前方配置されており切れるのは主に末尾のブランド名のため実害は限定的。GSCで「表示回数が多くCTRが低い」ページを特定してから対象を絞る方針（2026-07-29決定・2026-08-04も維持）。60字超の4本（boki3-next-exam 66字 / itp-vs-fe 63字 / boki2-moshi-honban 62字 / fe-vs-ap 61字）は優先候補として控えておく。
- **本文に「更新日」表示が無い記事が25本**（JSON-LDにdateModifiedはある）。7/29に73本へ一括追加した際の取りこぼし。軽微な一括作業のため稟議不要。
- **meta description が120字超なのは boki2-software.html の1件のみ**（123字）。実害小。
- **boki2-junshisan.html：** title/descが約束する「自己株式」に対応する h2 が無い（本文言及18回）。boki2-ochita ほど深刻でないため今回は記録のみ。次回の約束表現スクリーニングでまとめて扱う。
- **静的被リンクが1件のみの記事が19本**（28本→改善。0件の孤立記事は無し）。直近の新規記事3本（ai-shiwake-kikikata / boki-careless-miss / boki-zasetsu-type）がいずれも1件のみ。「公開時に既存記事から最低3本の被リンクを張る」をチェックリストに加えるかは内部リンク施策と合わせて検討。
- **robots.txt 末尾のコメント `# LLM向けサイト案内（llms.txt 提案仕様）` が事実と不一致**（llms.txtは設置済み）。クローラー挙動には無関係。llms.txt更新のコミットで同時に修正する。
- **特定商取引法に基づく表記ページ：** tokusho.html は存在する（2026-07-29時点の「未設置」記述を訂正）。

---

## 監査手法のメモ

- 外部サイトのfetch（本番study-quest.netへの直接アクセス）は社サンドボックスのallowlist制限により実行できない。監査はGitHub Pagesのデプロイ元であるローカルリポジトリに対して実施している。リポジトリとデプロイ内容が一致している前提で判断していることを明記しておく。
- 内部リンク切れの機械検出では、JSテンプレートリテラル（`${a.f}`、`${item.url}` 等）が誤検出として7件程度混入する。これらは実害なしとして除外してよい。
- 7/26のペルソナ統一、7/27のJSON-LD一括修正のような機械的置換では大量のファイルのタイムスタンプが動くが、sitemapのlastmodは更新すべきではない（Googleは実質的更新のみの反映を推奨）。lastmodの追随チェックは、git logで実質的なコンテンツ追加があったファイルに限定して行うこと。
- sitemap突合は必ず**双方向**で行う。第1回で「デッドエントリ0件」だけを確認して未掲載ページの検出を怠り、about.html / contact.html の漏れを見逃した。

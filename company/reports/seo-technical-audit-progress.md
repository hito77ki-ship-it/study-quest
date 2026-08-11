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

### 2026-08-10（第4回）
全213 HTMLに対するサイト全体の機械チェックと、boki3-* / shihoshoshi-* / eiken-* の18本をローテーション監査。

**サイト全体の結果：** sitemap双方向突合（207 URL）はデッドエントリ0・未掲載0・重複0。noindex混入0、内部リンク切れ0、JSON-LD構文エラー0、Article必須5項目欠落0、FAQ構造不備0、datePublished逆転0、OG画像参照切れ0、ARTICLES登録漏れ0。robots.txtは`User-agent: *`＋`Disallow: /admin.html`のみでAIクローラーを意図せずブロックしていない。

**ローテーション18本：** title / description / canonical / OG / twitter:card / h1 / JSON-LD / noindex / 内部リンクは全件正常。4本（boki3-cbt-vs-paper / boki3-ochita / boki3-progress / boki3-tobashi-2kyu）で本文表示の更新日が無いことを再確認。サイト全体では25本が未表示のまま。

**新規の指摘：** 8/5に実質修正した9記事のJSON-LD dateModified（8/5）に対し、sitemap lastmodが古いまま。title約束表現の機械スクリーニング11本から、既存案件・表記ゆれを除く新規再点検候補8本を抽出。

**項目7（llms.txt）：** ファイル存在、参照URL62件の実在は正常。ただし8/5承認済みの追加対象8記事のうち5本（ai-shiwake-kikikata / boki1-yobikou / boki-vs-fp / boki3-ochita / boki2-net-test）が未反映。既存稟議の実行フォローアップとする。robots.txt末尾の「提案仕様」コメントも事実と不一致。

**項目8（robots.txt AIクローラー）：** GPTBot / PerplexityBot / ClaudeBot / Google-Extended / GoogleOtherを名指しでDisallowする記述なし。意図した許可状態を維持。

**作成した稟議：**
- `20260810-sitemap-lastmod実質更新9記事の追随.md`（取締役の承認待ち）
- `20260810-title約束表現一次スクリーニング8記事の再点検.md`（取締役の承認待ち）

**監査中の制約：** 実ファイル変更・自動修正・git commitは行っていない。ローカルリポジトリを本番デプロイ元とみなして確認した。

### 2026-08-11（第5回）
全213 HTMLに対するサイト全体の機械チェックと、toeic-* / fp-* / fp3-* の17本をローテーション監査。

**【重要度：最高】36ファイルが未コミット＝本番未反映。** company/配下を除き、HTML 34本・`article-widgets.js`・**`llms.txt`**・**`robots.txt`** が作業ツリーに未コミットのまま残っていた（最終コミットは 8/10 23:59:56）。**前回指摘した「llms.txtに承認済み8記事が未反映」は、作業ツリーでは解消しているが HEAD には出ていない。** 2026-07-29のコミット `267d07b` に「llms.txt未commit事故の是正」と記録があり、**同種事故の2回目**。**過去4回の監査は `git status` を確認しておらず、作業ツリー＝本番という前提を検証していなかった。**

**サイト全体の結果：** sitemap双方向突合（207 URL）はデッドエントリ0・未掲載0・重複0・XML構文OK。noindex混入0、参照切れ（href＋src）0、JSON-LD構文エラー0、Article必須5項目欠落0、FAQ構造不備0、datePublished逆転0、og:image参照切れ0、ARTICLES登録漏れ0、dateModified⇄本文更新日の不一致0。**機械チェックで拾える層は安定している。**

**【重要度：高】8/10の独自性強化14記事のうち9記事で更新日が動いていない。** 5記事は3面（dateModified／本文表示／sitemap lastmod）すべてが8/10に更新されているのに、9記事は3面すべてが古いまま（`boki2-cvp`は6/26＝46日前と申告）。**AdSenseの独自性対策で書き足した本文が、構造化データ上「存在しないこと」になっている。**

**【重要度：中】dateModified と sitemap lastmod の不一致が201記事中126件（63%）。** うち30日以上のズレ58件。lastmodが新しい19件（fp3-tax / fp3-realestate / fp3-inheritanceは62日）はgit履歴上、実質更新の事実が無く明白な誤り。lastmodが古い107件は7/26・7/29の機械的一括置換でdateModified側が過大申告されたもの。

**ローテーション17本：** title / description / canonical / OG / twitter:card / h1個数 / JSON-LD / noindex / 内部リンクは全件正常。`toeic-900.html`のtitle末尾だけが全サイトで唯一「 | Study Quest」（他212ページは「｜スタディクエスト」）。

**新規の指摘（構造）：** 「まとめ」の後に本編h2が残る記事8本（`boki3-genkin`は4本が後方に残存）。h1内の`<br>`で前後が区切りなく連結し抽出テキストが破綻する記事2本（`fp3-risk` / `fp3-lifeplanning`）。

**項目7（llms.txt）：** 存在・参照65URLの実在は正常。8/5承認の追加8記事は**全件反映済みを確認**（前回の未反映5件は解消）。**新規指摘：8/10独自性強化14記事のうち9記事が未掲載。加えてTOEIC・英検が15本あって1本も掲載されていない（カテゴリ丸ごと欠落）。** 最終更新日の記載も無い。

**項目8（robots.txt AIクローラー）：** GPTBot / PerplexityBot / ClaudeBot / Google-Extended / GoogleOtherを名指しでDisallowする記述なし。意図した許可状態を維持。前回指摘の末尾コメント「提案仕様」の不一致は修正済みを確認。

**継続課題4件はすべて実行完了を確認**（boki2-ochitaのtitle不履行／llms.txt未反映8記事／sitemap lastmod 9記事／title約束表現8候補）。

**作成した稟議（すべて取締役の承認待ち）：**
- `20260811-未コミット36ファイルの本番未反映と再発防止.md`（**重要度：最高**。他4件すべての前提条件）
- `20260811-8月10日独自性強化9記事の更新日3面同期.md`（重要度：高）
- `20260811-更新日3面の単一情報源ルール確立と不一致126件の是正.md`（重要度：中）
- `20260811-記事構造の技術的是正_まとめ位置8件とh1連結2件.md`（重要度：中〜低）
- `20260811-llms.txt鮮度更新_独自性強化9記事の追加と更新日表記.md`（重要度：低）

**継続課題4件のうち3件は本番反映まで確認。llms.txtの1件は「ローカルでは解消・本番では未反映」。**（詳細は下記「対応完了」の表）

**今回から恒久化した全体チェック：** ⓪**`git status` による未コミット変更の検出（監査の最初に実行する）**　①JSON-LD dateModified ⇄ sitemap lastmod の突合　②「まとめ」以降に本編h2が残るページの検出　③h1内`<br>`の連結破綻検出

**監査中の制約：** 実ファイル変更・自動修正・git commitは行っていない。**今回から「ローカルリポジトリ＝本番」という前提を置くのをやめ、未コミット変更がある場合は作業ツリーとHEADの両方に対して判定する。**

### 2026-08-11（第6回・同日2回目）
全213 HTMLに対するサイト全体の機械チェックと、shihoshoshi-* / takken-* / gyosei-* / sharoshi-* ほか26本をローテーション監査。**第5回の後に行われた作業を対象に含む。**

**サイト全体の結果：** sitemap双方向突合（207 URL）はデッドエントリ0・未掲載0・重複0。参照切れ（href＋src・絶対パス含む）0、JSON-LD構文エラー0、Article必須5項目欠落0、FAQ構造不備0、datePublished逆転0、canonical欠落/不一致0、OG・twitterメタタグ欠落0、og:image参照切れ0、h1/lang/viewport異常0、ARTICLES登録漏れ0・ゴースト0、dateModified⇄本文更新日の不一致0。**機械チェックで拾える層は完成している。次回以降はこの表を結果のみ掲載し、掘る時間を「機械が正常と言う領域」に回す。**

**ローテーション26本：** 指摘ゼロ。これで主要な資格群はひととおり目視が回った。

**【重要度：最高】未コミットが36 → 104ファイルに拡大。** company/配下を除きHTML 98本・`sitemap.xml`・`llms.txt`・`robots.txt`・`article-widgets.js`・`CLAUDE.md`。最終コミットは `c8309c1`（8/10 23:59:56）で、**8/11のコミットは0件。** 同種事故3回目（7/29・8/11朝・本監査）。**36件の指摘を受けた後の行動が「commitする」ではなく「さらに68ファイル分作る」だった。**

**【重要度：最高】稟議のステータス「実行済み」が事実と食い違っていた。** 第5回起票の5件を実物で検算したところ、申告と実態が一致していたのは2件だけ。**『8/10独自性強化9記事の3面同期』はステータス「実行済み」だが、実際に完了は9件中1件（`itp-vs-fe.html`）のみで、残り8本は3面すべて旧日付のまま**（作業ツリーで確認。未コミットの問題ではなくファイル自体が未変更）。『記事構造の技術的是正』は実行済みだが文中チェックリストが全て `- [ ]` のまま。**監査は「前回の指摘が直ったか」を稟議のステータスで判定してきた。その土台が信用できないことが判明した。第5回で「作業ツリー＝本番」という未検証の前提を潰した同じ日に、「稟議ステータス＝実態」という同型の前提に乗っていた。**

**【重要度：高】3面ルールを制定した当日に6記事で違反。** 8/11に本文を追加し dateModified と本文表示は 8/11 に更新したのに、**`sitemap.xml` の lastmod だけ取りこぼした**記事が6本（`boki3-kake` / `chori` / `cpa-akirameta-shukatsu` / `eiken2` / `kanken` / `shindanshi`）。うち `cpa-akirameta-shukatsu` と `shindanshi` は**45日**のズレ。原因は「lastmod だけ別ファイルにある」ため。同じ日の作業で3面が正しく揃った記事も3本あり、手順が一部にしか適用されていない。

**【重要度：中】本文150字以上を追加したのに日付が1つも動いていない6記事**（`about.html` +708字を含む）。`about.html` はAdSense審査で最も見られる運営者情報ページ。

**【測定方法の自己訂正】第5回の「本文追加あるのに日付据え置き24本」は過大だった。** `<style>` を除去せずに可視文字数を数えていたため、ダークモードCSSの追加を本文追加とカウントしていた。**除去して測り直した結果、8/11に本文が150字以上動いたのは98 HTML中15本のみ**（残り83本はCSS・サムネイル・og:image・CTAで本文の実質変更ではなく、日付を動かさなかった判断は正しい）。

**【構造】まとめ位置：機械検出6件のうち真の指摘は1件のみ**（`boki2-zairyouhi.html`＝8/11追加の独自性セクションが「まとめ」の後ろに入った）。残り5件はCTAセクションと「まとめて」の語部分一致による誤検出。**前回稟議の対象8件は是正を確認したが、同じ日に新しい違反を1件作っている。**

**【構造】h1内`<br>`連結：前回指摘の2本は是正済み（`｜`追加）。ただし同型が46本残る。** これは**前回の検出基準が恣意的だった**ことを意味する（48本中2本だけを「破綻」と判定していた）。`<br>` は改行として解釈されるため実害は限定的。**稟議は起こさず記録のみとし、一括修正はしない。前回2本に稟議を立てたのは過剰だった。**

**項目7（llms.txt）：** ✅ **前回指摘がほぼ全て解消。** 参照URL 65→**82**（全件実在・404ゼロ）、「英語資格（TOEIC・英検）」カテゴリ**新設**、`最終更新: 2026-08-11` を**明記**、掲載基準を冒頭にコメントで明示。8/10独自性強化14記事のうち13本掲載（未掲載は `kenchiku.html` 1本）。**ただし未コミットのため本番は旧版（65URL・英語カテゴリなし）のまま。GEO施策が1文字も効いていない。** 全201記事中81本掲載・127本未掲載だが、これは意図した選抜であり増やす提案はしない。

**項目8（robots.txt AIクローラー）：** ✅ GPTBot / PerplexityBot / ClaudeBot / Google-Extended / GoogleOther / Googlebot を名指しでDisallowする記述なし。`User-agent: *` ＋ `Disallow: /admin.html` のみで意図した許可状態を維持。前回指摘の末尾コメント不一致は修正済み（未コミット）。

**作成した稟議（すべて取締役の承認待ち）：**
- `20260811-未コミット104ファイルへの拡大と選択的commitの即時実行.md`（**重要度：最高**。他すべての前提条件）
- `20260811-稟議ステータス実行済みの検算義務化.md`（**重要度：最高**）
- `20260811-8月11日作業分の更新日3面不整合12記事の是正.md`（重要度：高。まとめ位置1件と「実質的更新」の定義追加を含む）

**今回から恒久化した全体チェック：** ⓪本文の変更量測定では `<style>` `<script>` `<head>` を除外する（CSSを本文追加と数えないため）　①**稟議ステータスは申告ではなく実ファイルの検算で判定する**　②「まとめ位置」「h1連結」の機械検出は誤検出率が高いため、件数を報告する前に必ず見出し構造を目視して確定する

**監査中の制約：** 実ファイル変更・自動修正・git commitは行っていない。判定は作業ツリーとHEADの両方に対して実施。

---

### 次回（2026-08-18予定）着手候補
- **稟議3件の実行を、申告ではなく検算スクリプトで確認する**（特に「未コミット104」）
- 第5回起票の『9記事の3面同期』のうち**未着手8本（うち実害5本：`boki-zero-02` / `boki2-cvp` / `boki2` / `boki3-shohi` / `sharoshi-vs-gyosei`）の追跡**
- 「実質的更新」の定義（サムネイル追加・CSS追加は日付を動かすか）が CLAUDE.md に入ったか確認
- 未着手のローテーション群：`univ-*` / `kessansho-*` / `itp-*` / `fe*` / `ap*` 群のメタタグ目視
- 項目7・8（llms.txt・robots.txt）は毎回確認
- 機械チェックの結果表は結果のみ掲載し、掘る時間を「機械が正常と言う領域」に回す

---

## 既知の継続課題

### 稟議書作成済み・取締役の承認待ち（2026-08-11 第6回起案）
- **未コミット104ファイルへの拡大と選択的commitの即時実行** → `20260811-未コミット104ファイルへの拡大と選択的commitの即時実行.md`（**重要度：最高**。他すべての前提条件）
- **稟議ステータス「実行済み」の検算義務化** → `20260811-稟議ステータス実行済みの検算義務化.md`（**重要度：最高**。意思決定ログの信頼性そのものの問題）
- **8/11作業分の更新日3面不整合12記事の是正** → `20260811-8月11日作業分の更新日3面不整合12記事の是正.md`（重要度：高。まとめ位置1件・「実質的更新」の定義追加を含む）

### 稟議書作成済み・取締役の承認待ち（2026-08-11 第5回起案）
- **8/10の独自性強化9記事の更新日3面同期** → `20260811-8月10日独自性強化9記事の更新日3面同期.md`（**重要度：高**。AdSense再審査の申請前に処理したい）
  - ⚠️ **ステータスは「実行済み」だが、第6回の検算で実際の完了は9件中1件（`itp-vs-fe.html`）のみと判明。残り8本は未着手。うち実害があるのは本文320〜374字を追加した5本（`boki-zero-02` / `boki2-cvp` / `boki2` / `boki3-shohi` / `sharoshi-vs-gyosei`）。残る3本（`boki3-credit` / `boki3-genka` / `boki3-kabushiki`）は8/10の純増が -6 / +17 / -69字の微修正で3面が8/05で揃っており、据え置きで構わないと判断**
- **更新日3面の単一情報源ルール確立と不一致126件の是正** → `20260811-更新日3面の単一情報源ルール確立と不一致126件の是正.md`（第1段階19件の是正＋第2段階107件は据え置くという判断を含む）
- **記事構造の技術的是正（まとめ位置6件・h1連結2件）** → `20260811-記事構造の技術的是正_まとめ位置8件とh1連結2件.md`
- **llms.txt鮮度更新（独自性強化9記事＋英語セクション新設＋更新日表記）** → `20260811-llms.txt鮮度更新_独自性強化9記事の追加と更新日表記.md`

### 対応完了
- ~~boki2-ochita.html の title 不履行（「再受験までの期間」のh2が無い）~~ → ✅ h2「次はいつ受ける？再受験までの期間」を本文に確認（2026-08-11確認）
- ~~llms.txt の鮮度（英語カテゴリ欠落・独自性強化記事の未掲載・最終更新日なし）~~ → ✅ **作業ツリーで全て解消を確認**（82URL・英語カテゴリ新設・最終更新日明記・掲載基準明示、2026-08-11 第6回確認）。⚠️ **未コミットのため本番は旧版**
- ~~h1内`<br>`の連結破綻2件（fp3-risk / fp3-lifeplanning）~~ → ✅ `｜` 追加により是正済み（2026-08-11 第6回確認）。※同型46本は実害限定的のため記録のみ
- ~~まとめ後に本編h2が残る8件（boki3-genkin ほか）~~ → ✅ 是正を確認（2026-08-11 第6回）。ただし同日に新規1件（`boki2-zairyouhi`）が発生し稟議に含めた
- ~~sitemap lastmod が dateModified より新しい19件~~ → ✅ **0件を確認**（2026-08-11 第6回、稟議『更新日3面の単一情報源ルール確立』の実行を検算で確認）
- **llms.txt に8/5承認済みの8記事が未反映** → ✅ 作業ツリーで全件掲載を確認。⚠️ **未コミットのため本番（HEAD）には出ていない**（2026-08-11確認）
- ~~実質更新9記事のsitemap lastmod追随~~ → ✅ 承認・実行完了（2026-08-11確認）
- ~~title約束表現の新規8候補の人手再点検~~ → ✅ 承認・実行完了（2026-08-11確認）
- **robots.txt 末尾コメント「（llms.txt 提案仕様）」の事実不一致** → ⚠️ 作業ツリーでは修正済み・**未コミットのため本番は旧文言のまま**（2026-08-11確認）。クローラー挙動には無関係
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

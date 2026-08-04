# 記事品質監査 進捗管理

週1回の定例監査（`study-quest-article-quality-audit`）で監査済みの記事を記録する。全記事を一巡したらリセットして最初から再監査するローテーション運用。

## 監査済み一覧

### 2026.07.27（1巡目・1回目、15本）
- ai-shiwake-kikikata.html
- ap.html
- boki-vs-fp.html
- boki-zero-01.html
- boki-zero-02.html
- boki-zero-03.html
- boki-zero-04.html
- boki-zero-05.html
- boki.html
- boki1-11month-strategy.html
- boki1-akirameta-tatenaoshi.html
- boki1-asshuku-kicho-chokusetsu-vs-tsumitatekin.html
- boki1-kawase-yoyaku-furiate-vs-dokuritsu.html
- boki1-kigyoketsugo-vs-renketsu.html
- boki1-next-exam.html

対応レポート：`company/reports/20260727-記事品質監査.md`
対応稟議書：`company/decisions/20260727-記事品質改善_*.md`（5件）

### 2026.07.29（1巡目・2回目、15本）
- boki-careless-miss.html
- boki-zasetsu-type.html
- boki1-renketsu-seika.html
- boki1-shasai-teigaku-vs-risokuho.html
- boki1-sogo-vs-kobetsu-shokyaku.html
- boki1-taishoku-kanbenho-vs-gensokuho.html
- boki1-yobikou.html
- boki1.html
- boki2-arai-kirihanashi.html
- boki2-bumonbetsu.html
- boki2-cbt-vs-paper.html
- boki2-chokusetsu-genka.html
- boki2-cvp.html
- boki2-gaika.html
- boki2-ginko-chosei.html

※ boki-careless-miss.html / boki-zasetsu-type.html は 2026.07.27 公開の新記事で1回目のリストに含まれていなかったため、繰り上げて組み込んだ。

対応レポート：`company/reports/20260729-記事品質監査.md`
対応稟議書：`company/decisions/20260729-記事品質改善_*.md`（3件）

### 2026.07.30（1巡目・3回目、15本）
- boki2-hikiatekin.html
- boki2-hojinzei-shohizei.html
- boki2-hyojun-genka.html
- boki2-hyojun-vs-jissai.html
- boki2-junshisan.html
- boki2-keihi.html
- boki2-kessan.html
- boki2-kobetsu-genka.html
- boki2-kogyo-enshu.html
- boki2-kogyo.html
- boki2-kotei-betsu-genka.html
- boki2-kotei-shisan-why.html
- boki2-kotei-shisan.html
- boki2-kurinobe-shisan-vs-fusai.html
- boki2-lease.html

対応レポート：`company/reports/20260730-記事品質監査.md`
対応稟議書：`company/decisions/20260730-記事品質改善_*.md`（3件）

※ 今回、記事単位ではなく**シリーズ横断の構造欠陥**が見つかった。`article-widgets.js` の `ARTICLES` に簿記2級の論点記事28本のうち15本が未登録で、サイドバー論点一覧と前後記事ナビが機能していなかった（簿記3級32本・1級・司法書士・単発ガイドは未登録0本）。**記事ファイル単位の監査だけでは見つからない類の問題なので、以後の監査では「対象記事が `ARTICLES` と `BOKI*_FILES` の両方に登録されているか」を定型チェック項目に加える。**

### 2026.07.31（1巡目・4回目、15本）
- boki2-moshi-honban.html
- boki2-net-test.html
- boki2-next-exam.html
- boki2-noren-vs-fu-no-noren.html
- boki2-ochita.html
- boki2-oyoryoku-kabe.html
- boki2-progress.html
- boki2-renketsu-suteru.html
- boki2-renketsu.html
- boki2-roumuhi.html
- boki2-seizo-genka-hokokusho.html
- boki2-seizo-kansetsuhi.html
- boki2-shasai.html
- boki2-shohin-baibai.html
- boki2-software.html

※ `boki2-progress.html` は記事ではなく学習進捗チェックのツールページ。文字数の少なさは仕様として扱った。

対応レポート：`company/reports/20260731-記事品質監査.md`
対応稟議書：`company/decisions/20260731-記事品質改善_*.md`（3件）

※ 今回も**記事単位では見つからない構造欠陥**が出た。`boki2-noren-vs-fu-no-noren.html` が `ARTICLES` 未登録だったのをきっかけに全数調査したところ、**197本中37本が `ARTICLES` 未登録**だった（簿記2級6・簿記3級5・公認会計士6・英検6・TOEIC4・大学生向け4・税務その他5・IELTS1）。`ARTICLES` はサイドバー／前後ナビだけでなく**「新着記事」「人気記事」ウィジェットの生成にも使われている**ため、37本はサイト内の自動内部リンク網から完全に外れていた。
※ 07-30の検算が「配列の要素が `ARTICLES` にあるか」という**片方向**だったのが原因。**今後は「全htmlファイル → ARTICLES」の逆方向も必ず回す**（定型チェック項目9を改訂）。
※ また、`boki2-seizo-genka-hokokusho.html` で**同一の例題データから当期製品製造原価が125,000と135,000の2通り出る矛盾**を検出した。各計算は単体では正しく、突き合わせて初めて出る類の欠陥。**定型チェック項目14を新設**した。

### 2026.08.04（1巡目・5回目、15本）
- boki2-sogo-genka.html
- boki2-yukashoken.html
- boki2-zairyouhi.html
- boki2-zeikouka.html
- boki2.html
- boki3-cbt-vs-paper.html
- boki3-credit.html
- boki3-denpyo.html
- boki3-genka.html
- boki3-genkin.html
- boki3-hojinzei.html
- boki3-hojosho.html
- boki3-kabushiki.html
- boki3-kafusoku.html
- boki3-kake.html

※ アルファベット順では `boki3-ginko.html` が範囲に入るが、これは `boki2-ginko-chosei.html` への **noindex 付きリダイレクトページ**（本文83字）で記事ではない。対象から外し、次の `boki3-kake.html` を繰り上げて組み込んだ。**同種のリダイレクトページが他にもある可能性があるため、次回以降は選定時に `robots noindex` と `http-equiv="refresh"` の有無を先にチェックする。**

対応レポート：`company/reports/20260804-記事品質監査.md`
対応稟議書：`company/decisions/20260804-記事品質改善_*.md`（3件）

※ 今回、**記事ファイルではなく `article-widgets.js` 自体のコード欠陥**を検出した。カンマ区切りセレクタ6箇所（1393/1395/1397/1407/1409/1411行目）で2番目のセレクタに `html[data-theme="dark"]` が付いておらず、**ダークモード用の文字色が `!important` 付きでライトモード（既定表示）にも適用されていた。** `boki3-kabushiki.html` の配当計算表と `boki3-shohi.html` の消費税計算表で、金額欄のコントラスト比が **1.43〜2.28:1**（WCAG AA基準4.5:1）まで落ちていた。**潰れているのは装飾ではなく計算の答えそのもの。** 記事を1本ずつ読む監査では原理的に発見できず、共有ファイルのセレクタを機械パースして初めて出た。**定型チェック項目16を新設。**

※ `boki3-credit.html` の `warn-box`「**【最大のひっかけ】**」の中で、例示仕訳の**貸借が3科目すべて逆転**していた（`売上 10,000 ／ クレジット売掛金 9,800 ＋ 支払手数料 200`）。加えて手数料の数値が本文例題（3%・300円・9,700円）と食い違っていた。**記事が自ら「最大のひっかけ」と名指しで強調した1文が誤っていた。** 文字数・例題数・リンク健全性のどれでも引っかからない類の欠陥。**定型チェック項目17を新設。**

※ `boki3-genka.html` で**図解SVG（取得原価¥1,000,000・年¥180,000）と本文例題（¥1,000・年¥180）の桁が1,000倍違う**ことを検出。図・figcaption・本文がそれぞれ単体では正しく、突き合わせて初めて出る。項目14の対象を「本文中の数値」に限っていたため見逃していた。**図解内の数値・altの約束まで対象を広げ、定型チェック項目18を新設。**

※ CLAUDE.md「タイトル変更時のチェックリスト」（07-29制定）の違反が**15本中2本**（`boki3-denpyo.html` の「仕訳日計表」、`boki3-kake.html` の「未収入金・未払金との違い」）で再発。**あのチェックリストは新規作成・タイトル変更時にしか回っておらず、既存記事に一度も全数適用していない。** 同率なら全205本で約27本。定例監査（週15本）で一巡するのは12月であり、それまで放置される。**全数スキャンを監査とは別枠で一度回すことを稟議書「boki2の成果保証表現とtitle不履行3本」の対応7として起案した。**

---

## 進捗

- 監査済み：75本 / 全記事約201本（全213 htmlから admin・app・game・flyer・index・google検証ファイル、about・contact・privacy・terms・shikaku-list、および noindex リダイレクトページ `boki3-ginko.html` を除く）
- 次回の起点：`boki3-kashidaore.html`（アルファベット順の続き。`boki3-kake.html` は今回繰り上げ済みのためスキップ）
- 1巡完了予定：2026年12月頃（週15本ペース）

### 未処理のまま積み上がっている既存稟議（要判断）

定例監査で毎回再検出されるため、状況を明記しておく。

| 稟議書 | 起案日 | ステータス | 現状 |
|---|---|---|---|
| `20260731-記事品質改善_ARTICLES未登録35本と日付表示欠落.md` | 07-31 | 🕐 承認待ち | **08-04時点で未登録は依然37本、1本も減っていない。** 今回の `boki3-cbt-vs-paper.html`、更新日表示欠落の `boki2-zairyouhi.html` / `boki3-cbt-vs-paper.html` も本稟議に含まれる項目 |
| `20260731-記事品質改善_薄い記事3本と未使用CSS.md` | 07-31 | 🕐 承認待ち | — |
| `20260731-記事品質改善_計算矛盾と数値の事実誤り.md` | 07-31 | 🕐 承認待ち | — |
| `20260730-記事品質改善_kogyo-enshuのダークモード可読性とindex未掲載.md` | 07-30 | 🕐 承認待ち | — |

**監査が発見を積み上げても、承認が滞れば本番は1ミリも良くならない。** 08-04起案の3件と併せ、優先順位を付けた一括判断をお願いしたい。

## 定型チェック項目（毎回実施する）

監査のたびに毎回同じ観点を漏らさず見るため、実行内容を明文化しておく。

1. **文字数**：`<head>`・`<script>`・`<style>`・タグを除去した本文字数を算出し、同カテゴリ内で極端に短いものを特定する
2. **事実の検算**：本文中の計算・数値主張・法令の条文内容を手計算で検証する
3. **`<picture>` 包み**：SVG/PNG図解が `<picture>` で包まれているか（widgets の `.container picture` カード風ラッパーが効く条件）
4. **ファイル実在**：`src`/`srcset`/`href="*.html"` の参照先が実在するか
5. **ダークモード可読性**：ローカル `<style>` で明るい背景を指定している箇所について、(a) 文字色を明示しているか (b) widgets またはローカルに `html[data-theme="dark"]` の対応があるか を確認。**特に「クラス指定の白背景」は widgets の救済網（`[style*="background:#fff"]` はインラインstyle限定）に掛からないので必ず個別確認する**
6. **詳細度**：ローカルの `td` / `th` 系の色指定が widgets の `html[data-theme="..."] td`（詳細度0,1,1）に負けていないか
7. **クラス衝突**：ローカル定義クラス名が widgets 標準クラスと重複していないか
8. **未使用CSS**：`<style>` で定義したクラスがマークアップで使われているか
9. **widgets登録（2026-07-31改訂・両方向で検算する）**
   - (a) **配列 → ARTICLES**：`BOKI*_FILES` 等の全要素が `ARTICLES` に存在するか
   - (b) **全htmlファイル → ARTICLES**：`article-widgets.js` を読み込む全ファイルが `ARTICLES` に存在するか。**(a)だけでは「配列にも ARTICLES にも最初から居ない記事」を検出できない**（2026-07-31、37本の取りこぼしの反省より）
   - `ARTICLES` はサイドバー・前後ナビだけでなく**「新着記事」（191行目）「人気記事」（206行目）ウィジェットの生成にも使われる。** 未登録＝内部リンク網から完全に外れる
   - 意図的に登録しないページ（`boki2-progress.html` 等のツールページ）は、**理由をコード内コメントに残して誤検出を防ぐ**
10. **index.html 掲載**：`index.html` の記事一覧にカードリンクがあるか
11. **日付整合**：JSON-LD `dateModified` と本文「更新日」表示の一致、`datePublished > dateModified` の逆転がないか
12. **著者ペルソナ**：「若葉（関西の大学3回生・日商簿記1級勉強中）」で統一されているか、旧名「大谷一輝」の残存がないか、検証不能に具体的な体験談がないか
13. **過度な断定**：「絶対に〜できる」等の成果保証表現がないか。あわせて**「最も〜」「試験で一番〜」など裏付けのない最上級表現**も見る（2026-07-31追加）
14. **同一記事内の数値整合（2026-07-31新設）**：**同じ例題データが記事内で複数回登場したら、答えを必ず突き合わせる。** 各計算が単体で正しいことは記事全体の整合を保証しない。`boki2-seizo-genka-hokokusho.html` は⑤と⑥が同じデータで125,000と135,000という別の答えを出しており、**3回の監査で見逃していた**
15. **サイト横断の数値整合（2026-07-31新設）**：勉強時間・合格率・受験料など、複数記事で繰り返し出る数値がサイト内で揃っているか。揃っていないだけでなく、**外部の最新データと合っているか**も確認する（合格率は年度で動く）
16. **共有ファイル自体の検算（2026-08-04新設）**：記事ファイルだけでなく `article-widgets.js` を検算対象に含める
    - (a) **カンマ区切りセレクタの全要素に `html[data-theme="..."]` が付いているか。** CSS のセレクタリストは各要素が独立評価され、祖先条件は右側に引き継がれない。1つでも漏れると**そのルールが全テーマに適用される**
    - (b) `!important` 付きルールが、記事側から打ち消せない形で意図しないテーマ・意図しない要素に漏れていないか
    - この観点が無かったため、**ライトモード（既定表示）で計算結果の金額が読めない状態が2記事で放置されていた**（2026-08-04、コントラスト比1.43:1）
17. **強調ボックス内の記述を最優先で検算する（2026-08-04新設）**：`warn-box` / `tip-box` や「最重要」「最大のひっかけ」「絶対に押さえる」等でマークされた箇所は、**本文の通常記述より先に検算する**
    - 読者が最も信用して読む箇所であり、誤りの実害が最も大きい
    - 特に**平文で書かれた仕訳**に注意する。`.shiwake-box` / `.kari` / `.kashi` でマークアップされた仕訳は貸借が構造的に担保されるが、平文の「A ／ B」形式は担保が無い
    - `boki3-credit.html` は「【最大のひっかけ】」ボックス内の平文仕訳で**3科目すべての貸借が逆転**していた（2026-08-04）
18. **図解と本文の照合（2026-08-04新設）**：図解（SVG/PNG）について以下を本文と突き合わせる
    - (a) 図中の数値が本文の例題と**同じ数値例か**（桁違い・別設定になっていないか）
    - (b) 図の `alt` / `figcaption` が名乗った論点に、**対応する本文解説が存在するか**
    - 項目14の対象を「本文中の数値」に限っていたため、`boki3-genka.html`（図¥1,000,000 vs 本文¥1,000）と `boki2-zairyouhi.html`（図が「先入先出法・移動平均法の単価計算比較」を名乗るが本文に解説なし）を見逃していた（2026-08-04）
19. **title↔本文の照合は既存記事にも適用する（2026-08-04追加・項目の運用改訂）**：CLAUDE.md「タイトル変更時のチェックリスト」は**タイトルを変更するときにしか回っていない**。監査対象の15本については、タイトルを触っていなくても**毎回4点（title / h1 / og:title / description）と h2 構成を突き合わせる**
    - titleのキーワードは**出現するだけでは足りない。** FAQのみ・図のaltのみ・フロー図の1行のみ、といった「形だけの出現」は不履行とみなす。**対応するh2があるか**まで見る
    - `boki3-denpyo.html`（仕訳日計表：本文2回・h2なし）、`boki3-kake.html`（未収入金・未払金：FAQ2問のみ・「例題つき」と称しながら例題なし）で再発（2026-08-04）

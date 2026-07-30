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

---

## 進捗

- 監査済み：45本 / 全記事約202本（全213 htmlから admin・app・game・flyer・index・google検証ファイル、about・contact・privacy・terms・shikaku-list の11本を除く）
- 次回の起点：`boki2-moshi-honban.html`（アルファベット順の続き）
- 1巡完了予定：2026年12月頃（週15本ペース）

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
9. **widgets登録**：対象記事が `ARTICLES` と `BOKI*_FILES` の**両方**に登録されているか（片方だけだとサイドバー・前後ナビから黙って消える）
10. **index.html 掲載**：`index.html` の記事一覧にカードリンクがあるか
11. **日付整合**：JSON-LD `dateModified` と本文「更新日」表示の一致、`datePublished > dateModified` の逆転がないか
12. **著者ペルソナ**：「若葉（関西の大学3回生・日商簿記1級勉強中）」で統一されているか、旧名「大谷一輝」の残存がないか、検証不能に具体的な体験談がないか
13. **過度な断定**：「絶対に〜できる」等の成果保証表現がないか

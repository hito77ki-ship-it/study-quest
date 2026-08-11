# Study Quest AdSense全体ローテーション監査

**監査日：** 2026年8月11日  
**監査者：** CEO ジョブズ  
**対象：** `fp3-realestate.html` から `zeirishi.html` までの未監査65本  
**方針：** 記事本文・`index.html`・`article-widgets.js`・画像・公開ページは編集しない。git commitもしない。

## 1. 取締役向け結論

- 監査記事数：**65本**
- 独自性不足候補：**48本**（記事本文にも動的な編集部メモにも、固有の判断・学習手順を確認できない候補）
- 定型文候補：**63本**（いいね依頼・Study Questへの定型締めを含む）
- 事実鮮度候補：**42件**（本文更新日表示欠落4件、JSON-LDとsitemapの不一致38件。既存稟議で扱う）
- 重大な事実誤り：**0件**
- 新規稟議化：**1件**（`index.html` 未掲載12本）
- `ARTICLES` 未登録：**0本**
- `index.html` 未掲載：**12本**

今回の公式照合で、インボイス記事の2割・3割特例と仕入税額控除の70→50→30%移行は国税庁の令和8年度資料と一致し、FP3級のCBT・時間・合格基準も日本FP協会の現行要綱と整合した。誤りを無理に作らず、導線欠落だけを新規稟議にした。

## 2. 対象記事

```text
fp3-realestate.html fp3-risk.html fp3-tax.html fp3.html gaibuin.html gyosei.html
hatarakinagara-shikaku.html hisho.html hoikushi.html ielts.html invoice-2wari-3wari-tokurei.html
iryo-jimu.html itp-vs-fe.html itp.html kaigo-fukushi.html kaigo.html kakutei-shinkoku-okure-bassoku.html
kanken.html keizoku.html kenchiku.html kessansho-yomikata-sony.html kiken.html mansion.html mos.html nurse.html
osusume-shikaku.html shakai-fukushi.html shakaijin-benkyou-jikan.html sharoshi-vs-gyosei.html
sharoshi-vs-shindanshi.html sharoshi.html shihoshoshi-futoki.html shihoshoshi-kaishaho.html
shihoshoshi-minpo-bukken.html shihoshoshi-minpo-sosoku.html shihoshoshi-roniten.html shihoshoshi-start.html
shihoshoshi.html shikaku-20dai.html shikaku-30dai.html shikaku-3months.html shikaku-app.html shikaku-eigyo.html
shikaku-jinsei-kawaru.html shikaku-women.html shikaku-zasetsu-riyu.html shindanshi.html shukatsu-shikaku.html
takken-vs-gyosei.html takken-vs-mansion.html takken.html tenshoku-shikaku.html toefl.html toeic-600.html
toeic-730.html toeic-860.html toeic-900.html toeic-vs-eiken.html toeic.html toroku-hanbai.html
univ-ai-report-hack.html univ-boki-units.html univ-qualification-strategy.html zeirishi-vs-cpa.html zeirishi.html
```

## 3. 横断判定

### 独自性不足：48本

自動判定の「明示的な独自判断・学習手順なし」を、`article-widgets.js` の動的な `ORIGINALITY_NOTES` も含めて再確認した。文字数不足ではなく、読者がその記事固有の判断基準・学習順・確認手順を再現できるかで候補化している。

対象は、FP3級論点、司法書士論点、資格ランキング、英語スコア別記事、定型ガイド記事などに分布する。対象ファイルは次の48本。

```text
fp3-realestate.html fp3-risk.html fp3-tax.html gyosei.html hatarakinagara-shikaku.html
hisho.html hoikushi.html ielts.html invoice-2wari-3wari-tokurei.html iryo-jimu.html
kaigo-fukushi.html kaigo.html kakutei-shinkoku-okure-bassoku.html kiken.html mansion.html
mos.html nurse.html osusume-shikaku.html shakai-fukushi.html shakaijin-benkyou-jikan.html
sharoshi-vs-shindanshi.html sharoshi.html shihoshoshi-futoki.html shihoshoshi-kaishaho.html
shihoshoshi-minpo-bukken.html shihoshoshi-minpo-sosoku.html shihoshoshi-roniten.html
shihoshoshi-start.html shihoshoshi.html shikaku-20dai.html shikaku-30dai.html
shikaku-3months.html shikaku-jinsei-kawaru.html shikaku-women.html shikaku-zasetsu-riyu.html
shukatsu-shikaku.html takken-vs-gyosei.html takken.html tenshoku-shikaku.html toeic-600.html
toeic-730.html toeic-860.html toeic-900.html toeic-vs-eiken.html toroku-hanbai.html
univ-ai-report-hack.html univ-boki-units.html zeirishi-vs-cpa.html
```

文字数不足ではなく、記事固有の判断基準・学習手順・確認手順が読者に再現できるかで候補化した。自動監査の全分類結果は同じディレクトリの出力と進捗表にも記録した。

FP3級・司法書士の単一論点記事は、短いことだけを理由に加筆しない。必要なら次回以降、公式情報の確認手順や設例の使い方を追加するが、既存の薄い記事稟議と重複させない。

### 定型文：63本

対象65本のうち63本に、記事固有の結論ではなく「いいねボタンを押してほしい」「Study Questで学習時間を記録しよう」という締めが確認できた。司法書士6本では、同一の励まし文とStudy Quest誘導がほぼそのまま反復されている。これは既存稟議「薄い26本の広告除去と、定型締め文192本の一括是正」の対象と重なるため、新規起案しない。

### 事実鮮度・更新情報不一致：42件

- 本文の更新日表示欠落：`fp3-realestate.html`、`fp3-tax.html`、`univ-ai-report-hack.html`、`univ-boki-units.html`
- JSON-LD `dateModified` と sitemap `<lastmod>` の不一致：38本

後者はサイト全体126件の既存稟議「更新日3面の単一情報源ルール確立と、不一致126件の是正」に含める。今回、本文更新日とJSON-LDの不一致を新たに確認した記事はない。

### 構造・発見性

- `ARTICLES` 登録：65/65本
- `index.html` 掲載：53/65本。**12本が未掲載**
- `app.html` への静的リンク：64/65本。`toeic-900.html` が欠落
- 代表カテゴリハブへの静的リンク：64/65本。`toeic-900.html` が欠落
- `index.html` 未掲載12本は、既存の台帳整備後にも残るため、新規稟議化した

「まとめ」の後ろに本編が残る問題は、既存稟議「記事構造の技術的是正」で扱ったFP3級3記事の修正後状態を確認し、今回新たな章順稟議は起こさない。

### 定型的な強調表現

「無敵」「最強」「確実に合格」などは31本で候補語を検出した。ただし、試験戦略の比喩と成果保証が混在しており、今回の機械検出だけでは全件を事実誤りと断定できない。既存の定型締め・保証表現是正の稟議に統合し、次回は「読者の結果を保証している文」だけを分離して確認する。

## 4. 公式一次情報との照合

### インボイス

`invoice-2wari-3wari-tokurei.html` の主な記載は、国税庁の令和8年度税制改正特集と一致する。

- 2割特例：令和8年9月30日が属する課税期間まで
- 3割特例：個人事業者の令和9年分・令和10年分、法人は対象外
- 仕入税額控除の経過措置：2026年10月から70%、2028年10月から50%、2030年10月から30%、2031年10月以降0%
- 一のインボイス発行事業者以外からの課税仕入れの年間上限：1億円

出典：[国税庁 令和8年度税制改正特集](https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice-review/index.htm)

### FP3級

日本FP協会の現行試験要綱は、3級を原則CBT、学科90分・60問・36点以上、実技60分・20問・60点以上としている。今回対象のFP3級記事群に、これと矛盾する重大な記載は確認しなかった。

出典：[日本FP協会 2級・3級FP技能検定 試験要綱](https://www.jafp.or.jp/exam/outline/3fp.shtml)

### IELTS・TOEFL

`ielts.html` は2026年半ば以降の紙試験終了と市場ごとの差を反映済み。IELTS公式は紙ベース試験を段階的に終了し、選択市場ではWriting on Paperを提供すると説明している。`toefl.html` も2026年1月21日以降の1〜6尺度と移行期間の0〜120相当表示を反映済み。

出典：[IELTS test delivery updates](https://ielts.org/news-and-insights/updates-to-ielts-test-delivery)、[ETS TOEFL iBT test content and structure](https://www.ets.org/toefl/test-takers/ibt/about/content.html.html)

### 証券外務員

`gaibuin.html` は前回の是正後、一種440点・308点以上、二種300点・210点以上の区分を反映している。料金・実施条件は変動するため、公式申込先へ戻れる導線を維持する。

出典：[日本証券業協会 外務員資格試験](https://www.jsda.or.jp/gaimuin/shiken.html)

## 5. 既存稟議との対応

| 今回の発見 | 扱い |
|---|---|
| 定型締め文63本 | 既存「薄い26本の広告除去と、定型締め文192本の一括是正」へ統合 |
| 更新日表示欠落4本・sitemap不一致38本 | 既存「更新日3面の単一情報源ルール確立と、不一致126件の是正」へ統合 |
| FP3級のまとめ位置 | 既存「記事構造の技術的是正」実行結果を確認。新規起案なし |
| 重大な制度事実誤り | 0件。新規起案なし |
| index未掲載12本・`toeic-900`の静的出口欠落 | **新規稟議を起案** |

## 6. 次回ローテーション候補

今回で既存の1巡目ローテーションは、ルート直下のArticle約203本のうち200本まで確認した。次回は先頭へ戻り、次の順で開始する。

1. `ai-shiwake-kikikata.html`
2. `ap.html`
3. `boki-vs-fp.html`
4. `boki-zero-01.html`
5. `boki-zero-02.html`
6. `boki-zero-03.html`
7. `boki-zero-04.html`
8. `boki-zero-05.html`
9. `boki.html`
10. `boki1-11month-strategy.html`

次回は、今回の未解決候補のうち承認・実行されていないものを再検出しないよう、既存稟議のステータス確認を先に行う。特に独自判断メモの導入後、読者の回遊と学習診断クリックが増えたかをGSC・GA4で確認する。

## 7. CEO所見

65本を読んで分かったのは、Study Questの問題が「記事が短い」ことではないということだ。単一論点の記事には、狭いからこそ必要な価値がある。問題は、入口から見えない記事、同じ締め文で読者の次の行動を奪う記事、更新日が三面で揃っていない記事が混ざっていることだ。

今回、制度の間違いを0件と報告できたのは良い。しかし、正しい記事が見つからなければ価値は発生しない。次にやるべきは量産ではなく、12本を読者の前に出し、定型の締めを学習行動へ置き換えることだ。

**それはユーザーの人生を本当に変えるか。** まず、読者が記事に到達できる状態を作る。そこから先に、固有の判断と学習手順を磨く。

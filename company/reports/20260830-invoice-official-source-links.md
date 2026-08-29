# インボイス特例記事の一次情報リンク整備

**実施日：** 2026年8月30日
**承認：** 取締役が「全部やってみよう」として実施を承認
**対象：** `invoice-2wari-3wari-tokurei.html`

## 実施内容

- 2割特例の終了時期、3割特例の対象・適用年分、7・5・3割控除の経過措置、FAQの直後に読者可視の国税庁一次情報リンクを追加した。
- FAQ本文・FAQPage JSON-LDの制度説明を、国税庁の現行案内と再照合した。
- `dateModified`、本文表示更新日、`sitemap.xml` の`lastmod`を2026-08-30へ同期した。

## 根拠

- [国税庁「2割特例 特設ページ」](https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_2tokurei.htm)を2026年8月30日に実際に確認。2割特例は令和8年9月30日が属する課税期間まで適用できる。
- [国税庁「令和8年度 税制改正特集」](https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice-review/index.htm)を同日に実際に確認。3割特例は対象個人事業者の令和9年分・令和10年分の申告に適用され、7・5・3割控除の時系列も掲載されている。

## 検証

- ArticleとFAQPageのJSON-LDを構文解析する。
- 日付3面、本文の読者可視リンク、リンク先URLを確認する。

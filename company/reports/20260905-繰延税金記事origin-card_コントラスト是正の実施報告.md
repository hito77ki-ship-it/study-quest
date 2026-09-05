# 繰延税金記事のorigin-card：文字コントラスト是正の実施報告

**実施日：2026年9月5日**
**対応稟議：** [アクセシビリティ是正：繰延税金記事のorigin-card文字コントラスト](../decisions/20260905-アクセシビリティ是正_繰延税金記事origin-cardの文字コントラスト.md)

## 実施内容

- `boki2-kurinobe-shisan-vs-fusai.html` の負債カードにある科目説明の文字色を `#DC2626` から `#B91C1C` へ変更した。
- 同じカードですでに使われている赤系へそろえ、背景・境界線・レイアウト・本文は変更していない。
- Article JSON-LDの `dateModified`、画面表示の更新日、`sitemap.xml` の対象URLの `lastmod` を `2026-09-05` に同期した。

## 検証結果

| 検証 | 結果 |
|---|---|
| 文字色と背景色のコントラスト計算 | pass（`#B91C1C` on `#FEF2F2` = 5.91:1、AA基準4.5:1以上） |
| 対象CSSの解決済み色 | pass（PCレンダリングで `rgb(185, 28, 28)` を確認） |
| Article JSON-LD、画面表示、`sitemap.xml` の更新日同期 | pass（すべて `2026-09-05`） |
| `git diff --check` | pass |
| `node scripts/audits/run-content-quality-gate.mjs --strict --no-write --paths boki2-kurinobe-shisan-vs-fusai.html` | pass（Structural 0 / links 0 / dates 0 / themeCandidates 0 / metricCandidates 0） |
| `node scripts/audits/run-adsense-policy-gate.mjs --strict --no-write` | pass（Blockers 0） |
| `node scripts/audits/run-media-audits.mjs --mode internal-links --no-write` | pass |
| ローカル表示確認 | pass（PC・390px幅で横スクロールなし、PCのconsole error 0） |

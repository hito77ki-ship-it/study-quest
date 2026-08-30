# adsense-cta-batch事実是正3件のmain照合

**実施日：** 2026年08月30日
**対象：** `origin/codex/adsense-cta-batch` の事実是正3件
**結論：** 2件は現行 `main` で正しく反映済み。社債の発行側・保有側の区別1件を即時是正し、ブランチは再適用しない。

## 照合結果

| 記事 | 確認項目 | 現行mainの状態 | 根拠 |
|---|---|---|---|
| `boki2-junshisan.html` | 純資産4区分と自己株式の扱い | 4区分を明記し、自己株式を株主資本からの控除として記載済み | [e-Gov・会社計算規則第76条](https://laws.e-gov.go.jp/law/418M60000010013?occasion_date=20260301) |
| `boki2-hyojun-genka.html` | 標準原価と実際原価の差異 | `100,000 − 108,000 = △8,000円` と不利差異を記載済み。`△` は負数の会計表示 | 算術および本文の説明の整合を確認 |
| `boki1-shasai-teigaku-vs-risokuho.html` | 発行側社債が簿記1級の論点か | 発行側の定額法・利息法を1級、2級の満期保有目的債券などを保有側として明記するよう是正 | [日本商工会議所・適用年度案内](https://www.kentei.ne.jp/bookkeeping/35697-2/2022-2026)、[出題区分表PDF](https://www.kentei.ne.jp/wp/wp-content/uploads/2021/03/2021_shokai1-3.pdf) |

## ブランチの扱い

- 照合対象ブランチ：`origin/codex/adsense-cta-batch`（`4167639`）
- 照合時点の現行 `main`：`863b64a`
- 対象ブランチには `main` に未反映の9コミットがあり、事実是正以外の変更も含む。
- 2件は現行 `main` で正しく、残る1件はこのPRで必要箇所だけ是正したため、ブランチ全体の統合や個別コミットの再適用は不要と判断した。

## 検証

- 各記事の現行本文を検索し、上表の記述を確認
- 会社計算規則および日本商工会議所の一次情報ページ・PDFを実際に開いて確認
- `boki1-shasai-teigaku-vs-risokuho.html` のJSON-LD・本文表示・sitemap.xmlの更新日を2026-08-30へ同期

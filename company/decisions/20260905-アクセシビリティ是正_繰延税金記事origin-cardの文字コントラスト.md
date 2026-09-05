# アクセシビリティ是正：繰延税金記事のorigin-card文字コントラスト

**ステータス：実行済み（事実誤りの是正）**
**決定日：2026年9月5日**

本稟議の指摘は **1件**。対象は `boki2-kurinobe-shisan-vs-fusai.html` の `.origin-card.fusai .origin-kamoku` であり、今回確認した `origin-card` 11記事すべての再設計ではない。

## 確認結果と対応

| 対象 | 修正前 | 背景 | 修正前の比 | 対応後 | 対応後の比 |
|---|---|---|---:|---|---:|
| `.origin-card.fusai .origin-kamoku` | `#DC2626` | `#FEF2F2` | 4.41:1 | `#B91C1C` | 5.91:1 |

13px・boldの本文相当テキストには4.5:1以上が必要であり、修正前は0.09不足していた。対応後の `#B91C1C` は同じ負債カードの `.origin-name` と `.origin-badge` で既に使われている色であるため、新しい色を増やさずカード内の赤系を統一できる。

## 実行範囲

- 対象CSSの文字色1箇所
- `boki2-kurinobe-shisan-vs-fusai.html` のArticle JSON-LDと表示更新日
- `sitemap.xml` の対象URLの `lastmod`
- 本稟議書と実施報告

カードの背景・枠線・レイアウト・ダークモード設計、他10記事の `.origin-card`、本文・図解・広告は変更しない。デザイン保護憲章を確認し、既存の色を使うアクセシビリティ小修正として扱う。

## 検証

- 色のコントラスト計算（修正前後）
- Article JSON-LD、表示更新日、`sitemap.xml` の `lastmod` 同期
- `git diff --check`
- 対象記事の品質・広告ポリシー・内部リンク監査
- ローカルのPC・モバイル表示確認

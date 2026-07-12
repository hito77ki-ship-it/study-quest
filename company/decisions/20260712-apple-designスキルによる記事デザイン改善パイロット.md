# apple-designスキルによる記事デザイン改善パイロット（boki2-zairyouhi.html）

**日付：** 2026年7月12日
**決定者：** CEO ジョブズ / 取締役
**ステータス：** 承認・実行済み

## 背景

前日導入したapple-designスキル（`emilkowalski/skills`、vercel-labs/skills CLI経由）を、実際の記事ページに適用する最初のパイロット。取締役から`boki2-zairyouhi.html`を対象に、①タイポグラフィ、②押下フィードバック、③backdrop-filterの浮遊感、④prefers-reduced-motion対応の4原則を適用する指示があった。制約はバニラJS/HTML/CSSのみ・レトロRPGの世界観維持・モバイルファースト。

## リサーチ・検証内容

apple-designスキル（WWDC「Designing Fluid Interfaces」等の要約）の原則と現状を照合した。

- 押下フィードバック（`:active`）が記事内に**ゼロ**で、スマホでは実質無反応だった（hoverのみ）
- 見出しに字間指定がなく、スキルの「大きい文字ほどマイナストラッキング」原則に未達
- navの`backdrop-filter`は`blur(10px)`のみで、素材感を出すsaturate併用なし
- reduced-motion対応なし。スキルの原則は「動きは消すが、反応は消さない」

## 実施内容（CSSのみ、JS追加ゼロ）

1. **タイポグラフィ**：h1に`letter-spacing:-0.02em`・`line-height:1.35`、h2に`letter-spacing:-0.01em`。本文の`line-height:1.9`は日本語本文として適正なので不変更
2. **押下フィードバック**：`.nav-cta`・`.app-cta a`に`:active{scale(.96)}`、FAQ`summary`に背景色フィードバック、関連記事カード（`rel-card`クラス新設）に`scale(.98)`。すべて`transition:100ms ease-out`で即時反応
3. **浮遊感**：navを`blur(20px) saturate(180%)`＋`rgba(255,255,255,.72)`に強化（-webkit-プレフィックス併記）
4. **アクセシビリティ**：`prefers-reduced-motion:reduce`でscale変形を無効化し`opacity:.75`の押下フィードバックに置換。`prefers-reduced-transparency:reduce`でnavを不透明白にフォールバック

## ジョブズの所見

7/11にapp.html・article-widgets.jsへ適用した軽量原則の、個別記事テンプレートへの展開第1弾。今回も「CSSのみ・ライブラリゼロ」の制約を守っており、ページ速度（SEO）への悪影響はない。reduced-transparency対応はスキルを読んで初めて追加した観点で、単なる見た目でなくアクセシビリティの底上げにもなった。モバイル390px幅でレンダリング確認済み、レイアウト崩れなし。

このパイロットの型（4原則セット）が良好なら、他の記事テンプレートにも同じパターンを展開できる。ただし約200記事への一括展開は変更量が大きいため、展開する場合は別途稟議とする。

## 影響

- `boki2-zairyouhi.html`のみ（埋め込みCSSと関連記事カードへのclass付与）
- 本文・図解・構成・配色・RPG要素は不変更

## フォローアップ

- [x] 実装・モバイルレンダリング確認・hooks/JSON-LDチェック
- [x] 実機での触感確認（取締役、2026-07-12「結構いい」と好評価）
- [x] **パイロット2本目（2026-07-12追記）**：新テンプレート型の`daigakusei-nenkin.html`にも同じ4原則を適用。テンプレート差分は「関連記事がカード型でなくテキストリンクのためrel-card処理は不要」「既存transitionにopacityがあるため`transform`を追記合成」の2点のみで、型はそのまま流用できると確認
- [ ] 全記事への横展開はPythonスクリプトで一括適用する方針（Fableでの型決めは完了、実行はSonnetで監督）。実行前に別途稟議

## 展開時のコスト方針（2026-07-12追記）

取締役から「Fableでの全記事適用は消費が大きすぎる（3ヶ月かかりそう）」との指摘があり、以下で合意：型決め（デザイン判断）はFableで2本のパイロットとして完了済み。約190記事への横展開は、モデルによる1ファイルずつの編集ではなく**Pythonスクリプトの一括適用＋既存hooksでの検証＋サンプル記事のスクリーンショット確認**で行う。監督はSonnetで十分。これにより想定期間は3ヶ月→1〜2日に短縮。

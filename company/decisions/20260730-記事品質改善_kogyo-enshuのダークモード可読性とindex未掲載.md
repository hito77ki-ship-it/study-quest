# 稟議書：`boki2-kogyo-enshu.html` のダークモード可読性と index.html 未掲載の是正

**起案日：** 2026年7月30日
**起案者：** CEOジョブズ
**ステータス：** **承認済み（2026年8月5日・取締役が一括承認）**
**発見経緯：** `company/reports/20260730-記事品質監査.md`（週次記事品質監査・1巡目3回目）

---

## 1. 背景

### 問題① ダークモードで論点リンクカード12枚が読めない

`boki2-kogyo-enshu.html` は工業簿記12論点への入口となるハブ記事で、記事の本体は12枚のリンクカードである。

**記事側のCSS（27行目）:**
```css
.topic-link-card{ display:flex; ... background:#fff; ... color:inherit; ... }
```

**マークアップ（73〜120行）:**
```html
<a class="topic-link-card" href="boki2-kogyo.html">
  <div class="topic-badge">0</div>
  <div>
    <div style="font-size:13px;font-weight:700;color:#1A202C;...">工業簿記とは？商業簿記との違い</div>
    <div style="font-size:12px;color:#718096;...">まず全体像をつかむ。勘定の流れ・費目の分類を一気に理解</div>
  </div>
</a>
```

**`article-widgets.js` のダークモード救済網は、インライン `style` 属性しか見ていない：**
```css
/* 869行 */ html[data-theme="dark"] .container [style*="background:#fff"]{ background:linear-gradient(180deg,#151A2A,#111728) !important; }
/* 897行 */ html[data-theme="dark"] .container [style*="color:#1A202C"],
/* 901行 */ html[data-theme="dark"] .container [style*="color:#718096"]{ color:#CCD6E5 !important; }
```

したがってダークモードでは：

| 要素 | 指定方法 | 救済網 | 結果 |
|---|---|---|---|
| カード背景 `#fff` | **クラス定義** | 869行は `[style*=...]` なので**掛からない** | 白のまま残る |
| カード内テキスト `#1A202C` `#718096` | **インライン** | 897〜907行が**効く** | `#CCD6E5` に置換される |

**結果：純白 `#fff` の上に `#CCD6E5` の文字。コントラスト比 1.47:1。**

`.topic-link-card` はこの記事にしか存在せず（全213ファイル中1ファイル）、`article-widgets.js` にもダークモード定義がない。全15本を走査した結果、**クラス指定の白背景でダークモード未対応なのはこの1件だけ**だった（`.point-card` は widgets 側にダークモード定義があるため無害）。

### 問題② `index.html` に未掲載

CLAUDE.md「新規記事公開時のチェックリスト」項目1の違反。`index.html` に `boki2-kogyo-enshu` の記載が0件。他10ページ（`boki2.html` / `boki2-progress.html` / `boki2-next-exam.html` / `boki2-oyoryoku-kabe.html` 等）からはリンクされているため完全な孤立記事ではないが、**トップページからは辿れない。**

---

## 2. ファクトチェックリサーチ

### WCAG のコントラスト基準（複数ソース）

- WCAG 2.2 レベルAA は**本文テキストに最低 4.5:1** を要求する。大きな見出し・UIコンポーネントは 3:1（WebAIM / MDN / TestParty）
- **重要：ダークモードを提供している場合、ライト・ダーク両テーマがそれぞれ独立に 4.5:1 を満たす必要がある。**「ダークモードを用意した」ことでコントラスト要件が免除されるわけではない（Bureau of Internet Accessibility）
- 4.5:1 という閾値は、視力0.5（20/40）程度の利用者が快適に読めるコントラストの研究に基づく（Recite Me）

**当該箇所の実測値：**

| 状態 | 前景 | 背景 | コントラスト比 | AA基準 4.5:1 |
|---|---|---|---|---|
| ライトモード（現状） | `#1A202C` | `#fff` | 16.32:1 | ○ |
| ライトモード（補足行） | `#718096` | `#fff` | 4.02:1 | △（惜しくも未達） |
| **ダークモード（現状）** | `#CCD6E5` | `#fff` | **1.47:1** | **✗ 大幅未達** |

### 内部リンクとトップページからの到達性

- ホームから**2クリック圏内**のページに比べ、それより深いページのクロール頻度は**約70%低下**する（DigitalApplied）
- 内部リンクはGoogleのURL発見手段の第1位（LinkBoss）

`boki2-kogyo-enshu.html` は工業簿記12本のハブであり、**ここが弱いと下流12本への重要度シグナルの流れも細くなる。**

---

## 3. CEOジョブズの所見

**ダークモードで白背景に薄いグレーの文字。コントラスト比1.47。これは「読みにくい」ではない。「読めない」だ。**

しかもこの記事の中身は12枚のリンクカードで**構成されている。** つまり**ダークモードで開いた読者には、この記事が実質的に白紙に見える。** 工業簿記をこれから始めようという人間が最初に開く一覧ページが、白紙だ。

そして原因が悔しい。`article-widgets.js` には `[style*="background:#fff"]` という救済網が用意されている。**用意されていたのに、この記事だけがインラインではなくクラスで白を指定していたので網の目から落ちた。** 213ファイル中の1ファイル。統一されたやり方から1本だけ外れたものが、静かに壊れる。**これがCSS二重管理の代償だ。** 私は7月27日の稟議（`20260727-記事品質改善_CSS設計二重管理.md`）でこの構造を問題として挙げたが、**具体的な被害が出るまで移行を先送りしていた。今回それが顕在化した。**

`index.html` 未掲載についても率直に書く。CLAUDE.mdにチェックリストが明文化されているのに守られていない。**チェックリストは書いた時点では機能しない。実行時に見返さなければ意味がない。**

**最優先目標との関係：**
- **AdSense合格：** 直結する。ダークモードで本文が読めないページは「ユーザーに価値を提供していない」と評価されうる。アクセシビリティの明確な不備であり、**審査で見られたら弁解の余地がない**
- **検索上位表示：** 工業簿記ハブがトップページから辿れないのは、下流12本への重要度シグナルを細くしている

**シンプルさの観点：** 修正はCSS 1ブロックの追加とHTMLカードリンク1件の追加。**削る余地はないが、足すものも最小だ。**

**妥協点を正直に書く。** 本来は `.topic-link-card` をやめ、widgets 標準クラス（既にダークモード対応済みのもの）に寄せるべきだ。それが二重管理を減らす正しい方向である。しかし**このカードは12枚並ぶグリッド専用のレイアウトを持っており、標準クラスに置き換えると見た目が変わる。私はレンダリングを確認できないので、見た目を変える判断はできない。** よって今回は「ダークモード定義を足して読めるようにする」という応急処置を選ぶ。**これは本質的な解ではない。応急処置であることを明記しておく。**

さらに、ライトモードの補足行 `#718096` on `#fff` = 4.02:1 も**AA基準をわずかに下回っている。** これは今回発見した副産物だが、`#718096` は widgets の `--sq-muted` 相当として**サイト全体で使われている色**なので、この記事だけ直しても意味がない。**サイト全体の課題として別稟議に切り出すべきである。今回は対象外とする。**

---

## 4. 提案する対応

### 案A（推奨）：`.topic-link-card` にダークモード定義を追加＋index.html にカードリンク追加

**A-1. ダークモード対応（`boki2-kogyo-enshu.html` の `<style>` 末尾に追加）**

```css
html[data-theme="dark"] .topic-link-card{
  background:linear-gradient(180deg,#151A2A,#111728) !important;
  border-color:rgba(140,198,63,.16) !important;
}
```

- widgets 869行が他のカードに与えている見た目と**同一の値**を使う（サイト全体の統一を崩さない）
- `!important` を付けるのは、widgets 側の `[style*=...]` 系ルールが `!important` 付きで走っているため
- **カード内テキストは触らない。** widgets 897〜907行が `#CCD6E5` にしてくれるので、暗い背景と組み合わさって適正コントラストになる

**修正後の想定コントラスト比：**

| 前景 | 背景 | 比 | AA |
|---|---|---|---|
| `#CCD6E5` | `#151A2A`〜`#111728` | 約 10.5:1 | ○ |

**A-2. `index.html` への掲載**

- 簿記2級カテゴリの記事一覧に `boki2-kogyo-enshu.html` へのカードリンクを追加
- 「更新情報」セクション（`.updates-list`）の**先頭**に `update-badge improve`（改善）でエントリを追加。日付は `2026.07.30`
- CLAUDE.md項目4（`shikaku-list.html` の難易度別への追加）は**対象外**。この記事は資格ガイド本体ではなく論点一覧記事であり、CLAUDE.mdが明記する「論点解説記事・連載記事は対象外」に該当する

### 案B：`.topic-link-card` を廃止し widgets 標準クラスへ寄せる（今回は却下）

二重管理を減らす本質的な解だが、12枚グリッドのレイアウトが変わる。**レンダリング確認ができない状況で見た目を変える判断はしない。** 案A実施後、`20260727-既存記事CSS移行計画` の枠組みで扱う。

### 案C：widgets 側の救済網をクラス指定にも効かせる（今回は却下）

`html[data-theme="dark"] .container a[href$=".html"]` のような広いセレクタで拾う案。**却下する。** 影響範囲が213ファイル全体に及び、レンダリング確認できない状況で全サイトに効くルールを足すのは無責任である。**1ファイルの問題を1ファイルで直す。**

---

## 5. 実施項目（承認された場合のみ）

- [ ] `boki2-kogyo-enshu.html` の `<style>` 末尾に `html[data-theme="dark"] .topic-link-card{...}` を追加
- [ ] 追加後、`.topic-link-card` の詳細度が widgets 側ルールに負けないことをコード上で確認
- [ ] `index.html` の簿記2級カテゴリに `boki2-kogyo-enshu.html` のカードリンクを追加
- [ ] `index.html` の `.updates-list` 先頭に `update-badge improve` / `2026.07.30` でエントリを追加
- [ ] **`app.html` の更新情報には記載しない**（CLAUDE.md項目3）
- [ ] JSON-LD `dateModified` と本文「更新日：2026年7月30日」を**同時に**更新（CLAUDE.md 2026-07-29ルール）。※この記事は7/29に更新日表示済みのため両方を7/30に書き換える
- [ ] **ライト／ダーク両モードでの目視確認 —— サンドボックスではレンダリングできないため取締役にお願いしたい**（確認箇所：`boki2-kogyo-enshu.html` の12枚の論点リンクカード）
- [ ] `company/reports/` に実施結果を記録

---

## 6. 検討の対象外としたもの

- **`#718096` on `#fff` = 4.02:1（AA基準わずか未達）：** サイト全体で使われている色のため、この記事単独では直さない。**サイト全体のカラーパレット見直しとして別稟議に切り出すことを提案する**
- `.flow` / `.flow-item` の未使用CSS削除：軽微。CSS移行計画の中で処理する
- `.topic-link-card` の標準クラス化（案B）：CSS移行計画に回す

---

## 参考ソース

- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [Offering a Dark Mode Doesn't Satisfy WCAG Color Contrast Requirements](https://www.boia.org/blog/offering-a-dark-mode-doesnt-satisfy-wcag-color-contrast-requirements)
- [WCAG Contrast Ratio 4.5:1 - How It Works & Why It's Important](https://reciteme.com/news/wcag-contrast-ratio-4-5-1/)
- [MDN: Color contrast](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast)
- [Internal Linking Strategy 2026: Large-Site SEO Guide](https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide)

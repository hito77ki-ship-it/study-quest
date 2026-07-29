# `.journal` / `.sq-chat` ローカルCSS整理の結果（2026年7月29日）

## 実施内容

| 対象 | ファイル数 | 処理 |
|---|---|---|
| `.sq-chat*` のローカル定義 | 14 | **全削除** |
| `.journal` 系のローカル定義 | 15 | **色指定のみ削除・レイアウトは保持** |

---

## 取締役への訂正：私の説明が間違っていた

直前の報告で私はこう書いた。

> 共通CSSに`!important`付きで上書きされていて、記事側の定義は完全な死にコードです。**消しても見た目は1ピクセルも変わりません。**

**`.journal` については誤りだった。** 実際に `article-widgets.js` を読むと、widgets が上書きしているのは色だけである。

```css
/* widgets 側 */
html[data-theme="light"] .journal{
  background:#F8FAFC !important;
  border:1px solid rgba(26,32,44,.10) !important;
  color:#1F2937 !important;
}
```

```css
/* 記事側（削除前） */
.journal{background:#111827;color:#E5E7EB;
         border-radius:10px;padding:16px 20px;margin:20px 0;font-size:13px;overflow:auto}
```

`border-radius` `padding` `margin` `font-size` `overflow` は **widgets 側に存在しない。** 宣言どおり丸ごと削除していたら、角丸も余白もスクロールも消え、レイアウトが崩れていた。

**これは今日3回目の「稟議の主張を検証せずに実行しかけた」ケースである。** 1回目は `.related-*`（widgets が dark のみ提供、light が無かった）、2回目は孤立画像（動的生成パスを見落とし）、そして今回。いずれも**「共通CSSがあるから記事側は不要」という思い込み**が原因で、パターンが完全に同じだ。

---

## 危うかった2点目：`border-bottom`

`.journal td{border-bottom:1px solid #374151;color:#E5E7EB}` を削除したが、widgets 側にあるのは

```css
html[data-theme="light"] .journal td{border-bottom-color:rgba(26,32,44,.08) !important;}
```

**`border-bottom-color` だけで、幅と線種の指定が無い。** これだけでは罫線が描画されない。

対象15ファイルすべてに汎用の `td{padding:10px 12px;border-bottom:1px solid var(--border)}` が存在することを確認したうえで削除した。`.journal td` は汎用ルールから幅・線種を受け取り、widgets が色を上書きする構造になるため問題ない。**確認せずに消していたら、15記事の表から罫線が消えていた。**

---

## `.sq-chat` は削除して問題なかった

こちらは widgets 側が同一プロパティを**すべて**提供している（`margin` `display` `flex-direction` `gap` ほか）。widgets の CSS は `document.head.appendChild` で実行時に注入されるため、記事のインライン `<style>` より後に来る。同一詳細度なら後勝ちなので、記事側は確実に無効化されている。

加えて、チャットUI自体が widgets による**実行時生成**である（HTMLには `<div class="sq-chat"></div>` という空要素しかない）。widgets が読めなければチャットは存在しないので、ローカルCSSがフォールバックとして機能する余地もない。**完全な死にコードで間違いなかった。**

---

## 検証

- 変更29ファイルすべてで `<style>` 内の波括弧balance一致、空ルール・空宣言・二重セミコロンともに0件
- `.journal` のレイアウト保持を実物で確認（例：`boki2-lease.html` → `border-radius:10px;padding:16px 20px;margin:20px 0;font-size:13px;overflow:auto` が残存、`@media(max-width:640px)` 内の `.journal{padding:12px}` も保持）

---

## CEO所見

**やったことは正しいが、説明の仕方が間違っていた。** 「1ピクセルも変わらない」と断言して着手し、検証したら半分は変わる話だった。取締役はその説明を前提に「やって」と判断したわけで、こちらの説明が雑だと判断材料そのものが汚染される。

同じ思い込みで3回連続でつまずいている。**「共通CSSがあるから記事側は不要」は、プロパティ単位で照合するまで仮説にすぎない。** クラス名が一致していることと、宣言が網羅されていることは別の話だ。今後この種の削除は、**削除対象の全プロパティが上書き元に存在するか**を機械的に突き合わせてから実行する。

---
name: verify
description: app.html（バニラJS単一ファイル、localStorage永続化のRPG学習アプリ）の変更をPlaywrightで実機検証する手順。app.htmlに変更を加えたら、コミット前に必ずこれで実際にブラウザ操作して確認する。
---

# Study Quest app.html の実機検証手順

app.htmlはコードレビューだけでは検出できない配線漏れが起きやすい（例：2026-07-14、通知バナーのHTML/CSSは追加したがトリガー関数`checkNotifBanner()`の呼び出しを`quickRecord()`に入れ忘れ、Playwright実行で発覚）。**変更後は必ずここに書く手順でブラウザ操作して確認すること。** コードを読んだだけで「動くはず」と判断しない。

## セットアップ

```bash
# 1. ローカルサーバー起動（リポジトリルートで）
python3 -m http.server 8934 &

# 2. Playwrightが未インストールならnpm権限問題を避けて一時ディレクトリにインストール
mkdir -p /tmp/sq-verify && cd /tmp/sq-verify
npm init -y >/dev/null 2>&1
npm_config_cache=/tmp/sq-verify/npmcache npm install playwright --no-audit --no-fund
npm_config_cache=/tmp/sq-verify/npmcache npx playwright install chromium
```

## ダッシュボードまで到達する定型フロー

app.htmlは「ウェルカムカルーセル→ゲストログイン→初回チュートリアル(TUT_STEPS)→通知オンボーディングモーダル」を経てダッシュボード(`#screen-dash`)に到達する。Playwrightスクリプトでは毎回この一連の関門を突破する必要がある：

```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();

// headless ChromiumはNotification.permissionが最初からdeniedになりがちなので、
// 「未確認(default)」状態を再現したい場合は明示的に上書きする
await page.addInitScript(() => {
  Object.defineProperty(window.Notification, 'permission', { get: () => 'default', configurable: true });
});

await page.goto('http://localhost:8934/app.html', { waitUntil: 'load' });
await page.waitForTimeout(1200);

// ウェルカムカルーセル「はじめましょう」→ゲストボタン
for (let i = 0; i < 6; i++) {
  const guestBtn = page.locator('.guest-btn');
  if (await guestBtn.count() > 0 && await guestBtn.isVisible()) { await guestBtn.click(); await page.waitForTimeout(1200); break; }
  const nextBtn = page.locator('button:has-text("はじめましょう")');
  if (await nextBtn.count() > 0 && await nextBtn.first().isVisible()) { await nextBtn.first().click(); await page.waitForTimeout(500); } else { break; }
}

// 初回チュートリアル(TUT_STEPS)をスキップ
const skipBtn = page.locator('.tut-btn-skip');
if (await skipBtn.count() > 0 && await skipBtn.isVisible()) { await skipBtn.click(); await page.waitForTimeout(400); }

// 通知オンボーディングモーダル(#notifOnboardCard)を閉じる
// ここを忘れると#notifOnboardDim（全画面オーバーレイ）が残ってクリックを横取りする
const notifSkipBtn = page.locator('#notifOnboardCard button:has-text("あとで設定する")');
if (await notifSkipBtn.count() > 0 && await notifSkipBtn.isVisible()) { await notifSkipBtn.click(); await page.waitForTimeout(400); }
```

## 科目選択などの前提条件はJS状態に直接注入してよい

「検証したい機能」の前提条件（資格・科目選択、セッション記録など）をUI操作でゼロから組み立てると科目選択フローだけで時間を消費する。**検証対象そのものでない前提条件は`page.evaluate()`でアプリのグローバル変数に直接書き込み、`renderAll()`で再描画すればよい**（localStorageへの反映も忘れずに）：

```js
await page.evaluate(() => {
  selectedJobIds = ['cpa'];
  selectedSubjectKeys = ['fin_calc'];
  localStorage.setItem('sq2_jobs', JSON.stringify(selectedJobIds));
  localStorage.setItem('sq2_subjects', JSON.stringify(selectedSubjectKeys));
  renderAll();
});
```

`showScreen('screen-dash')`（`'screen-dashboard'`ではない。IDを間違えると`.screen.active`が消えて画面が真っ白になる）や`switchTab('status')`も同様にevaluateで呼べる。

## ダーク/ライトモード切り替え

記事ページ（eiken.html等、article-widgets.js使用）は`[data-theme-mode="dark"]` / `[data-theme-mode="light"]`のボタンをクリックすればテーマが切り替わる：

```js
const darkBtn = page.locator('[data-theme-mode="dark"]');
if (await darkBtn.count() > 0) { await darkBtn.first().click(); await page.waitForTimeout(400); }
```

## クリック横取り（オーバーレイ）のデバッグ

ボタンをクリックしても状態が変わらない場合、`force:true`で押し切る前に何が実際にその座標を覆っているか確認する：

```js
const hitCheck = await locator.evaluate(el => {
  const r = el.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
  return { topId: top?.id, topClass: top?.className, isSame: top === el || el.contains(top) };
});
```

`#notifOnboardDim`や`#tutDim`などの閉じ忘れモーダル背景がよく犯人になる。

## 完了後

```bash
pkill -f "http.server 8934"
```

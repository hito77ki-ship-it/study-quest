# 実施報告：llms.txt にアプリ使い方ガイドを追加

**実施日：** 2026年9月12日
**対象：** `llms.txt`
**対応した稟議：** `company/decisions/20260912-llms_app-guide追加.md`

## 実施内容

`llms.txt` の「アプリ」節に、公開済みの `app-guide.html` を本体より先に追加した。説明文は、資格記事で方針を決めた後に、学習時間と次にやることを記録する使い方に限定した。

`llms.txt` の最終更新日を2026年9月12日に更新した。記事本文・アプリ・sitemap.xml は変更していない。

## 検証

- `test -f app-guide.html`：成功
- `rg -n 'app-guide.html|最終更新: 2026-09-12' llms.txt`：成功
- `git diff --check`：成功

# Codex運用：着手前監査・記録検索・Obsidian受信箱 実装記録

- 実施日: 2026-08-20
- 対応稟議: [Codex運用：着手前監査・記録検索・Obsidian受信箱](../decisions/20260820-Codex運用_着手前監査_記録検索_Obsidian受信箱.md)

## 実装内容

| 項目 | 実装 |
| --- | --- |
| 着手前確認 | `scripts/audits/run-work-preflight.mjs`。Git日付、ブランチ、HEAD、index lock、作業ツリー、必須指示、直近記録をJSONで返す。 |
| 記録検索 | `scripts/audits/search-company-records.mjs`。稟議・レポート253件を実行時に読み込み、種別・本文語で検索する。永続インデックスは作らない。 |
| 指示の肥大化観測 | `scripts/audits/run-instruction-context-audit.mjs`。サイズ、長文の完全重複候補、大きい章を報告するだけで編集しない。 |
| 知識昇格 | `company/templates/knowledge-promotion-check.md` と形式検査CLIを追加した。 |
| Codex作業ブリーフ | `company/templates/codex-task-brief.md` を追加した。目的・境界・検証・実行強度を毎回短く渡せる。 |
| Obsidian受信箱 | 5 SkillsをCodexユーザー領域へ導入し、Git正本を維持する連携規約を追加した。 |

## 検証結果

- 着手前CLIが日付、ブランチ、HEAD、lock、作業ツリー、直近の稟議・レポートを返した。
- 記録検索CLIは `--type decisions --query Codex` で、該当する稟議3件を返した。
- 指示コンテキスト監査は `AGENTS.md` 13,699 bytes、`CLAUDE.md` 23,356 bytes、計37,055 bytesを計測した。完全重複候補は、両ファイルに意図して置かれた評価順1件のみだった。自動変更はしていない。
- 知識昇格テンプレートは必須7節を満たし、形式検査に合格した。
- 知識索引監査は知識Markdown 15件、索引済み15件、索引漏れ・リンク切れ・必須節不足はいずれも0件だった。
- `obsidian-markdown`、`obsidian-bases`、`json-canvas`、`obsidian-cli`、`defuddle` の5 Skillsが `/Users/hitoki/.codex/skills/` に存在することを確認した。
- `git diff --check` に合格した。

## 境界の確認

実装中に既存の作業ツリー差分を検出したが、記事、メトリクス、既存レポート、他の稟議には変更・ステージを行わなかった。今回のCLIは全て読み取り専用であり、Vaultの作成、Obsidian同期設定、既存ノートの移動も行っていない。

## 次回の利用

```bash
node scripts/audits/run-work-preflight.mjs
node scripts/audits/search-company-records.mjs --type decisions --query "sitemap 更新日"
node scripts/audits/run-instruction-context-audit.mjs
node scripts/audits/run-knowledge-promotion-check.mjs company/templates/knowledge-promotion-check.md
```

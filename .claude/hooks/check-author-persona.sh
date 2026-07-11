#!/bin/bash
# PostToolUse hook: Edit/Write で .html を編集した直後に著者ペルソナ表記の整合性をざっくり照合する。
# canonical情報源は about.html：大谷一輝／日商簿記1級勉強中。
# 「大谷」の表記ゆれ（大谷 一輝／大谷一輝／大谷 のみ）は既存の許容パターンなので誤検知しない。
# ブロックはしない（編集は既に完了しているため、あくまで警告）。

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [[ -z "$file_path" || ! "$file_path" =~ \.html$ || ! -f "$file_path" ]]; then
  exit 0
fi

msgs=()

# JSON-LD author.name が「大谷」を含まない場合
while IFS= read -r n; do
  [[ -z "$n" ]] && continue
  if [[ "$n" != *"大谷"* ]]; then
    msgs+=("JSON-LD authorに「大谷」が含まれない: ${n}")
  fi
done < <(grep -o '"author":[^}]*"name": *"[^"]*"' "$file_path" | grep -o '"name": *"[^"]*"')

# 「著者：」を含む行が「大谷」を含まない、または古い「公認会計士受験生」表記を含む場合
while IFS= read -r m; do
  [[ -z "$m" ]] && continue
  if [[ "$m" != *"大谷"* ]]; then
    msgs+=("著者表記に「大谷」が含まれない: ${m}")
  fi
  if [[ "$m" == *"公認会計士受験生"* ]]; then
    msgs+=("著者バイオが古い「公認会計士受験生」表記のまま: ${m}")
  fi
done < <(grep -o '著者：[^<|]*' "$file_path")

# 会話UIのチャット名ラベルに古いバイオが残っている場合
if grep -q 'sq-chat-name">[^<]*公認会計士受験生' "$file_path"; then
  msgs+=("会話UIのsq-chat-nameに古い「公認会計士受験生」表記が残存")
fi

if [[ ${#msgs[@]} -eq 0 ]]; then
  exit 0
fi

joined=$(printf '%s / ' "${msgs[@]}")
context="著者ペルソナ整合性チェック(${file_path##*/}): ${joined}読者向け文脈での意図的な言及の可能性もあるため、念のため確認してください。"

jq -n --arg ctx "$context" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
exit 0

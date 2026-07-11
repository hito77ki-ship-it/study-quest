#!/bin/bash
# PostToolUse hook: Edit/Write で .html を編集した直後に主要タグの開閉数をざっくり照合する。
# 誤検知はあり得るので、あくまで「念のための警告」として additionalContext に流すだけで
# ブロックはしない（編集自体は既に完了しているため）。

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [[ -z "$file_path" || ! "$file_path" =~ \.html$ || ! -f "$file_path" ]]; then
  exit 0
fi

check_tag() {
  local tag="$1"
  local open close
  open=$(grep -o "<${tag}[ >]" "$file_path" | wc -l | tr -d ' ')
  close=$(grep -o "</${tag}>" "$file_path" | wc -l | tr -d ' ')
  echo "$open $close"
}

msgs=()
for tag in div section article; do
  read -r open close <<< "$(check_tag "$tag")"
  if [[ "$open" != "$close" ]]; then
    msgs+=("<${tag}>: open=${open} close=${close}")
  fi
done

if [[ ${#msgs[@]} -eq 0 ]]; then
  exit 0
fi

joined=$(printf '%s / ' "${msgs[@]}")
context="HTMLタグ数チェック(${file_path##*/}): ${joined}開閉数が一致していません。自己終結や文字列内の記述による誤検知の可能性もありますが、念のためgit diffで確認してください。"

jq -n --arg ctx "$context" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
exit 0

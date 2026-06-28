#!/usr/bin/env python3
"""
tweet_generator.py
記事HTMLからX（Twitter）投稿文（140文字・ハッシュタグ付き）を自動生成し
tweets/<filename>.txt に保存する。

使い方:
  python tweet_generator.py itp.html          # 1ファイル処理
  python tweet_generator.py --all             # *.html を一括処理
  python tweet_generator.py --preview itp.html # 保存せず確認
"""

import os
import re
import sys
from pathlib import Path

# ---- 設定 ---------------------------------------------------------------

BASE_URL = "https://hito77ki-ship-it.github.io/study-quest/"

# キーワード → ハッシュタグのマッピング（先に一致したものを使用）
HASHTAG_MAP = [
    (["ITパスポート", "iパス"],          ["#ITパスポート", "#iパス", "#IT資格"]),
    (["基本情報技術者", "基本情報"],      ["#基本情報技術者", "#FE試験", "#IT資格"]),
    (["応用情報技術者", "応用情報"],      ["#応用情報技術者", "#AP試験", "#IT資格"]),
    (["MOS", "オフィス"],               ["#MOS", "#Excel", "#PC資格"]),
    (["簿記1級"],                        ["#簿記1級", "#日商簿記", "#資格勉強"]),
    (["簿記2級"],                        ["#簿記2級", "#日商簿記", "#資格勉強"]),
    (["簿記3級", "簿記"],                ["#簿記3級", "#日商簿記", "#資格勉強"]),
    (["FP3級", "FP3"],                   ["#FP3級", "#ファイナンシャルプランナー", "#資格勉強"]),
    (["FP2級", "FP2", "FP"],            ["#FP2級", "#ファイナンシャルプランナー", "#資格勉強"]),
    (["宅建"],                           ["#宅建", "#宅地建物取引士", "#資格勉強"]),
    (["行政書士"],                       ["#行政書士", "#資格勉強", "#独学"]),
    (["司法書士"],                       ["#司法書士", "#資格勉強", "#独学"]),
    (["社労士", "社会保険労務士"],        ["#社労士", "#社会保険労務士", "#資格勉強"]),
    (["中小企業診断士", "診断士"],        ["#中小企業診断士", "#診断士", "#資格勉強"]),
    (["公認会計士"],                     ["#公認会計士", "#CPA", "#資格勉強"]),
    (["税理士"],                         ["#税理士", "#資格勉強", "#独学"]),
    (["英検"],                           ["#英検", "#実用英語技能検定", "#英語学習"]),
    (["TOEIC"],                          ["#TOEIC", "#英語", "#英語学習"]),
    (["TOEFL", "IELTS"],                 ["#TOEFL", "#英語", "#英語学習"]),
    (["保育士"],                         ["#保育士", "#資格勉強", "#独学"]),
    (["介護福祉士", "介護"],             ["#介護福祉士", "#資格勉強"]),
    (["看護師"],                         ["#看護師", "#資格勉強"]),
    (["社会福祉士"],                     ["#社会福祉士", "#資格勉強"]),
]
DEFAULT_HASHTAGS = ["#資格勉強", "#独学", "#スタディクエスト"]

# ---- HTML パーサー -------------------------------------------------------

def extract_info(html_path: str) -> dict:
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    # タイトル（サイト名を除去）
    m = re.search(r"<title>(.*?)</title>", content, re.DOTALL)
    raw_title = m.group(1).strip() if m else ""
    title = re.sub(r"\s*[｜|]\s*.*$", "", raw_title).strip()

    # meta description
    m = re.search(r'<meta name="description" content="([^"]*)"', content)
    description = m.group(1).strip() if m else ""

    # クイックサマリーカードのラベル・値
    labels = re.findall(r'class="quick-card__label"[^>]*>([^<]+)<', content)
    values = re.findall(r'class="quick-card__value"[^>]*>([^<]+)<', content)

    # canonical URL
    m = re.search(r'<link rel="canonical" href="([^"]*)"', content)
    url = m.group(1).strip() if m else BASE_URL + Path(html_path).name

    return {
        "title": title,
        "description": description,
        "labels": labels,
        "values": values,
        "url": url,
    }

# ---- ハッシュタグ選択 ----------------------------------------------------

def pick_hashtags(title: str, description: str) -> list[str]:
    text = title + description
    for keywords, tags in HASHTAG_MAP:
        if any(kw in text for kw in keywords):
            return tags
    return DEFAULT_HASHTAGS

# ---- ツイート生成 --------------------------------------------------------

def generate_tweet(info: dict) -> str:
    title       = info["title"]
    labels      = info["labels"]
    values      = info["values"]
    url         = info["url"]
    hashtags    = pick_hashtags(title, info["description"])

    hashtag_str = " ".join(hashtags)

    # X(Twitter) の文字数ルール:
    #   日本語1文字 = 1文字、URLは常に23文字換算
    url_len  = 23
    body_max = 140 - url_len - 1 - len(hashtag_str) - 1
    # -1 は URL前の改行、-1 はハッシュタグ前の改行

    # キースタッツ（合格率・勉強時間など）を抽出
    LABEL_JA = {"STUDY TIME": "勉強時間", "PASS RULE": "合格基準", "FIRST MOVE": "最初の一手"}
    stats_parts = []
    for label, value in zip(labels, values):
        ja_label = LABEL_JA.get(label, label)
        if any(kw in ja_label for kw in ["合格率", "勉強時間", "試験回数", "試験日", "合格基準"]):
            stats_parts.append(f"{ja_label}:{value}")
        if len(stats_parts) >= 2:
            break

    stats_str = "・".join(stats_parts)

    # 本文を組み立て
    if stats_str:
        body = f"📚{title}｜{stats_str}"
    else:
        body = f"📚{title}"

    if len(body) > body_max:
        body = body[: body_max - 1] + "…"

    tweet = f"{body}\n{url}\n{hashtag_str}"
    return tweet

# ---- 保存 ----------------------------------------------------------------

def save_tweet(html_path: str, tweet: str, preview: bool = False) -> Path:
    out_dir = Path(html_path).parent / "tweets"
    out_dir.mkdir(exist_ok=True)
    out_file = out_dir / (Path(html_path).stem + ".txt")

    if not preview:
        out_file.write_text(tweet, encoding="utf-8")

    return out_file

# ---- メイン処理 ----------------------------------------------------------

def process(html_path: str, preview: bool = False):
    path = Path(html_path)
    if not path.exists():
        print(f"  [skip] not found: {html_path}")
        return

    info   = extract_info(str(path))
    tweet  = generate_tweet(info)
    out    = save_tweet(str(path), tweet, preview=preview)

    char_count = len(tweet.replace(info["url"], "x" * 23))
    status = "preview" if preview else f"saved → {out.name}"
    print(f"{'👀' if preview else '✓'} {path.name} [{char_count}文字] {status}")
    print("─" * 60)
    print(tweet)
    print("─" * 60)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    preview = "--preview" in args
    args = [a for a in args if a != "--preview"]

    if args[0] == "--all":
        html_files = sorted(Path(".").glob("*.html"))
        for f in html_files:
            process(str(f), preview=preview)
    else:
        for html_path in args:
            process(html_path, preview=preview)


if __name__ == "__main__":
    main()

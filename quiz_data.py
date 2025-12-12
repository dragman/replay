import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

try:
    import regex as regex_module
except ImportError:
    regex_module = None


WORD_RE = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")


def load_messages(chat_path: Path) -> list[dict]:
    with chat_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_dictionary(dict_paths: list[Path]) -> set[str]:
    words: set[str] = set()
    for path in dict_paths:
        if not path.exists():
            continue
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip().lower()
                if line:
                    words.add(line)
    return words


def rounded_thousands(value: int) -> int:
    return int(round(value / 1000.0) * 1000)


def print_rankings(title: str, items: list[tuple[str, int]], value_fmt=str):
    print(f"\n{title}")
    print("-" * len(title))
    if not items:
        print("  (no data)")
        return
    width = max(len(label) for label, _ in items[:10])
    for rank, (label, count) in enumerate(items[:10], start=1):
        print(f"{rank:>2}. {label.ljust(width)}  {value_fmt(count)}")


def is_probable_emoji(char: str) -> bool:
    if not char:
        return False
    codepoint = ord(char)
    category = unicodedata.category(char)
    if category in {"So", "Sk"} and codepoint >= 0x2600:
        return True
    if "EMOJI" in unicodedata.name(char, ""):
        return True
    if category == "So" and any(
        keyword in unicodedata.name(char, "")
        for keyword in ("FACE", "HAND", "CAT", "SMILING", "HEART", "ROCKET")
    ):
        return True
    return False


def iter_emoji_sequences(text: str):
    if not text:
        return
    if regex_module:
        clusters = regex_module.findall(r"\X", text)
        emoji_pattern = regex_module.compile(
            r"""
            (?:
              \p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?
              (?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*  # ZWJ sequences
            )
            """,
            flags=regex_module.VERBOSE,
        )
        for cluster in clusters:
            if emoji_pattern.fullmatch(cluster):
                yield cluster
    else:
        for char in text:
            if is_probable_emoji(char):
                yield char


def main():
    repo_root = Path(__file__).resolve().parent
    messages = load_messages(repo_root / "parsed_chat.json")
    dictionary = load_dictionary(
        [repo_root / "dictionary.txt", repo_root / "dictionary_en.txt"]
    )

    message_counts = Counter()
    emoji_counts = Counter()
    word_counts = Counter()
    unusual_counts = Counter()

    for msg in messages:
        sender = (msg.get("sender") or "Unknown").strip() or "Unknown"
        message_counts[sender] += 1
        text = msg.get("text") or ""

        if text:
            emoji_counts.update(iter_emoji_sequences(text))
            for word in WORD_RE.findall(text):
                lowered = word.lower()
                word_counts[lowered] += 1
                if lowered not in dictionary:
                    unusual_counts[lowered] += 1

    most_messages = message_counts.most_common()
    least_messages = sorted(
        message_counts.items(), key=lambda item: (item[1], item[0])
    )

    print_rankings(
        "Most messages (rounded to nearest 1k shown)",
        most_messages,
        value_fmt=lambda count: f"{count} (~{rounded_thousands(count):,})",
    )
    print_rankings(
        "Fewest messages",
        least_messages,
    )
    print_rankings("Most used emoji", emoji_counts.most_common())
    print_rankings("Most used words", word_counts.most_common())
    print_rankings("Most used non-dictionary words", unusual_counts.most_common())


if __name__ == "__main__":
    main()

import re
import json
import os
import base64
import gzip
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

EXPIRY_ENV_VAR = "CHAT_KEY_EXPIRES"

# Matches: [04/04/2020, 10:54:24] Name: Message text
LINE_RE = re.compile(
    r'^\[([0-9/]+),\s*([0-9:]+)\]\s+([^:]+):\s*(.*)$'
)

# Characters WhatsApp likes to sprinkle in
BIDI_CHARS = dict.fromkeys(map(ord, [
    "\u200e",  # LEFT-TO-RIGHT MARK
    "\u200f",  # RIGHT-TO-LEFT MARK
    "\u202a",  # LEFT-TO-RIGHT EMBEDDING
    "\u202b",  # RIGHT-TO-LEFT EMBEDDING
    "\u202c",  # POP DIRECTIONAL FORMATTING
    "\ufeff",  # ZERO WIDTH NO-BREAK SPACE / BOM
]))

def clean_invisibles(s: str) -> str:
    return s.translate(BIDI_CHARS)

def parse_whatsapp(path):
    messages = []
    current = None

    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.rstrip("\n")

            # Strip invisible formatting chars first
            line_clean = clean_invisibles(line)

            m = LINE_RE.match(line_clean)
            if m:
                # flush previous
                if current:
                    messages.append(current)

                date, time, sender, text = m.groups()
                sender = sender.strip()
                text = text.strip()

                current = {
                    "date": date,
                    "time": time,
                    "sender": sender,
                    "text": text,
                }
            else:
                # continuation line
                if current:
                    current["text"] += "\n" + clean_invisibles(raw.rstrip("\n"))

        if current:
            messages.append(current)

    return messages


def encrypt_messages(messages, output_path="chat_data.enc", expires_on=None):
    json_bytes = json.dumps(messages, ensure_ascii=False).encode("utf-8")
    data = gzip.compress(json_bytes)
    key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    aes = AESGCM(key)
    cipher = aes.encrypt(nonce, data, None)

    payload = {
        "nonce": base64.b64encode(nonce).decode("ascii"),
        "ciphertext": base64.b64encode(cipher).decode("ascii"),
    }
    if expires_on:
        payload["expires"] = expires_on

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f)

    return base64.b32encode(key).decode("ascii")


if __name__ == "__main__":
    input_path = Path("chat.txt")
    if not input_path.exists():
        raise SystemExit("chat.txt not found")

    msgs = parse_whatsapp(input_path)

    with open("parsed_chat.json", "w", encoding="utf-8") as f:
        json.dump(msgs, f, ensure_ascii=False, indent=2)

    expires_on = os.environ.get(EXPIRY_ENV_VAR, "").strip() or None
    if expires_on:
        print(f"Embedding expiry date: {expires_on}")

    key_b32 = encrypt_messages(msgs, "chat_data.enc", expires_on=expires_on)

    print("Wrote parsed_chat.json and chat_data.enc")
    print("Provide the following Base32 key via QR code / URL hash:")
    print(key_b32)

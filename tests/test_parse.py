import base64
import json
import gzip
from pathlib import Path

import pytest

import parse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


TEST_CHAT = """[04/10/2017, 17:19:04] Sex: You created this group
[04/10/2017, 17:21:22] Dragos: Looks like flights are around £100
We are proposing Nov 17-21st.
[05/10/2017, 08:00:00] Mark: Another line
continuation line
"""


def test_parse_whatsapp_handles_multiline(tmp_path: Path):
    chat_path = tmp_path / "chat.txt"
    chat_path.write_text(TEST_CHAT, encoding="utf-8")

    messages = parse.parse_whatsapp(chat_path)

    assert len(messages) == 3
    assert messages[0]["sender"] == "Sex"
    assert messages[1]["text"].endswith("Nov 17-21st.")
    assert "\n" in messages[1]["text"]
    assert messages[2]["text"].endswith("continuation line")


def test_encrypt_messages_writes_gzipped_payload(tmp_path: Path):
    output = tmp_path / "chat_data.enc"
    messages = [
        {"date": "04/10/2017", "time": "10:00:00", "sender": "Dragos", "text": "Hello"}
    ]
    expires = "2099-12-31T23:59:59Z"

    key_b32 = parse.encrypt_messages(messages, output_path=output, expires_on=expires)

    data = json.loads(output.read_text(encoding="utf-8"))
    assert data["expires"] == expires

    key_bytes = base64.b32decode(key_b32)
    nonce = base64.b64decode(data["nonce"])
    ciphertext = base64.b64decode(data["ciphertext"])

    aes = AESGCM(key_bytes)
    plain = aes.decrypt(nonce, ciphertext, None)
    decompressed = gzip.decompress(plain)
    decrypted_messages = json.loads(decompressed.decode("utf-8"))

    assert decrypted_messages == messages

import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import qrcode

KEY_ENV_VAR = "CHAT_REPLAY_KEY"
DATE_ENV_VAR = "CHAT_REPLAY_DATE"
BASE_URL_ENV_VAR = "CHAT_REPLAY_BASE_URL"

base_url = os.environ.get(BASE_URL_ENV_VAR, "https://yourdomain.com/viewer.html")
key = os.environ.get(KEY_ENV_VAR, "").strip()
if not key:
    raise SystemExit(
        f"Missing Base32 key. Set the {KEY_ENV_VAR} environment variable before running this script."
    )

date_filter = os.environ.get(DATE_ENV_VAR, "").strip()

parsed = urlparse(base_url)

query_params = dict(parse_qsl(parsed.query, keep_blank_values=True))
if date_filter:
    query_params["D"] = date_filter
else:
    query_params.pop("D", None)
new_query = urlencode(query_params)

fragment_params = dict(parse_qsl(parsed.fragment, keep_blank_values=True))
fragment_params["K"] = key
new_fragment = urlencode(fragment_params)

final_url = urlunparse(
    (
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        new_fragment,
    )
)

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=10,
    border=4,
)
qr.add_data(final_url)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save("chat_qr.png")

print("Saved QR to chat_qr.png")
print(f"Encoded URL: {final_url}")

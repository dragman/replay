import argparse
import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import qrcode

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    Image = ImageDraw = ImageFont = None

KEY_ENV_VAR = "CHAT_REPLAY_KEY"
DATE_ENV_VAR = "CHAT_REPLAY_DATE"
BASE_URL_ENV_VAR = "CHAT_REPLAY_BASE_URL"
OUTPUT_ENV_VAR = "CHAT_QR_OUTPUT"

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

def parse_args():
    parser = argparse.ArgumentParser(description="Generate QR codes for chat replay.")
    parser.add_argument(
        "-o",
        "--output",
        default=os.environ.get(OUTPUT_ENV_VAR, "chat_qr.png"),
        help="Output image filename (default: %(default)s)",
    )
    parser.add_argument(
        "--box-size",
        type=int,
        default=10,
        help="QR box size (default: %(default)s)",
    )
    parser.add_argument(
        "--border",
        type=int,
        default=4,
        help="QR border size (default: %(default)s)",
    )
    parser.add_argument(
        "--label",
        default=os.environ.get("CHAT_QR_LABEL", ""),
        help="Optional label to display after saving (default: %(default)s)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=args.box_size,
        border=args.border,
    )
    qr.add_data(final_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    if hasattr(img, "convert"):
        img = img.convert("RGB")
    label_text = (args.label or "").strip()

    if label_text and Image and ImageDraw and ImageFont:
        font = ImageFont.load_default()
        measurement_canvas = Image.new("RGB", (1, 1))
        measurement_draw = ImageDraw.Draw(measurement_canvas)
        if hasattr(measurement_draw, "textbbox"):
            bbox = measurement_draw.textbbox((0, 0), label_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width, text_height = measurement_draw.textsize(label_text, font=font)
        padding = 16
        gap = 12
        canvas_width = max(img.width, text_width) + padding * 2
        canvas_height = img.height + text_height + gap + padding * 2
        canvas = Image.new("RGB", (canvas_width, canvas_height), "white")
        img_x = (canvas_width - img.width) // 2
        img_y = padding
        canvas.paste(img, (img_x, img_y))
        draw = ImageDraw.Draw(canvas)
        text_x = (canvas_width - text_width) // 2
        text_y = img_y + img.height + gap
        draw.text((text_x, text_y), label_text, font=font, fill="black")
        img = canvas
    elif label_text:
        print("Label requested but Pillow drawing modules are unavailable; skipping image label.")

    img.save(args.output)

    print(f"Saved QR to {args.output}")
    if args.label:
        print(args.label)
    print(f"Encoded URL: {final_url}")


if __name__ == "__main__":
    main()

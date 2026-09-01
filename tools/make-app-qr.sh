#!/usr/bin/env bash
# Regenerate the footer app QR (images/icons/app-qr.svg).
#
# The QR encodes ONE url — app.html — which reads the user agent and forwards
# to the App Store or Google Play. A QR cannot detect the device itself; the
# split has to happen at the destination, so this url must be live.
#
#   ./tools/make-app-qr.sh                              # default production url
#   ./tools/make-app-qr.sh https://staging.example.com/app.html
#
set -euo pipefail
URL="${1:-https://markelmallakh.github.io/Exception-Orderbase/app.html}"
OUT="images/icons/app-qr.svg"
ENC=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=""))' "$URL")

curl -fsS --max-time 30 -o "$OUT" \
  "https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=0&ecc=M&format=svg&data=$ENC"

# Round-trip the result so a broken or mis-encoded code never ships silently.
curl -fsS --max-time 30 -o /tmp/app-qr-verify.png \
  "https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=0&ecc=M&data=$ENC"
DECODED=$(curl -fsS --max-time 30 -F "file=@/tmp/app-qr-verify.png" \
  "https://api.qrserver.com/v1/read-qr-code/" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["symbol"][0]["data"])')

if [ "$DECODED" = "$URL" ]; then
  echo "OK  $OUT -> $DECODED"
else
  echo "FAIL  encoded '$URL' but decoded '$DECODED'" >&2
  exit 1
fi

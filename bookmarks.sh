#!/usr/bin/env bash
#! bookmarks.sh

set -euo pipefail

INPUT_RELATIVE_PATH="${1:-input/template.yml}"

cat templates/index.tpl > index.html

sed -i "s|__INPUT_PATH__|${INPUT_RELATIVE_PATH}|g" index.html

python3 -m http.server 8000 --bind 127.0.0.1 &
SERVER_PID=$!

trap 'kill $SERVER_PID 2>/dev/null; rm -f index.html' EXIT

flatpak run com.brave.Browser http://127.0.0.1:8000

wait $SERVER_PID

#!/bin/sh
# Reconstruit tout le film : voix (Piper) → hauteur par personnage → événements → mixage → sous-titres → image → assemblage à −14 LUFS
set -e
LIB=/root/lemo-opuscar
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
PY="$LIB/.venv/bin/python"
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
cd "$LIB"
"$PY" "$HERE/tools/tts_piper.py" "$HERE/lines.json" "$HERE/out/raw"   # voix Piper UPMC « Pierre » (fichiers dans .voices/)
"$PY" "$HERE/voice.py"
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/mix.py"
"$PY" "$HERE/srt.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --size 1080x1920 --out "$HERE/out/video.mp4"
sh "$HERE/finish.sh"

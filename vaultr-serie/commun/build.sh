#!/bin/sh
# Fabrique un épisode : sh commun/build.sh <dossier de l'épisode>
#   voix (Piper) → hauteur par personnage → minutage → événements → musique/mixage → sous-titres → image → assemblage −14 LUFS
set -e
EP=$(cd "$1" && pwd); NAME=$(basename "$EP"); HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
PY="$LIB/.venv/bin/python"
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
"$PY" "$HERE/tts.py" "$EP"
"$PY" "$HERE/voice.py" "$EP"
"$PY" "$HERE/plan.py" "$EP"
cd "$LIB"
node core/render/events.mjs "$EP" --size 1080x1920
"$PY" "$HERE/mix.py" "$EP"
"$PY" "$HERE/srt.py" "$EP"
[ "${STILLS:-0}" = 1 ] && exit 0
node core/render/video.mjs "$EP" --fps 24 --workers 3 --size 1080x1920 --out "$EP/out/video.mp4"
J=$(ffmpeg -hide_banner -i "$EP/out/mix.wav" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
v() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -loglevel error -y -i "$EP/out/video.mp4" -i "$EP/out/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -r 24 \
  -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$EP/$NAME.mp4"
POSTER=$("$PY" -c "import json;P=json.load(open('$EP/out/plan.json'));b=[b for b in P['beats'] if b.get('holo')] or P['beats'];print(round((b[0]['t0']+b[0]['t1'])/2,2))")
ffmpeg -loglevel error -y -ss "$POSTER" -i "$EP/$NAME.mp4" -frames:v 1 -q:v 2 "$EP/poster.jpg"
echo "$EP/$NAME.mp4"

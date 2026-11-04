#!/bin/sh
# Assemble image + son à −14 LUFS (mux.sh de la bibliothèque, sans grain : style vectoriel) et tire l'affiche
set -e
LIB=/root/lemo-opuscar
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$LIB"
if ! sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/vaultr-tiktok.mp4" 24 0; then
  echo "mux.sh a échoué (FFmpeg 6) : assemblage manuel en deux passes"
  J=$(ffmpeg -hide_banner -i "$HERE/out/mix.wav" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
  v() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
  ffmpeg -loglevel error -y -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -r 24 \
    -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true" \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$HERE/vaultr-tiktok.mp4"
fi
ffmpeg -loglevel error -y -ss 11.5 -i "$HERE/vaultr-tiktok.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
echo "$HERE/vaultr-tiktok.mp4"

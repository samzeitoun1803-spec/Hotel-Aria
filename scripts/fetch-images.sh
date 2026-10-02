#!/usr/bin/env bash
# Télécharge toutes les photos publiées sur le site officiel hotel-aria.fr
# dans assets/images/_officiel/, pour ensuite les renommer selon les
# emplacements attendus (voir assets/images/README.md).
set -euo pipefail

BASE="https://www.hotel-aria.fr"
PAGES=("/fr/" "/en/" "/fr/chambres/" "/en/rooms/" "/en/hotel-nice-centre/" "/en/contact/")
OUT="$(cd "$(dirname "$0")/.." && pwd)/assets/images/_officiel"
mkdir -p "$OUT"

urls=$(for p in "${PAGES[@]}"; do
  curl -fsSL -A "Mozilla/5.0" "$BASE$p" || true
done | grep -oE '(https?:)?//[^"'"'"' )]+\.(jpe?g|png|webp)|/[^"'"'"' )]+\.(jpe?g|png|webp)' | sort -u)

for u in $urls; do
  case "$u" in
    //*) u="https:$u" ;;
    /*)  u="$BASE$u" ;;
  esac
  name=$(basename "${u%%\?*}")
  echo "↓ $name"
  curl -fsSL -A "Mozilla/5.0" "$u" -o "$OUT/$name" || echo "  échec : $u"
done

echo "Terminé : $(ls "$OUT" | wc -l) fichiers dans $OUT"

#!/usr/bin/env bash
set -euo pipefail

PREFIX="${1:-${PREFIX:-$HOME/.local}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "$ROOT/usr/bin" || ! -d "$ROOT/usr/share" ]]; then
  echo "error: run this script from the extracted release folder" >&2
  exit 1
fi

for dep in gjs; do
  if ! command -v "$dep" >/dev/null; then
    echo "error: missing runtime dependency: $dep" >&2
    echo "install gjs, gtk4, and libadwaita from your distro packages" >&2
    exit 1
  fi
done

mkdir -p "$PREFIX/bin" "$PREFIX/share"
cp -a "$ROOT/usr/bin/." "$PREFIX/bin/"
cp -a "$ROOT/usr/share/." "$PREFIX/share/"

if command -v glib-compile-schemas >/dev/null; then
  glib-compile-schemas "$PREFIX/share/glib-2.0/schemas" 2>/dev/null || true
fi
if command -v gtk4-update-icon-cache >/dev/null; then
  gtk4-update-icon-cache -q -t -f "$PREFIX/share/icons/hicolor" 2>/dev/null || true
fi
if command -v update-desktop-database >/dev/null; then
  update-desktop-database -q "$PREFIX/share/applications" 2>/dev/null || true
fi

echo "Colorman installed to $PREFIX"
echo "Launch: org.gnome.Colorman"

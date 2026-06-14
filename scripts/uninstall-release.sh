#!/usr/bin/env bash
set -euo pipefail

PREFIX="${1:-${PREFIX:-$HOME/.local}}"
APP_ID="org.gnome.Colorman"

run_as_root=()
if [[ "$PREFIX" == /* && "$PREFIX" != "$HOME"* && "$(id -u)" -ne 0 ]]; then
  run_as_root=(sudo)
fi

"${run_as_root[@]}" rm -f "$PREFIX/bin/$APP_ID"
"${run_as_root[@]}" rm -f "$PREFIX/share/applications/$APP_ID.desktop"
"${run_as_root[@]}" rm -f "$PREFIX/share/metainfo/$APP_ID.metainfo.xml"
"${run_as_root[@]}" rm -f "$PREFIX/share/dbus-1/services/$APP_ID.service"
"${run_as_root[@]}" rm -f "$PREFIX/share/glib-2.0/schemas/$APP_ID.gschema.xml"
"${run_as_root[@]}" rm -f "$PREFIX/share/icons/hicolor/scalable/apps/$APP_ID.svg"
"${run_as_root[@]}" rm -f "$PREFIX/share/icons/hicolor/symbolic/apps/$APP_ID-symbolic.svg"
"${run_as_root[@]}" rm -rf "$PREFIX/share/colorman"

if command -v update-desktop-database >/dev/null; then
  "${run_as_root[@]}" update-desktop-database -q "$PREFIX/share/applications" 2>/dev/null || true
fi
if command -v gtk4-update-icon-cache >/dev/null; then
  "${run_as_root[@]}" gtk4-update-icon-cache -q -t -f "$PREFIX/share/icons/hicolor" 2>/dev/null || true
fi
if command -v glib-compile-schemas >/dev/null; then
  "${run_as_root[@]}" glib-compile-schemas "$PREFIX/share/glib-2.0/schemas" 2>/dev/null || true
fi

echo "Colorman removed from $PREFIX"

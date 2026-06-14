#!/usr/bin/env bash
set -euo pipefail

PREFIX="${PREFIX:-$HOME/.local}"
REPO="ArnavK-09/colorman"

curl -fsSL "https://raw.githubusercontent.com/${REPO}/master/scripts/uninstall-release.sh" | bash -s -- "$PREFIX"

#!/usr/bin/env bash
set -euo pipefail

VERSION="0.0.70"
REPO="ArnavK-09/colorman"
PREFIX="${PREFIX:-$HOME/.local}"

curl -fsSL "https://github.com/${REPO}/releases/download/v${VERSION}/uninstall.sh" | bash -s -- "$PREFIX"

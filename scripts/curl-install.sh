#!/usr/bin/env bash
set -euo pipefail

VERSION="0.0.69"
REPO="ArnavK-09/colorman"
PREFIX="${PREFIX:-$HOME/.local}"

arch="$(uname -m)"
case "$arch" in
  x86_64|aarch64) ;;
  *)
    echo "error: unsupported architecture: $arch" >&2
    exit 1
    ;;
esac

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

url="https://github.com/${REPO}/releases/download/v${VERSION}/colorman-${VERSION}-linux-${arch}.tar.gz"
echo "Downloading ${url}"
curl -fsSL "$url" | tar xz -C "$tmp"

dir="$tmp/colorman-${VERSION}-linux-${arch}"
if [[ ! -f "$dir/install.sh" ]]; then
  echo "error: release archive is missing install.sh" >&2
  exit 1
fi

bash "$dir/install.sh" "$PREFIX"

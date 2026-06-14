#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="$(grep '"version"' "$root/package.json" | head -1 | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
arch="$(uname -m)"
release_dir="${root}/release"
bundle_name="colorman-${version}-linux-${arch}"
staging="${release_dir}/staging"
bundle="${release_dir}/${bundle_name}"

rm -rf "$release_dir"
mkdir -p "$staging" "$bundle"

cd "$root"
bun run build
bun run build:resources

if [[ -d _build ]]; then
  meson setup _build --prefix=/usr --reconfigure
else
  meson setup _build --prefix=/usr
fi
meson compile -C _build
DESTDIR="$staging" meson install -C _build

cp -a "$staging/usr" "$bundle/"
cp "$root/scripts/install-release.sh" "$bundle/install.sh"
cp "$root/scripts/uninstall-release.sh" "$bundle/uninstall.sh"
chmod +x "$bundle/install.sh" "$bundle/uninstall.sh"

tar -C "$release_dir" -czf "${release_dir}/${bundle_name}.tar.gz" "$bundle_name"
cp "$root/scripts/curl-install.sh" "${release_dir}/install.sh"
cp "$root/scripts/uninstall-release.sh" "${release_dir}/uninstall.sh"
chmod +x "${release_dir}/install.sh" "${release_dir}/uninstall.sh"

echo "Release artifacts:"
echo "  ${release_dir}/${bundle_name}.tar.gz"
echo "  ${release_dir}/install.sh"
echo "  ${release_dir}/uninstall.sh"

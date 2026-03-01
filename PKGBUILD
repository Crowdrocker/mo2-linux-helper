# Maintainer: Your Name <you@example.com>
# Contributor: MO2 Linux Helper Contributors

pkgname=mo2-linux-helper-git
pkgver=r1.0000000
pkgrel=1
pkgdesc="Interactive GUI for configuring Mod Organizer 2 with Proton/Wine on Linux"
arch=('x86_64')
url="https://github.com/Crowdrocker/mo2-linux-helper"
license=('GPL3')
depends=(
  'webkit2gtk-4.1'
  'gtk3'
  'libayatana-appindicator'
  'xdg-utils'
  'python'
  'bash'
)
optdepends=(
  'protontricks: apply per-game Wine fixes'
  'winetricks: Wine prefix management'
  'wine: run MO2 and tools'
  'protonup-qt: install/manage Proton-GE builds'
  'flatpak: Flatpak permission management'
  'python-vdf: write Non-Steam shortcuts to shortcuts.vdf'
  'steam: Non-Steam shortcut integration'
)
makedepends=(
  'rust'
  'cargo'
  'nodejs'
  'npm'
  'git'
  'tauri-cli'         # from AUR: tauri-cli-bin
)
provides=('mo2-linux-helper')
conflicts=('mo2-linux-helper')
source=("$pkgname::git+https://github.com/Crowdrocker/mo2-linux-helper.git")
sha256sums=('SKIP')

pkgver() {
  cd "$pkgname"
  printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
}

prepare() {
  cd "$pkgname"
  npm ci --prefer-offline 2>/dev/null || npm install
  # Pre-fetch Cargo deps so the build is offline-capable
  cargo fetch --locked 2>/dev/null || cargo fetch
}

build() {
  cd "$pkgname"

  export TAURI_SKIP_DEVSERVER_CHECK=true
  export NODE_ENV=production

  npm run build
  cargo tauri build --bundles deb,appimage
}

package() {
  cd "$pkgname"

  # ── Binary (extracted from the build output) ─────────────────────────────
  install -Dm755 "src-tauri/target/release/mo2-linux-helper" \
    "$pkgdir/usr/bin/mo2-linux-helper"

  # ── Companion scripts ────────────────────────────────────────────────────────
  install -Dm755 "scripts/mo2-setup.sh"          "$pkgdir/usr/bin/mo2-setup"
  install -Dm755 "scripts/mo2-nxm.sh"            "$pkgdir/usr/bin/mo2-nxm"
  install -Dm755 "scripts/mo2-shortcut.py"        "$pkgdir/usr/bin/mo2-shortcut"
  install -Dm755 "scripts/mo2-flatpak-setup.sh"   "$pkgdir/usr/bin/mo2-flatpak-setup"

  # ── Desktop entry ────────────────────────────────────────────────────────────
  install -Dm644 "assets/com.modorganizer.MO2LinuxHelper.desktop" \
    "$pkgdir/usr/share/applications/com.modorganizer.MO2LinuxHelper.desktop"

  # ── Icons ────────────────────────────────────────────────────────────────────
  for size in 16 32 48 64 128 256; do
    if [[ -f "assets/icons/${size}x${size}.png" ]]; then
      install -Dm644 "assets/icons/${size}x${size}.png" \
        "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/com.modorganizer.MO2LinuxHelper.png"
    fi
  done

  # ── Metainfo (for software centers) ─────────────────────────────────────────
  install -Dm644 "assets/com.modorganizer.MO2LinuxHelper.metainfo.xml" \
    "$pkgdir/usr/share/metainfo/com.modorganizer.MO2LinuxHelper.metainfo.xml"

  # ── License ──────────────────────────────────────────────────────────────────
  install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"

  # ── Docs ─────────────────────────────────────────────────────────────────────
  install -Dm644 "README.md" "$pkgdir/usr/share/doc/$pkgname/README.md"
}

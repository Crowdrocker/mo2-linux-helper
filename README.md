# ⬡ MO2 Linux Helper

> Dark industrial cyberpunk GUI for configuring Mod Organizer 2 on Linux with Proton/Wine.

![Arch Linux](https://img.shields.io/badge/Arch-Linux-1793D1?logo=arch-linux&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Rust](https://img.shields.io/badge/Rust-1.77+-CE422B?logo=rust)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)

---

## Features

- **Setup Wizard** — Animated terminal output, progress bar, MO2 path config, dry-run mode
- **Dependency Manager** — Real-time detection of Proton-GE, protontricks, wine, DXVK, vkd3d, etc.
- **Game Fixes** — Toggle patches for 18 games via protontricks (Cyberpunk, Fallout, Skyrim, BG3, xEdit...)
- **NXM Links** — Register/unregister `nxm://` handler, live `.desktop` preview
- **Non-Steam Shortcut** — Write directly to Steam's `shortcuts.vdf` via Python + `vdf` library
- **Flatpak Config** — Permission toggles with live-generated override command
- **Portable Instances** — Scan filesystem for `ModOrganizer.ini`, launch with one click
- **Native Plugins** — Detect `libgame_*.so` plugins in MO2's plugins/ directory
- **Backend Scripts** — Real shell/Python scripts with Copy/Download buttons
- **Flatpak Manifest** — Complete `.yml` ready for Flathub submission
- **Auto-update Check** — Pings GitHub for new Proton-GE versions

---

## Requirements

- Arch Linux (or any distro with AUR access)
- Rust 1.77+ (`rustup`)
- Node.js 18+ + npm
- Tauri CLI v2

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri system deps (Arch)
sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator

# Install Node deps
npm install

# Install Tauri CLI
cargo install tauri-cli --version "^2"
```

---

## Development

```bash
# Clone
git clone https://github.com/Crowdrocker/mo2-linux-helper
cd mo2-linux-helper

# Install JS deps
npm install

# Run in dev mode (hot reload)
cargo tauri dev
# or
npm run tauri:dev
```

---

## Build

```bash
# Release build (produces AppImage, .deb, .pacman in src-tauri/target/release/bundle/)
cargo tauri build
# or
npm run tauri:build

# Debug build
npm run tauri:build:debug
```

Build outputs land in:
```
src-tauri/target/release/bundle/
├── appimage/   mo2-linux-helper_2.0.0_amd64.AppImage
└── deb/        mo2-linux-helper_2.0.0_amd64.deb
```

> **Note:** Tauri v2 dropped the `pacman` bundler. For Arch, use the AppImage or install directly from the compiled binary at `src-tauri/target/release/mo2-linux-helper`.

---

## Install (Arch)

```bash
# From built .pkg.tar.zst
sudo pacman -U src-tauri/target/release/bundle/pacman/mo2-linux-helper-2.0.0-1-x86_64.pkg.tar.zst
```

Or install the companion scripts manually:

```bash
sudo install -Dm755 scripts/mo2-setup.sh     /usr/bin/mo2-setup
sudo install -Dm755 scripts/mo2-nxm.sh       /usr/bin/mo2-nxm
sudo install -Dm755 scripts/mo2-shortcut.py  /usr/bin/mo2-shortcut
sudo install -Dm755 scripts/mo2-flatpak-setup.sh /usr/bin/mo2-flatpak-setup
```

---

## AUR

An AUR package `mo2-linux-helper-git` is planned. Until then, clone and build above.

---

## Optional Python dep (for Non-Steam shortcut)

```bash
pip install vdf
```

---

## Project Structure

```
mo2-linux-helper/
├── src/                    # React frontend
│   ├── main.jsx            # Entry point
│   └── App.jsx             # Main UI (all sections)
├── src-tauri/              # Tauri/Rust backend
│   ├── src/
│   │   └── main.rs         # All Tauri commands (invoke handlers)
│   ├── Cargo.toml
│   └── tauri.conf.json     # App config + shell permissions
├── scripts/                # Standalone bash/python scripts
│   ├── mo2-setup.sh
│   ├── mo2-nxm.sh
│   ├── mo2-shortcut.py
│   └── mo2-flatpak-setup.sh
├── package.json
├── vite.config.js
└── index.html
```

---

## Tauri Commands (Rust → Frontend)

| Command | Description |
|---|---|
| `check_dependencies` | Detect all deps (Proton-GE, wine, protontricks...) |
| `install_dependency` | Install a dep via pacman/pipx/protonup |
| `run_setup` | Full MO2 setup wizard |
| `set_nxm_handler` | Register/unregister nxm:// handler |
| `apply_game_fix` | Apply protontricks fix for a specific game |
| `write_steam_shortcut` | Write Non-Steam shortcut via Python vdf |
| `apply_flatpak_overrides` | Apply flatpak permission overrides |
| `scan_portable_instances` | Scan filesystem for ModOrganizer.ini |
| `scan_native_plugins` | Find libgame_*.so in MO2 plugins/ |
| `check_for_updates` | Check GitHub for new Proton-GE version |
| `launch_mo2_instance` | Launch a portable MO2 instance |
| `open_in_files` | Open path in system file manager |

---

## License

GPL-3.0 — Contributions welcome. PRs for more game fixes especially appreciated.

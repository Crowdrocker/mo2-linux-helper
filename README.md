# MO2 Linux Helper

<div align="center">

![MO2 Linux Helper](https://img.shields.io/badge/MO2-Linux%20Helper-00e5ff?style=for-the-badge&logo=linux&logoColor=white)
![Arch Linux](https://img.shields.io/badge/Arch%20Linux-1793D1?style=for-the-badge&logo=arch-linux&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A desktop app that automates Mod Organizer 2 setup on Linux with Proton.**

[Install](#installation) · [Features](#features) · [Screenshots](#screenshots) · [Contributing](#contributing)

</div>

---

## Features

- ⚡ **One-click MO2 setup** — installs MO2, Wine, winetricks dependencies automatically
- 📦 **Dependency manager** — tracks and installs vcruntime, dotnet48, d3dcompiler, DXVK and more
- 🎮 **Game-specific fixes** for 18+ games including:
  - Cyberpunk 2077, Fallout 4, Skyrim SE/VR, Fallout 3/NV, Oblivion Remastered, Morrowind
  - Starfield, Witcher 3, Elden Ring, Dark Souls Remastered, Baldur's Gate 3
  - xEdit, Synthesis Patcher, BodySlide, NifSkope, LOOT
- 🔗 **NXM link handler** — registers `nxm://` and `nxms://` URI schemes for 1-click Nexus installs
- 🚀 **Non-Steam shortcut** — adds MO2 to Steam library with correct Proton launch options
- 📦 **Flatpak support** — generates permission overrides and full manifest
- 💾 **Portable instance detection** — scans for local `ModOrganizer.ini` files
- 🔌 **Native plugin support** — manages `libgame_*.so` Linux-native game plugins
- ⌨️ **Backend scripts** — generates and runs real shell/Python scripts
- 🔄 **Auto-update checker** — notifies when new MO2 or Proton-GE versions are available
- 💾 **Config persistence** — all settings saved locally

## Installation

### AUR (Arch Linux) — Recommended

```bash
yay -S mo2-linux-helper
# or
paru -S mo2-linux-helper
```

### Pre-built Binary

Download the latest `.AppImage` or `.deb` from [Releases](https://github.com/Crowdrocker/mo2-linux-helper/releases).

```bash
chmod +x mo2-linux-helper_*.AppImage
./mo2-linux-helper_*.AppImage
```

### Build from Source

**Prerequisites:** Node.js 20+, Rust 1.77+, `webkit2gtk`, `libayatana-appindicator`

```bash
git clone https://github.com/Crowdrocker/mo2-linux-helper.git
cd mo2-linux-helper
npm install
npm run tauri build
```

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| Arch Linux | any | Other distros partially supported |
| Steam | latest | Required for Proton |
| Proton-GE | 9-20+ | Recommended over stock Proton |
| wine | 9.x+ | For non-Steam prefix |
| winetricks | 20240105+ | Dependency installer |
| protontricks | 1.11+ | Proton prefix management |

Install dependencies:
```bash
sudo pacman -S wine winetricks
yay -S protontricks proton-ge-custom
```

## Usage

### First Run

1. Launch the app
2. Go to **Setup Wizard**
3. Verify your paths (MO2, Steam, Proton version)
4. Click **⚡ Run Full Setup**

### Game Fixes

Navigate to **Game Fixes**, enable the games you mod, and the appropriate Proton environment variables and compatibility patches will be applied automatically when launching MO2.

### NXM Links

Go to **NXM Links** → **Register Handler**. After registering, clicking "Mod Manager Download" on NexusMods will open directly in MO2.

### Portable Instances

If you use portable MO2 instances (with a local `ModOrganizer.ini`), go to **Portable Instances** and scan your games directory. Each instance can be launched independently.

## Backend Scripts

The app generates real, executable scripts you can use independently:

| Script | Purpose |
|---|---|
| `mo2-setup.sh` | Full automated setup |
| `mo2-nxm.sh` | NXM handler registration |
| `mo2-shortcut.py` | Steam shortcuts.vdf writer |
| `mo2-flatpak-setup.sh` | Flatpak overrides |

Scripts are installed to `/usr/lib/mo2-linux-helper/scripts/` and symlinked to `/usr/bin/`.

## Screenshots

> Coming soon

## Contributing

PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

Areas that need help:
- Testing on non-Arch distros (Fedora, Ubuntu)
- Additional game profiles
- Wayland-specific fixes
- Steam Deck support

## License

MIT — see [LICENSE](LICENSE)

## Credits

- [Mod Organizer 2](https://github.com/ModOrganizer2/modorganizer) — the modding tool this wraps
- [Proton-GE](https://github.com/GloriousEggroll/proton-ge-custom) — the Proton build we recommend
- The Linux gaming community on [r/linux_gaming](https://reddit.com/r/linux_gaming)

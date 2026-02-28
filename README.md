# MO2 Linux Helper

A fully interactive desktop application for configuring Mod Organizer 2 (MO2) with Proton dependencies on Linux. Built with a cyberpunk industrial aesthetic, featuring scanline overlays, neon cyan and orange accents, and a mono terminal font.

![MO2 Linux Helper](https://img.shields.io/badge/version-1.0.0-cyan)
![License](https://img.shields.io/badge/license-MIT-orange)
![Platform](https://img.shields.io/badge/platform-Linux-green)

## Features

### Core Functionality
- **Auto-install MO2 + Proton dependencies** - Automated setup of Mod Organizer 2 with all required dependencies
- **NXM link handler setup** - One-click registration of Nexus Mods link handler
- **Game fixes for 18+ titles** - Pre-configured fixes for Cyberpunk 2077, Fallout series, Skyrim, Baldur's Gate 3, and more
- **Flatpak support** - Full Flatpak configuration with permission management
- **Non-Steam shortcut adder** - Generate Steam shortcuts for MO2 and games
- **Portable instance detection** - Automatically discover and manage portable MO2 instances
- **Native plugin management** - Install and update libgame_*.so plugins for Linux-native games

### Supported Games
- Cyberpunk 2077
- Fallout 4 / Fallout 3 / Fallout: New Vegas
- Skyrim Special Edition / Skyrim VR
- Baldur's Gate 3
- Starfield
- The Witcher 3
- Dark Souls Remastered
- Elden Ring
- BodySlide
- NifSkope
- xEdit
- Synthesis
- LOOT
- Oblivion Remastered
- Morrowind

### User Interface
- **Dark industrial cyberpunk theme** - Scanline overlay, neon accents, mono terminal font
- **Animated terminal output** - Real-time command execution visualization
- **Progress tracking** - Visual progress bars and status indicators
- **Config persistence** - All settings saved to localStorage with export/import
- **Toast notifications** - Instant feedback on actions
- **Responsive design** - Works on various screen sizes

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/mo2-linux-helper.git
cd mo2-linux-helper

# Install dependencies
npm install

# Start development server
npm run dev
```

### AUR Package (Arch Linux)

```bash
yay -S mo2-linux-helper
```

### Flatpak

```bash
flatpak install flathub com.modorganizer.MO2LinuxHelper
```

## Usage

### Setup Wizard

1. Launch the application
2. Follow the setup wizard to configure paths
3. Choose between full installation or dry-run mode
4. Watch the animated terminal output as MO2 is installed

### Dependencies Management

- View status of all required dependencies
- Install individual or batch dependencies
- Monitor installation progress with spinners

### Game Fixes

- Toggle game-specific fixes on/off
- Filter games by category (RPG, Action, Tools)
- Search for specific games
- Apply all fixes with one click

### NXM Links

- Register/unregister NXM link handler
- Preview generated .desktop file
- Download or copy configuration

### Non-Steam Shortcuts

- Add MO2 and games to Steam
- Configure launch options
- Generate VDF files automatically

### Flatpak Configuration

- Toggle Flatpak permissions
- Generate override commands
- Download Flatpak manifest

### Portable Instances

- Scan for portable MO2 instances
- Launch instances directly
- Remove unwanted instances

### Native Plugins

- Install libgame_*.so plugins
- Update all plugins at once
- Monitor plugin status

### Backend Scripts

- View all shell and Python scripts
- Copy, download, or run scripts directly
- Full syntax highlighting

## Backend Scripts

The application includes several backend scripts that can be used independently:

### mo2-setup.sh
Main installation script for MO2 and dependencies.

```bash
chmod +x backend-scripts/mo2-setup.sh
./backend-scripts/mo2-setup.sh
```

### mo2-nxm.sh
NXM link handler setup script.

```bash
chmod +x backend-scripts/mo2-nxm.sh
./backend-scripts/mo2-nxm.sh
```

### mo2-shortcut.py
Steam shortcut generator.

```bash
python3 backend-scripts/mo2-shortcut.py
```

### mo2-flatpak-setup.sh
Flatpak configuration script.

```bash
chmod +x backend-scripts/mo2-flatpak-setup.sh
./backend-scripts/mo2-flatpak-setup.sh
```

## Configuration

All configuration is stored in `localStorage` and can be exported/imported:

- MO2 installation path
- Proton path
- Steam path
- Active game fixes
- Portable instances
- Native plugins
- Flatpak permissions

## Development

### Project Structure

```
mo2-linux-helper/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── App.jsx        # Main application
│   └── App.css        # Cyberpunk theme
├── backend-scripts/   # Shell and Python scripts
├── public/            # Static assets
└── package.json
```

### Building for Production

```bash
npm run build
```

### Creating Desktop App

To package as an Electron or Tauri application:

```bash
# Electron
npm install --save-dev electron
npm run build:electron

# Tauri
npm install --save-dev @tauri-apps/cli
npm run tauri build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Mod Organizer 2 team for the amazing mod manager
- Proton-GE for enabling Windows games on Linux
- The Linux gaming community for support and feedback

## Support

- GitHub Issues: https://github.com/yourusername/mo2-linux-helper/issues
- Reddit: r/linux_gaming
- Discord: Join our community server

## Roadmap

- [ ] Auto-update checker (GitHub releases API)
- [ ] Mod profile export/import
- [ ] Enhanced error handling
- [ ] More game fixes
- [ ] Plugin marketplace integration
- [ ] Cloud sync for configurations

---

Made with ❤️ for the Linux gaming community